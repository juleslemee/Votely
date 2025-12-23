import { Metadata } from 'next';
import Link from 'next/link';
import { getJobs } from '@/lib/jobs';
import { Job } from '@/types/jobs';

export const metadata: Metadata = {
  title: 'Careers at Votely | Open Positions',
  description:
    'Join Votely and help build civic technology that matters. View our open positions and apply today.',
  openGraph: {
    title: 'Careers at Votely',
    description: 'Join Votely and help build civic technology that matters.',
    type: 'website',
  },
};

function formatCompensation(job: Job): string {
  const { compensation } = job;
  if (compensation.type === 'hourly') {
    return `$${compensation.min} – $${compensation.max} / hour`;
  }
  return `$${compensation.min.toLocaleString()} – $${compensation.max.toLocaleString()} / year`;
}

function formatEmploymentType(type: Job['employmentType']): string {
  const labels: Record<Job['employmentType'], string> = {
    'full-time': 'Full-time',
    'part-time': 'Part-time',
    contract: 'Contract',
    internship: 'Internship',
  };
  return labels[type];
}

export default function JobsPage() {
  const jobs = getJobs();

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="text-purple-600 hover:text-purple-700 font-medium mb-6 inline-block"
          >
            &larr; Back to Votely
          </Link>
          <h1 className="text-4xl font-ubuntu font-bold text-foreground mb-6">
            Careers at Votely
          </h1>
          <div className="space-y-4 text-gray-700 font-noto">
            <p>
              Votely is a civic technology company here to make democracy actually work for people.
              We don&apos;t just want to build &quot;useful&quot; tools. We aren&apos;t interested in &quot;slightly
              better&quot; civic apps. We are here to build the best civic engagement platform on the
              planet. Period.
            </p>
            <p>
              As a remote-first company, we hire the most talented people regardless of where they
              happen to wake up. While we&apos;re building the future of civic tech, we know that a team
              with different backgrounds, perspectives, and &quot;lived-in&quot; experiences is what makes
              our product better for everyone. If you&apos;ve got a unique point of view to add to the
              mix, we want to hear it.
            </p>
            <p>
              Don&apos;t count yourself out. If you&apos;re excited about what we&apos;re building but your
              resume doesn&apos;t check every single box, apply anyway. We care more about your talent,
              your drive, and your &quot;get-it-done&quot; attitude than a perfect list of bullet points.
              We&apos;re looking for awesome humans, not perfect machines.
            </p>
            <p className="text-gray-500 italic">
              (Why Votely™? Because we believe your voice should matter every day, not just every
              four years.)
            </p>
            <p className="text-sm text-gray-500 mt-6 pt-4 border-t border-gray-200">
              <strong>A Note on Security:</strong> Stay safe out there. We will never interview you
              over Telegram or WhatsApp. All official Votely communication will come from a
              @votelyquiz.com email address. If it feels fishy, it probably is.
            </p>
          </div>
        </div>

        {/* Job listings */}
        <div className="space-y-4">
          {jobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 font-noto">
                No open positions at the moment. Check back soon!
              </p>
            </div>
          ) : (
            jobs.map((job) => (
              <Link
                key={job.slug}
                href={`/jobs/${job.slug}`}
                className="block bg-white rounded-xl border border-gray-200 p-6 hover:border-purple-300 hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-ubuntu font-semibold text-foreground mb-2">
                      {job.title}
                    </h2>
                    <div className="flex flex-wrap gap-2 text-sm text-gray-600 font-noto">
                      <span className="bg-gray-100 px-3 py-1 rounded-full">{job.department}</span>
                      <span className="bg-gray-100 px-3 py-1 rounded-full">{job.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-purple-600 font-noto">
                      {formatCompensation(job)}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500 font-noto">
            Don&apos;t see a role that fits?{' '}
            <a
              href="mailto:jules@votelyquiz.com"
              className="text-purple-600 hover:text-purple-700 underline"
            >
              Reach out anyway
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
