import { useState, useCallback, useEffect } from 'react';
import { Message, Conversation, FileAttachment, DEFAULT_MODEL } from '@/types/chat';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Json } from '@/integrations/supabase/types';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

interface DbConversation {
  id: string;
  title: string;
  model: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface DbMessage {
  id: string;
  role: string;
  content: string;
  attachments: Json;
  created_at: string;
}

function parseAttachments(attachments: Json): FileAttachment[] {
  if (Array.isArray(attachments)) {
    return attachments as unknown as FileAttachment[];
  }
  return [];
}

export function useChat() {
  const { user, session } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load conversations from database
  const loadConversations = useCallback(async () => {
    if (!user) {
      setConversations([]);
      setIsLoadingConversations(false);
      return;
    }

    setIsLoadingConversations(true);
    
    try {
      console.log('Loading conversations for user:', user.id);
      
      const { data, error: fetchError } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching conversations:', fetchError);
        throw fetchError;
      }

      console.log('Loaded conversations:', data?.length || 0);

      const convs: Conversation[] = (data || []).map((c: DbConversation) => ({
        id: c.id,
        title: c.title,
        model: c.model,
        messages: [],
        createdAt: new Date(c.created_at),
        updatedAt: new Date(c.updated_at),
      }));

      setConversations(convs);
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError('Failed to load conversations');
    } finally {
      setIsLoadingConversations(false);
    }
  }, [user]);

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: string): Promise<Message[]> => {
    try {
      console.log('Loading messages for conversation:', conversationId);
      
      const { data, error: fetchError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (fetchError) {
        console.error('Error fetching messages:', fetchError);
        throw fetchError;
      }

      console.log('Loaded messages:', data?.length || 0);

      const messages: Message[] = (data || []).map((m: DbMessage) => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        timestamp: new Date(m.created_at),
        attachments: parseAttachments(m.attachments),
      }));

      return messages;
    } catch (err) {
      console.error('Error loading messages:', err);
      return [];
    }
  }, []);

  // Load conversations when user changes
  useEffect(() => {
    if (user) {
      loadConversations();
    } else {
      setConversations([]);
      setCurrentConversation(null);
      setIsLoadingConversations(false);
    }
  }, [user, loadConversations]);

  const createNewConversation = useCallback(async (model: string = DEFAULT_MODEL) => {
    if (!user) {
      console.error('Cannot create conversation: no user');
      return null;
    }

    try {
      console.log('Creating new conversation for user:', user.id);
      
      const { data, error: insertError } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          title: 'New chat',
          model,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating conversation:', insertError);
        throw insertError;
      }

      console.log('Created conversation:', data.id);

      const newConversation: Conversation = {
        id: data.id,
        title: data.title,
        messages: [],
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        model: data.model,
      };

      setConversations(prev => [newConversation, ...prev]);
      setCurrentConversation(newConversation);
      return newConversation;
    } catch (err) {
      console.error('Error creating conversation:', err);
      setError('Failed to create conversation');
      return null;
    }
  }, [user]);

  const updateConversationTitle = useCallback(async (id: string, firstMessage: string) => {
    const title = firstMessage.slice(0, 40) + (firstMessage.length > 40 ? '...' : '');
    
    try {
      await supabase
        .from('conversations')
        .update({ title, updated_at: new Date().toISOString() })
        .eq('id', id);

      setConversations(prev => 
        prev.map(c => c.id === id ? { ...c, title } : c)
      );
      setCurrentConversation(prev => 
        prev?.id === id ? { ...prev, title } : prev
      );
    } catch (err) {
      console.error('Error updating title:', err);
    }
  }, []);

  const sendMessage = useCallback(async (
    content: string,
    attachments: FileAttachment[] = [],
    thinkingMode: boolean = false,
    webSearch: boolean = false
  ) => {
    if (!content.trim() && attachments.length === 0) return;
    if (!user || !session) {
      setError('Please sign in to send messages');
      return;
    }

    let conversation = currentConversation;
    if (!conversation) {
      conversation = await createNewConversation();
      if (!conversation) return;
    }

    setError(null);
    setIsLoading(true);

    // Create user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
      attachments,
    };

    // Update title if first message
    if (conversation.messages.length === 0) {
      updateConversationTitle(conversation.id, content);
    }

    // Add user message to conversation locally
    const updatedMessages = [...conversation.messages, userMessage];
    setCurrentConversation(prev => prev ? { ...prev, messages: updatedMessages } : null);
    setConversations(prev => 
      prev.map(c => c.id === conversation!.id ? { ...c, messages: updatedMessages, updatedAt: new Date() } : c)
    );

    // Save user message to database
    try {
      await supabase.from('messages').insert({
        conversation_id: conversation.id,
        role: 'user',
        content,
        attachments: attachments.length > 0 ? (attachments as unknown as Json) : ([] as unknown as Json),
      });
    } catch (err) {
      console.error('Error saving user message:', err);
    }

    // Prepare assistant message placeholder
    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };

    const messagesWithAssistant = [...updatedMessages, assistantMessage];
    setCurrentConversation(prev => prev ? { ...prev, messages: messagesWithAssistant } : null);

    try {
      // Build message content for API
      const apiMessages = updatedMessages.map(msg => {
        if (msg.role === 'user' && msg.attachments && msg.attachments.length > 0) {
          const contentParts: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];
          
          if (msg.content) {
            contentParts.push({ type: 'text', text: msg.content });
          }
          
          msg.attachments.forEach(att => {
            if (att.type.startsWith('image/') && att.base64) {
              contentParts.push({
                type: 'image_url',
                image_url: { url: att.base64 }
              });
            }
          });
          
          return { role: msg.role, content: contentParts };
        }
        return { role: msg.role, content: msg.content };
      });

      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          messages: apiMessages,
          model: conversation.model,
          thinkingMode,
          webSearch,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let fullContent = '';
      let reasoningContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            const reasoning = parsed.choices?.[0]?.delta?.reasoning as string | undefined;
            
            if (reasoning) {
              reasoningContent += reasoning;
            }
            
            if (content) {
              fullContent += content;
            }
            
            const displayContent = reasoningContent 
              ? `<thinking>${reasoningContent}</thinking>\n\n${fullContent}`
              : fullContent;
              
            setCurrentConversation(prev => {
              if (!prev) return null;
              const newMessages = [...prev.messages];
              const lastIdx = newMessages.length - 1;
              if (newMessages[lastIdx]?.role === 'assistant') {
                newMessages[lastIdx] = {
                  ...newMessages[lastIdx],
                  content: displayContent,
                };
              }
              return { ...prev, messages: newMessages };
            });
          } catch {
            // JSON parse error, continue
          }
        }
      }

      const finalContent = reasoningContent 
        ? `<thinking>${reasoningContent}</thinking>\n\n${fullContent}`
        : fullContent;

      // Finalize the message
      setCurrentConversation(prev => {
        if (!prev) return null;
        const newMessages = [...prev.messages];
        const lastIdx = newMessages.length - 1;
        if (newMessages[lastIdx]?.role === 'assistant') {
          newMessages[lastIdx] = {
            ...newMessages[lastIdx],
            content: finalContent,
            isStreaming: false,
          };
        }
        return { ...prev, messages: newMessages };
      });

      // Save assistant message to database
      try {
        await supabase.from('messages').insert({
          conversation_id: conversation.id,
          role: 'assistant',
          content: finalContent,
        });
        
        // Update conversation timestamp
        await supabase
          .from('conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', conversation.id);
      } catch (err) {
        console.error('Error saving assistant message:', err);
      }

      // Update conversations list
      setConversations(prev => 
        prev.map(c => c.id === conversation!.id ? { ...c, updatedAt: new Date() } : c)
      );

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      
      setCurrentConversation(prev => {
        if (!prev) return null;
        const newMessages = prev.messages.filter(m => m.id !== assistantMessage.id);
        return { ...prev, messages: newMessages };
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentConversation, user, session, createNewConversation, updateConversationTitle]);

  const selectConversation = useCallback(async (id: string) => {
    const conversation = conversations.find(c => c.id === id);
    if (conversation) {
      // Always load messages fresh from database
      const messages = await loadMessages(id);
      const updatedConversation = { ...conversation, messages };
      setCurrentConversation(updatedConversation);
      
      // Update local state with loaded messages
      setConversations(prev => 
        prev.map(c => c.id === id ? updatedConversation : c)
      );
    }
  }, [conversations, loadMessages]);

  const deleteConversation = useCallback(async (id: string) => {
    try {
      // Delete messages first (foreign key constraint)
      await supabase.from('messages').delete().eq('conversation_id', id);
      await supabase.from('conversations').delete().eq('id', id);
      
      setConversations(prev => prev.filter(c => c.id !== id));
      if (currentConversation?.id === id) {
        setCurrentConversation(null);
      }
    } catch (err) {
      console.error('Error deleting conversation:', err);
      setError('Failed to delete conversation');
    }
  }, [currentConversation]);

  const updateModel = useCallback(async (model: string) => {
    if (currentConversation) {
      try {
        await supabase
          .from('conversations')
          .update({ model })
          .eq('id', currentConversation.id);

        setCurrentConversation(prev => prev ? { ...prev, model } : null);
        setConversations(prev => 
          prev.map(c => c.id === currentConversation.id ? { ...c, model } : c)
        );
      } catch (err) {
        console.error('Error updating model:', err);
      }
    }
  }, [currentConversation]);

  const clearCurrentConversation = useCallback(() => {
    setCurrentConversation(null);
  }, []);

  return {
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
    refreshConversations: loadConversations,
  };
}