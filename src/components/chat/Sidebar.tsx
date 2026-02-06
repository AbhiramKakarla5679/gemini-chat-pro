import { Plus, Trash2, Menu, LogOut, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Conversation } from '@/types/chat';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { SettingsModal } from './SettingsModal';

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
  const { user, signOut } = useAuth();

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return 'This Week';
    if (days < 30) return 'This Month';
    return date.toLocaleDateString('en-US', { month: 'short' });
  };

  const groupedConversations = conversations.reduce((groups, conv) => {
    const key = formatDate(conv.updatedAt);
    if (!groups[key]) groups[key] = [];
    groups[key].push(conv);
    return groups;
  }, {} as Record<string, Conversation[]>);

  const userInitial = user?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:relative z-50 h-full w-[260px] bg-card border-r border-border flex flex-col transition-all duration-300 ease-out",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-0 md:border-0 md:overflow-hidden"
      )}>
        {/* Header */}
        <div className="p-3 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center shadow-md shadow-accent/20">
              <Sparkles className="w-4 h-4 text-accent-foreground" />
            </div>
            <span className="font-bold text-sm">SaveMyExams</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onNewChat}
              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"
              title="New chat"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary md:hidden"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Conversation list */}
        <ScrollArea className="flex-1 px-2 py-2">
          {Object.entries(groupedConversations).map(([group, convs]) => (
            <div key={group} className="mb-3">
              <h3 className="px-2 py-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {group}
              </h3>
              <div className="space-y-0.5">
                {convs.map((conv) => (
                  <div
                    key={conv.id}
                    className={cn(
                      "group relative flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors",
                      currentConversationId === conv.id
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    )}
                    onClick={() => onSelectConversation(conv.id)}
                  >
                    <span className="truncate text-sm flex-1">{conv.title}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(conv.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {conversations.length === 0 && (
            <div className="px-2 py-8 text-center text-muted-foreground text-sm">
              No conversations yet
            </div>
          )}
        </ScrollArea>

        {/* Footer with user */}
        <div className="p-2 border-t border-border">
          <div className="flex items-center justify-between px-2 py-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-accent-foreground">
                {userInitial}
              </div>
              <span className="text-sm truncate max-w-[100px] text-muted-foreground">
                {user?.email?.split('@')[0]}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <SettingsModal />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut()}
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}