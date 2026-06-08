import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { generateSlug } from '@/lib/utils/slug';
import { CreateMomentInput } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body: CreateMomentInput = await req.json();

    const { partner_name, sender_name, message, theme_id } = body;

    if (!partner_name || !sender_name || !message || !theme_id) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 }
      );
    }

    if (message.length > 1000) {
      return NextResponse.json(
        { error: 'Message must be under 1000 characters.' },
        { status: 400 }
      );
    }

    const slug = generateSlug();

    const { data, error } = await supabaseAdmin
      .from('moments')
      .insert({
        slug,
        partner_name: partner_name.trim(),
        sender_name: sender_name.trim(),
        message: message.trim(),
        theme_id,
      })
      .select('slug')
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: 'Failed to create moment.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ slug: data.slug }, { status: 201 });
  } catch (err) {
    console.error('Create moment error:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
