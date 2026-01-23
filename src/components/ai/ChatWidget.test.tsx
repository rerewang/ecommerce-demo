import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChatWidget } from './ChatWidget';
import { useChat } from '@ai-sdk/react';

vi.mock('@ai-sdk/react', () => ({
  useChat: vi.fn(),
}));

describe('ChatWidget', () => {
  const sendMessageMock = vi.fn();
  const setMessagesMock = vi.fn();
  const stopMock = vi.fn();
  const regenerateMock = vi.fn();

  beforeEach(() => {
    sendMessageMock.mockReset();
    setMessagesMock.mockReset();
    stopMock.mockReset();
    regenerateMock.mockReset();

    (useChat as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      messages: [],
      sendMessage: sendMessageMock,
      status: 'ready',
      setMessages: setMessagesMock,
      stop: stopMock,
      regenerate: regenerateMock,
      error: null,
    });
  });

  // Avoid scrollIntoView errors in jsdom
  window.HTMLElement.prototype.scrollIntoView = vi.fn();

  it('renders the chat toggle button initially', () => {
    render(<ChatWidget />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('opens the chat window when the toggle button is clicked', () => {
    render(<ChatWidget />);
    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);
    expect(screen.getByText('PetPixel Art Curator')).toBeDefined();
  });

  it('sends a message when form is submitted', async () => {
    const { container } = render(<ChatWidget />);
    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);

    const input = screen.getByPlaceholderText('Ask about art styles...');
    fireEvent.change(input, { target: { value: 'Hello world' } });

    const form = container.querySelector('form');
    if (!form) throw new Error('Form not found');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(sendMessageMock).toHaveBeenCalledWith({ text: 'Hello world' });
    });
  });
});
