# Research: Chat Widget (F4)

**Feature**: 004-chat-widget
**Date**: 2026-03-15
**Questions resolved**: 4/4 NEEDS CLARIFICATION resolved

---

## Decision 1: Docusaurus Global Component Injection

**Decision**: Use `src/theme/Root.tsx` swizzle pattern.

**Rationale**: The `Root` component renders at the very top of the React tree, above the theme `Layout`, and **never unmounts** during SPA navigation. This makes it ideal for a floating chat button that must persist across all pages with consistent state. Official Docusaurus docs explicitly state Root is "for stateful logic that should not be re-initialized across navigations."

**Implementation sketch**:
```tsx
// book-site/src/theme/Root.tsx
import ChatWidget from '@site/src/components/ChatWidget';
export default function Root({ children }) {
  return <>{children}<ChatWidget /></>;
}
```

**Alternatives considered**:
- `injectHtmlTags` plugin — meant for static HTML; managing a React component's lifecycle is harder.
- Swizzle Layout — more invasive, wraps every page but does unmount/remount on navigation.
- Docusaurus plugin with client module — viable but adds indirection for no benefit.

---

## Decision 2: Gemini API Proxy Pattern

**Decision**: Add `POST /chat` endpoint to the existing FastAPI backend (F3). The browser never receives the Gemini API key. The endpoint accepts `{query, context_passages}` and returns `{answer, citations}`.

**Rationale**:
- Gemini API key stays on the server as an environment variable — Constitution Principle VI compliance.
- Reuses F3 infrastructure (same host, CORS already configured, same deployment unit).
- Zero additional deployment overhead vs. a separate serverless function.
- Proven pattern: Google AI Studio itself uses a server-side proxy for API key security.

**Two-call flow from browser**:
1. `POST /search` → RAG passages (existing F3 endpoint)
2. `POST /chat` → answer + citations (new F4 endpoint, sends passages as context)

**Alternatives considered**:
- Direct browser → Gemini: Exposes API key in client bundle — rejected (Constitution Principle VI).
- Cloudflare Workers / Vercel Edge: Adds deployment complexity; overkill for hackathon scope.
- Build-time baked API key (DOCUSAURUS_GEMINI_KEY env): Publicly visible in JS bundle — rejected.

---

## Decision 3: Chat Widget State Management

**Decision**: `useState` + `useReducer` local component state (Phase 1). No external state library.

**Rationale**:
- Spec Assumption: conversation resets on page navigation — no cross-component state sharing needed.
- Local state is colocated with the component, easiest to reason about.
- Avoids adding Zustand/Jotai dependency (Constitution Principle II: smallest viable diff).
- If persistence across pages is added later, a Zustand store can replace local state with minimal refactor.

**State shape**:
```ts
{ isOpen: boolean, messages: ChatMessage[], loading: boolean }
```

**Alternatives considered**:
- Zustand: Good for persistence; premature for Phase 1 scope.
- React Context: Not a state management tool — would add Provider boilerplate without benefit.
- Redux Toolkit: Severe overkill for a single floating widget.

---

## Decision 4: Streaming vs Batch for Gemini Response

**Decision**: Use **streaming** (`generate_content` with streaming iterator) via Server-Sent Events (SSE).

**Rationale**:
- Gemini 2.0 Flash time-to-first-token is ~0.53s; output speed is ~170 tokens/sec.
- With batch, the user stares at a spinner for 2–4 seconds. With streaming, text appears in ~0.5s.
- The `google-generativeai` Python SDK supports streaming with identical request structure to batch — zero additional complexity.
- FastAPI `StreamingResponse` + `text/event-stream` is a standard pattern with broad browser support.

**Streaming citation strategy**: Citations are appended after the full answer is streamed. The LLM is prompted to emit a `---CITATIONS---` marker at the end, allowing the frontend to split answer body from citation list.

**Alternatives considered**:
- Batch: Simpler response parsing but inferior UX for a chat interface.
- WebSockets: Overkill for single-shot Q&A; SSE is unidirectional and sufficient.
- Polling: Anti-pattern for streaming content.

---

## Summary

| Decision | Chosen Approach | Key Benefit |
|----------|----------------|-------------|
| Docusaurus injection | `src/theme/Root.tsx` | Persistent across navigation |
| Gemini proxy | FastAPI `POST /chat` | Key never in browser |
| State management | Local `useState` | Minimal complexity |
| Response delivery | SSE streaming | 0.5s TTFT perceived latency |
