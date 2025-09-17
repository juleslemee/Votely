'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import Script from 'next/script';

interface Star {
  top: number;
  left: number;
  size: string;
  color: string;
  rotate: string;
}

// Random, non-overlapping star pattern with a mix of large and small stars
const NUM_STARS = 110;
const MIN_DIST = 7; // percent, minimum distance between stars
const SIZES = [
  'w-8 h-8', 'w-10 h-10', 'w-12 h-12', 'w-14 h-14', 'w-16 h-16', 'w-20 h-20',
  'w-24 h-24', 'w-28 h-28', 'w-32 h-32', 'w-40 h-40', // allow some large
];
const COLORS = [
  'text-primary','text-secondary'
];
const ROTATIONS = ['rotate-0', 'rotate-3', 'rotate-6', 'rotate-12', '-rotate-3', '-rotate-6', '-rotate-12', 'rotate-45', '-rotate-45'];

function randomStar(existing: Star[]): Star {
  let tries = 0;
  while (tries < 100) {
    const top = Math.random() * 95 + 2; // 2% to 97%
    const left = Math.random() * 95 + 2;
    // Prevent overlap: check distance to all existing
    if (existing.every((s: Star) => {
      const dx = s.left - left;
      const dy = s.top - top;
      return Math.sqrt(dx * dx + dy * dy) > MIN_DIST;
    })) {
      return {
        top,
        left,
        size: SIZES[Math.floor(Math.random() * SIZES.length)] + ' md:' + SIZES[Math.floor(Math.random() * SIZES.length)],
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotate: ROTATIONS[Math.floor(Math.random() * ROTATIONS.length)],
      };
    }
    tries++;
  }
  // fallback: just place it
  return {
    top: Math.random() * 95 + 2,
    left: Math.random() * 95 + 2,
    size: SIZES[Math.floor(Math.random() * SIZES.length)] + ' md:' + SIZES[Math.floor(Math.random() * SIZES.length)],
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rotate: ROTATIONS[Math.floor(Math.random() * ROTATIONS.length)],
  };
}

const starPattern: Star[] = [];
for (let i = 0; i < NUM_STARS; i++) {
  // Bias more stars toward the top
  const isTop = i < Math.floor(NUM_STARS * 2 / 3);
  let star: Star;
  let tries = 0;
  do {
    star = randomStar(starPattern);
    if (isTop && star.top > 50) star.top = Math.random() * 45 + 2; // force top half
    tries++;
  } while (starPattern.some(s => Math.sqrt((s.left - star.left) ** 2 + (s.top - star.top) ** 2) < MIN_DIST) && tries < 10);
  starPattern.push(star);
}

const faqItems = [
  {
    question: "What makes Votely better than the Political Compass test?",
    answer: "Votely uses 3 axes instead of 2, measures 39 total political dimensions, offers 81 distinct ideologies (vs just 4 quadrants), uses percentage sliders for nuanced answers, and features a unique 3D cube visualization of your results."
  },
  {
    question: "Why is a 3-axis political quiz more accurate?",
    answer: "Traditional 2D compasses miss the cultural/social dimension entirely. By adding a Progressive-Conservative axis to Economic and Authority axes, Votely captures the full spectrum of political beliefs, preventing misclassification of culturally progressive libertarians or socially conservative socialists."
  },
  {
    question: "How does the 39-axis system work?",
    answer: "While you answer questions on 3 main axes, our two-phase system analyzes 39 total political dimensions to place you precisely among 81 ideologies. This is more comprehensive than any competitor - 8values uses 8 axes, 9axes uses 9, and 12axes uses 12."
  },
  {
    question: "What is the 3D cube visualization?",
    answer: "Unlike flat 2D charts, Votely displays your results in an interactive 3D cube where you can see your exact position in political space. You can rotate and explore to understand how you relate to all 81 ideologies in three dimensions."
  },
  {
    question: "Why use percentage sliders instead of yes/no answers?",
    answer: "Political views aren't binary. Our percentage agreement sliders (0-100%) capture the intensity of your beliefs. You might agree 30% with one statement but 90% with another - this nuance is lost in traditional strongly agree/disagree scales."
  },
  {
    question: "Is Votely the most accurate political quiz available?",
    answer: "With 39 measured dimensions, 81 distinct ideologies, percentage-based answers, and two-phase analysis, Votely offers the most comprehensive political assessment available online. No other quiz matches this level of detail and nuance."
  },
  {
    question: "Should I take the 12 or 60 question version?",
    answer: "The 12-question version gives you a quick but accurate overview, perfect for sharing and casual use. The 60-question version provides extreme detail and precision, ideal when you want the most accurate possible results."
  },
  {
    question: "Who created Votely and why?",
    answer: "Votely was created by Jules Lemee to provide a more accurate, nuanced political assessment tool. Traditional political compasses oversimplify complex beliefs - Votely solves this with advanced methodology and detailed analysis."
  }
];

