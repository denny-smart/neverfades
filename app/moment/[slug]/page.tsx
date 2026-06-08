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
    .select('partner_name, sender_name, is_active, view_count, max_views')
    .eq('slug', slug)
    .single();

  if (!moment) {
    return {
      title: 'Moment Not Found — NeverFades',
    };
  }

  const isFaded = !moment.is_active || moment.view_count >= moment.max_views;

  if (isFaded) {
    return {
      title: 'A Passing Moment Has Faded — NeverFades',
      description: 'This digital experience has faded, but the feeling remains.',
    };
  }

  return {
    title: `A Passing Moment for ${moment.partner_name} — NeverFades`,
    description: `A cinematic emotional keepsake created by ${moment.sender_name}.`,
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
