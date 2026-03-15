/**
 * SelectionPopup RTL tests (T011)
 * Tests: selection detection, min-length suppression, code block exclusion,
 *        popup visibility, onAskAI callback, dismiss on mousedown
 */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import SelectionPopup from '../src/components/SelectionPopup/SelectionPopup';

// Helper: mock window.getSelection
function mockSelection(text: string, insideCode = false) {
  const anchorNode = insideCode
    ? Object.assign(document.createElement('code'), { nodeType: 1 })
    : document.createTextNode(text);

  const range = {
    getBoundingClientRect: () => ({
      left: 100, top: 200, right: 300, bottom: 220,
      width: 200, height: 20,
    }),
  } as unknown as Range;

  (window.getSelection as jest.Mock).mockReturnValue({
    toString: () => text,
    rangeCount: 1,
    getRangeAt: () => range,
    anchorNode,
  });
}

beforeEach(() => {
  jest.spyOn(window, 'getSelection').mockReturnValue({
    toString: () => '',
    rangeCount: 0,
    getRangeAt: () => null,
    anchorNode: null,
  } as unknown as Selection);

  Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
  Object.defineProperty(window, 'scrollX', { value: 0, writable: true });
  Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('1. No popup when no text is selected', () => {
  render(<SelectionPopup onAskAI={jest.fn()} />);
  expect(screen.queryByRole('button', { name: /ask ai/i })).not.toBeInTheDocument();
});

test('2. No popup when selection is shorter than 10 characters', () => {
  render(<SelectionPopup onAskAI={jest.fn()} />);
  mockSelection('short');
  act(() => { fireEvent.mouseUp(document); });
  expect(screen.queryByRole('button', { name: /ask ai/i })).not.toBeInTheDocument();
});

test('3. Popup appears when selection is 10+ characters and mouseup fires', () => {
  render(<SelectionPopup onAskAI={jest.fn()} />);
  mockSelection('This is a long enough selection text');
  act(() => { fireEvent.mouseUp(document); });
  expect(screen.getByRole('button', { name: /ask ai/i })).toBeInTheDocument();
});

test('4. No popup when selection is inside a code element', () => {
  render(<SelectionPopup onAskAI={jest.fn()} />);
  mockSelection('This is a long enough selection text', true);
  act(() => { fireEvent.mouseUp(document); });
  expect(screen.queryByRole('button', { name: /ask ai/i })).not.toBeInTheDocument();
});

test('5. onAskAI callback fires with selected text when button clicked', () => {
  const onAskAI = jest.fn();
  render(<SelectionPopup onAskAI={onAskAI} />);
  mockSelection('This is a long enough selection text');
  act(() => { fireEvent.mouseUp(document); });
  fireEvent.click(screen.getByRole('button', { name: /ask ai/i }));
  expect(onAskAI).toHaveBeenCalledWith('This is a long enough selection text');
});

test('6. Popup disappears when mousedown fires outside popup', () => {
  render(<SelectionPopup onAskAI={jest.fn()} />);
  mockSelection('This is a long enough selection text');
  act(() => { fireEvent.mouseUp(document); });
  expect(screen.getByRole('button', { name: /ask ai/i })).toBeInTheDocument();

  // Simulate click outside popup
  act(() => { fireEvent.mouseDown(document.body); });
  expect(screen.queryByRole('button', { name: /ask ai/i })).not.toBeInTheDocument();
});
