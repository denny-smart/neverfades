import { NextResponse } from 'next/server';

/** Trim text to a maximum character length, always ending on a complete sentence. */
function trimToSentence(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;

  // Try to cut at the last sentence-ending punctuation within the limit
  const slice = text.slice(0, maxChars);
  // Match last occurrence of ., !, or ? followed optionally by closing quotes/parens
  const match = slice.match(/^([\s\S]*[.!?]["')\]]*)/);
  if (match) return match[1].trim();

  // Fallback: cut at last space (avoid splitting a word)
  const lastSpace = slice.lastIndexOf(' ');
  return lastSpace > 0 ? slice.slice(0, lastSpace).trimEnd() + '…' : slice;
}

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
        { error: 'Gemini API key is not configured on the server.' },
        { status: 500 }
      );
    }

    // ── Prompt ───────────────────────────────────────────────────────────────
    // IMPORTANT: Do NOT instruct the model to count characters or stay under
    // a specific length — LLMs cannot reliably count characters while generating
    // and will produce mid-sentence truncations when they try to comply.
    // Instead, we ask for a short, complete piece and trim server-side.
    const prompt = `You are a poetic and emotionally intelligent writer for an app called "NeverFades" — a platform where people send keepsake messages that fade after 10 views.

Write a short, complete, and deeply felt keepsake message using the details below:
- For: ${partnerName}
- From: ${senderName}
- Tone / Vibe: ${vibe || 'romantic'}
- Context or memory: ${keywords || 'a general expression of love'}

Rules:
1. Write ONLY the message body — no greeting like "Dear ${partnerName}," and no sign-off like "Love, ${senderName}." The app already shows sender and recipient names.
2. Write exactly 2 to 3 complete, well-formed sentences.
3. Every sentence must be fully finished with proper punctuation (period, exclamation mark, or question mark).
4. Match the emotional tone of the chosen vibe: ${vibe}.
5. Make it feel personal, cinematic, and tender.
6. Output only the raw message text — no titles, labels, or formatting.`;

    // ── API call ─────────────────────────────────────────────────────────────
    const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(apiURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.85,
          maxOutputTokens: 1200, // plenty of room — we trim server-side
          stopSequences: [],
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini API error:', errorData);
      return NextResponse.json(
        { error: errorData.error?.message || 'Failed to communicate with the AI model.' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Log finishReason so we can spot truncations in Vercel logs
    const candidate = data.candidates?.[0];
    const finishReason = candidate?.finishReason;
    console.log('Gemini finishReason:', finishReason);
    if (finishReason && finishReason !== 'STOP') {
      console.warn('Gemini did not finish naturally. finishReason:', finishReason);
    }

    // Join all parts in case the model splits text across multiple entries
    const parts: Array<{ text?: string }> = candidate?.content?.parts || [];
    const rawText = parts.map((p) => p.text ?? '').join('').trim();

    // Strip wrapping quotation marks if present
    let sanitized = rawText;
    if (
      (sanitized.startsWith('"') && sanitized.endsWith('"')) ||
      (sanitized.startsWith('\u201c') && sanitized.endsWith('\u201d'))
    ) {
      sanitized = sanitized.slice(1, -1).trim();
    }

    // Trim to fit the 500-char textarea, always at a clean sentence boundary
    const finalText = trimToSentence(sanitized, 490);

    return NextResponse.json({ text: finalText });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'An unexpected error occurred.';
    console.error('AI message generation error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
