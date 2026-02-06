import { useState } from 'react';
import { Message } from '@/types/chat';
import { 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  GraduationCap,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
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
  const [liked, setLiked] = useState<boolean | null>(null);

  const isUser = message.role === 'user';

  // Parse thinking content from the message
  const thinkingMatch = message.content.match(/<thinking>([\s\S]*?)<\/thinking>/);
  const thinkingContent = thinkingMatch ? thinkingMatch[1].trim() : null;
  const mainContent = thinkingContent 
    ? message.content.replace(/<thinking>[\s\S]*?<\/thinking>/, '').trim()
    : message.content;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(mainContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-4 message-appear">
        <div className="max-w-[80%]">
          {/* File attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2 justify-end">
              {message.attachments.map((attachment) => (
                <div key={attachment.id}>
                  {attachment.type.startsWith('image/') && attachment.base64 ? (
                    <img 
                      src={attachment.base64} 
                      alt={attachment.name}
                      className="max-w-[200px] max-h-[150px] rounded-xl object-cover border border-border"
                    />
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary text-sm">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="truncate max-w-[150px]">{attachment.name}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* User message bubble */}
          <div className="px-4 py-3 rounded-2xl bg-secondary text-foreground">
            <p className="whitespace-pre-wrap text-sm">{message.content}</p>
          </div>
        </div>
      </div>
    );
  }

  // Assistant message
  return (
    <div className="mb-4 message-appear">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center shrink-0">
          <GraduationCap className="w-4 h-4 text-accent-foreground" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pt-0.5">
          {/* Thinking section */}
          {thinkingContent && (
            <div className="mb-3">
              <button
                onClick={() => setShowThinking(!showThinking)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
              >
                {showThinking ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
                <span className="font-bold">View reasoning</span>
              </button>
              {showThinking && (
                <div className="pl-3 border-l-2 border-border text-muted-foreground text-sm">
                  <ReactMarkdown>{thinkingContent}</ReactMarkdown>
                </div>
              )}
            </div>
          )}

          {/* Main content */}
          <div className={cn(
            "prose prose-invert prose-sm max-w-none",
            "[&_p]:text-foreground [&_p]:leading-relaxed [&_p]:mb-3 [&_p]:text-sm",
            "[&_code]:bg-secondary [&_code]:text-accent [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs",
            "[&_pre]:bg-secondary [&_pre]:rounded-xl [&_pre]:p-4 [&_pre]:my-3",
            "[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-foreground [&_pre_code]:text-xs",
            "[&_ul]:text-foreground [&_ol]:text-foreground [&_ul]:my-3 [&_ol]:my-3 [&_ul]:text-sm [&_ol]:text-sm",
            "[&_li]:text-foreground [&_li]:my-1",
            "[&_strong]:text-foreground [&_strong]:font-bold",
            "[&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground",
            "[&_h1]:text-lg [&_h2]:text-base [&_h3]:text-sm",
            "[&_h1]:font-bold [&_h2]:font-bold [&_h3]:font-bold",
            "[&_h1]:mt-4 [&_h2]:mt-3 [&_h3]:mt-3",
            "[&_h1]:mb-2 [&_h2]:mb-2 [&_h3]:mb-1",
            "[&_a]:text-accent [&_a]:no-underline hover:[&_a]:underline",
            "[&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_blockquote]:text-sm",
            message.isStreaming && isLatest && "streaming-cursor"
          )}>
            <ReactMarkdown
              components={{
                code({ node, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const isInline = !match && !className;
                  
                  if (isInline) {
                    return (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  }
                  
                  return (
                    <div className="relative group my-3">
                      {match && (
                        <div className="flex items-center justify-between px-3 py-1.5 bg-card rounded-t-xl border-b border-border">
                          <span className="text-xs text-muted-foreground font-bold">{match[1]}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary rounded"
                            onClick={() => navigator.clipboard.writeText(String(children))}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                        </div>
                      )}
                      <pre className={cn("!rounded-t-none !mt-0", className)}>
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

          {/* Actions toolbar */}
          {!message.isStreaming && (
            <div className="flex items-center gap-0.5 mt-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-accent" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-7 w-7 rounded-md hover:bg-secondary",
                  liked === true ? "text-accent" : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setLiked(liked === true ? null : true)}
              >
                <ThumbsUp className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-7 w-7 rounded-md hover:bg-secondary",
                  liked === false ? "text-destructive" : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setLiked(liked === false ? null : false)}
              >
                <ThumbsDown className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}