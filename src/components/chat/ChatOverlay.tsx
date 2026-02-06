import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
  } = useChat();

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleNewChat = () => {
    createNewConversation();
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
          className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={onClose}
        />
        
        <div className="absolute inset-4 md:inset-8 lg:inset-12 bg-[#212121] rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex items-center justify-center animate-scale-in">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 h-8 w-8 rounded-lg text-white/50 hover:text-white hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="text-center p-8 max-w-md">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
              <span className="text-2xl">✨</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3 font-display">
              Sign in to chat
            </h2>
            <p className="text-white/50 mb-6 font-rounded">
              Create an account or sign in to start chatting and save your conversation history.
            </p>
            <Button
              onClick={() => {
                onClose();
                navigate('/auth');
              }}
              className="px-8 py-3 text-base font-semibold rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white shadow-lg shadow-purple-500/25"
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
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />
        <div className="absolute inset-4 md:inset-8 lg:inset-12 bg-[#212121] rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex items-center justify-center animate-scale-in">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Chat Window */}
      <div className="absolute inset-4 md:inset-8 lg:inset-12 bg-[#212121] rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex animate-scale-in">
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
          {/* Header */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-lg text-white/50 hover:text-white hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <MessageList
            messages={currentConversation?.messages || []}
            isLoading={isLoading}
          />

          <ChatInput
            onSend={sendMessage}
            isLoading={isLoading}
            currentModel={currentConversation?.model || 'google/gemini-3-pro-preview'}
            onModelChange={updateModel}
          />
        </div>
      </div>
    </div>
  );
}
