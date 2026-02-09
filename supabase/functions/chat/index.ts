import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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
    const { messages, model = 'openai/gpt-5-nano', thinkingMode = false, webSearch = false }: ChatRequest = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Get user from auth header for custom instructions
    let customInstructions = '';
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey, {
          global: { headers: { Authorization: authHeader } }
        });
        
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: settings } = await supabase
            .from('user_settings')
            .select('custom_instructions')
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (settings?.custom_instructions) {
            customInstructions = settings.custom_instructions;
            console.log('Loaded custom instructions for user:', user.id);
          }
        }
      } catch (err) {
        console.error('Error loading user settings:', err);
      }
    }

    console.log(`Chat request - Model: ${model}, Thinking: ${thinkingMode}, Web: ${webSearch}, Messages: ${messages.length}`);

    // Build system prompt based on modes and custom instructions
    let systemPrompt = `You are a helpful, knowledgeable AI assistant. You help users think through problems, learn, and get things done.

**Formatting Rules (ALWAYS follow these):**
- Always use proper markdown formatting for clear, readable responses.
- Use **bold** for key terms, important words, and answers that need emphasis.
- Use bullet points (- ) or numbered lists (1. ) to organize information. Never write long unbroken paragraphs.
- Use headings (## and ###) to create clear sections when answering multi-part questions. Use relevant emojis in headings for visual flair (e.g. "## 🚀 Getting Started", "## 💡 Key Ideas").
- When listing items like sentences, vocabulary, or steps, put each on its own line as a bullet point.
- Use \`inline code\` for technical terms and code blocks for code.
- Use > blockquotes for key ideas, definitions, or important takeaways. These will appear with a highlighted side-line.
- Add --- horizontal rules between major sections to create visual separation.
- Keep paragraphs short (2-3 sentences max).
- When filling in blanks or highlighting answers within text, use **bold** for the answer word.
- Start responses with a brief emoji-accented summary line when appropriate.`;

    
    // Add custom instructions if provided
    if (customInstructions) {
      systemPrompt += `\n\n**User's Custom Instructions:**\n${customInstructions}`;
    }
    
    if (thinkingMode) {
      systemPrompt = `You are an AI assistant with advanced reasoning capabilities.

**Process:**
1. First, think through the problem step-by-step inside <thinking>...</thinking> tags
2. Consider multiple approaches and evaluate them
3. Then provide your final, polished answer after the thinking section

**Formatting Rules (ALWAYS follow these):**
- Use **bold** for key terms and important answers.
- Use bullet points or numbered lists to organize information — never long unbroken paragraphs.
- Use headings (## ###) for multi-part answers. Use relevant emojis in headings (e.g. "## 🧠 Analysis", "## ✅ Conclusion").
- Use > blockquotes for key insights and important takeaways.
- Add --- horizontal rules between major sections.
- Keep paragraphs short (2-3 sentences max).
- When highlighting answers within text, **bold** the answer word.`;

      
      if (customInstructions) {
        systemPrompt += `\n\n**User's Custom Instructions:**\n${customInstructions}`;
      }
    }

    if (webSearch) {
      systemPrompt = `You are an AI assistant with access to current information and web knowledge.

**Formatting Rules (ALWAYS follow these):**
- Use **bold** for key terms and important answers.
- Use bullet points or numbered lists — never long unbroken paragraphs.
- Use headings (## ###) for multi-part answers. Use relevant emojis in headings.
- Use > blockquotes for key insights and important takeaways.
- Add --- horizontal rules between major sections.
- Keep paragraphs short (2-3 sentences max).
- When highlighting answers within text, **bold** the answer word.
- Be transparent about the recency of your information.

CRITICAL: You MUST always include a sources section at the very end of your response in EXACTLY this format (one source per line):
---
**Sources:**
- [Title of the page or article](https://actual-url.com) — Brief one-line description of the source
- [Another Source Title](https://another-url.com) — Brief description`;


      if (customInstructions) {
        systemPrompt += `\n\n**User's Custom Instructions:**\n${customInstructions}`;
      }
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

    // Track API usage asynchronously
    if (authHeader) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const adminClient = createClient(supabaseUrl, serviceRoleKey);
        
        const anonClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
          global: { headers: { Authorization: authHeader } }
        });
        const { data: { user: trackUser } } = await anonClient.auth.getUser();
        
        if (trackUser) {
          // Estimate cost based on model
          let costPerRequest = 0.0005; // default
          if (model.includes('pro')) costPerRequest = 0.002;
          else if (model.includes('flash') && !model.includes('lite')) costPerRequest = 0.001;
          else if (model.includes('gpt-5') && !model.includes('nano') && !model.includes('mini')) costPerRequest = 0.003;
          
          const { data: existing } = await adminClient
            .from('api_usage')
            .select('id, requests, cost_dollars')
            .eq('user_id', trackUser.id)
            .maybeSingle();
          
          if (existing) {
            await adminClient.from('api_usage').update({
              requests: existing.requests + 1,
              cost_dollars: Number(existing.cost_dollars) + costPerRequest,
              updated_at: new Date().toISOString(),
            }).eq('id', existing.id);
          } else {
            await adminClient.from('api_usage').insert({
              user_id: trackUser.id,
              email: trackUser.email || 'unknown',
              requests: 1,
              cost_dollars: costPerRequest,
            });
          }
        }
      } catch (trackErr) {
        console.error('Error tracking usage:', trackErr);
      }
    }

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
