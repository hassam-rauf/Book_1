import { useState } from 'react';
import { ChatMessage, Citation, ChatChunk, SearchResultItem } from './types';

let messageIdCounter = 0;
function makeId(): string {
  return `msg-${Date.now()}-${++messageIdCounter}`;
}

interface UseChatStreamResult {
  messages: ChatMessage[];
  loading: boolean;
  validationMsg: string;
  input: string;
  setInput: (v: string) => void;
  setValidationMsg: (v: string) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  clearMessages: () => void;
}

/**
 * Shared SSE streaming hook for ChatWidget (F4) and SelectionChatPanel (F5).
 *
 * @param backendUrl - Base URL for the RAG backend
 * @param selectedText - Optional selected text to prepend as context_passages[0] (F5)
 */
export function useChatStream(backendUrl: string, selectedText?: string, language: 'en' | 'ur' = 'en'): UseChatStreamResult {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationMsg, setValidationMsg] = useState('');

  function appendToken(id: string, text: string) {
    setMessages(prev => prev.map(m =>
      m.id === id ? { ...m, content: m.content + text } : m
    ));
  }

  function updateAssistant(id: string, content: string, citations: Citation[], isStreaming: boolean) {
    setMessages(prev => prev.map(m =>
      m.id === id ? { ...m, content, citations, isStreaming } : m
    ));
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const query = input.trim();
    if (!query) {
      setValidationMsg('Please enter a question.');
      return;
    }
    setValidationMsg('');
    setInput('');
    setLoading(true);

    const userMsg: ChatMessage = {
      id: makeId(),
      role: 'user',
      content: query,
      citations: [],
      timestamp: Date.now(),
      isStreaming: false,
    };
    const assistantId = makeId();
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      citations: [],
      timestamp: Date.now(),
      isStreaming: true,
    };
    setMessages(prev => [...prev, userMsg, assistantMsg]);

    try {
      // Step 1: retrieve passages from RAG backend
      const searchRes = await fetch(`${backendUrl}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, top_k: 5 }),
      });
      if (!searchRes.ok) throw new Error('Search failed: ' + searchRes.status);
      const searchData = await searchRes.json();
      const ragPassages = (searchData.results as SearchResultItem[]).map(r => ({
        text: r.text,
        chapter_title: r.chapter_title,
        section_heading: r.section_heading,
        score: r.score,
      }));

      // Step 2: build context_passages — prepend selectedText if provided (F5)
      const selectionPassage = selectedText?.trim()
        ? [{
            text: selectedText.trim(),
            chapter_title: 'Selected Text',
            section_heading: typeof document !== 'undefined' ? document.title : 'Textbook',
            score: 1.0,
          }]
        : [];

      const passages = [...selectionPassage, ...ragPassages];

      if (passages.length === 0) {
        updateAssistant(assistantId, "I couldn't find relevant information in the textbook for that question.", [], false);
        setLoading(false);
        return;
      }

      // Step 3: stream answer from chat endpoint
      const chatRes = await fetch(`${backendUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, context_passages: passages, language }),
      });
      if (!chatRes.ok) throw new Error('Chat failed: ' + chatRes.status);

      const reader = chatRes.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split('\n\n');
        buffer = events.pop() ?? '';

        for (const event of events) {
          const line = event.trim();
          if (!line.startsWith('data:')) continue;
          const jsonStr = line.slice('data:'.length).trim();
          if (!jsonStr) continue;

          try {
            const chunk: ChatChunk = JSON.parse(jsonStr);
            if (chunk.type === 'token' && chunk.text) {
              appendToken(assistantId, chunk.text);
            } else if (chunk.type === 'citations' && chunk.citations) {
              setMessages(prev => prev.map(m =>
                m.id === assistantId
                  ? { ...m, citations: chunk.citations as Citation[] }
                  : m
              ));
            } else if (chunk.type === 'error') {
              updateAssistant(
                assistantId,
                `⚠️ ${chunk.detail ?? 'Something went wrong'}. If the error persists, the AI quota may be exhausted — try again in a few minutes.`,
                [],
                false,
              );
              setLoading(false);
              return;
            } else if (chunk.type === 'done') {
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, isStreaming: false } : m
              ));
              setLoading(false);
              return;
            }
          } catch {
            // Malformed JSON chunk — skip
          }
        }
      }
    } catch (err) {
      updateAssistant(
        assistantId,
        `Something went wrong: ${err instanceof Error ? err.message : 'Unknown error'}. Please try again.`,
        [],
        false,
      );
    } finally {
      setLoading(false);
    }
  }

  return {
    messages,
    loading,
    validationMsg,
    input,
    setInput,
    setValidationMsg,
    handleSubmit,
    clearMessages: () => setMessages([]),
  };
}
