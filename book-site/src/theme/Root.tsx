import React, { useState } from 'react';
import ChatWidget from '@site/src/components/ChatWidget/ChatWidget';
import { SelectionPopup, SelectionChatPanel } from '@site/src/components/SelectionPopup';
import { AuthProvider } from '@site/src/components/Auth/AuthProvider';

interface RootProps {
  children: React.ReactNode;
}

export default function Root({ children }: RootProps) {
  const backendUrl =
    (typeof process !== 'undefined' && process.env.DOCUSAURUS_BACKEND_URL) ||
    'http://localhost:8000';

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
