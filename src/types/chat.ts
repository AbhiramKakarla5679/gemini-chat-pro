export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: FileAttachment[];
  isStreaming?: boolean;
  thinkingContent?: string;
}

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  base64?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  model: string;
}

export type ModelOption = {
  id: string;
  name: string;
  description: string;
  category: 'gemini' | 'gpt';
};

export const AVAILABLE_MODELS: ModelOption[] = [
  { id: 'google/gemini-2.5-flash-lite', name: 'Gemini Flash Lite', description: 'Fastest & cheapest model', category: 'gemini' },
  { id: 'google/gemini-3-flash-preview', name: 'Gemini 3 Flash', description: 'Fast and efficient for everyday tasks', category: 'gemini' },
  { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Balanced speed and capability', category: 'gemini' },
  { id: 'google/gemini-3-pro-preview', name: 'Gemini 3 Pro', description: 'Most capable model for complex tasks', category: 'gemini' },
  { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Advanced reasoning and multimodal', category: 'gemini' },
  { id: 'openai/gpt-5-nano', name: 'GPT-5 Nano', description: 'Efficient and fast', category: 'gpt' },
  { id: 'openai/gpt-5-mini', name: 'GPT-5 Mini', description: 'Fast with strong reasoning', category: 'gpt' },
  { id: 'openai/gpt-5', name: 'GPT-5', description: 'Powerful all-rounder model', category: 'gpt' },
];

export const DEFAULT_MODEL = 'google/gemini-2.5-flash-lite';
