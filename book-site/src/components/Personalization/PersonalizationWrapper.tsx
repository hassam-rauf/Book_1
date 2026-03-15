import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { useSession } from '@site/src/components/Auth/AuthProvider';

const BACKEND_URL =
  (typeof process !== 'undefined' && process.env.DOCUSAURUS_BACKEND_URL) ||
  'https://book-1-ygse.onrender.com';

// Base URL prefix to strip from pathname when computing chapter slug
// e.g. "/Book_1/docs/module-1/ch01" → "module-1/ch01"
const DOCS_BASE = '/Book_1/docs/';

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
  const [generating, setGenerating] = useState(false);
  const [noticeDismissed, setNoticeDismissed] = useState(false);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const chapterSlug =
    typeof window !== 'undefined'
      ? (() => {
          const path = window.location.pathname;
          const idx = path.indexOf(DOCS_BASE);
          return idx >= 0 ? path.slice(idx + DOCS_BASE.length).replace(/\/$/, '') : null;
        })()
      : null;

  useEffect(() => {
    // Only personalize when logged in and on a docs page
    if (session.isPending || !session.data?.user || !chapterSlug) return;

    let cancelled = false;

    const fetchPersonalized = async () => {
      try {
        const resp = await fetch(`${BACKEND_URL}/personalize/${chapterSlug}`, {
          credentials: 'include',
        });

        if (!resp.ok) return; // Silently fall back to default

        const data: PersonalizeApiResponse = await resp.json();

        if (cancelled) return;

        if (data.cached && !data.generating) {
          // Fresh cache hit — show immediately
          setPersonalizedMd(data.content);
          setGenerating(false);
        } else if (data.generating) {
          // Cache miss or stale — show whatever we got, poll for fresh version
          if (data.cached) {
            setPersonalizedMd(data.content); // Show stale while regenerating
          }
          setGenerating(true);
          // Poll /status after 20s
          pollTimerRef.current = setTimeout(() => pollStatus(1), 20000);
        }
      } catch {
        // Network error — silently use default content
      }
    };

    const pollStatus = async (attempt: number) => {
      if (cancelled || attempt > 4) {
        setGenerating(false);
        return;
      }
      try {
        const resp = await fetch(`${BACKEND_URL}/personalize/${chapterSlug}/status`, {
          credentials: 'include',
        });
        if (!resp.ok) return;
        const status = await resp.json();
        if (status.ready) {
          // Fetch fresh personalized content
          const freshResp = await fetch(`${BACKEND_URL}/personalize/${chapterSlug}`, {
            credentials: 'include',
          });
          if (freshResp.ok && !cancelled) {
            const fresh: PersonalizeApiResponse = await freshResp.json();
            setPersonalizedMd(fresh.content);
            setGenerating(false);
          }
        } else {
          // Still generating — try again in 15s
          pollTimerRef.current = setTimeout(() => pollStatus(attempt + 1), 15000);
        }
      } catch {
        setGenerating(false);
      }
    };

    fetchPersonalized();

    return () => {
      cancelled = true;
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
  }, [session.data, chapterSlug, session.isPending]);

  // Not logged in or no slug — render default content
  if (!session.data?.user || !chapterSlug || (!personalizedMd && !generating)) {
    return <>{defaultContent}</>;
  }

  // Still on first load (no stale content yet) — show default while generating
  if (!personalizedMd) {
    return (
      <>
        {generating && (
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
            ✨ Personalizing this chapter for your profile…
          </div>
        )}
        {defaultContent}
      </>
    );
  }

  return (
    <>
      {!noticeDismissed && (
        <div
          style={{
            padding: '6px 12px',
            marginBottom: 12,
            background: 'var(--ifm-color-primary-lightest, #e8f4fd)',
            borderRadius: 4,
            fontSize: 13,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>
            ✨ This chapter has been personalized for your profile.{' '}
            <a href="/profile" style={{ fontSize: 13 }}>
              Edit profile
            </a>
            {generating && ' · Refreshing…'}
          </span>
          <button
            onClick={() => setNoticeDismissed(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // @ts-expect-error — react-markdown code component typing
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {personalizedMd}
      </ReactMarkdown>
    </>
  );
}
