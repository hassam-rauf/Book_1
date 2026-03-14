import React from 'react';
import ChatWidget from '@site/src/components/ChatWidget/ChatWidget';

interface RootProps {
  children: React.ReactNode;
}

export default function Root({ children }: RootProps) {
  const backendUrl =
    (typeof process !== 'undefined' && process.env.DOCUSAURUS_BACKEND_URL) ||
    'http://localhost:8000';
  return (
    <>
      {children}
      <ChatWidget backendUrl={backendUrl} />
    </>
  );
}
