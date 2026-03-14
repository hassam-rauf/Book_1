/**
 * Unit tests for ChatWidget.
 * Mocks fetch globally — no real network calls.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatWidget from '../src/components/ChatWidget/ChatWidget';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Helper: create a ReadableStream from SSE strings
function makeSseStream(events: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const e of events) controller.enqueue(encoder.encode(e));
      controller.close();
    },
  });
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe('ChatWidget — open/close', () => {
  it('renders floating button on mount', () => {
    render(<ChatWidget backendUrl="http://localhost:8000" />);
    expect(screen.getByRole('button', { name: /open chat/i })).toBeInTheDocument();
  });

  it('opens panel when floating button clicked', async () => {
    render(<ChatWidget backendUrl="http://localhost:8000" />);
    await userEvent.click(screen.getByRole('button', { name: /open chat/i }));
    expect(screen.getByRole('dialog', { name: /textbook chat/i })).toBeInTheDocument();
  });

  it('closes panel when close button clicked', async () => {
    render(<ChatWidget backendUrl="http://localhost:8000" />);
    await userEvent.click(screen.getByRole('button', { name: /open chat/i }));
    await userEvent.click(screen.getByRole('button', { name: /close chat/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /open chat/i })).toBeInTheDocument();
  });
});

describe('ChatWidget — input validation', () => {
  it('shows validation message and does not call fetch on empty submit', async () => {
    render(<ChatWidget backendUrl="http://localhost:8000" />);
    await userEvent.click(screen.getByRole('button', { name: /open chat/i }));
    await userEvent.click(screen.getByRole('button', { name: /send/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/please enter a question/i);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe('ChatWidget — loading state', () => {
  it('disables send button while loading', async () => {
    // Mock search to return one passage; mock chat to hang (never resolves)
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [{
            text: 'ROS 2 uses DDS...',
            chapter_title: 'Chapter 3',
            section_heading: '3.3',
            module: 'module-1',
            score: 0.9,
            chunk_index: 0,
            source_path: 'ch03.md',
          }],
          query: 'What is ROS 2?',
          total: 1,
        }),
      })
      .mockReturnValueOnce(new Promise(() => {})); // chat never resolves

    render(<ChatWidget backendUrl="http://localhost:8000" />);
    await userEvent.click(screen.getByRole('button', { name: /open chat/i }));
    const input = screen.getByRole('textbox', { name: /chat input/i });
    await userEvent.type(input, 'What is ROS 2?');
    await userEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /send/i })).toBeDisabled();
    });
  });
});

describe('ChatWidget — error handling', () => {
  it('shows error message when search call fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<ChatWidget backendUrl="http://localhost:8000" />);
    await userEvent.click(screen.getByRole('button', { name: /open chat/i }));
    const input = screen.getByRole('textbox', { name: /chat input/i });
    await userEvent.type(input, 'What is DDS?');
    await userEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  it('shows error message when chat stream returns error event', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [{
            text: 'Some text',
            chapter_title: 'Ch 1',
            section_heading: '1.1',
            module: 'module-1',
            score: 0.8,
            chunk_index: 0,
            source_path: 'ch01.md',
          }],
          query: 'test',
          total: 1,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        body: makeSseStream([
          'data: {"type":"error","detail":"Quota exceeded"}\n\n',
        ]),
      });

    render(<ChatWidget backendUrl="http://localhost:8000" />);
    await userEvent.click(screen.getByRole('button', { name: /open chat/i }));
    await userEvent.type(screen.getByRole('textbox', { name: /chat input/i }), 'What is ROS?');
    await userEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });
});
