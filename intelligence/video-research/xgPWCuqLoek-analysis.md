# Video Analysis: Claude Code Agentic RAG Masterclass

**Source URL:** https://youtu.be/xgPWCuqLoek
**Channel:** The AI Automators (Daniel & Alan)
**Duration:** ~2h 14m (8050 seconds / 134 minutes)
**Captured:** 2026-05-03
**Frame budget extracted:** ~80 frames (sparse, full-video scan)
**Transcript:** YouTube native captions (en) — full transcript captured

---

## 1. CORE TOPIC

The video is a long-form, end-to-end masterclass on **building an Agentic RAG (Retrieval-Augmented Generation) web application from scratch by collaborating with Claude Code as the coding agent**. The presenter (Daniel) builds the entire app live across 8 modules, narrating every Claude Code prompt, plan, build, validation cycle, course correction, and bug fix.

Two core philosophical positions drive the video:

1. **Naive RAG is dead. Agentic RAG is the new baseline.** Vector search is not enough — modern systems must combine vector search with text-to-SQL, web search, sub-agents, MCP servers, agent skills, and code-execution sandboxes.
2. **Collaborate with the AI, do not delegate.** The presenter explicitly contrasts this build with autonomous "Ralph Wigum loop" agents that you fire-and-forget. He stays in the loop on every plan, every commit, every bug.

The build target is a multi-user RAG SaaS-style app:
- React + TypeScript + Tailwind + shadcn/ui front end (Vite-bundled)
- Vanilla Python + FastAPI back end (no frameworks like LangChain/LlamaIndex)
- Supabase (Postgres + pgvector + Auth + Storage + Realtime + Row Level Security)
- Docling for multi-format document parsing
- Cohere or Qwen3 reranker
- Tavily for web search
- Both cloud LLMs (OpenAI, OpenRouter — GLM 4.7, Qwen3 embeddings) and local LLMs (LM Studio, Qwen3-VL-30B mixture-of-experts) supported
- LangSmith for observability

By the end of 134 minutes the presenter ships an alpha-grade agentic RAG app with chat, document ingestion, hybrid search, reranking, metadata extraction, text-to-SQL, web search, dark mode, and sub-agents — and explicitly flags that deployment, RLS hardening, and proper test infrastructure are deferred to follow-on videos.

---

## 2. KEY CONCEPTS

### 2.1 Naive RAG vs. Agentic RAG
- **Naive RAG**: User query → embed → cosine similarity over a single vector store → stuff top-k chunks into the prompt → generate answer. One retrieval call, one generation, no loop.
- **Agentic RAG**: The LLM is given multiple retrieval tools (vector search, keyword search, text-to-SQL, web search, file system bash, document analyzer sub-agent) and decides — possibly across multiple turns — *which* tool to call, *with what arguments*, and *whether to call again* before answering. The retrieval is itself a multi-step reasoning loop.

### 2.2 Hybrid Search
Pure semantic (vector) search misses keyword matches and exact identifiers (product codes, SKUs). Hybrid search runs **vector search + Postgres full-text/keyword search in parallel**, then fuses the result lists.

### 2.3 Reciprocal Rank Fusion (RRF)
A score-free way to merge two ranked result lists. Each result's final score is `Σ 1 / (k + rank_in_list_i)` across all lists it appeared in. Avoids the problem of scoring scales differing between BM25 and cosine similarity.

### 2.4 Reranking
After RRF gives you a fused candidate list (e.g. top 50), a dedicated **cross-encoder reranker model** scores each (query, candidate) pair more accurately than the embedding model could. The video supports two providers:
- **Cohere** (cloud, paid) — easy API key
- **Qwen3 reranker** (local) — runs on the user's RTX 5090 via LM Studio

### 2.5 Embeddings & Embedding Dimensions
A vector representation of text. Chosen embedding model determines the dimension (1536 for OpenAI ada/3-small, 4096 for Qwen3-Embedding). Once chunks exist with one dimension, you cannot swap to a different-dimension model without wiping the vector column. The build hits this exact wall when switching from OpenAI to Qwen3.

### 2.6 PG Vector / pgvector
Postgres extension that adds a `vector(N)` column type and indexes (HNSW, IVFFlat) for ANN search. Used inside Supabase to keep storage, auth, and vectors in one DB.

### 2.7 Record Manager (Module 3)
A deduplication layer. On ingestion the system computes a **content hash** of the file. If the hash matches an existing record → skip processing entirely. If the file changed → delete all old chunks for that document, re-chunk, re-embed, re-insert (the presenter rejects partial-reembed strategies because they leave orphan chunks).

