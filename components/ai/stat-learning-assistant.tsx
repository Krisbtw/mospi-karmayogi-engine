"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Bot, User, BookOpen, ChevronDown } from "lucide-react";
import { Officer, CompetencyItem } from "@/lib/data-service";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: { source: string; snippet: string }[];
  timestamp: Date;
}

interface StatLearningAssistantProps {
  officer: Officer;
  competencies: CompetencyItem[];
}

const SUGGESTED_QUESTIONS = [
  "What is the Jevons formula for CPI elementary aggregates?",
  "Explain the three approaches to measuring GDP.",
  "How is stratification done in PLFS sampling?",
  "What competency gaps should I focus on first?",
  "What courses are recommended for my role?",
];

const GREETING: Message = {
  id: "greeting",
  role: "assistant",
  content: "Namaste! I'm your MoSPI × iGOT Statistical Learning Assistant, grounded in approved NSSTA manuals and FRAC competency standards.\n\nYou can ask me about:\n• Statistical concepts (CPI, GDP, PLFS, ASI methodology)\n• Your competency gaps and learning priorities\n• iGOT and NSSTA TPAC course recommendations\n• Assessment preparation and quiz practice",
  timestamp: new Date(),
};

export function StatLearningAssistant({ officer, competencies }: StatLearningAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, messages]);

  const handleSend = async (text?: string) => {
    const query = (text ?? input).trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: query,
          officer: {
            name: officer.name,
            designation: officer.designation,
            cadreRank: officer.cadreRank,
            division: officer.division,
            experienceLevel: officer.experienceLevel,
            jobRole: officer.jobRole,
          },
          competencies: competencies.map((c) => ({
            label: c.label,
            fracCode: c.fracCode,
            current: c.current,
            target: c.target,
            gap: c.target - c.current,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.answer || "I couldn't find a specific answer. Please try rephrasing your question.",
          citations: data.citations || [],
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error("API error");
      }
    } catch {
      // Fallback: generate a helpful static response for demo purposes
      const fallbackResponse = generateFallbackResponse(query, officer, competencies);
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: fallbackResponse,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        id="stat-learning-assistant-btn"
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold shadow-lg transition-all duration-300",
          "bg-primary text-primary-foreground hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0",
          isOpen && "hidden"
        )}
        aria-label="Open Statistical Learning Assistant"
      >
        <Sparkles className="h-4 w-4" />
        <span>Ask AI</span>
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div
          className="fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl border border-border bg-surface shadow-2xl"
          style={{ width: "380px", height: "560px" }}
          role="dialog"
          aria-label="Statistical Learning Assistant"
        >
          {/* Header */}
          <div className="flex items-center justify-between rounded-t-2xl border-b border-border bg-primary px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Statistical Learning Assistant</p>
                <p className="text-[10px] text-white/70">MoSPI × iGOT · NSSTA grounded</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1.5 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
              aria-label="Close assistant"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Officer context strip */}
          <div className="border-b border-border bg-slate-50/80 px-4 py-2 text-[10px] text-fg-muted">
            <span className="font-medium text-fg">{officer.name}</span> · {officer.designation} · {officer.experienceLevel} yrs exp ·{" "}
            <span className="text-primary font-medium">{competencies.filter((c) => c.current < c.target).length} active gaps</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex gap-2.5", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                <div className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                  msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-slate-200 text-fg"
                )}>
                  {msg.role === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                </div>
                <div className={cn(
                  "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-slate-100 text-fg rounded-tl-sm"
                )}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {msg.citations.map((cit, i) => (
                        <div key={i} className="rounded border border-primary/20 bg-primary/5 px-2 py-1">
                          <div className="flex items-center gap-1 text-[10px] font-semibold text-primary">
                            <BookOpen className="h-3 w-3" /> {cit.source}
                          </div>
                          <p className="text-[10px] text-fg-muted mt-0.5">{cit.snippet}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className={cn("mt-1 text-[9px]", msg.role === "user" ? "text-white/60 text-right" : "text-fg-muted")}>
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200">
                  <Bot className="h-3.5 w-3.5 text-fg" />
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-slate-100 px-3.5 py-2.5">
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-fg-muted animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-fg-muted animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-fg-muted animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggested questions */}
          {messages.length <= 1 && (
            <div className="border-t border-border px-4 py-2">
              <p className="text-[10px] text-fg-muted mb-2 font-medium">Suggested questions</p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_QUESTIONS.slice(0, 3).map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="rounded-full border border-primary/25 bg-primary/5 px-2.5 py-1 text-[10px] font-medium text-primary hover:bg-primary/10 transition-colors"
                  >
                    {q.length > 30 ? q.slice(0, 28) + "…" : q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-border p-3">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex items-center gap-2 rounded-xl border border-border bg-bg px-3 py-2 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/30 transition-all"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about statistics, competencies, courses…"
                className="flex-1 bg-transparent text-xs text-fg placeholder:text-fg-muted outline-none"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-white disabled:opacity-40 hover:bg-primary/90 transition-colors"
                aria-label="Send message"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
            <p className="mt-1.5 text-center text-[9px] text-fg-muted">Grounded in NSSTA-approved manuals · PLFS, CPI, NAS, ASI</p>
          </div>
        </div>
      )}
    </>
  );
}

// Fallback response generator for demo (when API is unavailable)
function generateFallbackResponse(query: string, officer: Officer, competencies: CompetencyItem[]): string {
  const q = query.toLowerCase();

  if (q.includes("jevons") || q.includes("elementary") || q.includes("cpi")) {
    return "The Jevons formula computes elementary aggregate indices as the unweighted geometric mean of price relatives across quoted markets:\n\nP = (p₁/p₀ × p₂/p₀ × … × pₙ/p₀)^(1/n)\n\nThis is used for All-India CPI rural/urban compilation at the district level before aggregation using Laspeyres weights.\n\n📖 Source: CPI Compilation Manual, Chapter 4.2 — Elementary Index Formula";
  }

  if (q.includes("gdp") || q.includes("national income") || q.includes("gva")) {
    return "GDP can be measured by three equivalent approaches:\n\n1. Production Approach: Sum of GVA across all sectors + Net taxes on products\n2. Income Approach: Compensation of employees + Gross operating surplus + Net taxes on production\n3. Expenditure Approach: GFCE + PFCE + GFCF + Change in Stocks + Net Exports\n\n📖 Source: NAS — Sources & Methods (SNA 2008), Chapter 2.2";
  }

  if (q.includes("plfs") || q.includes("sampling") || q.includes("stratif")) {
    return "PLFS uses stratified multi-stage sampling:\n\n• Rural: 2011 Population Census village list as FSUs\n• Urban: UFS blocks (Urban Frame Survey) as FSUs\n• Urban areas use rotational panel design — each FSU surveyed for 4 consecutive quarters with 75% overlap between adjacent quarters\n\n📖 Source: PLFS Operational Guidelines, Chapter 2 — Sampling Scheme";
  }

  if (q.includes("gap") || q.includes("focus") || q.includes("competency") || q.includes("priorit")) {
    const gaps = competencies
      .filter((c) => c.current < c.target)
      .sort((a, b) => (b.target - b.current) - (a.target - a.current))
      .slice(0, 3);
    if (gaps.length === 0) {
      return `Great news, ${officer.name}! You've met all your current FRAC competency targets. Consider attempting advanced assessments or exploring emerging skills like Data Visualization and GIS.`;
    }
    return `Based on your profile, ${officer.name}, your top 3 priority gaps are:\n\n${gaps.map((g, i) => `${i + 1}. ${g.label} — Current: ${g.current}/5, Target: ${g.target}/5 (Gap: ${g.target - g.current})`).join("\n")}\n\nI'd recommend starting with ${gaps[0].label} as it has the largest impact on your ${officer.designation} FRAC compliance.`;
  }

  if (q.includes("course") || q.includes("igot") || q.includes("tpac") || q.includes("recommend")) {
    return `For a ${officer.designation} with ${officer.experienceLevel} years experience in ${officer.division}, I recommend:\n\n**iGOT Karmayogi (Online)**\n• CPI Compilation: Advanced Index Methods\n• National Accounts: GVA Compilation & Deflators\n\n**NSSTA TPAC (In-person)**\n• Statistical Methods for Survey Design — NSSTA Greater Noida (Oct 2026)\n• R & Python for Official Statistical Data Processing — NSSTA (Oct 2026)\n\nAll courses are aligned to your FRAC deficit areas.`;
  }

  return `I understand you're asking about "${query}". As a ${officer.designation} in the ${officer.division}, I can help you with:\n\n• Statistical methodology (CPI, GDP, PLFS, ASI)\n• Your competency gaps and targets\n• iGOT and NSSTA TPAC course navigation\n• Assessment preparation\n\nPlease try asking a more specific question about any of these topics, and I'll provide a grounded response from approved NSSTA manuals.`;
}
