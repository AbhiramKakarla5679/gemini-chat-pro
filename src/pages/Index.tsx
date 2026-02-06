import { useState } from 'react';
import { Sidebar } from '@/components/chat/Sidebar';
import { MessageList } from '@/components/chat/MessageList';
import { ChatInput } from '@/components/chat/ChatInput';
import { useChat } from '@/hooks/useChat';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { useEffect } from 'react';

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
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

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleNewChat = () => {
    createNewConversation();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
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
      <main className="flex-1 flex flex-col min-w-0">
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
      </main>

      <Toaster position="top-center" />
    </div>
  );
};

export default Index;
