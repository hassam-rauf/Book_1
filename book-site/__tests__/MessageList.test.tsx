/**
 * Unit tests for MessageList and CitationList components.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import MessageList from '../src/components/ChatWidget/MessageList';
import { ChatMessage } from '../src/components/ChatWidget/types';

function makeMsg(overrides: Partial<ChatMessage>): ChatMessage {
  return {
    id: 'test-1',
    role: 'user',
    content: 'Hello',
    citations: [],
    timestamp: Date.now(),
    isStreaming: false,
    ...overrides,
  };
}

describe('MessageList', () => {
  it('renders user message content', () => {
    render(<MessageList messages={[makeMsg({ role: 'user', content: 'What is ROS 2?' })]} />);
    expect(screen.getByText('What is ROS 2?')).toBeInTheDocument();
  });

  it('renders assistant message content', () => {
    render(<MessageList messages={[makeMsg({ role: 'assistant', content: 'ROS 2 is a framework.' })]} />);
    expect(screen.getByText('ROS 2 is a framework.')).toBeInTheDocument();
  });

  it('shows streaming dots for messages with isStreaming=true', () => {
    render(<MessageList messages={[makeMsg({ role: 'assistant', content: 'Loading', isStreaming: true })]} />);
    expect(screen.getByText('●●●')).toBeInTheDocument();
  });

  it('does not show streaming dots when isStreaming=false', () => {
    render(<MessageList messages={[makeMsg({ role: 'assistant', content: 'Done', isStreaming: false })]} />);
    expect(screen.queryByText('●●●')).not.toBeInTheDocument();
  });

  it('renders citation list for assistant messages with citations', () => {
    const msg = makeMsg({
      role: 'assistant',
      content: 'DDS is a standard [1].',
      citations: [
        { index: 1, chapter_title: 'Chapter 3', section_heading: '3.2 DDS', score: 0.9 },
      ],
    });
    render(<MessageList messages={[msg]} />);
    expect(screen.getByText(/Chapter 3/)).toBeInTheDocument();
    expect(screen.getByText(/3.2 DDS/)).toBeInTheDocument();
  });

  it('does not render citations list for user messages', () => {
    const msg = makeMsg({
      role: 'user',
      content: 'What is DDS?',
      citations: [
        { index: 1, chapter_title: 'Chapter 3', section_heading: '3.2', score: 0.9 },
      ],
    });
    render(<MessageList messages={[msg]} />);
    // Citations should not render for user messages
    expect(screen.queryByRole('list', { name: /sources/i })).not.toBeInTheDocument();
  });

  it('renders multiple messages in order', () => {
    const msgs = [
      makeMsg({ id: '1', role: 'user', content: 'First question' }),
      makeMsg({ id: '2', role: 'assistant', content: 'First answer' }),
    ];
    render(<MessageList messages={msgs} />);
    expect(screen.getByText('First question')).toBeInTheDocument();
    expect(screen.getByText('First answer')).toBeInTheDocument();
  });
});
