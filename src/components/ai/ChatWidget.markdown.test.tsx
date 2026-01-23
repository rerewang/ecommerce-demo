import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

  const renderOpenWidget = async () => {
    render(<ChatWidget />);
    const toggleButton = screen.getByRole('button', { name: '' });
    fireEvent.click(toggleButton);
    // Wait for animation or state update if necessary
    await waitFor(() => expect(screen.getByPlaceholderText('Ask about art styles...')).toBeVisible());
  };

  it('renders markdown lists correctly', async () => {
    const messages = [
      {
        id: '1',
        role: 'assistant',
        content: 'Here is a list:\n- Item 1\n- Item 2\n\n1. Ordered 1\n2. Ordered 2',
        parts: [{ type: 'text', text: 'Here is a list:\n- Item 1\n- Item 2\n\n1. Ordered 1\n2. Ordered 2' }],
      },
    ] as unknown as UIMessage[];

    mockedUseChat.mockReturnValue({
      ...baseMockReturn,
      messages,
    });

    await renderOpenWidget();

    // Markdown often renders lists as <li> elements. 
    // Testing Library's getByText might not find text if it's split or if we're looking for the wrong thing.
    // Let's look for list items specifically or use a more flexible regex.
    expect(screen.getByText(/Item 1/)).toBeInTheDocument();
    expect(screen.getByText(/Item 2/)).toBeInTheDocument();
    expect(screen.getByText(/Ordered 1/)).toBeInTheDocument();
  });

  it('renders code blocks with basic styling', async () => {
    const messages = [
      {
        id: '1',
        role: 'assistant',
        content: 'Here is code:\n```javascript\nconst a = 1;\n```\nAnd inline `code`.',
        parts: [{ type: 'text', text: 'Here is code:\n```javascript\nconst a = 1;\n```\nAnd inline `code`.' }],
      },
    ] as unknown as UIMessage[];

    mockedUseChat.mockReturnValue({
      ...baseMockReturn,
      messages,
    });

    await renderOpenWidget();

    // Code blocks might be rendered inside <pre><code>...</code></pre>
    // The text content might be split.
    // We check for the presence of the code text.
    expect(screen.getByText(/const a = 1;/)).toBeInTheDocument();
    // Use getAllByText because "code" might appear in the text description ("Here is code") and the inline code block
    const codeMatches = screen.getAllByText(/code/);
    expect(codeMatches.length).toBeGreaterThan(0);
    // Check for the code tag itself (implementation detail of react-markdown)
    const codeElements = document.querySelectorAll('code');
    expect(codeElements.length).toBeGreaterThan(0);
  });

  it('sanitizes dangerous HTML tags', async () => {
    const messages = [
      {
        id: '1',
        role: 'assistant',
        content: 'Safe text <script>alert("xss")</script> <img src=x onerror=alert(1) />',
        parts: [{ type: 'text', text: 'Safe text <script>alert("xss")</script> <img src=x onerror=alert(1) />' }],
      },
    ] as unknown as UIMessage[];

    mockedUseChat.mockReturnValue({
      ...baseMockReturn,
      messages,
    });

    await renderOpenWidget();

    expect(screen.getByText(/Safe text/)).toBeInTheDocument();
    const scripts = document.querySelectorAll('script');
    expect(scripts.length).toBe(0);
    const images = document.querySelectorAll('img');
    // The image might be rendered but the onerror attribute should be stripped.
    // In some sanitizers, the entire tag might be stripped if invalid.
    // Let's verify no onerror attribute exists on any image.
    images.forEach((img) => {
      expect(img.getAttribute('onerror')).toBeNull();
    });
  });

  it('renders links but prevents dangerous protocols', async () => {
    const messages = [
      {
        id: '1',
        role: 'assistant',
        content: '[Good Link](https://google.com) [Bad Link](javascript:alert(1))',
        parts: [{ type: 'text', text: '[Good Link](https://google.com) [Bad Link](javascript:alert(1))' }],
      },
    ] as unknown as UIMessage[];

    mockedUseChat.mockReturnValue({
      ...baseMockReturn,
      messages,
    });

    await renderOpenWidget();

    const goodLink = screen.getByText('Good Link');
    expect(goodLink).toHaveAttribute('href', 'https://google.com');

    // Bad link might be rendered as text or with a safe protocol, or the href might be stripped.
    const badLink = screen.queryByText('Bad Link');
    if (badLink) {
      expect(badLink).not.toHaveAttribute('href', 'javascript:alert(1)');
    }
  });

  it('renders embedded product tool output correctly', async () => {
    const messages = [
      {
        id: '1',
        role: 'assistant',
        content: 'Found items. :::products [{"id":"p1","name":"Test Art","price":99,"image_url":"/img.jpg"}] ::: Summary text.',
        parts: [{ type: 'text', text: 'Found items. :::products [{"id":"p1","name":"Test Art","price":99,"image_url":"/img.jpg"}] ::: Summary text.' }],
      },
    ] as unknown as UIMessage[];

    mockedUseChat.mockReturnValue({
      ...baseMockReturn,
      messages,
    });

    await renderOpenWidget();

    expect(screen.getByText('Test Art')).toBeInTheDocument();
    expect(screen.getByText('$99')).toBeInTheDocument();
    expect(screen.getByText(/Summary text/)).toBeInTheDocument();
    // Ensure raw JSON is hidden
    expect(screen.queryByText(':::products')).not.toBeInTheDocument();
  });
});
