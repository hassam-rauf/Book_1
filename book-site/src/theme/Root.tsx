import React, { useState, useEffect } from 'react';
import ChatWidget from '@site/src/components/ChatWidget/ChatWidget';
import { SelectionPopup, SelectionChatPanel } from '@site/src/components/SelectionPopup';
import { AuthProvider } from '@site/src/components/Auth/AuthProvider';

interface RootProps {
  children: React.ReactNode;
}

const BACKEND_URL =
  (typeof process !== 'undefined' && process.env.DOCUSAURUS_BACKEND_URL) ||
  'https://book-1-ygse.onrender.com';

const AUTH_URL = 'https://physical-ai-auth-tog0.onrender.com';

// Pre-warm Render free-tier services on page load so they're ready when needed
function usePreWarm() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    fetch(`${BACKEND_URL}/health`, { method: 'GET', cache: 'no-store' }).catch(() => {});
    fetch(`${AUTH_URL}/api/auth/get-session`, { method: 'GET', cache: 'no-store' }).catch(() => {});
  }, []);
}

export default function Root({ children }: RootProps) {
  const backendUrl = BACKEND_URL;
  usePreWarm();

  const [chatOpen, setChatOpen] = useState(false);
  const [selectionContext, setSelectionContext] = useState<string | null>(null);

  return (
    <AuthProvider>
      {children}
      <ChatWidget
        backendUrl={backendUrl}
        isOpen={chatOpen}
        onOpen={() => setChatOpen(true)}
        onClose={() => setChatOpen(false)}
      />
      <SelectionPopup onAskAI={(text) => setSelectionContext(text)} />
      {selectionContext && (
        <SelectionChatPanel
          selectedText={selectionContext}
          backendUrl={backendUrl}
          onClose={() => setSelectionContext(null)}
        />
      )}
    </AuthProvider>
  );
}
