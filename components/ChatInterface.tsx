import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>({
  authMode: 'apiKey',
});

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const ChatInterface = ({ name = "Jeremy", accessKey }: { name?: string, accessKey?: string }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!isExporting) {
      scrollToBottom();
    }
  }, [messages, isExporting]);

  // Load chat history
  useEffect(() => {
    if (!accessKey) {
      // If no access key, just show the default message
      setMessages([{
        role: 'assistant',
        content: `Hi! I'm ${name.split(' ')[0]}'s AI assistant. Ask me anything about their experience, skills, or projects!`
      }]);
      setIsHistoryLoaded(true);
      return;
    }

    const loadHistory = async () => {
      try {
        const { data: history } = await client.models.ChatMessage.list({
          filter: { accessKey: { eq: accessKey } }
        });

        if (history && history.length > 0) {
          // Sort by createdAt (default field in Amplify models)
          const sortedHistory = [...history].sort((a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );

          setMessages(sortedHistory.map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content
          })));
        } else {
          // No history, set initial message
          setMessages([{
            role: 'assistant',
            content: `Hi! I'm ${name.split(' ')[0]}'s AI assistant. Ask me anything about their experience, skills, or projects!`
          }]);
        }
      } catch (err) {
        console.error("Error loading chat history:", err);
        // Fallback to initial message
        setMessages([{
          role: 'assistant',
          content: `Hi! I'm ${name.split(' ')[0]}'s AI assistant. Ask me anything about their experience, skills, or projects!`
        }]);
      } finally {
        setIsHistoryLoaded(true);
      }
    };

    loadHistory();
  }, [accessKey, name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: messages,
          accessKey: accessKey
        }),
      });

      const data = await response.json();
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        throw new Error('Failed to get reply');
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (messages.length === 0 || isExporting) return;

    setIsExporting(true);
    try {
      // Dynamic imports for PDF generation libraries
      const [jsPDF, html2canvas] = await Promise.all([
        import('jspdf').then(m => m.default),
        import('html2canvas').then(m => m.default)
      ]);

      const element = chatContainerRef.current;
      if (!element) return;

      // Find the messages container
      const messagesEl = element.querySelector('.chat-messages') as HTMLElement;
      if (!messagesEl) return;

      // Create a clone to render for PDF (to avoid capturing scrollbars and fixed height)
      const clone = messagesEl.cloneNode(true) as HTMLElement;
      clone.style.height = 'auto';
      clone.style.maxHeight = 'none';
      clone.style.overflow = 'visible';
      clone.style.width = messagesEl.offsetWidth + 'px';
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.background = 'white';
      document.body.appendChild(clone);

      // Add a header to the PDF clone
      const header = document.createElement('div');
      header.innerHTML = `<h1 style="color: #646cff; margin-bottom: 20px; font-family: sans-serif;">Chat Log with ${name}</h1>`;
      clone.prepend(header);

      const canvas = await html2canvas(clone, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      document.body.removeChild(clone);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // Handle multi-page if needed
      let heightLeft = pdfHeight;
      let position = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`chat-log-${name.replace(/\s+/g, '-').toLowerCase()}.pdf`);
    } catch (error) {
      console.error("PDF Export error:", error);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="chat-interface" ref={chatContainerRef}>
      <div className="chat-header">
        <span className="chat-title">AI Assistant</span>
        <button
          onClick={handleExportPDF}
          disabled={isExporting || messages.length === 0}
          className="export-button"
          title="Export as PDF"
        >
          {isExporting ? '...' : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          )}
          <span>PDF</span>
        </button>
      </div>

      <div className="chat-messages">
        {messages.map((m, i) => (
          <div key={i} className={`message-wrapper ${m.role}`}>
            <div className="message-bubble">
              <ReactMarkdown>{m.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message-wrapper assistant">
            <div className="message-bubble loading">
              <span className="dot">.</span><span className="dot">.</span><span className="dot">.</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="chat-input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          disabled={isLoading || !isHistoryLoaded || isExporting}
        />
        <button type="submit" disabled={isLoading || !input.trim() || !isHistoryLoaded || isExporting}>
          Send
        </button>
      </form>

      <style jsx>{`
        .chat-interface {
          height: 450px;
          display: flex;
          flex-direction: column;
          background: var(--palette-neutral);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          margin-bottom: 30px;
          overflow: hidden;
          box-shadow: inset 0 2px 10px rgba(0,0,0,0.02);
          text-align: left; /* Reset centering from parent */
        }
        .chat-header {
          padding: 12px 20px;
          background: var(--card-bg);
          border-bottom: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .chat-title {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          opacity: 0.7;
        }
        .export-button {
          padding: 6px 12px;
          background: var(--palette-neutral);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          color: var(--text-primary);
          font-size: 0.75rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: none;
        }
        .export-button svg {
          width: 14px;
          height: 14px;
        }
        .export-button:hover:not(:disabled) {
          background: var(--border-color);
          border-color: var(--text-secondary);
          transform: none;
        }
        .export-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .message-wrapper {
          display: flex;
          width: 100%;
        }
        .message-wrapper.user {
          justify-content: flex-end;
        }
        .message-wrapper.assistant {
          justify-content: flex-start;
        }
        .message-bubble {
          max-width: 75%;
          padding: 14px 18px;
          border-radius: 18px;
          font-size: 0.95rem;
          line-height: 1.6;
          text-align: left;
        }
        .message-bubble :global(p) {
          margin-bottom: 12px;
        }
        .message-bubble :global(p:last-child) {
          margin-bottom: 0;
        }
        .message-bubble :global(ul), .message-bubble :global(ol) {
          margin-bottom: 12px;
          padding-left: 20px;
        }
        .user .message-bubble {
          background: var(--palette-secondary);
          color: white;
          border-bottom-right-radius: 4px;
        }
        .assistant .message-bubble {
          background: var(--card-bg);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          border-bottom-left-radius: 4px;
        }
        .loading .dot {
          animation: blink 1.4s infinite;
          font-size: 1.5rem;
          line-height: 0;
        }
        .loading .dot:nth-child(2) { animation-delay: 0.2s; }
        .loading .dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes blink {
          0% { opacity: 0.2; }
          20% { opacity: 1; }
          100% { opacity: 0.2; }
        }
        .chat-input-area {
          display: flex;
          padding: 15px;
          background: var(--card-bg);
          border-top: 1px solid var(--border-color);
          gap: 10px;
        }
        input {
          flex: 1;
          padding: 12px 16px;
          background: var(--palette-neutral);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          border-radius: 25px;
          outline: none;
          font-size: 0.95rem;
        }
        input:focus {
          border-color: var(--palette-secondary);
        }
        .chat-input-area button {
          background: var(--palette-secondary);
          color: white;
          border: none;
          padding: 0 24px;
          border-radius: 25px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 8px var(--shadow-color);
        }
        .chat-input-area button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          box-shadow: none;
        }
        .chat-input-area button:not(:disabled):hover {
          filter: brightness(1.1);
          transform: translateY(-1px);
        }
        .chat-input-area button:not(:disabled):active {
          transform: translateY(0);
        }

        @media (max-width: 480px) {
          .chat-interface {
            height: 380px;
            margin-bottom: 20px;
          }
          .chat-messages {
            padding: 8px;
            gap: 6px;
          }
          .message-bubble {
            max-width: 92%;
            padding: 8px 12px;
            font-size: 0.85rem;
          }
          .chat-input-area {
            padding: 6px;
            gap: 4px;
          }
          .chat-input-area button {
            padding: 0 10px;
            font-size: 0.8rem;
          }
          input {
            padding: 6px 10px;
            font-size: 0.85rem;
          }
          .chat-title {
            font-size: 0.75rem;
          }
        }
      `}</style>


    </div>
  );
};
