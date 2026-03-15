import React, { useRef, useEffect } from 'react';
import styles from './ChatWidget.module.css';
import MessageList from './MessageList';
import { useChatStream } from './useChatStream';

interface ChatWidgetProps {
  backendUrl: string;
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export default function ChatWidget({ backendUrl, isOpen, onClose, onOpen }: ChatWidgetProps) {
  const { messages, loading, validationMsg, input, setInput, setValidationMsg, handleSubmit } =
    useChatStream(backendUrl);

  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          className={styles.floatingButton}
          onClick={onOpen}
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
              onClick={onClose}
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
