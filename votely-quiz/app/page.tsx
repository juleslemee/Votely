'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

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

export default function Home() {
  const [showQuizOptions, setShowQuizOptions] = useState(false);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative bg-background overflow-hidden">
      {/* Random, Non-overlapping Star Pattern */}
      <div className="absolute inset-0 pointer-events-none select-none z-0">
        {starPattern.map((star, i) => (
          <svg
            key={i}
            className={`absolute opacity-8 ${star.size} ${star.color} ${star.rotate}`}
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
      {/* Main Content */}
      <div className="flex flex-col items-center z-10 w-full relative max-w-lg mx-auto">
        {/* Card background */}
        <div className="absolute inset-0 rounded-3xl bg-white/80 shadow-xl backdrop-blur z-0" />
        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center w-full p-8">
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
                      <span className="text-sm opacity-90">(10 Questions)</span>
                    </button>
                  </Link>
                  <Link href="/quiz?type=long" className="flex-1">
                    <button className="w-full py-4 text-lg md:text-xl font-semibold rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition">
                      Longform<br />
                      <span className="text-sm opacity-90">(50 Questions)</span>
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
    </div>
  );
}
