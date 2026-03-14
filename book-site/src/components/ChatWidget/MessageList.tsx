import React from 'react';
import styles from './ChatWidget.module.css';
import { ChatMessage } from './types';
import CitationList from './CitationList';

interface MessageListProps {
  messages: ChatMessage[];
}

export default function MessageList({ messages }: MessageListProps) {
  return (
    <div className={styles.messageList}>
      {messages.map(msg => (
        <div
          key={msg.id}
          className={msg.role === 'user' ? styles.userMessage : styles.assistantMessage}
        >
          <div className={styles.messageContent}>
            {msg.content}
            {msg.isStreaming && <span className={styles.streamingDots}>●●●</span>}
          </div>
          {msg.role === 'assistant' && msg.citations.length > 0 && (
            <CitationList citations={msg.citations} />
          )}
        </div>
      ))}
    </div>
  );
}
