import { useState, useRef, useCallback } from 'react';
import { 
  Send, 
  Paperclip, 
  X, 
  Globe, 
  Code2, 
  SlidersHorizontal,
  Plus,
  Atom,
  Square
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileAttachment, AVAILABLE_MODELS } from '@/types/chat';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (content: string, attachments: FileAttachment[], thinkingMode: boolean) => void;
  isLoading: boolean;
  currentModel: string;
  onModelChange: (model: string) => void;
}

type ChatMode = 'research' | 'code' | null;

export function ChatInput({ onSend, isLoading, currentModel, onModelChange }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [reasoningMode, setReasoningMode] = useState(false);
  const [activeMode, setActiveMode] = useState<ChatMode>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(() => {
    if (!input.trim() && attachments.length === 0) return;
    if (isLoading) return;
    
    onSend(input, attachments, reasoningMode);
    setInput('');
    setAttachments([]);
  }, [input, attachments, reasoningMode, isLoading, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: FileAttachment[] = [];
    
    for (const file of Array.from(files)) {
      if (file.type.startsWith('image/')) {
        const base64 = await readFileAsBase64(file);
        newAttachments.push({
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type,
          size: file.size,
          base64,
        });
      } else {
        newAttachments.push({
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type,
          size: file.size,
        });
      }
    }

    setAttachments(prev => [...prev, ...newAttachments]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleStop = () => {
    // Would implement abort controller here
  };

  return (
    <div className="p-4 pb-6">
      <div className="max-w-3xl mx-auto">
        {/* Main input container - ChatGPT dark style */}
        <div className="relative rounded-3xl bg-[#2f2f2f] border border-[#424242] overflow-hidden">
          
          {/* Reasoning indicator when active */}
          {isLoading && reasoningMode && (
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#424242]">
              <div className="flex items-center gap-2 text-[#ececec]">
                <Atom className="h-5 w-5 animate-pulse" />
                <span className="text-sm font-medium">Reasoning...</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleStop}
                className="h-7 px-3 text-xs bg-[#424242] hover:bg-[#525252] text-[#ececec] rounded-full"
              >
                Stop
              </Button>
            </div>
          )}

          {/* Attachments preview */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 px-4 pt-3">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#424242] text-sm text-[#ececec]"
                >
                  <span className="truncate max-w-[150px]">{attachment.name}</span>
                  <button
                    onClick={() => removeAttachment(attachment.id)}
                    className="hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Text input area */}
          <div className="px-4 py-3">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                // Auto-resize
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything"
              disabled={isLoading}
              className="w-full bg-transparent text-[#ececec] placeholder:text-[#8e8e8e] resize-none outline-none text-base leading-relaxed min-h-[24px] max-h-[200px]"
              rows={1}
            />
          </div>

          {/* Bottom toolbar */}
          <div className="flex items-center justify-between px-3 pb-3">
            <div className="flex items-center gap-0.5">
              {/* Plus/Attach button */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.txt,.md,.json,.csv,.js,.ts,.py,.html,.css"
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full text-[#b4b4b4] hover:text-[#ececec] hover:bg-[#424242]"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <Plus className="h-5 w-5" />
              </Button>

              {/* Search/Browse web */}
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full text-[#b4b4b4] hover:text-[#ececec] hover:bg-[#424242]"
                disabled={isLoading}
              >
                <Globe className="h-5 w-5" />
              </Button>

              {/* Canvas/Code */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-9 w-9 rounded-full hover:bg-[#424242]",
                  activeMode === 'code' ? "text-[#ececec] bg-[#424242]" : "text-[#b4b4b4] hover:text-[#ececec]"
                )}
                onClick={() => setActiveMode(activeMode === 'code' ? null : 'code')}
                disabled={isLoading}
              >
                <Code2 className="h-5 w-5" />
              </Button>

              {/* Reasoning/Thinking toggle */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-9 w-9 rounded-full hover:bg-[#424242]",
                  reasoningMode ? "text-[#ececec] bg-[#424242]" : "text-[#b4b4b4] hover:text-[#ececec]"
                )}
                onClick={() => setReasoningMode(!reasoningMode)}
                disabled={isLoading}
                title="Toggle reasoning mode"
              >
                <SlidersHorizontal className="h-5 w-5" />
              </Button>

              {/* Active mode chips */}
              {activeMode === 'research' && (
                <div className="flex items-center gap-1.5 ml-2 px-3 py-1.5 rounded-full bg-[#424242] text-[#ececec] text-sm">
                  <Atom className="h-4 w-4" />
                  <span>Research</span>
                  <button 
                    onClick={() => setActiveMode(null)}
                    className="ml-0.5 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {reasoningMode && !isLoading && (
                <div className="flex items-center gap-1.5 ml-2 px-3 py-1.5 rounded-full bg-[#424242] text-[#ececec] text-sm">
                  <Atom className="h-4 w-4" />
                  <span>Reasoning</span>
                  <button 
                    onClick={() => setReasoningMode(false)}
                    className="ml-0.5 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Send button with gradient */}
            <Button
              onClick={handleSubmit}
              disabled={isLoading || (!input.trim() && attachments.length === 0)}
              size="icon"
              className={cn(
                "h-9 w-9 rounded-full transition-all",
                (input.trim() || attachments.length > 0) && !isLoading
                  ? "bg-gradient-to-r from-[#ab68ff] via-[#ff7eb3] to-[#ff9f68] hover:opacity-90"
                  : "bg-[#676767] text-[#b4b4b4]"
              )}
            >
              <Send className="h-4 w-4 text-white" />
            </Button>
          </div>
        </div>

        {/* Model info text */}
        <p className="text-center text-xs text-[#8e8e8e] mt-3">
          ChatGPT can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
}
