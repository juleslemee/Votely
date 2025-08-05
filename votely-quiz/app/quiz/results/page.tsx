import { Metadata } from 'next';
import { Suspense } from 'react';
import ResultsClient from './results-client';

export const metadata: Metadata = {
  title: 'Your Political Ideology Results - 3D Compass Visualization',
  description: 'View your position among 81 ideologies on our unique 3D political compass. See detailed analysis across economic, authority, and social axes with interactive cube visualization.',
};

export default function ResultsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResultsClient />
    </Suspense>
  );
} 