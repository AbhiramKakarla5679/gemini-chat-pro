import { useState, useRef, useCallback, useEffect, DragEvent, ClipboardEvent } from 'react';
import { 
  Send, 
  X, 
  Globe, 
  Lightbulb,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Loader2,
  BookOpen
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
  onSend: (content: string, attachments: FileAttachment[], thinkingMode: boolean, webSearch: boolean, context?: string) => void;
  isLoading: boolean;
  currentModel: string;
  onModelChange: (model: string) => void;
  droppedFiles?: File[];
  onClearDroppedFiles?: () => void;
}

export function ChatInput({ 
  onSend, 
  isLoading, 
  currentModel, 
  onModelChange,
  droppedFiles,
  onClearDroppedFiles
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const [context, setContext] = useState('');
  const [showContext, setShowContext] = useState(false);
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
    
    // Prepend context to the message if provided
    const messageContent = context.trim() 
      ? `Context: ${context.trim()}\n\n${input}` 
      : input;
    
    onSend(messageContent, attachments, thinkingMode, webSearch, context);
    setInput('');
    setAttachments([]);
  }, [input, context, attachments, thinkingMode, webSearch, isLoading, onSend]);

  // Handle dropped files from parent
  useEffect(() => {
    if (droppedFiles && droppedFiles.length > 0) {
      processFiles(droppedFiles);
      onClearDroppedFiles?.();
    }
  }, [droppedFiles, onClearDroppedFiles]);

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

  // Handle paste events - removed to prevent duplicate with global paste listener
  const handlePaste = useCallback(async (e: ClipboardEvent<HTMLDivElement>) => {
    // Do nothing here - handled by global paste listener in useEffect below
    // This prevents duplicate file additions
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
    <div className="p-2 sm:p-4 pb-1 sm:pb-2 mb-3 sm:mb-2">
      <div className="max-w-3xl mx-auto">
        {/* Context input (collapsible) */}
        {showContext && (
          <div className="mb-3 glass-card rounded-2xl p-4 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-rounded font-bold text-muted-foreground flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5" />
                Study Context
              </label>
              <button
                onClick={() => {
                  setShowContext(false);
                  setContext('');
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Add notes, study materials, or context to help the AI understand your needs better..."
              className="w-full bg-transparent text-foreground placeholder:text-muted-foreground resize-none outline-none text-sm leading-relaxed min-h-[60px] max-h-[120px] font-rounded"
              rows={2}
            />
          </div>
        )}

        {/* Main input container */}
        <div 
          ref={containerRef}
          className={cn(
            "relative rounded-3xl glass-card transition-all duration-300",
            isDragging && "border-accent border-dashed"
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onPaste={handlePaste}
        >
          {/* Drag overlay */}
          {isDragging && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-accent/10 border-2 border-dashed border-accent">
              <div className="text-center">
                <ImageIcon className="w-8 h-8 mx-auto mb-2 text-accent" />
                <p className="text-sm font-rounded font-bold text-accent">Drop files here</p>
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {isLoading && (thinkingMode || webSearch) && (
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm font-rounded font-bold">
                  {thinkingMode ? 'Thinking...' : 'Searching...'}
                </span>
              </div>
            </div>
          )}

          {/* Attachments preview */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 px-4 pt-4">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="relative group"
                >
                  {attachment.type.startsWith('image/') && attachment.base64 ? (
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden glass-card">
                      <img 
                        src={attachment.base64} 
                        alt={attachment.name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeAttachment(attachment.id)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl glass-button text-sm font-rounded">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate max-w-[120px]">{attachment.name}</span>
                      <button
                        onClick={() => removeAttachment(attachment.id)}
                        className="hover:text-foreground transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Context chip if context is set but collapsed */}
          {context.trim() && !showContext && (
            <div className="px-4 pt-3">
              <button
                onClick={() => setShowContext(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass-button text-xs text-accent font-rounded font-bold transition-all duration-300 hover:bg-accent/20"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="truncate max-w-[200px]">{context.slice(0, 30)}...</span>
                <X 
                  className="w-3 h-3 ml-1 hover:text-foreground" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setContext('');
                  }}
                />
              </button>
            </div>
          )}

          {/* Text input area */}
          <div className="px-3 sm:px-4 py-3 sm:py-4">
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
              className="w-full bg-transparent text-foreground placeholder:text-muted-foreground resize-none outline-none text-sm sm:text-base leading-relaxed min-h-[20px] sm:min-h-[24px] max-h-[200px] font-rounded font-bold"
              rows={1}
            />
          </div>

          {/* Bottom toolbar */}
          <div className="flex items-center justify-between px-2 sm:px-3 pb-3 sm:pb-4">
            <div className="flex items-center gap-0.5 sm:gap-1">
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
                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl text-muted-foreground hover:text-foreground glass-button"
                    disabled={isLoading}
                  >
                    <Paperclip className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="glass-card border-border/50">
                  <DropdownMenuItem 
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer font-rounded font-bold"
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
                    className="cursor-pointer font-rounded font-bold"
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Upload image
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Context button */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 sm:h-9 sm:w-9 rounded-xl glass-button",
                  (showContext || context.trim()) ? "text-accent" : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setShowContext(!showContext)}
                disabled={isLoading}
                title="Add study context"
              >
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>

              {/* Web search */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 sm:h-9 sm:w-9 rounded-xl glass-button",
                  webSearch ? "text-accent" : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setWebSearch(!webSearch)}
                disabled={isLoading}
                title="Search the web"
              >
                <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>

              {/* Thinking mode */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 sm:h-9 sm:w-9 rounded-xl glass-button",
                  thinkingMode ? "text-accent" : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setThinkingMode(!thinkingMode)}
                disabled={isLoading}
                title="Enable deep thinking"
              >
                <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>

              {/* Active mode chips */}
              {thinkingMode && !isLoading && (
                <div className="flex items-center gap-1.5 ml-1 px-3 py-1.5 rounded-xl glass-button text-accent text-sm font-rounded font-bold">
                  <Lightbulb className="h-3.5 w-3.5" />
                  <span>Think</span>
                  <button 
                    onClick={() => setThinkingMode(false)}
                    className="ml-0.5 hover:text-foreground transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              {webSearch && !isLoading && (
                <div className="flex items-center gap-1.5 ml-1 px-3 py-1.5 rounded-xl glass-button text-accent text-sm font-rounded font-bold">
                  <Globe className="h-3.5 w-3.5" />
                  <span>Web</span>
                  <button 
                    onClick={() => setWebSearch(false)}
                    className="ml-0.5 hover:text-foreground transition-colors"
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
                "h-9 w-9 rounded-xl transition-all duration-300",
                (input.trim() || attachments.length > 0) && !isLoading
                  ? "bg-accent hover:bg-accent/90 text-accent-foreground glow"
                  : "glass-button text-muted-foreground"
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
        <div className="flex items-center justify-center mt-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="h-10 px-6 text-sm text-muted-foreground hover:text-foreground rounded-full border-2 border-accent/50 hover:border-accent bg-transparent hover:bg-accent/5 font-rounded font-medium transition-all duration-300"
              >
                {currentModelInfo.name}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="glass-card border-border/50 min-w-[260px] rounded-2xl p-2">
              {AVAILABLE_MODELS.map((model) => (
                <DropdownMenuItem
                  key={model.id}
                  onClick={() => onModelChange(model.id)}
                  className={cn(
                    "cursor-pointer flex flex-col items-start font-rounded rounded-xl px-3 py-2.5 my-0.5",
                    currentModel === model.id && "bg-accent/15 text-accent"
                  )}
                >
                  <span className="font-semibold">{model.name}</span>
                  <span className="text-xs text-muted-foreground">{model.description}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-center text-xs text-muted-foreground font-rounded mt-2">
          AI can make mistakes. Verify important info.
        </p>
      </div>
    </div>
  );
}