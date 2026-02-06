import { useRef, useEffect } from 'react';
import { Message } from '@/types/chat';
import { ChatMessage } from './ChatMessage';
import { Sparkles } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  thinkingMode?: boolean;
  webSearch?: boolean;
}

export function MessageList({ messages, isLoading, thinkingMode, webSearch }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-lg">
          <div 
            className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center shadow-lg shadow-accent/20 opacity-0 animate-scale-up"
            style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}
          >
            <Sparkles className="w-8 h-8 text-accent-foreground" />
          </div>
          <h1 
            className="text-2xl font-display font-bold mb-3 opacity-0 animate-fade-up"
            style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
          >
            What can I help with?
          </h1>
          <p 
            className="text-muted-foreground opacity-0 animate-fade-up"
            style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
          >
            Ask me anything — I'm here to help you think, create, and explore.
          </p>
          <div 
            className="flex flex-wrap justify-center gap-2 mt-8 opacity-0 animate-fade-up"
            style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}
          >
            {['Write a story', 'Explain a concept', 'Help me code', 'Brainstorm ideas'].map((suggestion) => (
              <span 
                key={suggestion}
                className="px-4 py-2 rounded-full text-sm text-muted-foreground glass-button cursor-default hover:text-foreground transition-colors"
              >
                {suggestion}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto py-6 px-4 pt-16">
        {messages.map((message, index) => (
          <ChatMessage 
            key={message.id} 
            message={message}
            isLatest={index === messages.length - 1}
            thinkingMode={thinkingMode}
            webSearch={webSearch}
          />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
