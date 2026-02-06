import { useState, useRef, useCallback, useEffect, DragEvent, ClipboardEvent } from 'react';
import { 
  Send, 
  X, 
  Globe, 
  Lightbulb,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileAttachment, AVAILABLE_MODELS } from '@/types/chat';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ChatInputProps {
  onSend: (content: string, attachments: FileAttachment[], thinkingMode: boolean, webSearch: boolean) => void;
  isLoading: boolean;
  currentModel: string;
  onModelChange: (model: string) => void;
}

export function ChatInput({ onSend, isLoading, currentModel, onModelChange }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [thinkingMode, setThinkingMode] = useState(false);
  const [webSearch, setWebSearch] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = useCallback(() => {
    if (!input.trim() && attachments.length === 0) return;
    if (isLoading) return;
    
    onSend(input, attachments, thinkingMode, webSearch);
    setInput('');
    setAttachments([]);
  }, [input, attachments, thinkingMode, webSearch, isLoading, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
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

  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newAttachments: FileAttachment[] = [];
    
    for (const file of fileArray) {
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
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    await processFiles(files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle paste events
  const handlePaste = useCallback(async (e: ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const imageItems: File[] = [];
    
    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          imageItems.push(file);
        }
      }
    }

    if (imageItems.length > 0) {
      e.preventDefault();
      await processFiles(imageItems);
    }
  }, []);

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only set dragging to false if we're leaving the container
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const { clientX, clientY } = e;
      if (
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom
      ) {
        setIsDragging(false);
      }
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      await processFiles(files);
    }
  }, []);

  // Global paste listener for images when input is focused
  useEffect(() => {
    const handleGlobalPaste = async (e: globalThis.ClipboardEvent) => {
      // Only handle if our textarea is focused or the container
      if (!containerRef.current?.contains(document.activeElement)) return;
      
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            await processFiles([file]);
          }
          break;
        }
      }
    };

    document.addEventListener('paste', handleGlobalPaste);
    return () => document.removeEventListener('paste', handleGlobalPaste);
  }, []);

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const currentModelInfo = AVAILABLE_MODELS.find(m => m.id === currentModel) || AVAILABLE_MODELS[0];

  return (
    <div className="p-4 pb-6">
      <div className="max-w-3xl mx-auto">
        {/* Main input container */}
        <div 
          ref={containerRef}
          className={cn(
            "relative rounded-2xl bg-card border transition-all duration-200",
            isDragging 
              ? "border-accent border-dashed bg-accent/5" 
              : "border-border"
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onPaste={handlePaste}
        >
          {/* Drag overlay */}
          {isDragging && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-accent/10 border-2 border-dashed border-accent">
              <div className="text-center">
                <ImageIcon className="w-8 h-8 mx-auto mb-2 text-accent" />
                <p className="text-sm font-bold text-accent">Drop files here</p>
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {isLoading && (thinkingMode || webSearch) && (
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm font-bold">
                  {thinkingMode ? 'Thinking...' : 'Searching...'}
                </span>
              </div>
            </div>
          )}

          {/* Attachments preview */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 px-4 pt-3">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="relative group"
                >
                  {attachment.type.startsWith('image/') && attachment.base64 ? (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-border">
                      <img 
                        src={attachment.base64} 
                        alt={attachment.name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeAttachment(attachment.id)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate max-w-[120px]">{attachment.name}</span>
                      <button
                        onClick={() => removeAttachment(attachment.id)}
                        className="hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
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
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              disabled={isLoading}
              className="w-full bg-transparent text-foreground placeholder:text-muted-foreground resize-none outline-none text-base leading-relaxed min-h-[24px] max-h-[200px]"
              rows={1}
            />
          </div>

          {/* Bottom toolbar */}
          <div className="flex items-center justify-between px-3 pb-3">
            <div className="flex items-center gap-1">
              {/* Attach files */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.txt,.md,.json,.csv,.js,.ts,.tsx,.py,.html,.css,.doc,.docx"
                className="hidden"
                onChange={handleFileSelect}
              />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary"
                    disabled={isLoading}
                  >
                    <Paperclip className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-card border-border">
                  <DropdownMenuItem 
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer"
                  >
                    <Paperclip className="h-4 w-4 mr-2" />
                    Upload file
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.multiple = true;
                      input.onchange = (e) => handleFileSelect(e as any);
                      input.click();
                    }}
                    className="cursor-pointer"
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Upload image
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Web search */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-9 w-9 rounded-full hover:bg-secondary",
                  webSearch ? "text-accent bg-accent/10" : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setWebSearch(!webSearch)}
                disabled={isLoading}
                title="Search the web"
              >
                <Globe className="h-5 w-5" />
              </Button>

              {/* Thinking mode */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-9 w-9 rounded-full hover:bg-secondary",
                  thinkingMode ? "text-accent bg-accent/10" : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setThinkingMode(!thinkingMode)}
                disabled={isLoading}
                title="Enable deep thinking"
              >
                <Lightbulb className="h-5 w-5" />
              </Button>

              {/* Active mode chips */}
              {thinkingMode && !isLoading && (
                <div className="flex items-center gap-1.5 ml-1 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-bold">
                  <Lightbulb className="h-3.5 w-3.5" />
                  <span>Think</span>
                  <button 
                    onClick={() => setThinkingMode(false)}
                    className="ml-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              {webSearch && !isLoading && (
                <div className="flex items-center gap-1.5 ml-1 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-bold">
                  <Globe className="h-3.5 w-3.5" />
                  <span>Web</span>
                  <button 
                    onClick={() => setWebSearch(false)}
                    className="ml-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Send button */}
            <Button
              onClick={handleSubmit}
              disabled={isLoading || (!input.trim() && attachments.length === 0)}
              size="icon"
              className={cn(
                "h-9 w-9 rounded-full transition-all duration-200",
                (input.trim() || attachments.length > 0) && !isLoading
                  ? "bg-accent hover:bg-accent/90 text-accent-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Model selector and disclaimer */}
        <div className="flex items-center justify-between mt-3 px-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-transparent"
              >
                {currentModelInfo.name}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-card border-border min-w-[200px]">
              {AVAILABLE_MODELS.map((model) => (
                <DropdownMenuItem
                  key={model.id}
                  onClick={() => onModelChange(model.id)}
                  className={cn(
                    "cursor-pointer flex flex-col items-start",
                    currentModel === model.id && "bg-secondary"
                  )}
                >
                  <span className="font-bold">{model.name}</span>
                  <span className="text-xs text-muted-foreground">{model.description}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <p className="text-xs text-muted-foreground">
            AI can make mistakes. Verify important info.
          </p>
        </div>
      </div>
    </div>
  );
}