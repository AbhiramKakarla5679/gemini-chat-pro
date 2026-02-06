import { useState, useRef, useCallback } from 'react';
import { Send, Paperclip, X, Lightbulb, LightbulbOff, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { FileAttachment, AVAILABLE_MODELS } from '@/types/chat';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (content: string, attachments: FileAttachment[], thinkingMode: boolean) => void;
  isLoading: boolean;
  currentModel: string;
  onModelChange: (model: string) => void;
}

export function ChatInput({ onSend, isLoading, currentModel, onModelChange }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [thinkingMode, setThinkingMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(() => {
    if (!input.trim() && attachments.length === 0) return;
    if (isLoading) return;
    
    onSend(input, attachments, thinkingMode);
    setInput('');
    setAttachments([]);
  }, [input, attachments, thinkingMode, isLoading, onSend]);

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
      // Read file as base64 for images
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
        // For other files, just store metadata
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

  const currentModelInfo = AVAILABLE_MODELS.find(m => m.id === currentModel) || AVAILABLE_MODELS[0];

  return (
    <div className="border-t bg-background p-4">
      <div className="max-w-3xl mx-auto">
        {/* Attachments preview */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-sm"
              >
                <span className="truncate max-w-[150px]">{attachment.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => removeAttachment(attachment.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Input container */}
        <div className="relative flex items-end gap-2 rounded-2xl border bg-secondary/30 p-2">
          {/* File input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.txt,.md,.json,.csv"
            className="hidden"
            onChange={handleFileSelect}
          />
          
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            <Paperclip className="h-5 w-5" />
          </Button>

          {/* Textarea */}
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message..."
            disabled={isLoading}
            className="min-h-[44px] max-h-[200px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-2 py-2.5"
            rows={1}
          />

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Thinking mode toggle */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-9 w-9 shrink-0",
                thinkingMode 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setThinkingMode(!thinkingMode)}
              disabled={isLoading}
              title={thinkingMode ? "Thinking mode enabled" : "Enable thinking mode"}
            >
              {thinkingMode ? (
                <Lightbulb className="h-5 w-5" />
              ) : (
                <LightbulbOff className="h-5 w-5" />
              )}
            </Button>

            {/* Send button */}
            <Button
              onClick={handleSubmit}
              disabled={isLoading || (!input.trim() && attachments.length === 0)}
              size="icon"
              className="h-9 w-9 rounded-xl"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Model selector and info */}
        <div className="flex items-center justify-between mt-3 px-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 gap-2 text-sm text-muted-foreground hover:text-foreground">
                {currentModelInfo.name}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[280px]">
              <DropdownMenuLabel>Gemini Models</DropdownMenuLabel>
              {AVAILABLE_MODELS.filter(m => m.category === 'gemini').map((model) => (
                <DropdownMenuItem
                  key={model.id}
                  onClick={() => onModelChange(model.id)}
                  className="flex flex-col items-start gap-0.5"
                >
                  <span className="font-medium">{model.name}</span>
                  <span className="text-xs text-muted-foreground">{model.description}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>GPT Models</DropdownMenuLabel>
              {AVAILABLE_MODELS.filter(m => m.category === 'gpt').map((model) => (
                <DropdownMenuItem
                  key={model.id}
                  onClick={() => onModelChange(model.id)}
                  className="flex flex-col items-start gap-0.5"
                >
                  <span className="font-medium">{model.name}</span>
                  <span className="text-xs text-muted-foreground">{model.description}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {thinkingMode && (
            <span className="text-xs text-primary flex items-center gap-1">
              <Lightbulb className="h-3 w-3" />
              Thinking mode
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
