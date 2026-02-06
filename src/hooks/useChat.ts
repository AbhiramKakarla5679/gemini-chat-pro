import { useState, useCallback } from 'react';
import { Message, Conversation, FileAttachment } from '@/types/chat';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

export function useChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createNewConversation = useCallback((model: string = 'google/gemini-3-pro-preview') => {
    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      title: 'New chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      model,
    };
    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversation(newConversation);
    return newConversation;
  }, []);

  const updateConversationTitle = useCallback((id: string, firstMessage: string) => {
    const title = firstMessage.slice(0, 30) + (firstMessage.length > 30 ? '...' : '');
    setConversations(prev => 
      prev.map(c => c.id === id ? { ...c, title } : c)
    );
    setCurrentConversation(prev => 
      prev?.id === id ? { ...prev, title } : prev
    );
  }, []);

  const sendMessage = useCallback(async (
    content: string,
    attachments: FileAttachment[] = [],
    thinkingMode: boolean = false
  ) => {
    if (!content.trim() && attachments.length === 0) return;

    let conversation = currentConversation;
    if (!conversation) {
      conversation = createNewConversation();
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

    // Add user message to conversation
    const updatedMessages = [...conversation.messages, userMessage];
    setCurrentConversation(prev => prev ? { ...prev, messages: updatedMessages } : null);
    setConversations(prev => 
      prev.map(c => c.id === conversation!.id ? { ...c, messages: updatedMessages, updatedAt: new Date() } : c)
    );

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
          
          // Add text content
          if (msg.content) {
            contentParts.push({ type: 'text', text: msg.content });
          }
          
          // Add image attachments
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
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: apiMessages,
          model: conversation.model,
          thinkingMode,
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
            if (content) {
              fullContent += content;
              
              // Update assistant message with new content
              setCurrentConversation(prev => {
                if (!prev) return null;
                const newMessages = [...prev.messages];
                const lastIdx = newMessages.length - 1;
                if (newMessages[lastIdx]?.role === 'assistant') {
                  newMessages[lastIdx] = {
                    ...newMessages[lastIdx],
                    content: fullContent,
                  };
                }
                return { ...prev, messages: newMessages };
              });
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Finalize the message
      setCurrentConversation(prev => {
        if (!prev) return null;
        const newMessages = [...prev.messages];
        const lastIdx = newMessages.length - 1;
        if (newMessages[lastIdx]?.role === 'assistant') {
          newMessages[lastIdx] = {
            ...newMessages[lastIdx],
            content: fullContent,
            isStreaming: false,
          };
        }
        return { ...prev, messages: newMessages };
      });

      setConversations(prev => 
        prev.map(c => {
          if (c.id === conversation!.id) {
            const messages = [...c.messages];
            messages.push(userMessage);
            messages.push({ ...assistantMessage, content: fullContent, isStreaming: false });
            return { ...c, messages, updatedAt: new Date() };
          }
          return c;
        })
      );

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      
      // Remove the assistant placeholder on error
      setCurrentConversation(prev => {
        if (!prev) return null;
        const newMessages = prev.messages.filter(m => m.id !== assistantMessage.id);
        return { ...prev, messages: newMessages };
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentConversation, createNewConversation, updateConversationTitle]);

  const selectConversation = useCallback((id: string) => {
    const conversation = conversations.find(c => c.id === id);
    if (conversation) {
      setCurrentConversation(conversation);
    }
  }, [conversations]);

  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (currentConversation?.id === id) {
      setCurrentConversation(null);
    }
  }, [currentConversation]);

  const updateModel = useCallback((model: string) => {
    if (currentConversation) {
      setCurrentConversation(prev => prev ? { ...prev, model } : null);
      setConversations(prev => 
        prev.map(c => c.id === currentConversation.id ? { ...c, model } : c)
      );
    }
  }, [currentConversation]);

  return {
    conversations,
    currentConversation,
    isLoading,
    error,
    sendMessage,
    createNewConversation,
    selectConversation,
    deleteConversation,
    updateModel,
  };
}
