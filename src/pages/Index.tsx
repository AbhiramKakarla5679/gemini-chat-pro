import { useState } from 'react';
import { Sidebar } from '@/components/chat/Sidebar';
import { MessageList } from '@/components/chat/MessageList';
import { ChatInput } from '@/components/chat/ChatInput';
import { useChat } from '@/hooks/useChat';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { Menu, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <div className="flex h-screen overflow-hidden bg-[#212121]">
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
      <main className="flex-1 flex flex-col min-w-0 bg-[#212121]">
        {/* Header when sidebar is closed */}
        {!sidebarOpen && (
          <div className="flex items-center gap-2 p-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="h-10 w-10 rounded-lg text-[#b4b4b4] hover:text-[#ececec] hover:bg-[#2f2f2f]"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNewChat}
              className="h-10 w-10 rounded-lg text-[#b4b4b4] hover:text-[#ececec] hover:bg-[#2f2f2f]"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        )}

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

      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: '#2f2f2f',
            color: '#ececec',
            border: '1px solid #424242',
          },
        }}
      />
    </div>
  );
};

export default Index;
