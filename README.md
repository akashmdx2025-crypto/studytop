# StudyForge AI — Antigravity IDE Prompt

**Problem Statement**: Students struggle to actively engage with passive study materials like notes and PDFs.

**Value Proposition**: StudyForge AI transforms any uploaded document into an interactive AI-powered study experience with chat, quizzes, flashcards, and summaries — all grounded in the user's own material.

**AI Component Explanation**: The app uses RAG (Retrieval-Augmented Generation) to chunk and embed documents, then retrieves relevant context to generate grounded responses, quizzes, and flashcards while guardrails prevent hallucination beyond the source material.

## GenAI Concepts Demonstrated

1.  **Constrained Prompting**: All prompts use structured system instructions with explicit rules, output format constraints, and response schemas.
2.  **RAG (Retrieval-Augmented Generation)**: Documents are chunked (500 tokens), embedded with `text-embedding-3-small`, and retrieved via cosine similarity.
3.  **Guardrails**: Input safety checks block injection; relevance checks (score < 0.3) refuse off-topic questions; output grounding validates AI proximity to source.
4.  **Evaluation & Logging**: Comprehensive logging of tokens, latency, and quality scores, viewable in the AI Logs dashboard.
5.  **Multimodal Input**: Supports PDF (via `pdf-parse`) and plain text (.txt, .md) uploads.
6.  **Deployment-Ready**: Built as a robust Full-Stack Vite + Express application.

## Tech Stack

- **Framework**: Vite + React + Express
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 + Shadcn/UI
- **AI**: OpenAI API (gpt-4o-mini)
- **Vector Store**: Custom In-Memory Vector Store
- **Parsing**: pdf-parse

## Setup Instructions

1. `git clone <repo>`
2. `npm install`
3. Add `OPENAI_API_KEY` to your secrets/.env
4. `npm run dev`

---
// source_handbook: week11-hackathon-preparation
