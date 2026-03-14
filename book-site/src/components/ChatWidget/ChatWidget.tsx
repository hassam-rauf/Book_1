import React, { useState, useRef, useEffect } from 'react';
import styles from './ChatWidget.module.css';
import { ChatMessage, Citation, ChatChunk, SearchResultItem } from './types';
import MessageList from './MessageList';

interface ChatWidgetProps {
  backendUrl: string;
}

let messageIdCounter = 0;
function makeId(): string {
  return `msg-${Date.now()}-${++messageIdCounter}`;
}

export default function ChatWidget({ backendUrl }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationMsg, setValidationMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      const passages = (searchData.results as SearchResultItem[]).map(r => ({
        text: r.text,
        chapter_title: r.chapter_title,
        section_heading: r.section_heading,
        score: r.score,
      }));

      if (passages.length === 0) {
        updateAssistant(assistantId, "I couldn't find relevant information in the textbook for that question.", [], false);
        setLoading(false);
        return;
      }

      // Step 2: stream answer from chat endpoint
      const chatRes = await fetch(`${backendUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, context_passages: passages }),
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

        // Process complete SSE events (separated by \n\n)
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
              updateAssistant(assistantId, 'Something went wrong. Please try again.', [], false);
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

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          className={styles.floatingButton}
          onClick={() => setIsOpen(true)}
          aria-label="Open chat"
          title="Ask the Textbook"
        >
          💬
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className={styles.panel} role="dialog" aria-label="Textbook chat">
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Ask the Textbook</span>
            <button
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          <div className={styles.messageArea}>
            {messages.length === 0 && (
              <p className={styles.emptyHint}>Ask any question about the Physical AI textbook.</p>
            )}
            <MessageList messages={messages} />
            <div ref={bottomRef} />
          </div>

          <form className={styles.inputRow} onSubmit={handleSubmit}>
            {validationMsg && (
              <span className={styles.validationMsg} role="alert">{validationMsg}</span>
            )}
            <input
              ref={inputRef}
              className={styles.input}
              type="text"
              placeholder="Ask a question..."
              value={input}
              onChange={e => { setInput(e.target.value); setValidationMsg(''); }}
              disabled={loading}
              aria-label="Chat input"
            />
            <button
              type="submit"
              className={styles.sendButton}
              disabled={loading}
              aria-label="Send"
            >
              {loading ? '…' : '→'}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
