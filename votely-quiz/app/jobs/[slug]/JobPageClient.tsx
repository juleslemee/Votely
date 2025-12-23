'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Job, JobSection } from '@/types/jobs';
import JobApplicationForm from './JobApplicationForm';

interface Props {
  job: Job;
}

function formatEmploymentType(type: Job['employmentType']): string {
  const labels: Record<Job['employmentType'], string> = {
    'full-time': 'Full-time',
    'part-time': 'Part-time',
    contract: 'Contract',
    internship: 'Intern',
  };
  return labels[type];
}

function formatLocationType(type: Job['locationType']): string {
  const labels: Record<Job['locationType'], string> = {
    remote: 'Remote',
    hybrid: 'Hybrid',
    onsite: 'On-site',
  };
  return labels[type];
}

function formatCompensation(job: Job): string {
  const { compensation } = job;
  if (compensation.type === 'hourly') {
    return `$${compensation.min}.00 – $${compensation.max}.00 per hour`;
  }
  return `$${compensation.min.toLocaleString()} – $${compensation.max.toLocaleString()} per year`;
}

function JobSectionComponent({ section }: { section: JobSection }) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">{section.title}</h3>
      {section.content && (
        <p className="text-gray-700 mb-3 leading-relaxed">{section.content}</p>
      )}
      {section.bullets && section.bullets.length > 0 && (
        <ul className="list-disc list-outside ml-5 space-y-2">
          {section.bullets.map((bullet, index) => (
            <li key={index} className="text-gray-700 leading-relaxed">
              {bullet}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MetadataItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-4 border-b border-gray-200">
      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</div>
      <div className="text-gray-900">{value}</div>
    </div>
  );
}

export default function JobPageClient({ job }: Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'application'>('application');

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/jobs"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </Link>
            <div className="flex items-center gap-2">
              <Image src="/logo.svg" alt="Votely" width={40} height={40} />
              <span className="text-xl font-ubuntu font-bold text-gray-900">Votely</span>
            </div>
            <div className="w-5" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Job Title */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">{job.title}</h1>
      </div>

      {/* Two-column layout */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left sidebar - Job metadata (shows after content on mobile) */}
          <aside className="lg:w-64 flex-shrink-0 order-2 lg:order-1">
            <div className="lg:sticky lg:top-8">
              <MetadataItem label="Location" value={job.location} />
              <MetadataItem label="Employment Type" value={formatEmploymentType(job.employmentType)} />
              <MetadataItem label="Location Type" value={formatLocationType(job.locationType)} />
              <MetadataItem label="Department" value={job.department} />
              <MetadataItem label="Compensation" value={formatCompensation(job)} />
            </div>
          </aside>

          {/* Right content area (shows first on mobile) */}
          <div className="flex-1 min-w-0 order-1 lg:order-2">
            {/* Tabs */}
            <div className="flex gap-8 border-b border-gray-200 mb-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-3 text-sm font-medium transition-colors relative ${
                  activeTab === 'overview'
                    ? 'text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Overview
                {activeTab === 'overview' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('application')}
                className={`pb-3 text-sm font-medium transition-colors relative ${
                  activeTab === 'application'
                    ? 'text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Application
                {activeTab === 'application' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
                )}
              </button>
            </div>

            {/* Tab content */}
            {activeTab === 'overview' ? (
              <div>
                {job.sections.map((section, index) => (
                  <JobSectionComponent key={index} section={section} />
                ))}
              </div>
            ) : (
              <JobApplicationForm jobSlug={job.slug} jobTitle={job.title} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
