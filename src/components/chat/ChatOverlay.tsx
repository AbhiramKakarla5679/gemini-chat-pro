import { useState, useEffect } from 'react';
import { X, Loader2, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ChatOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatOverlay({ isOpen, onClose }: ChatOverlayProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const {
    conversations,
    currentConversation,
    isLoading,
    isLoadingConversations,
    error,
    sendMessage,
    createNewConversation,
    selectConversation,
    deleteConversation,
    updateModel,
    clearCurrentConversation,
  } = useChat();

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleNewChat = () => {
    clearCurrentConversation();
  };

  const handleSend = (content: string, attachments: any[], thinkingMode: boolean, webSearch: boolean) => {
    sendMessage(content, attachments, thinkingMode, webSearch);
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Show auth prompt if not logged in
  if (!authLoading && !user) {
    return (
      <div className="fixed inset-0 z-[100]">
        <div 
          className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={onClose}
        />
        
        <div className="absolute inset-4 md:inset-8 lg:inset-12 bg-background rounded-2xl overflow-hidden shadow-2xl border border-border flex items-center justify-center animate-scale-up">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="text-center p-8 max-w-sm">
            <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-accent flex items-center justify-center">
              <span className="text-2xl">📚</span>
            </div>
            <h2 className="text-xl font-display font-bold mb-2">
              Sign in to start
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Create an account to save your conversations and track your progress.
            </p>
            <Button
              onClick={() => {
                onClose();
                navigate('/auth');
              }}
              className="px-6 h-11 font-bold rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (authLoading || isLoadingConversations) {
    return (
      <div className="fixed inset-0 z-[100]">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" />
        <div className="absolute inset-4 md:inset-8 lg:inset-12 bg-background rounded-2xl overflow-hidden shadow-2xl border border-border flex items-center justify-center animate-scale-up">
          <Loader2 className="w-6 h-6 animate-spin text-accent" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop - enhanced blur */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-xl animate-fade-in"
        onClick={onClose}
      />
      
      {/* Chat Window - glass effect */}
      <div className="absolute inset-4 md:inset-8 lg:inset-12 glass rounded-3xl overflow-hidden shadow-2xl flex animate-scale-up">
        {/* Sidebar */}
        <Sidebar
          conversations={conversations}
          currentConversationId={currentConversation?.id}
          onNewChat={handleNewChat}
          onSelectConversation={selectConversation}
          onDeleteConversation={deleteConversation}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          {/* Header - glass buttons */}
          <div className="absolute top-5 left-5 right-5 z-10 flex items-center justify-between">
            {!sidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground glass-button"
              >
                <Menu className="h-4 w-4" />
              </Button>
            )}
            <div className="flex-1" />
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground glass-button"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <MessageList
            messages={currentConversation?.messages || []}
            isLoading={isLoading}
          />

          <ChatInput
            onSend={handleSend}
            isLoading={isLoading}
            currentModel={currentConversation?.model || 'google/gemini-3-pro-preview'}
            onModelChange={updateModel}
          />
        </div>
      </div>
    </div>
  );
}