### 2.8 Metadata Extraction & Filtering (Module 4)
At ingestion, an LLM looks at the first 8,000 characters of the document and extracts structured metadata: `title`, `summary`, `document_type`, `topics[]`, `language`. Stored on the `documents` row and propagated to each `chunk`. Stored as JSON-driven schema configurable from the admin Settings UI (not hardcoded). **Pydantic** is used for validation. Crucial caveat surfaced in testing: the agent gets *over-zealous* with metadata filters and returns zero chunks when filter values mismatch. Fix is system-prompt engineering, not removing the feature.

### 2.9 Docling Pipeline
A document-parsing library that supports PDF, DOCX, PowerPoint, etc. Two pipelines:
- **Standard pipeline** — heuristic + small ML models, ~2 GB of PyTorch dependencies, ML weights downloaded on first run.
- **VLM pipeline** — uses a vision-language model (VLM) to look at PDF pages as images. The presenter offloads VLM work to his RTX 5090 server.

### 2.10 Sub-Agents (Module 8)
A second LLM agent the main agent can spawn via an `analyze_document` tool. The sub-agent receives a `document_id` + a query, loads the **entire document** into its context window, and returns an extraction. Critical purpose: **keep the main agent's context window clean**. The main agent only sees the sub-agent's final response, not the full document.

### 2.11 Context Engineering / Context Window Management
A recurring discipline: the presenter checks his Claude Code status line constantly and clears (`/clear`) when usage crosses ~50%. He uses `progress.md` as a handoff document so a fresh agent can resume mid-task. Multi-Claude is a "productivity hack" — running 2–3 Claude sessions in parallel on different features.

### 2.12 Plan / Build / Validate / Iterate Loop
The presenter's core AI dev loop:
1. **Plan Mode** (Shift+Tab) — Claude is read-only and produces a plan. Often spawns plan sub-agents.
2. Save plan to `agent-plans/` folder.
3. `/clear`.
4. `/build` slash command — drag the plan in, Claude executes.
5. Manual validation in browser + Playwright MCP-driven validation by Claude.
6. Bug-fix sub-loop, possibly with new plans.
7. Commit + tag a release per module.

### 2.13 Manage RAG vs. BYO RAG
- **Managed RAG** = OpenAI Responses API + vector_store, or Gemini File Search. Drop files into a bucket, ask questions. Black box: chunking, embeddings, retrieval strategy invisible. Per-tool-call billing ($2.50 / 1k calls) and per-GB storage ($0.10/GB on OpenAI). Module 1 ships this.
- **BYO RAG** = run your own pipeline (PG vector + your own chunking/embeddings/retrieval). Modules 2–8 build this.

### 2.14 Row Level Security (RLS)
Postgres feature where each row carries a `user_id` and a policy says `where user_id = auth.uid()`. The chat threads, messages, documents, and chunks tables all use this so different logged-in users see only their own data. The shared `sales_data` table for text-to-SQL is intentionally global, which the presenter flags as needing a custom RLS policy (currently "unrestricted", which he calls out as wrong).

### 2.15 Database-Level Security for Text-to-SQL
The presenter rejects parameterized query templates in favor of letting the LLM emit **raw SQL**, but binds the connection string to a **dedicated Postgres role with SELECT-only on a single table**. Even if the LLM emits `DROP TABLE`, the database refuses. Security is enforced where it can never be bypassed.

### 2.16 Streaming and SSE
The frontend talks to the backend over HTTP for non-streaming and **Server-Sent Events (SSE)** for streamed assistant responses, tool-call events, and sub-agent events.

### 2.17 Hot Reload
Vite dev server (port 5173) hot-reloads the React frontend; Uvicorn (port 8000) serves the Python backend. Both restart-able via a `scripts/restart-all.sh` the presenter has Claude generate to avoid repeating the same prompt.

### 2.18 Status Line + CC Status Line
A community tool (`CC StatusLine` repo) that shows the current Claude model, token usage %, and context budget at the bottom of the terminal. Treated as essential.

### 2.19 Slash Commands & CLAUDE.md
- `claude.md` — global rules, lean and deliberately short (loaded on every conversation).
- `/onboard` — custom command that scans repo, git log, PRD, plans, and `progress.md` to ground a fresh agent.
- `/build` — accepts a plan path, executes plan + tests + updates progress.
- Settings JSON file controls allowed/denied/ask-required tool permissions per session. Avoids YOLO mode.

---

## 3. ARCHITECTURE

### 3.1 Local Architecture (the actual build)

