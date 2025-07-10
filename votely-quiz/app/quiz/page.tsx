import { Metadata } from 'next';
import QuizPageClient from './quiz-page-client';

export const metadata: Metadata = {
  title: 'Political Views Quiz | Votely',
  description: 'Take the Votely quiz to discover your political alignment and see where you stand on the issues.',
};

export default function QuizPage() {
  return <QuizPageClient />;
} 