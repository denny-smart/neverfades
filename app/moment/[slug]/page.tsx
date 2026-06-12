import { redirect } from 'next/navigation';

interface MomentPageProps {
  params: Promise<{ slug: string }>;
}

// Redirect old /moment/:slug links to the cleaner root /:slug URL
export default async function MomentRedirectPage({ params }: MomentPageProps) {
  const { slug } = await params;
  redirect(`/${slug}`);
}