```
┌──────────────────────────────── Local Computer / Network ────────────────────────────────┐
│                                                                                          │
│  ┌─────────────┐       npm run dev / compile                                             │
│  │  Codebase   │ ─────────────────────────► ┌──────────────────┐                         │
│  │  Claude Code│                            │  Vite Dev Server │ ── serves ──► Browser  │
│  │  Cursor IDE │                            │  Node @ :5173    │     (HTML/CSS/JS)      │
│  └─────────────┘                            └──────────────────┘                         │
│                                                       │ HTTP/SSE                         │
│  Frontend stack:                                      ▼                                  │
│  React + TypeScript + Vite + Tailwind + shadcn/ui    ┌──────────────────┐                │
│                                                      │  Uvicorn Server  │                │
│  Backend stack:                                      │  Python @ :8000  │                │
│  Python + FastAPI + Docling                          └──────────────────┘                │
│                                                       │      │                           │
│                                                       │      └─► LM Studio (local LLMs:  │
│                                                       │             Qwen3-VL-30B,        │
│                                                       │             Qwen3-Embed)         │
│                                                       │      └─► OpenAI / OpenRouter     │
│                                                       │             (cloud LLMs)         │
│                                                       ▼                                  │
└──────────────────────────────────────────────────────────────────────────────────────────┘
                                                        │
                                                        ▼
                               ┌────────────────────────────────────────────┐
                               │            Supabase (Cloud)                │
                               │  Postgres + pgvector + Auth + Storage      │
                               │  + Realtime  ◄── live updates to browser   │
                               └────────────────────────────────────────────┘
```

### 3.2 Production Architecture (described, not deployed)

```
Local Codebase ── git push ──► GitHub ──► triggers build/deploy
                                                │
                                                ├─► Frontend Server: Vercel / Cloudflare / nginx
                                                │   serves rag.app  (static HTML/CSS/JS)
                                                │
                                                ├─► Backend Server: FastAPI + Uvicorn
                                                │   serves api.rag.app
                                                │
                                                ├─► Database: Supabase (managed)
                                                │
                                                └─► AI Models: OpenAI / OpenRouter / self-hosted
```

The presenter intentionally defers production deployment to a future video, citing the need for proper dev → staging → prod with database migrations, rollback strategy, and release trains as too large for this session.

### 3.3 Application Module Architecture (PRD)

```
┌──────────────────────────────────────────────────────────────────┐
│                   Product Requirements Document                  │
│                                                                  │
│  1. App Shell + Managed RAG                                      │
│  2. BYO Retrieval + Memory                                       │
│  3. Record Manager (deduplication via content hash)              │
│  4. Metadata Extraction + Filtering                              │
│  5. Multi-Format Support (Docling)                               │
│  6. Hybrid Search + Reranking (RRF + Cohere/Qwen3)               │
│  7. Additional Tools (text-to-SQL + Tavily web search)           │
│  8. Sub-Agents (analyze_document tool)                           │
└──────────────────────────────────────────────────────────────────┘
```

### 3.4 AI Dev Loop Diagram (shown on screen)

```
                         PRD
                          │
                   ┌──────▼──────┐
                   │    PLAN     │ ◄──── (plan mode, optional sub-agents)
                   └──────┬──────┘
                          │
                   ┌──────▼──────┐
                   │    BUILD    │ ◄──── (/build command, parallel sub-agents)
                   └──────┬──────┘
                          │
                   ┌──────▼──────┐
                   │    TEST     │ ◄──── (Playwright MCP + manual smoke test)
                   └──────┬──────┘
                          │
                   ┌──────▼──────┐
                   │   COMMIT    │ ◄──── (one tag/release per module)
                   └─────────────┘
```

### 3.5 Sub-Agent Architecture (Module 8)

```
User → Main Agent (Qwen3-VL-30B)
            │
            │  triggers
            ▼
  ┌─────────────────────┐
  │ analyze_document    │── isolated sub-agent ──► loads full doc into its own context
  │ tool                │                          returns extraction back to main
  └─────────────────────┘
            │
            │  main agent never sees full doc — only the sub-agent's response
            ▼
       Final Answer
```

Front end renders both main-agent thinking, the tool call, the sub-agent's nested reasoning bubble, and the streamed response. Significant rendering complexity (and a real bug shown live around `<think>` tags duplicating).

---

## 4. TOOLS AND TECHNOLOGIES

### Coding agents / IDEs
- **Claude Code** (primary) — terminal-based, plan mode, sub-agents, slash commands, `/build`, `/onboard`, `/clear`, `--resume`
- **Cursor** — used as the IDE for file visibility; also used in **Debug mode** when Claude Code spins its wheels (the debug mode generated hypotheses, added logging, narrowed root cause for the Langsmith tracing bug)
- **Google Antigravity** — mentioned as alternative
- **VS Code** — mentioned as alternative
- **GitHub Desktop** — used to commit + tag releases
- **Playwright MCP** — installed for browser-driven validation

