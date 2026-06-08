import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { partnerName, senderName, vibe, keywords } = await req.json();

    if (!partnerName || !senderName) {
      return NextResponse.json(
        { error: 'Recipient and Sender names are required.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured. Please set GEMINI_API_KEY in your environment variables.' },
        { status: 500 }
      );
    }

    const prompt = `
      You are a romantic and emotional writer crafting a keepsake message for an app called "NeverFades".
      
      Details:
      - Recipient Name (For): ${partnerName}
      - Sender Name (From): ${senderName}
      - Vibe: ${vibe || 'heartfelt and romantic'}
      - Memory keywords / context: ${keywords || 'general expression of love'}
      
      Requirements:
      - Write a beautiful, poetic, and highly evocative message.
      - Do NOT include any subject lines, titles, or formal introductory text like "Dear ${partnerName}," or signature text like "Love, ${senderName}." The app UI already displays who it is from and to.
      - Start directly with the core message/body.
      - Keep the length under 450 characters so it fits the cinematic screen.
      - Match the selected vibe: "${vibe}".
    `;

    const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(apiURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.82,
          maxOutputTokens: 300,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error?.message || 'Failed to communicate with the AI model.' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    // Clean up any potential quotation marks enclosing the entire message
    let sanitizedText = generatedText;
    if (sanitizedText.startsWith('"') && sanitizedText.endsWith('"')) {
      sanitizedText = sanitizedText.slice(1, -1);
    } else if (sanitizedText.startsWith('“') && sanitizedText.endsWith('”')) {
      sanitizedText = sanitizedText.slice(1, -1);
    }

    return NextResponse.json({ text: sanitizedText });
  } catch (error: any) {
    console.error('AI message generation error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
