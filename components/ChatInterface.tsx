import React, { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm Jeremy's AI assistant. Ask me anything about his experience, skills, or projects!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history: messages }),
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

  return (
    <div className="chat-interface">
      <div className="chat-messages">
        {messages.map((m, i) => (
          <div key={i} className={`message-wrapper ${m.role}`}>
            <div className="message-bubble">
              {m.content}
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
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !input.trim()}>
          Send
        </button>
      </form>

      <style jsx>{`
        .chat-interface {
          height: 400px;
          display: flex;
          flex-direction: column;
          background: var(--palette-neutral);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          margin-bottom: 30px;
          overflow: hidden;
          box-shadow: inset 0 2px 10px rgba(0,0,0,0.02);
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
        .message-bubble {
          max-width: 80%;
          padding: 12px 16px;
          border-radius: 18px;
          font-size: 0.95rem;
          line-height: 1.4;
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
        button {
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
        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          box-shadow: none;
        }
        button:not(:disabled):hover {
          filter: brightness(1.1);
          transform: translateY(-1px);
        }
        button:not(:disabled):active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
};
