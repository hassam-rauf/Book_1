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
  const { data: session } = authClient.useSession();
  const user = session?.user ?? null;

  // Detect preferred language from session (stored in user profile via backend)
  const [language, setLanguage] = useState<'en' | 'ur'>('en');

  useEffect(() => {
    if (!user) { setLanguage('en'); return; }
    // Fetch user profile to get preferred language
    fetch(`${backendUrl}/profile`, {
      headers: { 'x-user-id': user.id },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.preferred_language === 'ur') setLanguage('ur'); })
      .catch(() => {});
  }, [user, backendUrl]);

  const { messages, loading, validationMsg, input, setInput, setValidationMsg, handleSubmit } =
    useChatStream(backendUrl, undefined, language);

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

  const handleSignOut = async () => {
    await authClient.signOut();
  };

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

          {/* Auth strip */}
          <div className={styles.authStrip}>
            {user ? (
              <>
                <span className={styles.authUser}>👤 {user.name}</span>
                <button className={styles.authBtn} onClick={handleSignOut}>Sign out</button>
              </>
            ) : (
              <>
                <span className={styles.authHint}>Sign in for personalised answers</span>
                <a
                  href={`/login?redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '/')}`}
                  className={styles.authBtn}
                >Sign in</a>
              </>
            )}
          </div>

          <div className={styles.messageArea}>
            {messages.length === 0 && (
              <p className={styles.emptyHint}>
                {language === 'ur'
                  ? 'کتاب کے بارے میں کوئی بھی سوال پوچھیں۔'
                  : 'Ask any question about the Physical AI textbook.'}
              </p>
            )}
            <MessageList messages={messages} />
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
                placeholder={language === 'ur' ? 'سوال پوچھیں...' : 'Ask a question...'}
                value={input}
                onChange={e => { setInput(e.target.value); setValidationMsg(''); }}
                disabled={loading}
                aria-label="Chat input"
                dir={language === 'ur' ? 'rtl' : 'ltr'}
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
