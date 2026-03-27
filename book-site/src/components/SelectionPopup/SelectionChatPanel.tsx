import React, { useRef, useEffect } from 'react';
import styles from './SelectionPopup.module.css';
import MessageList from '../ChatWidget/MessageList';
import { useChatStream } from '../ChatWidget/useChatStream';

interface SelectionChatPanelProps {
  selectedText: string;
  backendUrl: string;
  onClose: () => void;
}

export default function SelectionChatPanel({ selectedText, backendUrl, onClose }: SelectionChatPanelProps) {
  const { messages, loading, validationMsg, input, setInput, setValidationMsg, handleSubmit } =
    useChatStream(backendUrl, selectedText);

  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={styles.panel} role="dialog" aria-label="Ask about selection">
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>Ask about selection</span>
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close selection chat"
        >
          ✕
        </button>
      </div>

      {/* Read-only context block showing the selected text */}
      <div className={styles.contextBlock} aria-label="Selected text context">
        <span className={styles.contextLabel}>Selected:</span>
        <p className={styles.contextText}>{selectedText}</p>
      </div>

      <div className={styles.messageArea}>
        {messages.length === 0 && (
          <p className={styles.emptyHint}>Ask a question about the selected text.</p>
        )}
        <MessageList messages={messages} backendUrl={backendUrl} />
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
          placeholder="Ask about this passage..."
          value={input}
          onChange={e => { setInput(e.target.value); setValidationMsg(''); }}
          disabled={loading}
          aria-label="Question input"
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
  );
}
