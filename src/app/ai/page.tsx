import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import AIClient from './AIClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Tools',
  description: 'AI-powered resume analysis, job matching, cover letters, interview prep, and salary negotiation.',
};

export default async function AIPage() {
  const session = await auth();
  if (!session) redirect('/login');
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAF8' }}>
      <Navbar session={session} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AIClient />
      </main>
    </div>
  );
}