### Frontend stack
- **React** — UI framework
- **TypeScript** — type safety
- **Vite** — bundler / dev server (port 5173)
- **Tailwind CSS** — utility styling
- **shadcn/ui** — component library Claude can drop in (buttons, dialogs, forms)

### Backend stack
- **Python** — primary language for AI
- **FastAPI** — HTTP framework
- **Uvicorn** — ASGI server (port 8000)
- **Pydantic** — schema validation for metadata extraction
- **Docling** — document parsing (PDF, DOCX, PPTX, with optional VLM pipeline)

### Data layer
- **Supabase** — Postgres + Auth + Storage + Realtime + Row-Level Security
- **pgvector** — vector similarity search inside Postgres
- **Supabase CLI** — used for migrations and DB ops
- **Postgres roles** — used to lock down text-to-SQL to read-only on a single table

### LLM providers
- **OpenAI** — Module 1 only (Responses API, replaces deprecated Assistants API)
- **OpenRouter** — Modules 2+ (used for GLM 4.7 chat and Qwen3 embeddings)
- **LM Studio** (local) — running Qwen3-VL-30B mixture-of-experts and Qwen3-Embedding-Small on RTX 5090 (32 GB VRAM)
- **Ollama** — mentioned as alternative to LM Studio
- **Gemini File Search** — mentioned as a managed-RAG alternative to OpenAI

### Models named
- **GLM 4.7** (via OpenRouter)
- **Qwen3-VL-30B** mixture-of-experts (local)
- **Qwen3 Embedding** (local + via OpenRouter)
- **Qwen3 Reranker** (local)
- **Cohere reranker** (cloud)

### External services
- **LangSmith** — observability (traces every LLM call, system prompt, tool call, response)
- **Tavily** — web search API, called from a `web_search` tool
- **GitHub** — version control + release tagging

### Other tooling mentioned
- **CC Status Line** — community status-bar tool for Claude Code
- **Mistral OCR** — alternative to Docling
- **Llama Parse** — alternative to Docling
- **Datalab OCR** — alternative to Docling
- **SearXNG** — alternative to Tavily for local web search
- **MTEB leaderboard** — for choosing embedding models
- **DeepEval** — referenced in his back catalog for ongoing AI eval

### Patterns NOT used
- LangChain — explicitly avoided
- LlamaIndex — explicitly avoided
- spec-kit / BMAD — mentioned as great planning tools but deliberately not used to keep the PRD lightweight

---

## 5. IMPLEMENTATION STEPS

### Module 1 — App Shell + Managed RAG
1. Clone the GitHub starter repo (`claude-code-agentic-rag-masterclass`) into Cursor.
2. Open Claude Code in the integrated terminal; install CC StatusLine for token visibility.
3. Configure `claude.md` with rules: no frameworks, raw SDK calls, RLS isolation, plan-storage convention, plan/build/validate loop, `progress.md` updates.
4. Run `/onboard` slash command → Claude scans repo + PRD + git log + plans folder.
5. Enter Plan Mode (Shift+Tab), kick off Module 1 planning. Plan sub-agent runs separately, protecting main context.
6. Save plan to `agent-plans/01-app-shell.md`.
7. `/clear`, then `/build <plan-path>` from a fresh context.
8. Claude builds 14 tasks: backend skeleton, Supabase client, DB migrations, frontend skeleton, auth pages, chat UI, OpenAI integration.
9. Provide env vars: `SUPABASE_URL`, anon key, service role key (legacy keys), `OPENAI_API_KEY`, `LANGSMITH_API_KEY`.
10. Run SQL migrations via Supabase CLI (Claude does it after linking project).
11. Manual validation: log in as `test@test.com`, send chat, verify thread + messages tables in Supabase.
12. Migrate from deprecated OpenAI Assistants API → OpenAI Responses API after realizing PRD spec was outdated.
13. Create vector_store in OpenAI Playground, attach PDF, copy vector_store_id, drop into env, restart backend.
14. Validate manage-RAG end-to-end: ask about "Whirlpool refrigerator" — answer pulls from PDF.
15. Multi-Claude productivity: while one Claude debugs Langsmith tracing, a second Claude adds front-end polish (dynamic chat titles, stop button, loading icon).
16. Commit with Cursor → tag `v0.1` → push to private GitHub repo.

