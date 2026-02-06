import { useRef, useEffect } from 'react';
import { Message } from '@/types/chat';
import { ChatMessage } from './ChatMessage';
import { GraduationCap } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md opacity-0 animate-fade-up" style={{ animationDelay: '100ms' }}>
          <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-accent flex items-center justify-center">
            <GraduationCap className="w-7 h-7 text-accent-foreground" />
          </div>
          <h1 className="text-xl font-display font-bold mb-2">
            How can I help you study?
          </h1>
          <p className="text-sm text-muted-foreground">
            Ask me anything about your subjects, exam prep, or homework.
          </p>
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
          />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}