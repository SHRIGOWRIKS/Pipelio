import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import TimelineClient from './TimelineClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Timeline',
  description: 'View all events across your job applications in chronological order.',
};

export default async function TimelinePage() {
  const session = await auth();
  if (!session) redirect('/login');
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAF8' }}>
      <Navbar session={session} />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TimelineClient />
      </main>
    </div>
  );
}
