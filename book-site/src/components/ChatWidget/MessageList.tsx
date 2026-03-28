import React, { useState } from 'react';
import styles from './ChatWidget.module.css';
import { ChatMessage } from './types';
import CitationList from './CitationList';

interface MessageListProps {
  messages: ChatMessage[];
  backendUrl: string;
}

function AssistantMessage({ msg, backendUrl }: { msg: ChatMessage; backendUrl: string }) {
  const [urduText, setUrduText] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);
  const [showUrdu, setShowUrdu] = useState(false);

  const handleTranslate = async () => {
    if (urduText) { setShowUrdu(true); return; } // already translated
    setTranslating(true);
    try {
      const res = await fetch(`${backendUrl}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: msg.content }),
      });
      if (!res.ok) throw new Error('Translation failed');
      const data = await res.json();
      setUrduText(data.translated);
      setShowUrdu(true);
    } catch {
      // silently fail — keep English
    } finally {
      setTranslating(false);
    }
  };

  const displayText = showUrdu && urduText ? urduText : msg.content;

  return (
    <div className={styles.assistantMessage}>
      <div
        className={styles.messageContent}
        dir={showUrdu ? 'rtl' : 'ltr'}
      >
        {displayText}
        {msg.isStreaming && <span className={styles.streamingDots}>●●●</span>}
      </div>
      {msg.citations.length > 0 && <CitationList citations={msg.citations} />}
      {msg.content.length > 10 && (
        <div className={styles.translateRow}>
          {showUrdu ? (
            <button className={styles.translateBtn} onClick={() => setShowUrdu(false)}>
              Show English
            </button>
          ) : (
            <button className={styles.translateBtn} onClick={handleTranslate} disabled={translating}>
              {translating ? 'Translating…' : '🌐 Urdu میں ترجمہ'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function MessageList({ messages, backendUrl }: MessageListProps) {
  return (
    <div className={styles.messageList}>
      {messages.map(msg => (
        msg.role === 'user' ? (
          <div key={msg.id} className={styles.userMessage}>
            <div className={styles.messageContent}>{msg.content}</div>
          </div>
        ) : (
          <AssistantMessage key={msg.id} msg={msg} backendUrl={backendUrl} />
        )
      ))}
    </div>
  );
}
