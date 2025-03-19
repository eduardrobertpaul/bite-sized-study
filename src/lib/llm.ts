import fetch from 'node-fetch';

export type ProcessedChunk = {
  content: string;
  metadata?: {
    title?: string;
    section?: string;
    page?: number;
  };
};

export type LLMResponse = {
  summary: string;
  embeddings?: number[];
  timestamp: string;
  chunkId: string;
};

/**
 * Sends a text chunk to the LLM API and gets summarized data
 */
export const processChunkWithLLM = async (
  chunk: ProcessedChunk
): Promise<LLMResponse> => {
  try {
    const response = await fetch(`${process.env.LLM_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.LLM_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Bite-Sized Study App'
      },
      body: JSON.stringify({
        model: process.env.LLM_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are an educational assistant that creates concise, accurate summaries of academic content.'
          },
          {
            role: 'user',
            content: `Summarize the following text in a concise but comprehensive way, preserving key concepts and terminology: ${chunk.content}`
          }
        ],
        temperature: parseFloat(process.env.LLM_TEMPERATURE as string),
        max_tokens: parseInt(process.env.LLM_MAX_TOKENS as string),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(JSON.stringify(error));
    }

    const data = await response.json();
    
    return {
      summary: data.choices[0]?.message?.content || '',
      timestamp: new Date().toISOString(),
      chunkId: generateChunkId(chunk),
    };
  } catch (error) {
    console.error('Error processing chunk with LLM:', error);
    throw error;
  }
};

/**
 * Generate a unique ID for a chunk based on its content
 */
const generateChunkId = (chunk: ProcessedChunk): string => {
  return `chunk_${Buffer.from(chunk.content.substring(0, 50)).toString('base64')}_${Date.now()}`;
};

/**
 * Gets embeddings for a text chunk
 */
export const getEmbeddings = async (text: string): Promise<number[]> => {
  try {
    const response = await fetch(`${process.env.LLM_API_URL}/embeddings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.LLM_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Bite-Sized Study App'
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: text,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(JSON.stringify(error));
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw error;
  }
}; 