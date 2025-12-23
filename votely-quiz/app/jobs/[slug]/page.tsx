import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getJobBySlug, getAllJobSlugs } from '@/lib/jobs';
import { Job } from '@/types/jobs';
import JobPageClient from './JobPageClient';

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const slugs = getAllJobSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;
  const job = getJobBySlug(slug);

  if (!job) {
    return {
      title: 'Job Not Found | Votely',
    };
  }

  return {
    title: `${job.title} | Votely Careers`,
    description: `Apply for ${job.title} at Votely. ${job.department} - ${job.location}. ${job.compensation.period || ''}`,
    openGraph: {
      title: `${job.title} at Votely`,
      description: `Join Votely as a ${job.title}. ${job.location}.`,
      type: 'website',
    },
  };
}

export default function JobPage({ params }: Props) {
  const { slug } = params;
  const job = getJobBySlug(slug);

  if (!job) {
    notFound();
  }

  return <JobPageClient job={job} />;
}