### Module 2 — BYO Retrieval + Memory
1. Plan via Plan Mode. Daniel insists Claude break parallelizable phases into multiple sub-agents.
2. Build creates: ingestion UI, file-to-storage pipeline, chunking, embeddings, pgvector upsert, model-provider selector, real-time ingestion status.
3. Test isolation: create `test2@test.com`, upload a different doc, log out / in to verify RLS.
4. Discover bug: API keys stored as plain text in DB → trigger plan mode for a security plan (Daniel converts settings to global admin-only).
5. Encounter dimension mismatch: column hardcoded as `vector(1536)` but Qwen3 produces 4096 dims. Claude widens column to dynamic.
6. Validate end-to-end with both cloud (GLM 4.7 + Qwen3 embeddings via OpenRouter) and local (Qwen3-VL-30B via LM Studio).
7. Tag `v0.2`.

### Modules 3 + 4 — Record Manager + Metadata (built in parallel)
1. Two Claude instances kicked off simultaneously planning each module.
2. Module 3 plan: SHA-based content hash, skip-if-unchanged, full re-embed on change.
3. Module 4 plan answers planner questions: same LLM as chat for extraction, expandable detail panel per doc, no backfill, dynamic schema saved as JSON in `global_settings` table.
4. Build runs with multiple general-purpose sub-agents in parallel.
5. Validate dedupe: re-upload same file → "Document unchanged. Skipped processing."
6. Validate metadata: text file uploaded → LLM-generated title, summary, document_type, topics, language all present.
7. Discover overzealous metadata-filter bug — agent passes `document_type=article` when actual is `reference`, returns zero chunks. Fix is system-prompt engineering only.
8. Tag `v0.3-0.4`.

### Module 5 — Multi-Format (Docling)
1. Plan: install Docling only (no Mistral/unstructured). Accept ~2 GB PyTorch + first-run ML downloads.
2. Build wires Docling standard pipeline; VLM pipeline points at the RTX 5090 server.
3. Smoke-test PDF ingestion. Performance issue: laptop hits 92% RAM with 16 PDFs.
4. Iteration: Claude finds the file is being loaded into memory twice and there's no concurrency cap. Fix adds a `MAX_CONCURRENT_INGESTIONS=3` constant; later raised to 10.

### Module 6 — Hybrid Search + Reranking
1. Plan: replace vector-only with hybrid (full-text + vector) + RRF + optional rerank (Cohere or local Qwen3 reranker).
2. Build adds dual-search Postgres functions, RRF merger, reranker abstraction.
3. Validate: trace shows `rerank: 0.75, rrf: 0.1, similarity: 0.47` when Cohere key is set; only `rrf + similarity` when not. Confirms reranker is wired.
4. Tag `v0.5-0.6`.

### Module 7 — Additional Tools (text-to-SQL + web search)
1. Plan: text-to-SQL with raw SQL but database-level read-only role; web search via Tavily.
2. Create `sales_data` example table with dummy orders.
3. Daniel rejects Claude's first proposal of parameterized query templates; insists on raw SQL + dedicated read-only Postgres user.
4. Bug: Claude initially built a fallback that "ignored failed queries and returned all rows" — silent leak, removed.
5. Bug: `execute_sql_as_reader` RPC function was over-engineered. Daniel forces the simpler approach: a new Postgres role `sql_reader` with `SELECT` grant on `sales_data` only.
6. Get Tavily API key, drop into Settings UI, validate web search by asking "latest weather in Galway, Ireland".
7. Add dark mode (separate prompt, separate Claude session).

### Module 8 — Sub-Agents
1. Plan: hierarchical agent — main agent spawns `analyze_document` sub-agent which loads entire doc into its own context.
2. Build does both backend (sub-agent runtime + tool) and front end (nested rendering of main-agent thinking, tool call event, sub-agent reasoning bubble, streamed response).
3. Bug: `analyze_document` errors with "document not found" — turns out main agent passes file *name* instead of `document_id`.
4. Bug: Supabase Python client raises on 204 No Content instead of returning None — fix in client wrapper.
5. Bug: thinking-tag bubble jumps below tool call rendering after sub-agent finishes — fix by adding tool-call-complete event.
6. Final smoke test: "Summarize the Naire 24-inch built-in oven, here's the product code" → searches docs → triggers sub-agent → loads full PDF → returns summary.
7. Test on local Qwen3-VL-30B (no `<think>` tags but tool call sequence still works).
8. Final commit, tag, push.

### End-of-build state
The presenter calls it an "alpha version" — works end-to-end smoke-tested but lacks:
- Production deployment infrastructure
- Full regression suite execution discipline
- Hardened RLS on `sales_data`
- Optimized Docling ingestion throughput

---

## 6. KEY QUOTES

> "Despite all of the advancements over the last 12 months, RAG is still the fundamental way to ground your AI systems in your private company data. Because what else is there other than retrieval?"

