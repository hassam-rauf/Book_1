import React, { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { useSession } from '@site/src/components/Auth/AuthProvider';

const BACKEND_URL =
  (typeof process !== 'undefined' && process.env.DOCUSAURUS_BACKEND_URL) ||
  'https://book-1-ygse.onrender.com';

const DOCS_BASE_CANDIDATES = ['/Book_1/docs/', '/docs/'];

function getChapterSlug(): string | null {
  if (typeof window === 'undefined') return null;
  const path = window.location.pathname;
  for (const base of DOCS_BASE_CANDIDATES) {
    const idx = path.indexOf(base);
    if (idx >= 0) return path.slice(idx + base.length).replace(/\/$/, '') || null;
  }
  return null;
}

interface PersonalizeApiResponse {
  content: string;
  cached: boolean;
  generating: boolean;
  profile: Record<string, string>;
}

interface PersonalizationWrapperProps {
  defaultContent: React.ReactNode;
}

export default function PersonalizationWrapper({ defaultContent }: PersonalizationWrapperProps) {
  const session = useSession();
  const [personalizedMd, setPersonalizedMd] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPersonalized, setShowPersonalized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const chapterSlug = getChapterSlug();
  const user = session.data?.user;

  const handlePersonalize = async () => {
    if (!chapterSlug) return;
    setLoading(true);
    setError(null);

    try {
      const resp = await fetch(`${BACKEND_URL}/personalize/${chapterSlug}`, {
        credentials: 'include',
      });
      if (!resp.ok) throw new Error(`Server error: ${resp.status}`);
      const data: PersonalizeApiResponse = await resp.json();

      if (data.cached && !data.generating) {
        setPersonalizedMd(data.content);
        setShowPersonalized(true);
        setLoading(false);
      } else {
        // Still generating — show stale if available, poll for fresh
        if (data.cached) setPersonalizedMd(data.content);
        setShowPersonalized(true);

        const pollStatus = async (attempt: number) => {
          if (attempt > 6) { setLoading(false); return; }
          try {
            const sResp = await fetch(`${BACKEND_URL}/personalize/${chapterSlug}/status`, { credentials: 'include' });
            if (!sResp.ok) { setLoading(false); return; }
            const status = await sResp.json();
            if (status.ready) {
              const freshResp = await fetch(`${BACKEND_URL}/personalize/${chapterSlug}`, { credentials: 'include' });
              if (freshResp.ok) {
                const fresh: PersonalizeApiResponse = await freshResp.json();
                setPersonalizedMd(fresh.content);
              }
              setLoading(false);
            } else {
              pollTimerRef.current = setTimeout(() => pollStatus(attempt + 1), 15000);
            }
          } catch {
            setLoading(false);
          }
        };
        pollTimerRef.current = setTimeout(() => pollStatus(1), 20000);
      }
    } catch (err) {
      setError('Could not personalize — please try again.');
      setLoading(false);
    }
  };

  // Not on a docs page — just render default
  if (!chapterSlug) return <>{defaultContent}</>;

  // Not logged in — show sign-in prompt banner
  if (!user) {
    return (
      <>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            marginBottom: 12,
            background: 'var(--ifm-color-primary-lightest, #e8f4fd)',
            borderRadius: 4,
            fontSize: 13,
            flexWrap: 'wrap',
          }}
        >
          <span style={{ flex: 1, color: 'var(--ifm-color-primary-darkest, #1a5276)' }}>
            ✨ Personalize this chapter based on your profile
          </span>
          <a
            href="/login"
            style={{
              background: 'var(--ifm-color-primary, #2e8555)',
              border: 'none',
              borderRadius: 4,
              color: '#fff',
              cursor: 'pointer',
              fontSize: 12,
              padding: '4px 12px',
              textDecoration: 'none',
            }}
          >
            Sign in to personalize
          </a>
        </div>
        {defaultContent}
      </>
    );
  }

  // Banner + toggle shown above chapter content
  const banner = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 12px',
        marginBottom: 12,
        background: 'var(--ifm-color-primary-lightest, #e8f4fd)',
        borderRadius: 4,
        fontSize: 13,
        flexWrap: 'wrap',
      }}
    >
      {showPersonalized ? (
        <>
          <span style={{ flex: 1, color: 'var(--ifm-color-primary-darkest, #1a5276)' }}>
            ✨ Showing personalized version{loading ? ' · Refreshing…' : ''}
          </span>
          <button
            onClick={() => { setShowPersonalized(false); }}
            style={{
              background: 'none',
              border: '1px solid var(--ifm-color-primary, #2e8555)',
              borderRadius: 4,
              color: 'var(--ifm-color-primary, #2e8555)',
              cursor: 'pointer',
              fontSize: 12,
              padding: '2px 8px',
            }}
          >
            Show original
          </button>
        </>
      ) : (
        <>
          <span style={{ flex: 1, color: 'var(--ifm-color-primary-darkest, #1a5276)' }}>
            ✨ Personalize this chapter based on your profile
          </span>
          <button
            onClick={handlePersonalize}
            disabled={loading}
            style={{
              background: 'var(--ifm-color-primary, #2e8555)',
              border: 'none',
              borderRadius: 4,
              color: '#fff',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 12,
              padding: '4px 12px',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Personalizing…' : 'Personalize'}
          </button>
        </>
      )}
      {error && <span style={{ color: '#dc2626', fontSize: 12, width: '100%' }}>{error}</span>}
    </div>
  );

  return (
    <>
      {banner}
      {showPersonalized && personalizedMd ? (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // @ts-expect-error — react-markdown code typing
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" {...props}>
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>{children}</code>
              );
            },
          }}
        >
          {personalizedMd}
        </ReactMarkdown>
      ) : (
        defaultContent
      )}
    </>
  );
}
