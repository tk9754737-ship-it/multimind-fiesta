import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const MODEL_MAPPING: { [key: string]: string } = {
  'gpt-5': 'openai/o1-mini', // Free, good OpenAI-like model
  'claude-4-sonnet': 'mistralai/mistral-7b-instruct:free', // Free Claude-like model
  'google': 'meta-llama/llama-3.1-8b-instruct:free', // Free Llama model (Google slot)
  'deepseek': 'google/gemma-3-4b-it:free', 
'perplexity':"perplexity/sonar-reasoning-pro",
  'grok': "mistralai/mistral-medium-3.1" ,
  "mistral": "nex-agi/deepseek-v3.1-nex-n1:free",
  "meta-llama": "mistralai/mistral-medium-3.1",
  "qwen": "arcee-ai/trinity-mini:free",
};


// Helper function for CORS headers
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*', // Adjust origin as needed for security
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  // Handle preflight request
  return new NextResponse(null, {
    status: 204, // No Content
    headers: corsHeaders(),
  });
}

export async function POST(request: NextRequest) {
  try {
    // CORS headers for actual POST response
    const headers = corsHeaders();

    const { message, models } = await request.json();

    if (!message || !models || !Array.isArray(models)) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid request format' }),
        { status: 400, headers }
      );
    }

    if (!OPENROUTER_API_KEY) {
      return new NextResponse(
        JSON.stringify({ error: 'OpenRouter API key not configured' }),
        { status: 500, headers }
      );
    }

    const responsePromises = models.map(async (modelId: string) => {
      const openRouterModel = MODEL_MAPPING[modelId];
      if (!openRouterModel) {
        return {
          modelId,
          error: `Model ${modelId} not supported`
        };
      }

      try {
        console.log(`Calling model: ${openRouterModel}`);

        const response = await fetch(OPENROUTER_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://multimind-ai.vercel.app/',
            'X-Title': 'AI Model Comparison App'
          },
          body: JSON.stringify({
            model: openRouterModel,
            messages: [
              {
                role: 'user',
                content: message
              }
            ],
            max_tokens: 600,
            temperature: 0.7
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          return {
            modelId,
            error: `API Error: ${errorData.error?.message || response.statusText}`
          };
        }

        const data = await response.json();
        return {
          modelId,
          content: data.choices[0]?.message?.content || 'No response content',
          usage: data.usage
        };
      } catch (error) {
        return {
          modelId,
          error: `Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }
    });

    const results = await Promise.all(responsePromises);

    return new NextResponse(
      JSON.stringify({ responses: results }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error('Chat API error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: corsHeaders() }

    );
  }
}