> "There has been an evolution though from naive RAG to agentic RAG. Vector search is no longer seen as the silver bullet for all retrieval. A hybrid strategy is needed that encompasses things like text to SQL for structured data, text to cipher for graph data, bash commands to GP file systems and more."

> "These are two fundamentally different philosophies with AI assisted coding at the moment. You either collaborate and stay in the loop or you delegate and walk away. And the reason we're using the collaborative approach today is that we're learning as we build and it allows the solution to evolve on a solid foundation."

> "You don't have to have used clawed code before, nor do you need to know how to code. But you do need to be as technically minded and willing to learn about things like APIs and databases and system architecture. Because in the workflow that I'm going to show you, you're not the one doing the coding. Applaud is your job is to guide it to understand what you're asking it to build to catch when something goes in the wrong direction."

> "Generally speaking, if that goes over 50%, I generally look to start a new conversation."

> "A key productivity hack is to have multiple clouds running at the same time. So as one Claude agent is working through a problem, another Claude agent can work at a completely different feature."

> "Generally speaking, I prefer to clear the session and start from scratch."

> "You need to be on the lookout for prompts that you're continually providing any kind of duplication of effort. You need to see is there a way that you can create slash commands, create scripts, make life easier for yourself so you constantly don't repeat yourself to the agent."

> "It's a black box. So we have no idea actually how it does it." (on managed RAG services)

> "Surely what you're proposing means that the LLM could delete all data in the table." — followed by Claude conceding: "Yeah, you're completely right and I was wrong to suggest relying on Python validation alone is the solution." (defining moment for database-level security)

> "Stop overengineering it." (Daniel correcting Claude on the RPC-function approach to read-only SQL)

> "You can kind of see how a code base can go off track fairly quickly. And this is just a perfect example of it. Like here it was creating database functions and using RPC and essentially was creating a system that was highly complex and actually doesn't even work and doesn't actually have the security that we need."

> "Definitely not committing to git enough as well... If we were committing to git kind of a lot more frequently, it would be easier to roll back."

> "I would in all reality call this an alpha version. It hasn't been fully tested. I've done smoke tests end to end. There's been a level of validation that Claude has carried out, but there's a lot more testing to be done on this application."

> "On the one hand, we have come pretty far in these eight modules. On the other hand, we are only scratching the surface."

> "It is amazing how complex these interfaces can get."

> "We do need to be able to see all the various tool calls that we're going to be generating." (on why LangSmith is non-negotiable)

> "Whether you're using AI coding or not, you need a way of formally managing the release cycle and release trains."

---

## 7. BUSINESS USE CASES

The build is framed around a concrete domain example: **appliance product manuals**. The presenter has an SFTP folder with 9,000 PDF product manuals (refrigerators, dryers, ovens, freezers) and uploads ~150 locally to test. Real-world questions tested live:
- "How do I install the filter cartridge on my refrigerator?" (with a model number)
- "Tell me about the Whirlpool refrigerator"
- "Tell me about the Samsung electric dryer"
- "Summarize the Naire 24-inch built-in oven" + product code
- "Can this be used in the United States?" (web search fallback)
- "What's the total value of all orders placed by Metro Office?" (text-to-SQL on a sales table)
- "Give me a breakdown of these orders" (multi-turn SQL)

Generalizes naturally to any document-heavy customer-support / knowledge-base / internal-search business: legal, insurance, healthcare records, HR policies, technical product documentation, university course materials, ERP knowledge bases.

The presenter explicitly mentions his and his brother's combined background: "deploying ERPs and e-commerce platforms in large scale enterprises" — positioning the build as enterprise-relevant.

---

## 8. COSTS AND INFRASTRUCTURE

### Hardware mentioned
- **RTX 5090** server with 32 GB VRAM — runs Qwen3-VL-30B mixture-of-experts at 70k token context (right at the GPU limit) and Qwen3 embeddings simultaneously
- **Gaming laptop** with 8 GB VRAM — runs Docling's smaller standard-pipeline ML models locally
- Mention that 70k context length on the 5090 is "right at the limit of the GPU memory"

### Cloud costs cited
- **OpenAI File Search**: $0.10 per GB stored + $2.50 per 1,000 tool calls — flagged as a meaningful bill at scale
- **Gemini File Search**: cheaper than OpenAI, but "who's to say they might not increase that cost in the future"
- **Supabase free tier**: up to 2 projects, but they "turn them off after a few days" — fine for tutorial, not production
- **Claude Code subscription**: implied (presenter hits a 45-minute usage block mid-build)
- **OpenRouter**: pay-per-token, used for GLM 4.7 + Qwen3 Embeddings
- **Tavily**: simple API key, paid
- **Cohere**: simple API key, paid
- **LangSmith**: free tier sufficient for this build

