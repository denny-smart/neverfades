import { supabaseAdmin } from '@/lib/supabase/server';
import MomentViewClient from '@/components/moment/MomentViewClient';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const revalidate = 0;

interface MomentPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: MomentPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data: moment } = await supabaseAdmin
    .from('moments')
    .select('is_active, view_count, max_views')
    .eq('slug', slug)
    .single();

  if (!moment) {
    return {
      title: 'NeverFades',
      description: 'A love that never does.',
    };
  }

  const isFaded = !moment.is_active || moment.view_count >= moment.max_views;

  if (isFaded) {
    return {
      title: 'NeverFades',
      description: 'This moment has faded.',
    };
  }

  return {
    title: 'NeverFades',
    description: 'Someone left something for you.',
    openGraph: {
      title: 'NeverFades',
      description: 'Someone left something for you.',
      type: 'website',
    },
  };
}

export default async function MomentPage({ params }: MomentPageProps) {
  const { slug } = await params;

  const { data: moment, error } = await supabaseAdmin
    .from('moments')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !moment) {
    notFound();
  }

  const initialFaded = !moment.is_active || moment.view_count >= moment.max_views;

  const sanitizedMoment = initialFaded
    ? {
        id: moment.id,
        slug: moment.slug,
        theme_id: moment.theme_id,
        view_count: moment.view_count,
        max_views: moment.max_views,
        is_active: false,
        created_at: moment.created_at,
        first_viewed_at: moment.first_viewed_at || null,
        last_viewed_at: moment.last_viewed_at || null,
        partner_name: '',
        sender_name: '',
        message: '',
      }
    : moment;

  return (
    <main>
      <MomentViewClient
        slug={slug}
        initialMoment={sanitizedMoment}
        initialFaded={initialFaded}
      />
    </main>
  );
}