export default function Home() {
  const [showQuizOptions, setShowQuizOptions] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  
  return (
    <div className="min-h-screen bg-background relative">
      {/* Random, Non-overlapping Star Pattern - Fixed background */}
      <div className="fixed inset-0 pointer-events-none">
        {starPattern.map((star, i) => (
          <svg
            key={i}
            className={`absolute opacity-80 ${star.size} ${star.color} ${star.rotate}`}
            style={{
              top: `${star.top}%`,
              left: `${star.left}%`,
            }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <polygon points="12,2 15,10 23,10 17,15 19,23 12,18 5,23 7,15 1,10 9,10" />
          </svg>
        ))}
      </div>
      
      {/* Content wrapper */}
      <div className="relative flex flex-col items-center py-16">
        {/* Main Quiz Card */}
        <div className="w-full max-w-4xl mx-auto mb-8 px-4">
          <div className="relative rounded-3xl bg-white/80 shadow-xl backdrop-blur p-8 flex flex-col items-center">
            {/* Logo */}
            <a 
              href="https://votely.juleslemee.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-32 h-32 md:w-44 md:h-44 mb-8 relative block hover:scale-105 transition-transform"
            >
              <Image src="/logo.svg" alt="Votely Logo" fill className="object-contain" priority />
            </a>
            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-center">
              Welcome to Votely
            </h1>
            {/* Button stack */}
            <div className="flex flex-col gap-4 w-full max-w-xs md:max-w-md">
            {!showQuizOptions ? (
              <button 
                onClick={() => setShowQuizOptions(true)}
                className="w-full py-4 text-xl md:text-2xl font-semibold rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition"
              >
                Start Quiz
              </button>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="text-center text-foreground/75 mb-2">
                  Choose your quiz length:
                </div>
                <div className="flex gap-3">
                  <Link href="/quiz?type=short" className="flex-1">
                    <button className="w-full py-4 text-lg md:text-xl font-semibold rounded-xl bg-purple-500 text-white hover:bg-purple-600 transition">
                      Shortform<br />
                      <span className="text-sm opacity-90">(12 Questions)</span>
                    </button>
                  </Link>
                  <Link href="/quiz?type=long" className="flex-1">
                    <button className="w-full py-4 text-lg md:text-xl font-semibold rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition">
                      Longform<br />
                      <span className="text-sm opacity-90">(60 Questions)</span>
                    </button>
                  </Link>
                </div>
                
                <button 
                  onClick={() => setShowQuizOptions(false)}
                  className="text-sm text-foreground/60 hover:text-foreground/80 transition mt-2"
                >
                  Back
                </button>
              </div>
            )}
            </div>
          </div>
        </div>
      
        {/* FAQ Section */}
        <div className="w-full max-w-4xl mx-auto px-4">
        <div className="bg-white/80 backdrop-blur rounded-3xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-foreground">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div key={index} className="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full text-left flex justify-between items-center py-2 hover:text-purple-600 transition-colors"
                >
                  <h3 className="text-lg font-semibold pr-4">{item.question}</h3>
                  <svg
                    className={`w-5 h-5 transform transition-transform ${openFaqIndex === index ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaqIndex === index && (
                  <p className="mt-3 text-gray-600 leading-relaxed">{item.answer}</p>
                )}
              </div>
            ))}
          </div>
        </div>
        </div>
      </div>
      
      {/* FAQ Schema Markup */}
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqItems.map(item => ({
              "@type": "Question",
              "name": item.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer
              }
            }))
          })
        }}
      />
    </div>
  );
}
