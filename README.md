# Retail Translator

A full-stack conversational translation app built to bridge language barriers between retail staff and customers — with context-aware translation, not just literal word-for-word conversion.

## The Problem

While working at the Apple Store, I regularly saw the same communication breakdown: staff and customers who didn't share a language would fall back on gestures, broken phrases, or a translation app that translated each message in isolation — losing the thread of the conversation. Most translation tools treat every message as a standalone sentence, with no memory of what came before. That works for a single phrase; it breaks down in a real, ongoing conversation ("What about in red?" is meaningless without knowing what "it" refers to).

This project is an MVP exploring whether retrieval-augmented generation (RAG) could solve that — giving the AI conversational memory, not just translation ability.

## How It Works

```
User types a message (staff or customer)
        │
        ▼
Message is embedded into a vector
        │
        ▼
Chroma is queried for the most relevant prior messages
        │
        ▼
Retrieved context + new message sent to Gemini,
with a system prompt instructing it to translate
naturally and use context only to resolve meaning
        │
        ▼
Response returned and displayed
        │
        ▼
New message is embedded and stored in Chroma
(after generating the reply, not before —
so it never matches against itself)
```

## Tech Stack

- **Frontend:** React
- **Backend:** Node.js, Express
- **LLM:** Google Gemini API (`gemini-flash-latest`) — text generation
- **Embeddings:** Google Gemini API (`gemini-embedding-001`)
- **Vector Database:** Chroma (local instance)

## Key Design Decisions

- **Separate frontend/backend.** API keys must never live in browser-shipped code — the backend is the only place secrets are held, and it's the natural seam for adding logic (like retrieval) without touching the UI.
- **Retrieve before store.** On each incoming message, relevant context is retrieved from Chroma *before* the new message is stored — otherwise a message would always match against itself as its own "most relevant" result.
- **Context vs. task, kept separate in the prompt.** The system prompt explicitly tells the model that retrieved context is for *understanding references* ("it," "that," "the red one") only — not something to translate or repeat. Blurring these caused the model to translate or echo prior messages instead of just the new one.
- **Role-aware translation direction.** Every message carries a `role` (staff/customer), since the correct translation direction depends on who's speaking, not just what they said.

## Known Limitations (MVP scope)

This is a week-one MVP, and a few things are deliberately unfinished:
- No input validation yet on empty/malformed messages (the model currently improvises a response rather than erroring cleanly).
- No loading state in the UI while waiting on a model response, and no protection against double-submitting a message mid-request.
- Chroma runs locally with no authentication or encryption at rest.
- CORS is wide open for local development and would need restricting to a specific origin before any real deployment.

## Running Locally

**Backend:**
```bash
cd backend
npm install
# add a .env file with GEMINI_API_KEY=your_key_here
npm run dev
```

**Chroma (separate terminal):**
```bash
chroma run --path ./chroma_data
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```