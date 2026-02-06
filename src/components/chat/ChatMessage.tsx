import { useState } from 'react';
import { Message } from '@/types/chat';
import { 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Image as ImageIcon,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Volume2,
  MoreHorizontal,
  Sparkles
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
  const [showThinking, setShowThinking] = useState(true);
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
      <div className="flex justify-end mb-6">
        <div className="max-w-[85%]">
          {/* File attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2 justify-end">
              {message.attachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#2f2f2f] text-sm text-[#ececec]">
                  {attachment.type.startsWith('image/') ? (
                    <>
                      <ImageIcon className="w-4 h-4 text-[#8e8e8e]" />
                      {attachment.base64 && (
                        <img 
                          src={attachment.base64} 
                          alt={attachment.name}
                          className="max-w-[200px] max-h-[150px] rounded-lg object-cover"
                        />
                      )}
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 text-[#8e8e8e]" />
                      <span className="truncate max-w-[200px]">{attachment.name}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* User message bubble */}
          <div className="px-5 py-3 rounded-3xl bg-[#2f2f2f] text-[#ececec]">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
      </div>
    );
  }

  // Assistant message
  return (
    <div className="mb-6 message-appear">
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ab68ff] via-[#ff7eb3] to-[#ff9f68] flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Thinking section */}
          {thinkingContent && (
            <div className="mb-4">
              <button
                onClick={() => setShowThinking(!showThinking)}
                className="flex items-center gap-2 text-sm text-[#8e8e8e] hover:text-[#ececec] transition-colors mb-2"
              >
                {showThinking ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
                <span className="font-medium">Thought for a moment</span>
              </button>
              {showThinking && (
                <div className="pl-4 border-l-2 border-[#424242] text-[#b4b4b4] text-sm space-y-2">
                  <ReactMarkdown>
                    {thinkingContent}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          )}

          {/* Main content */}
          <div className={cn(
            "prose prose-invert prose-sm max-w-none",
            "[&_p]:text-[#ececec] [&_p]:leading-relaxed [&_p]:mb-4",
            "[&_code]:bg-[#1e1e1e] [&_code]:text-[#e06c75] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm",
            "[&_pre]:bg-[#1e1e1e] [&_pre]:rounded-xl [&_pre]:p-4 [&_pre]:my-4",
            "[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-[#ececec]",
            "[&_ul]:text-[#ececec] [&_ol]:text-[#ececec] [&_ul]:my-4 [&_ol]:my-4",
            "[&_li]:text-[#ececec] [&_li]:my-1",
            "[&_strong]:text-[#ececec] [&_strong]:font-semibold",
            "[&_h1]:text-[#ececec] [&_h2]:text-[#ececec] [&_h3]:text-[#ececec]",
            "[&_h1]:text-xl [&_h2]:text-lg [&_h3]:text-base",
            "[&_h1]:font-semibold [&_h2]:font-semibold [&_h3]:font-medium",
            "[&_h1]:mt-6 [&_h2]:mt-5 [&_h3]:mt-4",
            "[&_h1]:mb-3 [&_h2]:mb-2 [&_h3]:mb-2",
            "[&_a]:text-[#7ab7ff] [&_a]:no-underline hover:[&_a]:underline",
            "[&_blockquote]:border-l-2 [&_blockquote]:border-[#424242] [&_blockquote]:pl-4 [&_blockquote]:text-[#b4b4b4]",
            "[&_hr]:border-[#424242] [&_hr]:my-6",
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
                        <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] rounded-t-xl border-b border-[#3d3d3d]">
                          <span className="text-xs text-[#8e8e8e] font-medium">{match[1]}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-[#8e8e8e] hover:text-[#ececec] hover:bg-[#424242] rounded"
                            onClick={() => navigator.clipboard.writeText(String(children))}
                          >
                            <Copy className="h-3.5 w-3.5 mr-1.5" />
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
            <div className="flex items-center gap-0.5 mt-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-[#8e8e8e] hover:text-[#ececec] hover:bg-[#2f2f2f]"
                onClick={handleCopy}
                title="Copy"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-[#8e8e8e] hover:text-[#ececec] hover:bg-[#2f2f2f]"
                title="Read aloud"
              >
                <Volume2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-lg hover:bg-[#2f2f2f]",
                  liked === true ? "text-green-400" : "text-[#8e8e8e] hover:text-[#ececec]"
                )}
                onClick={() => setLiked(liked === true ? null : true)}
                title="Good response"
              >
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-lg hover:bg-[#2f2f2f]",
                  liked === false ? "text-red-400" : "text-[#8e8e8e] hover:text-[#ececec]"
                )}
                onClick={() => setLiked(liked === false ? null : false)}
                title="Bad response"
              >
                <ThumbsDown className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-[#8e8e8e] hover:text-[#ececec] hover:bg-[#2f2f2f]"
                title="Regenerate"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-[#8e8e8e] hover:text-[#ececec] hover:bg-[#2f2f2f]"
                title="More"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
