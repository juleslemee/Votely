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
  {
    slug: 'product-manager-intern',
    title: 'Product Manager Intern',
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
          'Compensation: Up to $12,000 / month (commensurate with impact).',
          'Visa Status: We support F-1/OPT, J-1, and international candidates (no U.S. work auth required).',
          'Location: Fully Remote.',
          'Timing: Summer 2026 (off-cycle Spring/Fall 2026 considered).',
        ],
      },
      {
        title: 'The Role',
        content:
          "Most PM internships are \"strategy\" simulations that end in a slide deck. At Votely, PM interns ship. You will be responsible for defining features, analyzing user behavior, and working directly with engineering to move the needle on real civic outcomes. You aren't \"observing\" product management; you are doing it.",
      },
      {
        title: "What You'll Actually Do",
        bullets: [
          'Own the Roadmap: Take a feature from a messy idea to a polished launch.',
          'Data-Driven Decisions: Dive into our analytics to find where users are dropping off and tell us how to fix it.',
          'User Research: Talk to real users to understand the "why" behind the data.',
          'Collaboration: Work alongside founders and engineers to navigate technical tradeoffs and ship fast.',
        ],
      },
      {
        title: 'Who You Are',
        bullets: [
          'You are a student or recent grad who is obsessed with how products work.',
          "You are \"technical enough\"—you don't need to code, but you understand how software is built.",
          "You have high agency. You don't wait for a Trello card; you find the biggest problem and solve it.",
          'You can communicate complex ideas simply, whether in a Slack message or a spec doc.',
        ],
      },
      {
        title: 'Why Votely?',
        content:
          "Votely is here to make democracy actually work for people. We don't just want to build \"useful\" tools; we are here to build the best civic engagement platform on the planet. Period.",
        bullets: [
          'As a remote-first company, we hire the most talented people regardless of where they call home.',
          'We believe a diverse team with varied perspectives makes us better. If you can bring something new to the table and expand our point of view, that\'s a huge upside.',
          "Don't count yourself out. Even if you feel like you don't meet every requirement, apply anyway. We're looking for awesome candidates, not perfect resumes.",
        ],
      },
    ],
    isActive: true,
    createdAt: '2024-12-23T00:00:00.000Z',
    updatedAt: '2024-12-23T00:00:00.000Z',
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
