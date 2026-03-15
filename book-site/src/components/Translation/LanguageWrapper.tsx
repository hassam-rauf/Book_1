import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

// Base URL prefix for docs pages — used to extract chapter slug
const DOCS_BASE = '/Book_1/docs/';

// Static translations base path (served from book-site/static/translations/ur/)
const TRANSLATIONS_BASE = '/Book_1/translations/ur/';

interface LanguageWrapperProps {
  englishContent: React.ReactNode;
}

export default function LanguageWrapper({ englishContent }: LanguageWrapperProps) {
  const [lang, setLang] = useState<'en' | 'ur'>('en');
  const [urduMd, setUrduMd] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fallbackNotice, setFallbackNotice] = useState(false);
  const [noticeDismissed, setNoticeDismissed] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Read persisted language preference on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('preferred-lang');
    if (saved === 'ur') setLang('ur');
  }, []);

  const chapterSlug =
    typeof window !== 'undefined'
      ? (() => {
          const path = window.location.pathname;
          const idx = path.indexOf(DOCS_BASE);
          return idx >= 0 ? path.slice(idx + DOCS_BASE.length).replace(/\/$/, '') : null;
        })()
      : null;

  // Fetch Urdu content when language switches to 'ur'
  useEffect(() => {
    if (lang !== 'ur' || !chapterSlug) return;

    // Abort previous in-flight request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setUrduMd(null);
    setFallbackNotice(false);
    setNoticeDismissed(false);

    fetch(`${TRANSLATIONS_BASE}${chapterSlug}.md`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((text) => {
        if (controller.signal.aborted) return;
        setUrduMd(text);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setFallbackNotice(true);
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [lang, chapterSlug]);

  const handleToggle = () => {
    const next = lang === 'en' ? 'ur' : 'en';
    setLang(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-lang', next);
    }
    // Reset Urdu state when switching back to English
    if (next === 'en') {
      setUrduMd(null);
      setFallbackNotice(false);
      setNoticeDismissed(false);
    }
  };

  // Language toggle button (always visible)
  const toggleButton = (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
      <div
        style={{
          display: 'inline-flex',
          border: '1px solid var(--ifm-color-primary, #2e8555)',
          borderRadius: 4,
          overflow: 'hidden',
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        <button
          onClick={lang !== 'en' ? handleToggle : undefined}
          style={{
            padding: '3px 10px',
            background: lang === 'en' ? 'var(--ifm-color-primary, #2e8555)' : 'transparent',
            color: lang === 'en' ? '#fff' : 'var(--ifm-color-primary, #2e8555)',
            border: 'none',
            cursor: lang === 'en' ? 'default' : 'pointer',
          }}
          aria-label="Switch to English"
        >
          EN
        </button>
        <button
          onClick={lang !== 'ur' ? handleToggle : undefined}
          style={{
            padding: '3px 10px',
            background: lang === 'ur' ? 'var(--ifm-color-primary, #2e8555)' : 'transparent',
            color: lang === 'ur' ? '#fff' : 'var(--ifm-color-primary, #2e8555)',
            border: 'none',
            cursor: lang === 'ur' ? 'default' : 'pointer',
          }}
          aria-label="Switch to Urdu"
        >
          اردو
        </button>
      </div>
    </div>
  );

  // English mode — render PersonalizationWrapper unchanged
  if (lang === 'en') {
    return (
      <>
        {toggleButton}
        {englishContent}
      </>
    );
  }

  // Urdu mode — loading (no cached content yet)
  if (loading && !urduMd) {
    return (
      <>
        {toggleButton}
        <div
          style={{
            padding: '6px 12px',
            marginBottom: 12,
            background: 'var(--ifm-color-primary-lightest, #e8f4fd)',
            borderRadius: 4,
            fontSize: 13,
            color: 'var(--ifm-color-primary-darkest, #1a5276)',
          }}
        >
          اردو مواد لوڈ ہو رہا ہے…
        </div>
        {englishContent}
      </>
    );
  }

  // Urdu mode — fallback (no translation file found)
  if (fallbackNotice || (!urduMd && !loading)) {
    return (
      <>
        {toggleButton}
        {!noticeDismissed && (
          <div
            style={{
              padding: '6px 12px',
              marginBottom: 12,
              background: 'var(--ifm-color-warning-contrast-background, #fff3cd)',
              borderRadius: 4,
              fontSize: 13,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>📝 یہ باب ابھی اردو میں دستیاب نہیں ہے۔ (This chapter is not yet available in Urdu.)</span>
            <button
              onClick={() => setNoticeDismissed(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        )}
        {englishContent}
      </>
    );
  }

  // Urdu mode — render translated content RTL
  return (
    <>
      {toggleButton}
      <div style={{ direction: 'rtl', textAlign: 'right' }}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // @ts-expect-error — react-markdown code component typing
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                // Code blocks: rendered LTR even inside RTL container
                <div style={{ direction: 'ltr', textAlign: 'left' }}>
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                </div>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {urduMd!}
        </ReactMarkdown>
      </div>
    </>
  );
}
