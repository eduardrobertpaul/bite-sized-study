import { NextRequest, NextResponse } from 'next/server';
import { processChunkWithLLM, ProcessedChunk } from '@/lib/llm';
import { storeLLMResponse } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { materialId, chunk } = body as { materialId: string; chunk: ProcessedChunk };

    if (!materialId || !chunk?.content) {
      return NextResponse.json(
        { error: 'Missing required fields: materialId or chunk' },
        { status: 400 }
      );
    }

    // Process the chunk with LLM
    const llmResponse = await processChunkWithLLM(chunk);
    
    // Store the response
    await storeLLMResponse(materialId, llmResponse);

    return NextResponse.json({ success: true, response: llmResponse });
  } catch (error) {
    console.error('Error processing chunk:', error);
    return NextResponse.json(
      { error: 'Failed to process chunk with LLM' },
      { status: 500 }
    );
  }
} 