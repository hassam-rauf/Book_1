import React, { useState, useEffect, useCallback } from 'react';
// @ts-ignore — Docusaurus router may not be typed in all setups
import { useLocation } from '@docusaurus/router';
import { SelectionState } from '../ChatWidget/types';
import styles from './SelectionPopup.module.css';

interface SelectionPopupProps {
  onAskAI: (text: string) => void;
}

const MIN_SELECTION_LENGTH = 10;

function isInsideCodeBlock(node: Node | null): boolean {
  let current: Node | null = node;
  while (current) {
    if (current.nodeType === Node.ELEMENT_NODE) {
      const tag = (current as Element).tagName;
      if (tag === 'CODE' || tag === 'PRE') return true;
    }
    current = current.parentNode;
  }
  return false;
}

export default function SelectionPopup({ onAskAI }: SelectionPopupProps) {
  const location = useLocation();
  const [selection, setSelection] = useState<SelectionState>({
    text: '',
    rect: null,
    isVisible: false,
  });

  // Dismiss popup on SPA route change (T017)
  useEffect(() => {
    setSelection({ text: '', rect: null, isVisible: false });
  }, [location.pathname]);

  const handleSelectionEnd = useCallback(() => {
    const sel = window.getSelection();
    const text = sel?.toString().trim() ?? '';

    if (text.length < MIN_SELECTION_LENGTH) {
      setSelection({ text: '', rect: null, isVisible: false });
      return;
    }

    if (!sel || sel.rangeCount === 0) {
      setSelection({ text: '', rect: null, isVisible: false });
      return;
    }

    // Suppress popup inside code/pre blocks
    if (isInsideCodeBlock(sel.anchorNode)) {
      setSelection({ text: '', rect: null, isVisible: false });
      return;
    }

    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    setSelection({ text, rect, isVisible: true });
  }, []);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    // Hide popup when clicking outside — but not when clicking the popup button itself
    const target = e.target as Element;
    if (target.closest('[data-selection-popup]')) return;
    setSelection({ text: '', rect: null, isVisible: false });
  }, []);

  useEffect(() => {
    document.addEventListener('mouseup', handleSelectionEnd);
    document.addEventListener('touchend', handleSelectionEnd);
    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('mouseup', handleSelectionEnd);
      document.removeEventListener('touchend', handleSelectionEnd);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [handleSelectionEnd, handleMouseDown]);

  if (!selection.isVisible || !selection.rect) return null;

  const rect = selection.rect;
  const scrollY = window.scrollY || 0;
  const scrollX = window.scrollX || 0;
  const popupWidth = 104;
  const popupHeight = 36;
  const margin = 8;

  // Position centered above selection; clamp to viewport
  let left = rect.left + scrollX + rect.width / 2 - popupWidth / 2;
  left = Math.max(margin, Math.min(left, window.innerWidth + scrollX - popupWidth - margin));

  let top = rect.top + scrollY - popupHeight - margin;
  // If too close to top of viewport, show below instead
  if (rect.top < popupHeight + margin * 2) {
    top = rect.bottom + scrollY + margin;
  }

  return (
    <div
      data-selection-popup="true"
      className={styles.popupWrapper}
      style={{ position: 'absolute', left, top, zIndex: 10000 }}
      onMouseDown={e => e.preventDefault()} // prevent deselect on click
    >
      <button
        className={styles.popupButton}
        aria-label="Ask AI about selected text"
        onClick={() => {
          onAskAI(selection.text);
          setSelection({ text: '', rect: null, isVisible: false });
        }}
      >
        ✨ Ask AI
      </button>
    </div>
  );
}
