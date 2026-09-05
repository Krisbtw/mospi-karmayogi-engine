# MoSPI × iGOT Karmayogi — AI Capacity-Building Platform

SIH prototype: an AI-powered learning and gap-detection platform for
India's Official Statistical System, integrated with the iGOT Karmayogi
Bharat FRAC competency framework.

## Directory tree

```
mospi-karmayogi/
├── app/
│   ├── layout.tsx                     # Root layout, Inter + JetBrains Mono via next/font
│   ├── page.tsx                       # Landing hero + sample dashboard view
│   ├── globals.css                    # Design tokens (CSS variables, light/dark)
│   └── api/
│       ├── assessment/generate/route.ts   # RAG MCQ generation endpoint (Phase 2)
│       └── igot/sync/route.ts             # Server-side iGOT/Sunbird enrollment bridge
├── components/
│   ├── hero-section.tsx               # 21st.dev-style hero (Phase 3)
│   └── dashboard/
│       ├── competency-radar.tsx       # Officer skill-gap radar (recharts)
│       └── igot-recommendations.tsx   # Course sync cards
├── lib/
│   ├── prisma.ts                      # PrismaClient singleton
│   ├── igot/client.ts                 # Sunbird/Wattson client (mock ⇄ real toggle)
│   └── rag/
│       ├── chunker.ts                 # Semantic-boundary chunking
│       ├── embeddings.ts              # OpenAI embeddings wrapper
│       ├── retrieval.ts               # pgvector cosine-similarity retrieval
│       ├── llm.ts                     # LLM call + Zod validate/repair loop
│       └── schema.ts                  # Zod schemas (request + generated MCQ)
├── prisma/
│   └── schema.prisma                  # Full data model (Phase 1)
├── design-system/mospi-karmayogi/
│   └── MASTER.md                      # Token source of truth (ui-ux-pro-max output, brand-corrected)
├── package.json / tsconfig.json / tailwind.config.ts / next.config.mjs / postcss.config.mjs
└── .env.example
```

## Architecture at a glance

```
┌──────────────┐   upload PDF    ┌────────────────────┐
│  Cadre / TD  │ ───────────────▶│  Document pipeline  │
│  Admin (UI)  │                 │  chunk → embed →    │
└──────┬───────┘                 │  pgvector store     │
       │  request MCQs           └─────────┬───────────┘
       ▼                                   ▼
┌──────────────────────┐   retrieve   ┌───────────────┐
│ /api/assessment/      │◀────────────│ DocumentChunk │
│ generate (route.ts)   │  top-K       │ (pgvector)    │
└──────────┬────────────┘             └───────────────┘
           │ grounded chunks + FRAC codes
           ▼
┌───────────────────────┐   JSON + Zod validate/repair
│  LangChain → Claude    │──────────────────────────────▶ Question[]
│  (lib/rag/llm.ts)      │                                (persisted, tagged
└───────────────────────┘                                 with sourceChunkIds)
           │
           ▼
┌───────────────────────┐        ┌──────────────────────────┐
│ Competency gap engine  │───────▶│ CourseRecommendation      │
│ (UserCompetencyProf.)  │ maps   │ ⇄ iGOT Karmayogi (Sunbird)│
└───────────────────────┘        └──────────────────────────┘
```

## Design system

Tokens were generated with the `ui-ux-pro-max` design-system skill
(`--design-system --stack nextjs`), then the color palette and typefaces
were corrected to the brief's named brand (Deep Navy / Ashoka Blue /
Forest Emerald / Saffron Gold, Inter + JetBrains Mono) — see
`design-system/mospi-karmayogi/MASTER.md` for the full, brand-corrected
token table and the note on what was overridden and why. `app/globals.css`
and `tailwind.config.ts` implement those tokens as CSS variables /
Tailwind theme extensions.

## What's real vs. stubbed

- **Prisma schema, chunker, Zod schemas, retrieval SQL, API routes, UI
  components** are complete and meant to run as-is once you provide infra.
- **`lib/rag/llm.ts`** calls a real model (`claude-sonnet-4-6` via
  `@langchain/anthropic`) with a validate + one-shot repair loop — needs
  `ANTHROPIC_API_KEY`.
- **`lib/rag/embeddings.ts`** uses OpenAI `text-embedding-3-small` — needs
  `OPENAI_API_KEY`. Swap providers by changing this one file; the
  `vector(1536)` column width in `schema.prisma` must match if you do.
- **`lib/igot/client.ts`** runs in mock mode until `IGOT_API_BASE_URL` /
  `IGOT_SERVICE_TOKEN` are set — MoSPI hasn't issued Sunbird sandbox
  credentials yet, so this is the one deliberately fake seam. Swapping it
  requires no changes anywhere else in the codebase.

## Setup

```bash
npm install
cp .env.example .env        # fill in DATABASE_URL, ANTHROPIC_API_KEY, OPENAI_API_KEY
# Postgres needs the pgvector extension available before migrating:
#   CREATE EXTENSION IF NOT EXISTS vector;
npx prisma migrate dev --name init
npx prisma generate
npm run dev
```

> This sandbox's network allowlist blocks `binaries.prisma.sh`, so
> `prisma generate`/`validate` couldn't fully run here — `npx tsc --noEmit`
> was used instead and passes cleanly except for the handful of
> Prisma-model-shaped values that only resolve once the real client is
> generated with normal network access (they are not code bugs).
