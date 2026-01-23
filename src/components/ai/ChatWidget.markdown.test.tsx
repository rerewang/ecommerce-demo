import { render, screen, fireEvent } from '@testing-library/react';
import { ChatWidget } from './ChatWidget';
import { describe, it, expect, vi, beforeEach, MockedFunction } from 'vitest';
import { useChat } from '@ai-sdk/react';
import { UIMessage } from 'ai';
import '@testing-library/jest-dom';

vi.mock('@ai-sdk/react', () => ({
  useChat: vi.fn(),
}));

const mockedUseChat = useChat as unknown as MockedFunction<typeof useChat>;
const mockSendMessage = vi.fn();
const mockSetMessages = vi.fn();
const mockStop = vi.fn();
const mockRegenerate = vi.fn();
const mockAppend = vi.fn();
const mockReload = vi.fn();
const mockSetInput = vi.fn();

window.HTMLElement.prototype.scrollIntoView = vi.fn();

const baseMockReturn = {
  id: 'mock-chat-id',
  messages: [],
  input: '',
  setInput: mockSetInput,
  handleInputChange: vi.fn(),
  handleSubmit: vi.fn(),
  isLoading: false,
  sendMessage: mockSendMessage,
  status: 'ready' as const,
  error: undefined,
  stop: mockStop,
  regenerate: mockRegenerate,
  setMessages: mockSetMessages,
  append: mockAppend,
  reload: mockReload,
  data: undefined,
  addToolResult: vi.fn(),
  resumeStream: vi.fn(),
  addToolOutput: vi.fn(),
  addToolApprovalResponse: vi.fn(),
  clearError: vi.fn(),
};

describe('ChatWidget Markdown & Safety', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseChat.mockReturnValue({
      ...baseMockReturn,
      messages: [],
    });
  });

  const renderOpenWidget = () => {
    render(<ChatWidget />);
    const toggleButton = screen.getByRole('button', { name: '' });
    fireEvent.click(toggleButton);
  };

  it('renders markdown lists correctly', () => {
    const messages = [
      {
        id: '1',
        role: 'assistant',
        content: '',
        parts: [{ type: 'text', text: 'Here is a list:\n- Item 1\n- Item 2\n\n1. Ordered 1\n2. Ordered 2' }],
      },
    ] as unknown as UIMessage[];

    mockedUseChat.mockReturnValue({
      ...baseMockReturn,
      messages,
    });

    renderOpenWidget();

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Ordered 1')).toBeInTheDocument();
  });

  it('renders code blocks with basic styling', () => {
    const messages = [
      {
        id: '1',
        role: 'assistant',
        content: '',
        parts: [{ type: 'text', text: 'Here is code:\n```javascript\nconst a = 1;\n```\nAnd inline `code`.' }],
      },
    ] as unknown as UIMessage[];

    mockedUseChat.mockReturnValue({
      ...baseMockReturn,
      messages,
    });

    renderOpenWidget();

    expect(screen.getByText('const a = 1;')).toBeInTheDocument();
    expect(screen.getByText('code')).toBeInTheDocument();
    const codeElements = document.querySelectorAll('code');
    expect(codeElements.length).toBeGreaterThan(0);
  });

  it('sanitizes dangerous HTML tags', () => {
    const messages = [
      {
        id: '1',
        role: 'assistant',
        content: '',
        parts: [{ type: 'text', text: 'Safe text <script>alert("xss")</script> <img src=x onerror=alert(1) />' }],
      },
    ] as unknown as UIMessage[];

    mockedUseChat.mockReturnValue({
      ...baseMockReturn,
      messages,
    });

    renderOpenWidget();

    expect(screen.getByText(/Safe text/)).toBeInTheDocument();
    const scripts = document.querySelectorAll('script');
    expect(scripts.length).toBe(0);
    const images = document.querySelectorAll('img');
    images.forEach((img) => {
      expect(img.getAttribute('onerror')).toBeNull();
    });
  });

  it('renders links but prevents dangerous protocols', () => {
    const messages = [
      {
        id: '1',
        role: 'assistant',
        content: '',
        parts: [{ type: 'text', text: '[Good Link](https://google.com) [Bad Link](javascript:alert(1))' }],
      },
    ] as unknown as UIMessage[];

    mockedUseChat.mockReturnValue({
      ...baseMockReturn,
      messages,
    });

    renderOpenWidget();

    const goodLink = screen.getByText('Good Link');
    expect(goodLink).toHaveAttribute('href', 'https://google.com');

    const badLink = screen.queryByText('Bad Link');
    if (badLink) {
      expect(badLink).not.toHaveAttribute('href', 'javascript:alert(1)');
    }
  });

  it('renders embedded product tool output correctly', () => {
    const messages = [
      {
        id: '1',
        role: 'assistant',
        content: '',
        parts: [{ type: 'text', text: 'Found items. :::products [{"id":"p1","name":"Test Art","price":99,"image_url":"/img.jpg"}] ::: Summary text.' }],
      },
    ] as unknown as UIMessage[];

    mockedUseChat.mockReturnValue({
      ...baseMockReturn,
      messages,
    });

    renderOpenWidget();

    expect(screen.getByText('Test Art')).toBeInTheDocument();
    expect(screen.getByText('$99')).toBeInTheDocument();
    expect(screen.getByText(/Summary text/)).toBeInTheDocument();
    expect(screen.queryByText(':::products')).not.toBeInTheDocument();
  });
});
