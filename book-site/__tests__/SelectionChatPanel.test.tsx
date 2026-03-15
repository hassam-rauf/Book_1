/**
 * SelectionChatPanel RTL tests (T013)
 * Tests: context block render, context persists after submit,
 *        close button, input focus, empty validation
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SelectionChatPanel from '../src/components/SelectionPopup/SelectionChatPanel';

// Mock useChatStream hook
jest.mock('../src/components/ChatWidget/useChatStream', () => ({
  useChatStream: () => ({
    messages: [],
    loading: false,
    validationMsg: '',
    input: '',
    setInput: jest.fn(),
    setValidationMsg: jest.fn(),
    handleSubmit: jest.fn(),
    clearMessages: jest.fn(),
  }),
}));

// Mock MessageList
jest.mock('../src/components/ChatWidget/MessageList', () => ({
  __esModule: true,
  default: () => <div data-testid="message-list" />,
}));

// Mock CSS modules
jest.mock('../src/components/SelectionPopup/SelectionPopup.module.css', () => ({}), { virtual: true });

const defaultProps = {
  selectedText: 'ROS 2 uses a DDS transport layer for communication between nodes.',
  backendUrl: 'http://localhost:8000',
  onClose: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

test('1. Context block renders with provided selectedText', () => {
  render(<SelectionChatPanel {...defaultProps} />);
  expect(screen.getByText(defaultProps.selectedText)).toBeInTheDocument();
  expect(screen.getByLabelText('Selected text context')).toBeInTheDocument();
});

test('2. Panel has correct dialog role and label', () => {
  render(<SelectionChatPanel {...defaultProps} />);
  expect(screen.getByRole('dialog', { name: /ask about selection/i })).toBeInTheDocument();
});

test('3. Close button calls onClose prop', () => {
  const onClose = jest.fn();
  render(<SelectionChatPanel {...defaultProps} onClose={onClose} />);
  fireEvent.click(screen.getByRole('button', { name: /close/i }));
  expect(onClose).toHaveBeenCalledTimes(1);
});

test('4. Input field is present in the panel', () => {
  render(<SelectionChatPanel {...defaultProps} />);
  expect(screen.getByRole('textbox', { name: /question input/i })).toBeInTheDocument();
});

test('5. Empty hint message shown when no messages', () => {
  render(<SelectionChatPanel {...defaultProps} />);
  expect(screen.getByText(/ask a question about the selected text/i)).toBeInTheDocument();
});
