import { useState, useEffect, useCallback, DragEvent } from 'react';
import { Sidebar } from '@/components/chat/Sidebar';
import { MessageList } from '@/components/chat/MessageList';
import { ChatInput } from '@/components/chat/ChatInput';
import { useChat } from '@/hooks/useChat';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { Menu, Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { DEFAULT_MODEL } from '@/types/chat';

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);
  const [activeThinkingMode, setActiveThinkingMode] = useState(false);
  const [activeWebSearch, setActiveWebSearch] = useState(false);
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = (location.state as any)?.prefill as string | undefined;

  const {
    conversations,
    currentConversation,
    isLoading,
    error,
    sendMessage,
    createNewConversation,
    selectConversation,
    deleteConversation,
    updateModel,
  } = useChat();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Auto-send prefilled message from subjects page
  useEffect(() => {
    if (prefill && !authLoading && user) {
      createNewConversation();
      // Small delay to let the conversation initialize
      const timer = setTimeout(() => {
        sendMessage(prefill, []);
        // Clear the state so it doesn't re-send on re-render
        window.history.replaceState({}, document.title);
      }, 300);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefill, authLoading, user]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const [pendingModel, setPendingModel] = useState<string | null>(null);

  const handleNewChat = () => {
    createNewConversation(pendingModel || DEFAULT_MODEL);
  };

  const handleModelChange = (model: string) => {
    if (currentConversation) {
      updateModel(model);
    } else {
      setPendingModel(model);
    }
  };

  // When a new conversation is created and we have a pending model, apply it
  useEffect(() => {
    if (currentConversation && pendingModel) {
      updateModel(pendingModel);
      setPendingModel(null);
    }
  }, [currentConversation, pendingModel, updateModel]);

  // Global drag and drop handlers
  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const { clientX, clientY } = e;
    if (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    ) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      setDroppedFiles(Array.from(files));
    }
  }, []);

  // Clear dropped files after processing
  const clearDroppedFiles = useCallback(() => {
    setDroppedFiles([]);
  }, []);

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div 
      className="flex h-screen overflow-hidden bg-background"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Global drop overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-xl">
          <div className="text-center glass-card p-12 rounded-3xl border-2 border-dashed border-accent">
            <Upload className="w-16 h-16 mx-auto mb-4 text-accent" />
            <p className="text-xl font-rounded font-bold text-foreground mb-2">Drop files here</p>
            <p className="text-sm text-muted-foreground">Images, PDFs, and documents</p>
          </div>
        </div>
      )}

      <Sidebar
        conversations={conversations}
        currentConversationId={currentConversation?.id}
        onNewChat={handleNewChat}
        onSelectConversation={selectConversation}
        onDeleteConversation={deleteConversation}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main chat area */}
      <main className="flex-1 flex flex-col min-w-0 bg-background">
        {/* Header when sidebar is closed */}
        {!sidebarOpen && (
          <div className="flex items-center gap-2 p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground glass-button"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNewChat}
              className="h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground glass-button"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        )}

        <MessageList
          messages={currentConversation?.messages || []}
          isLoading={isLoading}
          thinkingMode={activeThinkingMode}
          webSearch={activeWebSearch}
        />

        <ChatInput
          onSend={(content, attachments, thinkingMode, webSearch, context) => {
            setActiveThinkingMode(thinkingMode);
            setActiveWebSearch(webSearch);
            sendMessage(content, attachments, thinkingMode, webSearch);
          }}
          isLoading={isLoading}
          currentModel={pendingModel || currentConversation?.model || DEFAULT_MODEL}
          onModelChange={handleModelChange}
          droppedFiles={droppedFiles}
          onClearDroppedFiles={clearDroppedFiles}
        />
      </main>

      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: 'hsl(220 15% 10%)',
            color: 'hsl(0 0% 98%)',
            border: '1px solid hsl(0 0% 100% / 0.08)',
            backdropFilter: 'blur(12px)',
          },
        }}
      />
    </div>
  );
};

export default Index;
