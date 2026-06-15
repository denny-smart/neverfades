import type { Metadata } from 'next';
import CreatePageClient from '@/components/create/CreatePageClient';

export const metadata: Metadata = {
  title: 'Create a Moment — NeverFades',
  description: 'Craft a cinematic emotional message that fades after 3 views.',
};

export default function CreatePage() {
  return (
    <main>
      <CreatePageClient />
    </main>
  );
}
