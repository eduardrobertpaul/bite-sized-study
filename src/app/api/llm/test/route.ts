import { NextResponse } from 'next/server';
import fetch from 'node-fetch';

export async function GET() {
  try {
    console.log('Testing with URL:', process.env.LLM_API_URL);
    console.log('Model:', process.env.LLM_MODEL);
    
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
            role: 'user',
            content: 'Say "API test successful" if you can read this message.'
          }
        ],
        temperature: parseFloat(process.env.LLM_TEMPERATURE as string),
        max_tokens: 50,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('API Error:', error);
      throw new Error(JSON.stringify(error));
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      message: data.choices[0]?.message?.content || 'No response content',
      model: process.env.LLM_MODEL,
      full_response: data
    });
  } catch (error: any) {
    console.error('Full error:', error);
    return NextResponse.json({
      success: false,
      error: error.toString(),
      details: error
    }, { status: 500 });
  }
} 