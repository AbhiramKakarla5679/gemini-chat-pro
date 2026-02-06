import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

interface ChatRequest {
  messages: Message[];
  model?: string;
  thinkingMode?: boolean;
  webSearch?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages, model = 'google/gemini-3-pro-preview', thinkingMode = false, webSearch = false }: ChatRequest = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(`Chat request - Model: ${model}, Thinking: ${thinkingMode}, Web: ${webSearch}, Messages: ${messages.length}`);

    // Build system prompt based on modes
    let systemPrompt = `You are a helpful, knowledgeable AI assistant. You help users:
- Think through complex problems clearly
- Write, edit, and improve content
- Explain concepts in simple terms
- Brainstorm creative ideas
- Answer questions accurately

Be friendly, concise, and helpful. Use markdown formatting for readability when appropriate.`;
    
    if (thinkingMode) {
      systemPrompt = `You are an AI assistant with advanced reasoning capabilities. For complex questions:

1. First, think through the problem step-by-step inside <thinking>...</thinking> tags
2. Consider multiple approaches and evaluate them
3. Show your complete reasoning process
4. Then provide your final, polished answer after the thinking section

Be thorough in analysis while remaining clear and helpful.`;
    }

    if (webSearch) {
      systemPrompt = `You are an AI assistant with access to current information and web knowledge. When answering:

1. Provide accurate, up-to-date information based on your knowledge
2. For factual claims, cite your sources by including a "Sources" section at the end
3. Format sources as a numbered list with descriptive titles
4. Be transparent about the recency of your information
5. If information might be outdated, mention this

Example source format at the end of your response:
---
**Sources:**
1. [Topic Name - Source Description](https://example.com)
2. [Another Topic - Source](https://example.com)

Always include relevant sources when making factual claims. Use markdown formatting for readability.`;
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AI gateway error: ${response.status}`, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Usage limit reached. Please add credits to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ error: 'Failed to get AI response' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Streaming response started');

    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat function error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});