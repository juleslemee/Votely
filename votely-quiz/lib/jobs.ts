import { Job } from '@/types/jobs';

export const JOBS: Job[] = [
  {
    slug: 'software-engineering-intern',
    title: 'Software Engineering Intern',
    department: '2026 Internships',
    location: 'US Remote',
    locationType: 'remote',
    employmentType: 'internship',
    compensation: {
      type: 'hourly',
      min: 70,
      max: 75,
      currency: 'USD',
      period: '$11,200 - $12,000 per month',
    },
    sections: [
      {
        title: 'The Essentials',
        bullets: [
          'Compensation: Up to $12,000 / month (annualized at $144k/year commensurate with impact).',
          'Visa Status: Open to all. We support F-1/OPT, J-1, and international candidates in general.',
          'Location: Fully Remote.',
          'Timing: Summer 2026 (off-cycle Spring/Fall 2026 considered for exceptional candidates).',
        ],
      },
      {
        title: 'The Reality of This Internship',
        content:
          "Most internships are \"safe\" sandbox projects. This isn't one of them. You will ship production code to tens of thousands of users on day one. We are building civic infrastructure at scale, and we need engineers who can handle high-traffic bursts, complex data pipelines, and rapid iteration.",
      },
      {
        title: "What You'll Actually Do",
        content:
          "You won't be shadowing; you'll be building. You will own a slice of the stack based on your strengths:",
        bullets: [
          'Backend & Infra: Scale APIs and data models that power real-world civic outcomes.',
          'Product Engineering: Ship user-facing features and experimentation frameworks.',
          'Systems: Optimize performance and reliability for a platform that cannot afford to go down during peak civic events.',
        ],
      },
      {
        title: 'Who You Are',
        content: 'We hire for velocity and ownership. This role is a fit if:',
        bullets: [
          'You are a CS/Engineering student or recent grad aiming for the top 1% of SWE roles.',
          'You prefer building real systems over completing coursework.',
          'You have a high "figure-it-out" quotient and require minimal hand-holding.',
          'You have a solid grasp of at least one modern stack (e.g., TypeScript/Node, Python, Go, React, or Cloud Infra).',
        ],
      },
      {
        title: 'Why Votely?',
        bullets: [
          'No Filler Work: Your work stays in the codebase after you leave.',
          'High-Signal Experience: This is a resume-defining role designed for people who take their career trajectory seriously.',
          'Direct Access: Work directly with founders on system design and product tradeoffs.',
        ],
      },
      {
        title: 'About Votely',
        content:
          "Votely is a fast-growing civic technology platform. We sit at the intersection of data, consumer software, and behavioral incentives, helping users navigate their political alignment and civic engagement. We're live with ~30,000 users, where technical decisions have real-world impact.",
      },
    ],
    isActive: true,
    createdAt: '2024-12-22T00:00:00.000Z',
    updatedAt: '2024-12-22T00:00:00.000Z',
  },
];

export function getJobs(): Job[] {
  return JOBS.filter((job) => job.isActive);
}

export function getJobBySlug(slug: string): Job | undefined {
  return JOBS.find((job) => job.slug === slug && job.isActive);
}

export function getAllJobSlugs(): string[] {
  return JOBS.filter((job) => job.isActive).map((job) => job.slug);
}
