import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ error: 'Invalid slug.' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const { session_id } = body;

    if (!session_id) {
      return NextResponse.json({ error: 'Session ID is required.' }, { status: 400 });
    }

    // Validate UUID format roughly
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(session_id)) {
      return NextResponse.json({ error: 'Invalid session ID format.' }, { status: 400 });
    }

    // Atomic increment via RPC with session verification
    const { data, error } = await supabaseAdmin.rpc('increment_view_count', {
      moment_slug: slug,
      client_session_id: session_id,
    });

    if (error) {
      console.error('RPC error:', error);
      return NextResponse.json({ error: 'Server error.' }, { status: 500 });
    }

    // No rows returned = moment doesn't exist or already faded
    if (!data || data.length === 0) {
      const { data: check } = await supabaseAdmin
        .from('moments')
        .select('is_active, slug')
        .eq('slug', slug)
        .single();

      if (!check) {
        return NextResponse.json({ error: 'Not found.' }, { status: 404 });
      }

      return NextResponse.json({ faded: true }, { status: 200 });
    }

    const moment = data[0];

    // If the view count reached limit before this view, it would have returned no rows.
    // If it reached limit DURING this view, moment.is_active is false but we return the content
    // for this final 10th view.
    return NextResponse.json(
      {
        faded: false,
        moment,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('View increment error:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