### Infra strategies
- Local-first development. App stays on `localhost:5173` (Vite) + `localhost:8000` (Uvicorn) for the entire 134-minute build.
- Production deployment is **described** (GitHub → Vercel/Cloudflare/nginx for frontend, GitHub → backend server for FastAPI/Uvicorn, Supabase managed) but **deferred** to a future video.
- Air-gapped option discussed: run Supabase via Docker locally, run all LLMs via LM Studio, publish frontend to local network. Possible but not demonstrated.
- ENV file management: `.env` per app (`backend/.env`, `frontend/.env`), gitignored. API keys for runtime config (LLM, embeddings, reranker, Tavily, Cohere) saved to a Supabase `global_settings` table — flagged as plaintext storage which the presenter calls out as not ideal but pragmatic.

---

## 9. WHAT IS MISSING OR COULD BE IMPROVED

The presenter is unusually candid about the gaps:

1. **Production deployment** — explicitly deferred. No Docker, no CI/CD, no dev/staging/prod, no blue-green, no migration discipline, no rollback strategy.
2. **No proper feature branching** — uses main branch only "for those who are starting off in development". Acknowledges this is bad practice.
3. **Insufficient git commit cadence** — only commits at end of modules. Hits multi-hour debug sessions where rollback would have been useful.
4. **Test suite quality** — the validation-test suite was added late (after Module 2). Many tests exist but are LLM-driven (cost concerns) rather than codified scripts.
5. **`sales_data` table has RLS disabled (unrestricted)** — flagged on screen as wrong: "unrestricted means anyone in the world can access. So we definitely need to enable RLS on this".
6. **API keys saved in plain text in Supabase** — "doesn't exactly seem like best practice".
7. **Docling ingestion throughput** — 16 PDFs maxes out laptop RAM; concurrency capped at 3 (later 10) but presenter says "still nowhere near as fast as it needs to get to". Bottleneck unidentified (LLM call vs Docling).
8. **Metadata filter overzealousness** — agent often returns zero chunks because it sets `document_type=article` when actual is `reference`. Fixable with better system prompts but not solved in this build.
9. **System prompts are minimal** — no proper retrieval-strategy prompting; agent doesn't progressively refine queries the way Claude Code itself does.
10. **No code-execution sandbox tool** — mentioned as a future module ("agentic rag should also have arbitrary code execution in a sandbox").
11. **Sub-agent UI rendering bugs** — `<think>` tags duplicate; nested tool-call timeline misorders. Patched but presenter says "it is amazing how complex these interfaces can get".
12. **Local model context limits** — Qwen3-VL-30B is "kind of at the edge of what these local models can do" for multi-tool agentic loops; agent doesn't always trigger the right tool.
13. **No formal evaluation framework** — DeepEval is mentioned for follow-on, not used here.
14. **No knowledge-graph retrieval** — the GraphRAG module is an existing video on the channel but explicitly out of scope for this build.
15. **Single-tenant architecture only at user-isolation level** — no concept of organizations / customers / tenant routing.

Direct presenter quote: "On the one hand, we have come pretty far in these eight modules. On the other hand, we are only scratching the surface. There's so much deeper that we can and need to go with this."

---

## 10. CONNECTION TO DEASSISTS

**DeAssists is an AI-first Education ERP SaaS, multi-tenant, AI-hookable, sellable to universities globally, BCBT first external tenant, September 2026 target.** Several elements of this video are directly load-bearing for what we're building.

### Directly applicable

1. **Agentic RAG architecture as the AI substrate for DeAssists.** Universities have deep document corpora (course catalogs, regulations, student handbooks, accreditation documents, faculty CVs, syllabi, lecture notes, lab manuals). The hybrid-search + reranking + metadata-filtering + sub-agent pattern from Modules 6 + 4 + 8 is exactly the retrieval shape for "ask the ERP anything about this institution".

2. **Multi-tenant isolation via Postgres RLS**. We already use Supabase-style patterns. The video's RLS approach (per-user `user_id` policies on threads/messages/documents/chunks) maps cleanly onto our per-tenant `tenant_id` policies. The cautionary tale of leaving `sales_data` "unrestricted" is exactly the kind of bug we must never ship — every DeAssists table must be tenant-scoped from day one.

3. **Database-level security for text-to-SQL** is gold for DeAssists. If we let an AI assistant answer "show me all students who registered late this semester" via SQL, the read-only Postgres role pattern is the only defensible approach. Parameterized templates won't scale to the breadth of EDU questions; raw SQL bound to a `tenant_reader` role with `SELECT` on a curated view set is the right shape.

