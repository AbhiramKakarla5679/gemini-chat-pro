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
      <div className="flex justify-end mb-5 message-appear">
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
                      className="max-w-[200px] max-h-[150px] rounded-2xl object-cover glass-card"
                    />
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl glass-card text-sm font-rounded font-bold">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="truncate max-w-[150px]">{attachment.name}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* User message bubble - glass effect */}
          <div className="px-5 py-3.5 rounded-3xl glass-card">
            <p className="whitespace-pre-wrap text-sm font-rounded font-bold text-foreground">{message.content}</p>
          </div>
        </div>
      </div>
    );
  }

  // Assistant message
  return (
    <div className="mb-5 message-appear">
      <div className="flex gap-4">
        {/* Avatar - glass effect */}
        <div className="w-8 h-8 rounded-2xl glass-card flex items-center justify-center shrink-0 border border-accent/30">
          <GraduationCap className="w-4 h-4 text-accent" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pt-0.5">
          {/* Thinking section - glass card */}
          {thinkingContent && (
            <div className="mb-4">
              <button
                onClick={() => setShowThinking(!showThinking)}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-all duration-300 mb-2 glass-button px-3 py-1.5 rounded-xl"
              >
                {showThinking ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
                <span className="font-rounded font-bold">View reasoning</span>
              </button>
              {showThinking && (
                <div className="pl-4 border-l-2 border-accent/30 text-muted-foreground text-sm glass-card rounded-2xl p-4 ml-0">
                  <ReactMarkdown>{thinkingContent}</ReactMarkdown>
                </div>
              )}
            </div>
          )}

          {/* Main content - SF Pro Bold Rounded */}
          <div className={cn(
            "prose prose-invert prose-sm max-w-none font-rounded",
            "[&_p]:text-foreground [&_p]:leading-relaxed [&_p]:mb-3 [&_p]:text-sm [&_p]:font-bold",
            "[&_code]:glass-card [&_code]:text-accent [&_code]:px-2 [&_code]:py-1 [&_code]:rounded-lg [&_code]:text-xs [&_code]:font-mono",
            "[&_pre]:glass-card [&_pre]:rounded-2xl [&_pre]:p-5 [&_pre]:my-4",
            "[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-foreground [&_pre_code]:text-xs",
            "[&_ul]:text-foreground [&_ol]:text-foreground [&_ul]:my-3 [&_ol]:my-3 [&_ul]:text-sm [&_ul]:font-bold [&_ol]:font-bold",
            "[&_li]:text-foreground [&_li]:my-1.5",
            "[&_strong]:text-foreground [&_strong]:font-extrabold",
            "[&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_h1]:font-display [&_h2]:font-display [&_h3]:font-display",
            "[&_h1]:text-lg [&_h2]:text-base [&_h3]:text-sm",
            "[&_h1]:font-black [&_h2]:font-extrabold [&_h3]:font-bold",
            "[&_h1]:mt-5 [&_h2]:mt-4 [&_h3]:mt-3",
            "[&_h1]:mb-3 [&_h2]:mb-2 [&_h3]:mb-2",
            "[&_a]:text-accent [&_a]:no-underline hover:[&_a]:underline [&_a]:transition-colors",
            "[&_blockquote]:border-l-2 [&_blockquote]:border-accent/40 [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground [&_blockquote]:text-sm [&_blockquote]:glass-card [&_blockquote]:rounded-r-2xl [&_blockquote]:py-3 [&_blockquote]:pr-4",
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
                    <div className="relative group my-4">
                      {match && (
                        <div className="flex items-center justify-between px-4 py-2 glass-card rounded-t-2xl border-b border-white/5">
                          <span className="text-xs text-muted-foreground font-rounded font-bold">{match[1]}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-3 text-xs text-muted-foreground hover:text-foreground glass-button rounded-xl font-rounded font-bold"
                            onClick={() => navigator.clipboard.writeText(String(children))}
                          >
                            <Copy className="h-3 w-3 mr-1.5" />
                            Copy
                          </Button>
                        </div>
                      )}
                      <pre className={cn("!rounded-t-none !mt-0 !rounded-b-2xl", className)}>
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

          {/* Actions toolbar - glass buttons */}
          {!message.isStreaming && (
            <div className="flex items-center gap-1.5 mt-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground glass-button"
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
                  "h-8 w-8 rounded-xl glass-button",
                  liked === true ? "text-accent border-accent/30" : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setLiked(liked === true ? null : true)}
              >
                <ThumbsUp className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-xl glass-button",
                  liked === false ? "text-destructive border-destructive/30" : "text-muted-foreground hover:text-foreground"
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