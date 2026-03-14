import React from 'react';
import styles from './ChatWidget.module.css';
import { Citation } from './types';

interface CitationListProps {
  citations: Citation[];
}

export default function CitationList({ citations }: CitationListProps) {
  if (citations.length === 0) return null;

  return (
    <ul className={styles.citationList} aria-label="Sources">
      {citations.map(c => (
        <li key={c.index} className={styles.citationItem}>
          <span className={styles.citationIndex}>[{c.index}]</span>
          {c.chapter_title} — {c.section_heading}
        </li>
      ))}
    </ul>
  );
}