4. **Sub-agents for full-document analysis**. Course applications, transcripts, accreditation reports — these are long documents. The `analyze_document` sub-agent pattern lets the main DeAssists agent stay focused on a student's question while a worker chews through a 50-page document in isolation. This is the pattern for "AI-hookable" surfaces in our roadmap.

5. **Plan / Build / Validate dev loop with PRD + plans folder + progress.md**. This mirrors our EAGLE methodology (Mode 1 gap report, Mode 2 spec, Mode 3 execute) almost exactly — the presenter is independently recreating the same discipline. Worth comparing his slash commands (`/onboard`, `/build`) against our `/eagle-mode1`, `/eagle-mode2`, `/eagle-mode3` and seeing if any of his phrasing tightens ours.

6. **Multi-Claude productivity pattern**. He runs 2–3 Claude sessions in parallel on independent features. This maps onto our parallel agent orchestration philosophy in `369-ECC` and `AGENTS.md`.

7. **Context management at 50% trigger**. A simple, durable rule. Worth canonicalizing in our brain files if not already there.

8. **LangSmith for observability**. We will need this (or Langfuse, or self-hosted equivalent) once we have AI features wired into the portal. The video's argument — "you will end up living in Langsmith looking at traces" — is non-negotiable for production AI.

9. **Local-model fallback (LM Studio + Qwen3)**. For BCBT specifically and for any tenant with strict data-residency requirements (some EDU institutions in EU/India), a fully air-gapped variant where DeAssists' AI runs against a tenant-local Qwen3 server is a real differentiator. The video shows this is achievable today on a single RTX 5090.

10. **Hybrid search > pure semantic**. Education content is filled with course codes, student IDs, semester numbers, accreditation reference numbers — exactly the kind of identifiers that pure vector search misses. Postgres full-text + pgvector with RRF is the right default for DeAssists search.

11. **Metadata extraction for course / syllabus / regulation classification**. The Module 4 pattern (LLM extracts `document_type`, `topics`, `language` at ingest) maps to extracting `course_code`, `semester`, `program`, `accreditation_body` from EDU documents — and then filtering retrieval by them.

12. **Record manager for course catalog refresh cycles**. Universities re-publish documents annually. SHA-based dedupe + delete-and-reembed-on-change is the right pattern for keeping our vector store clean across years.

13. **Anti-pattern lessons**:
    - **Lazy LLM behaviors** — the silent fallback that returned all rows when SQL failed is exactly the kind of bug that would leak student data. Every DeAssists fallback must fail loud.
    - **Over-engineered RPC functions** — Claude proposed an `execute_sql_as_reader` Postgres function with Python-layer validation. Daniel correctly insisted on Postgres-role-level security. Same lesson applies anywhere we're tempted to wrap security checks in application code.
    - **Hardcoded vector dimensions** — the `vector(1536)` migration that broke when switching to Qwen3 (4096) is a warning to keep our migrations dimension-agnostic from day one.
    - **Plain-text API keys in DB** — the video keeps them but flags it as wrong. We must encrypt at rest (Supabase Vault or libsodium) for any tenant-supplied credentials.
    - **Status updates from Claude lying about completion** — Claude said it had finished validation when it had skipped half the steps. We need explicit acceptance criteria + machine-checkable validation, not LLM self-reports.

### Indirectly applicable

14. **The presenter's GitHub starter repo and PRD format** — worth a look for inspiration when we open-source DeAssists modules.
15. **The DeepEval / RAG evaluation approach** referenced in his back catalog — relevant when we define our internal AI eval harness.
16. **Knowledge-graph RAG** (his GraphRAG video, 135k views) — possibly relevant for representing prerequisites / curriculum dependencies / faculty-to-publication networks in EDU domain.

### What we should *not* copy
- Single-branch `main` workflow — DeAssists already enforces feature branches + Latha review on portal commits per `CLAUDE.md`.
- `git add .` blanket commits — DeAssists `CLAUDE.md` has a hard rule against this.
- Direct-to-production deployment — DeAssists has explicit dev/dev_v2/main discipline.
- `test@test.com` style test credentials in `claude.md` — convenient for tutorials, unsafe for our brain files.

### Concrete follow-ups for the DeAssists brain
- Add an entry in `intelligence/video-research/INDEX.md` (if it exists) pointing here.
- Consider whether `/eagle-mode1` should add a "research existing implementations on YouTube/GitHub" step similar to his GitHub-search-first rule.
- Cross-reference this analysis against any future feature in `project/feature-registry.md` that involves agentic retrieval — particularly the AI assistant surfaces and the document-ingestion pipeline for tenant onboarding.
- The `analyze_document` sub-agent pattern is a strong candidate for a documented EAGLE pattern in `skills/eagleskill/`.

---

**End of analysis.**
