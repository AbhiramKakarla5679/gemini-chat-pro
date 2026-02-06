import { useState } from 'react';
import { Message } from '@/types/chat';
import { Bot, User, Copy, Check, ChevronDown, ChevronUp, FileText, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: Message;
  isLatest?: boolean;
}

export function ChatMessage({ message, isLatest }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [showThinking, setShowThinking] = useState(false);

  const isUser = message.role === 'user';

  // Parse thinking content from the message
  const thinkingMatch = message.content.match(/<thinking>([\s\S]*?)<\/thinking>/);
  const thinkingContent = thinkingMatch ? thinkingMatch[1].trim() : null;
  const mainContent = thinkingContent 
    ? message.content.replace(/<thinking>[\s\S]*?<\/thinking>/, '').trim()
    : message.content;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn(
      "py-6 px-4 -mx-4 rounded-xl message-appear",
      isUser ? "bg-chat-user" : "bg-chat-assistant"
    )}>
      <div className="flex gap-4">
        {/* Avatar */}
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
          isUser ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
        )}>
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Role label */}
          <div className="font-medium text-sm">
            {isUser ? 'You' : 'Assistant'}
          </div>

          {/* File attachments for user messages */}
          {isUser && message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {message.attachments.map((attachment) => (
                <div key={attachment.id} className="file-badge">
                  {attachment.type.startsWith('image/') ? (
                    <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <FileText className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="truncate max-w-[200px]">{attachment.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* Thinking section */}
          {thinkingContent && (
            <div className="mb-4">
              <button
                onClick={() => setShowThinking(!showThinking)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {showThinking ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
                <span>Thinking process</span>
              </button>
          {showThinking && (
                <div className="mt-2 p-4 rounded-lg bg-thinking-bg border border-thinking-border text-sm prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>
                    {thinkingContent}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          )}

          {/* Main content */}
          <div className={cn(
            "prose prose-sm max-w-none dark:prose-invert [&_pre]:bg-code-bg [&_code]:bg-code-bg [&_code]:text-code-foreground",
            message.isStreaming && isLatest && "streaming-cursor"
          )}>
            <ReactMarkdown
              components={{
                code({ node, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const isInline = !match;
                  
                  if (isInline) {
                    return (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  }
                  
                  return (
                    <div className="relative group">
                      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 bg-code-bg/50 hover:bg-code-bg"
                          onClick={() => {
                            navigator.clipboard.writeText(String(children));
                          }}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <pre className={className}>
                        <code {...props}>{children}</code>
                      </pre>
                    </div>
                  );
                },
              }}
            >
              {mainContent}
            </ReactMarkdown>
          </div>

          {/* Actions */}
          {!isUser && !message.isStreaming && (
            <div className="flex items-center gap-1 mt-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
