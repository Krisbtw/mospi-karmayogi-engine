import { NextRequest, NextResponse } from "next/server";
import { chunkDocument } from "@/lib/rag/chunker";
import {
  DocumentItem,
  StoredChunk,
  addStoredDocument,
  addStoredChunks,
  registerDocumentQuestions,
  getCompetencyForDocument,
} from "@/lib/data-service";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

async function parsePdfBuffer(buffer: Buffer): Promise<{ text: string; pages: number }> {
  try {
    const pdfParse = require("pdf-parse");
    const data = await pdfParse(buffer);
    if (data && typeof data.text === "string" && data.text.trim().length > 0) {
      return {
        text: data.text,
        pages: data.numpages || 1,
      };
    }
  } catch (err) {
    console.warn("PDF extraction warning, using buffer text decode:", err);
  }
  const raw = buffer.toString("utf-8");
  return { text: raw, pages: Math.max(1, Math.ceil(raw.length / 2500)) };
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      const { title, sourceType: incomingSourceType, summary, pageCount, rawText } = body;

      const docId = `doc_${Date.now()}`;
      let chunksCount = 12;
      let finalPages = pageCount || 24;

      if (rawText && typeof rawText === "string") {
        const generatedChunks = chunkDocument(rawText);
        chunksCount = generatedChunks.length;
        finalPages = Math.max(1, Math.ceil(rawText.length / 2500));

        const storedChunks: StoredChunk[] = generatedChunks.map((c) => ({
          id: `chunk_${docId}_${c.ordinal}`,
          documentId: docId,
          ordinal: c.ordinal,
          content: c.content,
          headingPath: c.headingPath,
        }));
        addStoredChunks(docId, storedChunks);
      }

      let detectedType: DocumentItem["sourceType"] = incomingSourceType || "NATIONAL_ACCOUNTS_MANUAL";
      const lower = (title || "").toLowerCase();
      if (lower.includes("plfs") || lower.includes("labour") || lower.includes("labor")) {
        detectedType = "PLFS_HANDBOOK";
      } else if (lower.includes("cpi") || lower.includes("price") || lower.includes("inflation")) {
        detectedType = "CPI_METHODOLOGY";
      } else if (lower.includes("asi") || lower.includes("factory") || lower.includes("industr")) {
        detectedType = "ASI_METHODOLOGY";
      } else if (lower.includes("national") || lower.includes("account") || lower.includes("gdp") || lower.includes("gva") || lower.includes("sdp") || lower.includes("ddp")) {
        detectedType = "NATIONAL_ACCOUNTS_MANUAL";
      }

      const newDoc: DocumentItem = {
        id: docId,
        title: title || "Uploaded MoSPI Statistical Methodology",
        sourceType: detectedType,
        pageCount: finalPages,
        fileSizeKb: Math.round(finalPages * 22),
        chunkCount: chunksCount,
        uploadedAt: "Just now",
        status: "READY",
        summary:
          summary ||
          "Official statistical guideline processed for semantic retrieval and Bloom-level MCQ generation.",
      };

      addStoredDocument(newDoc);
      registerDocumentQuestions(newDoc);
      return NextResponse.json({ success: true, document: newDoc }, { status: 201 });
    }

    // Handle multipart form uploads with true binary PDF parsing
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title =
      (formData.get("title") as string) || (file ? file.name : "Custom MoSPI Document.pdf");
    const rawSourceType = formData.get("sourceType") as DocumentItem["sourceType"] | null;

    let sourceType: DocumentItem["sourceType"] = rawSourceType || "NATIONAL_ACCOUNTS_MANUAL";
    const lower = title.toLowerCase();
    if (lower.includes("plfs") || lower.includes("labour") || lower.includes("labor")) {
      sourceType = "PLFS_HANDBOOK";
    } else if (lower.includes("cpi") || lower.includes("price") || lower.includes("inflation")) {
      sourceType = "CPI_METHODOLOGY";
    } else if (lower.includes("asi") || lower.includes("factory") || lower.includes("industr")) {
      sourceType = "ASI_METHODOLOGY";
    } else if (lower.includes("national") || lower.includes("account") || lower.includes("gdp") || lower.includes("gva") || lower.includes("sdp") || lower.includes("ddp")) {
      sourceType = "NATIONAL_ACCOUNTS_MANUAL";
    }

    const docId = `doc_${Date.now()}`;
    let extractedText = "";
    let pageCount = 1;
    let fileSizeKb = file ? Math.round(file.size / 1024) : 1500;

    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const isPdf =
        file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

      if (isPdf) {
        const parsed = await parsePdfBuffer(buffer);
        extractedText = parsed.text;
        pageCount = parsed.pages;
      } else {
        extractedText = buffer.toString("utf-8");
        pageCount = Math.max(1, Math.ceil(fileSizeKb / 28));
      }
    }

    // Run real semantic chunking over extracted text
    const rawChunks = chunkDocument(
      extractedText ||
        `${title}: Indian Official Statistical System guidelines on sampling, estimation, and national accounts.`
    );

    const storedChunks: StoredChunk[] = rawChunks.map((c) => ({
      id: `chunk_${docId}_${c.ordinal}`,
      documentId: docId,
      ordinal: c.ordinal,
      content: c.content,
      headingPath: c.headingPath,
    }));

    addStoredChunks(docId, storedChunks);

    const newDoc: DocumentItem = {
      id: docId,
      title,
      sourceType,
      pageCount,
      fileSizeKb,
      chunkCount: storedChunks.length,
      uploadedAt: "Just now",
      status: "READY",
      summary: `Parsed ${pageCount} pages and generated ${storedChunks.length} semantic chunks from ${title}.`,
    };

    addStoredDocument(newDoc);
    registerDocumentQuestions(newDoc);

    // Attempt Prisma persistence in background if PostgreSQL is reachable
    try {
      const user = await prisma.user.findFirst();
      if (user) {
        await prisma.document.create({
          data: {
            id: docId,
            title,
            sourceType: "CIRCULAR",
            status: "READY",
            fileUrl: `/uploads/${title}`,
            fileSizeKb,
            pageCount,
            uploadedById: user.id,
          },
        });
      }
    } catch {
      // Prisma offline, in-memory store handles it seamlessly
    }

    return NextResponse.json({ success: true, document: newDoc }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Document upload failed.",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
