import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ error: 'Invalid slug.' }, { status: 400 });
    }

    const { data: moment, error } = await supabaseAdmin
      .from('moments')
      .select('view_count, max_views, first_viewed_at, last_viewed_at, is_active')
      .eq('slug', slug)
      .single();

    if (error || !moment) {
      return NextResponse.json({ error: 'Moment not found.' }, { status: 404 });
    }

    return NextResponse.json({
      view_count: moment.view_count,
      max_views: moment.max_views,
      first_viewed_at: moment.first_viewed_at || null,
      last_viewed_at: moment.last_viewed_at || null,
      is_active: moment.is_active,
    }, { status: 200 });
  } catch (err) {
    console.error('Fetch stats error:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
