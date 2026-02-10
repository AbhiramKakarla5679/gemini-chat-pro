import { useState } from 'react';
import { Message } from '@/types/chat';
import { 
  Copy, 
  Check, 
  ChevronDown, 
  FileText, 
  Sparkles,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { parseSources, SourceCards } from './SourceCards';

interface ChatMessageProps {
  message: Message;
  isLatest?: boolean;
  thinkingMode?: boolean;
  webSearch?: boolean;
}

export function ChatMessage({ message, isLatest, thinkingMode, webSearch }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState<boolean | null>(null);

  const isUser = message.role === 'user';

  // Strip any thinking tags from content without displaying them
  const mainContent = message.content
    .replace(/<thinking>[\s\S]*?<\/thinking>/g, '')
    .replace(/<thinking>[\s\S]*$/g, '')
    .trim();

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
  const isWaitingForFirstToken = message.isStreaming && !mainContent.trim();

  return (
    <div className="mb-5 message-appear">
      <div className="flex gap-4">
        {/* Avatar - gradient accent or gemini spinner */}
        {isWaitingForFirstToken && !thinkingMode && !webSearch ? (
          <div className="w-8 h-8 flex items-center justify-center shrink-0">
            <div className="gemini-spinner-sm" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center shrink-0 shadow-md shadow-accent/20">
            <Sparkles className={cn("w-4 h-4 text-accent-foreground", isWaitingForFirstToken && "reasoning-sparkle")} />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0 pt-0.5">
          {/* Waiting for first token - show searching text */}
          {isWaitingForFirstToken && webSearch && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-sm font-rounded font-bold text-muted-foreground">
                Searching the web...
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
          )}

          {/* Main content - ChatGPT-style rich formatting */}
          {(() => {
            const { sources, contentWithoutSources } = parseSources(mainContent);
            return (
              <>
                <div className={cn(
                  "prose prose-invert max-w-none font-rounded",
                  // Paragraphs
                  "[&_p]:text-foreground [&_p]:leading-[1.75] [&_p]:mb-4 [&_p]:text-[15px] [&_p]:font-medium",
                  // Inline code
                  "[&_code]:glass-card [&_code]:text-accent [&_code]:px-2 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:text-[13px] [&_code]:font-mono [&_code]:font-semibold",
                  // Code blocks
                  "[&_pre]:glass-card [&_pre]:rounded-2xl [&_pre]:p-5 [&_pre]:my-5",
                  "[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-foreground/90 [&_pre_code]:text-[13px] [&_pre_code]:leading-relaxed",
                  // Lists
                  "[&_ul]:text-foreground [&_ol]:text-foreground [&_ul]:my-4 [&_ol]:my-4 [&_ul]:text-[15px] [&_ol]:text-[15px]",
                  "[&_ul]:pl-5 [&_ol]:pl-5",
                  "[&_li]:text-foreground [&_li]:my-2 [&_li]:leading-[1.7] [&_li]:font-medium",
                  "[&_li_p]:mb-1",
                  // Bold / Strong - accent
                  "[&_strong]:text-accent [&_strong]:font-extrabold",
                  // Italic / Emphasis
                  "[&_em]:text-accent/70 [&_em]:italic",
                  // Headings - accented with emoji support
                  "[&_h1]:text-accent [&_h2]:text-accent [&_h3]:text-foreground [&_h4]:text-foreground",
                  "[&_h1]:font-display [&_h2]:font-display [&_h3]:font-display [&_h4]:font-rounded",
                  "[&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg [&_h4]:text-base",
                  "[&_h1]:font-black [&_h2]:font-extrabold [&_h3]:font-bold [&_h4]:font-bold",
                  "[&_h1]:mt-7 [&_h2]:mt-6 [&_h3]:mt-5 [&_h4]:mt-4",
                  "[&_h1]:mb-3 [&_h2]:mb-3 [&_h3]:mb-2 [&_h4]:mb-2",
                  "[&_h1]:tracking-tight [&_h2]:tracking-tight",
                  "[&_h1]:border-b [&_h1]:border-accent/20 [&_h1]:pb-3",
                  // Links
                  "[&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-accent/40 hover:[&_a]:decoration-accent [&_a]:transition-colors",
                  // Blockquotes - highlighted side-line for key ideas
                  "[&_blockquote]:border-l-[3px] [&_blockquote]:border-accent [&_blockquote]:pl-4 [&_blockquote]:text-foreground/85 [&_blockquote]:text-[15px] [&_blockquote]:not-italic",
                  "[&_blockquote]:bg-accent/5 [&_blockquote]:rounded-r-xl [&_blockquote]:py-3 [&_blockquote]:pr-4 [&_blockquote]:my-5",
                  "[&_blockquote_p]:text-foreground/85 [&_blockquote_strong]:text-accent",
                  // Horizontal rules - styled dividers
                  "[&_hr]:border-none [&_hr]:h-px [&_hr]:my-6 [&_hr]:bg-gradient-to-r [&_hr]:from-transparent [&_hr]:via-border [&_hr]:to-transparent",
                  // Tables - well-formatted with alternating rows
                  "[&_table]:w-full [&_table]:my-5 [&_table]:glass-card [&_table]:rounded-xl [&_table]:overflow-hidden [&_table]:border [&_table]:border-border/30",
                  "[&_thead]:bg-accent/10",
                  "[&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:text-xs [&_th]:font-extrabold [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-accent [&_th]:border-b [&_th]:border-border/40",
                  "[&_td]:px-4 [&_td]:py-3 [&_td]:text-sm [&_td]:font-medium [&_td]:border-b [&_td]:border-border/15",
                  "[&_tr:nth-child(even)]:bg-accent/5 [&_tr:hover]:bg-accent/10 [&_tr]:transition-colors",
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
                          <div className="relative group my-5 not-prose">
                            {match && (
                              <div className="flex items-center justify-between px-4 py-2.5 glass-card rounded-t-2xl border-b border-border/20">
                                <span className="text-xs text-muted-foreground font-mono font-semibold uppercase tracking-wider">{match[1]}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-3 text-xs text-muted-foreground hover:text-foreground glass-button rounded-lg font-rounded font-bold"
                                  onClick={() => navigator.clipboard.writeText(String(children))}
                                >
                                  <Copy className="h-3 w-3 mr-1.5" />
                                  Copy
                                </Button>
                              </div>
                            )}
                            <pre className={cn("!rounded-t-none !mt-0 !rounded-b-2xl glass-card !border-t-0 p-5", className)}>
                              <code className="text-[13px] leading-relaxed text-foreground/90 font-mono" {...props}>{children}</code>
                            </pre>
                          </div>
                        );
                      },
                    }}
                  >
                    {contentWithoutSources}
                  </ReactMarkdown>
                </div>
                
                {/* Source cards */}
                {!message.isStreaming && <SourceCards sources={sources} />}
              </>
            );
          })()}

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