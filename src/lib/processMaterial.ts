import { ProcessedChunk, processChunkWithLLM } from './llm';
import { storeLLMResponse } from './storage';

/**
 * Process all chunks of a material with rate limiting
 */
export const processMaterialChunks = async (
  materialId: string,
  chunks: ProcessedChunk[]
): Promise<string[]> => {
  const chunkIds: string[] = [];
  const batchSize = 3; // Process 3 chunks at a time to avoid rate limits
  
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const promises = batch.map(async (chunk) => {
      try {
        // Process chunk with LLM
        const response = await processChunkWithLLM(chunk);
        
        // Store the response
        await storeLLMResponse(materialId, response);
        
        return response.chunkId;
      } catch (error) {
        console.error(`Error processing chunk ${i}:`, error);
        return null;
      }
    });
    
    // Wait for all chunks in this batch to be processed before moving to the next batch
    const batchResults = await Promise.all(promises);
    chunkIds.push(...batchResults.filter(Boolean) as string[]);
    
    // Add a small delay between batches to avoid rate limits
    if (i + batchSize < chunks.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return chunkIds;
};

/**
 * Estimate token count for rate limiting purposes
 * This is a rough estimate - actual tokens depend on the tokenizer used
 */
export const estimateTokenCount = (text: string): number => {
  // GPT models use roughly 4 characters per token on average
  return Math.ceil(text.length / 4);
}; 