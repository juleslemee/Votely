import { Metadata } from 'next';
import NextStepsClient from './next-steps-client';

export const metadata: Metadata = {
  title: 'Next Steps | Votely',
  description: 'Take the next step in your political journey with Votely.',
};

export const viewport = {
  themeColor: '#B07DD5',
  width: 'device-width',
  initialScale: 1,
};

export default function NextStepsPage() {
  return <NextStepsClient />;
} 