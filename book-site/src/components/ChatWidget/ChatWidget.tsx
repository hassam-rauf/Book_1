import React, { useRef, useEffect, useState } from 'react';
import styles from './ChatWidget.module.css';
import MessageList from './MessageList';
import { useChatStream } from './useChatStream';
import { authClient } from '@site/src/components/Auth/AuthProvider';

interface ChatWidgetProps {
  backendUrl: string;
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export default function ChatWidget({ backendUrl, isOpen, onClose, onOpen }: ChatWidgetProps) {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user ?? null;

  const { messages, loading, validationMsg, input, setInput, setValidationMsg, handleSubmit } =
    useChatStream(backendUrl);

  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [slowHint, setSlowHint] = useState(false);

  useEffect(() => {
    if (!loading) { setSlowHint(false); return; }
    const t = setTimeout(() => setSlowHint(true), 4000);
    return () => clearTimeout(t);
  }, [loading]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Gate: redirect to login if not signed in
  const handleOpen = () => {
    if (isPending) return;
    if (!user) {
      const redirect = typeof window !== 'undefined' ? window.location.pathname : '/';
      window.location.href = `/login?redirect=${encodeURIComponent(redirect)}`;
      return;
    }
    onOpen();
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = '/';
  };

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          className={styles.floatingButton}
          onClick={handleOpen}
          aria-label="Open chat"
          title="Ask the Textbook"
        >
          💬
        </button>
      )}

      {/* Chat panel — only shown when logged in */}
      {isOpen && user && (
        <div className={styles.panel} role="dialog" aria-label="Textbook chat">
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Ask the Textbook</span>
            <div className={styles.headerRight}>
              <span className={styles.headerUser}>👤 {user.name}</span>
              <button
                className={styles.closeButton}
                onClick={onClose}
                aria-label="Close chat"
              >✕</button>
            </div>
          </div>

          {/* Auth strip — sign out only */}
          <div className={styles.authStrip}>
            <span className={styles.authHint}>Ask anything about the textbook</span>
            <button className={styles.authBtn} onClick={handleSignOut}>Sign out</button>
          </div>

          <div className={styles.messageArea}>
            {messages.length === 0 && (
              <p className={styles.emptyHint}>Ask any question about the Physical AI textbook.</p>
            )}
            <MessageList messages={messages} backendUrl={backendUrl} />
            <div ref={bottomRef} />
          </div>

          <form className={styles.inputRow} onSubmit={handleSubmit}>
            {validationMsg && (
              <span className={styles.validationMsg} role="alert">{validationMsg}</span>
            )}
            {slowHint && (
              <span className={styles.validationMsg} role="status">
                ⏳ Waking up server, please wait…
              </span>
            )}
            <div className={styles.inputRowInner}>
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
            </div>
          </form>
        </div>
      )}
    </>
  );
}
