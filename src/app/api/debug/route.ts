import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    api_url: process.env.LLM_API_URL,
    model: process.env.LLM_MODEL,
    // Don't expose the full API key, just the first few characters
    api_key_preview: process.env.LLM_API_KEY?.substring(0, 10) + '...',
  });
} 