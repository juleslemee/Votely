import { Metadata } from 'next';
import { Suspense } from 'react';
import QuizPageClient from './quiz-page-client';

export const metadata: Metadata = {
  title: 'Political Views Quiz | Votely',
  description: 'Take the Votely quiz to discover your political alignment and see where you stand on the issues.',
};

function QuizLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/25 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-12">
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-6">
          <div className="h-full bg-purple-600 transition-all duration-300" style={{ width: '0%' }} />
        </div>
        <h1 className="text-4xl font-bold text-foreground text-center mb-8">
          Loading Quiz...
        </h1>
      </div>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<QuizLoading />}>
      <QuizPageClient />
    </Suspense>
  );
} 