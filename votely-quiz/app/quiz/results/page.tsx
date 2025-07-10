import { Metadata } from 'next';
import { Suspense } from 'react';
import ResultsClient from './results-client';

export const metadata: Metadata = {
  title: 'Your Results | Votely',
  description: 'See where you stand on the political compass based on your quiz answers.',
};

export default function ResultsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResultsClient />
    </Suspense>
  );
} 