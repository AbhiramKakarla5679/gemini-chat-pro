import { Plus, MessageSquare, Trash2, Menu, Search, Sparkles, MoreHorizontal, Settings, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Conversation } from '@/types/chat';
import { cn } from '@/lib/utils';

interface SidebarProps {
  conversations: Conversation[];
  currentConversationId?: string;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({
  conversations,
  currentConversationId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  isOpen,
  onToggle,
}: SidebarProps) {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return 'Previous 7 Days';
    if (days < 30) return 'Previous 30 Days';
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const groupedConversations = conversations.reduce((groups, conv) => {
    const key = formatDate(conv.updatedAt);
    if (!groups[key]) groups[key] = [];
    groups[key].push(conv);
    return groups;
  }, {} as Record<string, Conversation[]>);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:relative z-50 h-full w-[260px] bg-[#171717] flex flex-col transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-0 md:overflow-hidden"
      )}>
        {/* Header */}
        <div className="p-2 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-10 w-10 rounded-lg text-[#b4b4b4] hover:text-[#ececec] hover:bg-[#2f2f2f]"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-lg text-[#b4b4b4] hover:text-[#ececec] hover:bg-[#2f2f2f]"
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onNewChat}
              className="h-10 w-10 rounded-lg text-[#b4b4b4] hover:text-[#ececec] hover:bg-[#2f2f2f]"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Conversation list */}
        <ScrollArea className="flex-1 px-2">
          {Object.entries(groupedConversations).map(([group, convs]) => (
            <div key={group} className="mb-4">
              <h3 className="px-3 py-2 text-xs font-medium text-[#8e8e8e]">
                {group}
              </h3>
              <div className="space-y-0.5">
                {convs.map((conv) => (
                  <div
                    key={conv.id}
                    className={cn(
                      "group relative flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors",
                      currentConversationId === conv.id
                        ? "bg-[#2f2f2f] text-[#ececec]"
                        : "text-[#b4b4b4] hover:bg-[#212121] hover:text-[#ececec]"
                    )}
                    onClick={() => onSelectConversation(conv.id)}
                  >
                    <span className="truncate text-sm flex-1">{conv.title}</span>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-[#8e8e8e] hover:text-[#ececec] hover:bg-[#424242] rounded-lg shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-[#8e8e8e] hover:text-red-400 hover:bg-[#424242] rounded-lg shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteConversation(conv.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {conversations.length === 0 && (
            <div className="px-3 py-8 text-center text-[#8e8e8e] text-sm">
              No conversations yet
            </div>
          )}
        </ScrollArea>

        {/* Footer with user */}
        <div className="p-2 border-t border-[#2f2f2f]">
          <Button
            variant="ghost"
            className="w-full justify-between h-12 px-3 text-[#ececec] hover:bg-[#2f2f2f] rounded-lg group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-medium text-white">
                U
              </div>
              <span className="text-sm">User</span>
            </div>
            <MoreHorizontal className="h-4 w-4 text-[#8e8e8e] opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>
        </div>
      </aside>

      {/* Toggle button when sidebar is closed on mobile */}
      {!isOpen && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="fixed top-3 left-3 z-40 md:hidden h-10 w-10 rounded-lg text-[#b4b4b4] hover:text-[#ececec] hover:bg-[#2f2f2f]"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}
    </>
  );
}
