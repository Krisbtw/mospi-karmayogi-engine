import { OpenAIEmbeddings } from "@langchain/openai";

// text-embedding-3-small: 1536 dims, matches DocumentChunk.embedding's
// vector(1536) column in prisma/schema.prisma. If you swap embedding
// models, update both this and the column dimension together.
const EMBEDDING_MODEL = "text-embedding-3-small";
const BATCH_SIZE = 64;

let client: OpenAIEmbeddings | null = null;
function getClient(): OpenAIEmbeddings {
  if (!client) {
    client = new OpenAIEmbeddings({ model: EMBEDDING_MODEL });
  }
  return client;
}

/** Batches requests to stay under provider payload limits on large documents. */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  const embedder = getClient();
  const out: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const vectors = await embedder.embedDocuments(batch);
    out.push(...vectors);
  }

  return out;
}
