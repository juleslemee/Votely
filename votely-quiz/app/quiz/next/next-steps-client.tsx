"use client";

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { saveEmailToWaitlist } from '@/lib/quiz';
import { debugError } from '@/lib/debug-logger';
import { Rocket, Target, Users, Lightbulb, Heart, Shield, Lock } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';
import { capturePosthogEvent } from '@/lib/posthog-client';

const carouselScreenshots = [
  { src: '/Page 1 - Learn.png', alt: 'Learn civics screenshot' },
  { src: '/Page 2 - Act.png', alt: 'Act on issues screenshot' },
  { src: '/Page 3 - Map.png', alt: 'Map of local action screenshot' },
];

function NextStepsContent() {
  const posthog = usePostHog();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [autoSlide, setAutoSlide] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Preload all carousel images
  useEffect(() => {
    const preloadImages = async () => {
      const promises = carouselScreenshots.map((screenshot) => {
        return new Promise((resolve, reject) => {
          const img = new window.Image();
          img.onload = resolve;
          img.onerror = reject;
          img.src = screenshot.src;
        });
      });
      
      try {
        await Promise.all(promises);
        setImagesLoaded(true);
      } catch (error) {
        debugError('Error preloading images:', error);
        setImagesLoaded(true); // Still allow interaction even if preload fails
      }
    };
    
    preloadImages();
  }, []);

  // Auto-slide every 4s unless user has interacted
  useEffect(() => {
    if (!autoSlide) return;
    const timer = setTimeout(() => {
      setCarouselIdx((prev) => {
        const nextIndex = (prev + 1) % carouselScreenshots.length;
        capturePosthogEvent(posthog, 'carousel_changed', {
          slide_index: nextIndex,
          source: 'auto'
        });
        return nextIndex;
      });
    }, 4000);
    return () => clearTimeout(timer);
  }, [carouselIdx, autoSlide, posthog]);

  const handleArrow = (dir: -1 | 1) => {
    setAutoSlide(false);
    setCarouselIdx((prev) => {
      const nextIndex = (prev + dir + carouselScreenshots.length) % carouselScreenshots.length;
      capturePosthogEvent(posthog, 'carousel_changed', {
        slide_index: nextIndex,
        source: 'arrow'
      });
      return nextIndex;
    });
  };
  const handleDot = (idx: number) => {
    setAutoSlide(false);
    setCarouselIdx(idx);
    capturePosthogEvent(posthog, 'carousel_changed', {
      slide_index: idx,
      source: 'dot'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;
    const emailDomain = email.includes('@') ? email.split('@')[1]?.toLowerCase() : 'invalid';
    try {
      setIsSubmitting(true);
      // Add to waitlist (emails are no longer associated with quiz results)
      await saveEmailToWaitlist(email);
      setIsSuccess(true);
      capturePosthogEvent(posthog, 'waitlist_submit', {
        result: 'success',
        email_domain: emailDomain
      }, { sendToServer: true });
    } catch (error) {
      debugError('Error saving email:', error);
      capturePosthogEvent(posthog, 'waitlist_submit', {
        result: 'error',
        email_domain: emailDomain,
        error_message: error instanceof Error ? error.message : String(error)
      }, { sendToServer: true });
      // You might want to show an error message to the user here
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#B07DD5] bg-gradient-to-b from-[#B07DD5] to-[#6200B3] px-4 md:px-8 py-4 md:py-8 overflow-x-hidden">
      <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-8 md:gap-12 items-center justify-center min-h-screen">
        {/* Left column: Simplified content */}
        <div className="flex flex-col justify-center w-full md:w-1/2 max-w-xl">
          <div className="flex flex-col space-y-4 md:space-y-8 lg:space-y-10">
            {/* Pre-launch Badge */}
            <div className="flex items-center gap-2">
            <div className="bg-white/20 text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium backdrop-blur-sm border border-white/30 animate-pulse">
              <Rocket className="w-4 h-4" />
              Pre-Launch • Building Now
            </div>
          </div>

          {/* Main Headline */}
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white font-ubuntu leading-tight">
              Help Us Build the Future of Civic Engagement
            </h1>
            <p className="text-lg md:text-xl text-white/90">
              We're creating something that could fundamentally change how people connect with their local government. Join our founding community and help shape a tool that could transform democracy.
            </p>
          </div>

          {/* The Vision */}
          <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/20">
            <h3 className="text-white font-semibold text-lg mb-3">The Vision</h3>
            <p className="text-white/90 text-sm leading-relaxed">
              Image if we could make civic action as easy as scrolling social media. We're building this reality; a world where participation begets fairness and unity.
            </p>
          </div>

          {/* What We're Building Together */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg">What We're Building Together:</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-white/80 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-white mb-1">Hyper-Local Civic Intelligence</p>
                  <p className="text-white/70 text-sm">Smart alerts for town halls, elections, and opportunities to make a difference in your specific area</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-white/80 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-white mb-1">Community Action Network</p>
                  <p className="text-white/70 text-sm">Connect with neighbors who share your values and coordinate local impact</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-white/80 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-white mb-1">Democratic Innovation</p>
                  <p className="text-white/70 text-sm">New tools and approaches to make civic participation accessible and effective</p>
                </div>
              </div>
            </div>
          </div>

            {/* Why this matters now */}
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
              <p className="text-white/90 text-sm">
                <span className="font-semibold">Why this matters now:</span> Local politics affects your daily life more than federal politics, yet most people don't know when their city council meets or how to get involved. We can change that.
              </p>
            </div>
          </div>
        </div>
        {/* Right column: App mockups */}
        <div className="flex flex-col items-center w-full md:w-1/2 max-w-xs md:max-w-sm space-y-4">
          {/* Mobile arrows and dots above the image */}
          <div className="flex md:hidden w-full items-center justify-center gap-2 px-4 mb-2">
            <button
              aria-label="Previous"
              className="bg-white/80 hover:bg-white text-[#6200B3] rounded-full p-2 shadow transition flex items-center justify-center"
              onClick={() => handleArrow(-1)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              {carouselScreenshots.map((_, idx) => (
                <button
                  key={idx}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${carouselIdx === idx ? 'bg-white' : 'bg-white/40'}`}
                  onClick={() => handleDot(idx)}
                />
              ))}
            </div>
            <button
              aria-label="Next"
              className="bg-white/80 hover:bg-white text-[#6200B3] rounded-full p-2 shadow transition flex items-center justify-center"
              onClick={() => handleArrow(1)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="w-full aspect-[9/19] max-w-[200px] sm:max-w-[240px] md:max-w-[280px] mx-auto relative max-h-[60vh]">
            {/* Render all images but only show the active one */}
            {carouselScreenshots.map((screenshot, idx) => (
              <Image
                key={idx}
                src={screenshot.src}
                alt={screenshot.alt}
                fill
                className={`object-contain transition-opacity duration-300 ${
                  idx === carouselIdx ? 'opacity-100' : 'opacity-0'
                }`}
                priority
              />
            ))}
            {/* Desktop arrows: positioned further from mockup */}
            <button
              aria-label="Previous"
              className="hidden md:flex bg-white/80 hover:bg-white text-[#6200B3] rounded-full p-2 shadow transition items-center justify-center pointer-events-auto absolute -left-12 top-1/2 -translate-y-1/2 z-10"
              onClick={() => handleArrow(-1)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              aria-label="Next"
              className="hidden md:flex bg-white/80 hover:bg-white text-[#6200B3] rounded-full p-2 shadow transition items-center justify-center pointer-events-auto absolute -right-12 top-1/2 -translate-y-1/2 z-10"
              onClick={() => handleArrow(1)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* CTA Section moved below mockups */}
          <div className="w-full space-y-4 max-w-md">
            {!isSuccess ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Join Our Email Community"
                  className="w-full p-4 text-lg rounded-xl bg-white/95 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/50"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full p-5 text-xl font-bold text-[#6200B3] bg-white rounded-xl shadow-xl 
                    ${isSubmitting 
                      ? 'opacity-50' 
                      : 'hover:bg-white/90 hover:scale-105 hover:shadow-2xl'} 
                    transition-all duration-200 transform`}
                >
                  {isSubmitting ? 'Joining the Movement...' : 'Count Me In'}
                </button>
              </form>
            ) : (
              <div className="bg-white/10 p-6 rounded-xl text-white text-center backdrop-blur-sm border border-white/20">
                <h3 className="text-xl font-semibold mb-2">Welcome to the Movement!</h3>
                <p>Check your email for updates on our progress and how you can help shape the future of civic engagement.</p>
              </div>
            )}

            {/* Founding Supporter Benefits */}
            {!isSuccess && (
              <div className="space-y-3">
                <h4 className="font-medium text-white text-center text-sm">As a founding supporter, you'll get:</h4>
                <div className="space-y-2 text-white/90 text-sm">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-white/80" />
                    <span>Behind-the-scenes updates on our progress</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-white/80" />
                    <span>Input on features and direction</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Rocket className="w-4 h-4 text-white/80" />
                    <span>First access when we launch</span>
                  </div>
                </div>
                
                {/* Trust signals */}
                <div className="flex items-center justify-center gap-4 text-white/70 text-xs pt-2 border-t border-white/20">
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Your email won't be linked to your quiz results
                  </span>
                  <span>•</span>
                  <span> 1-2 updates/year, no spam, unsubscribe anytime</span>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default function NextStepsClient() {
  return (
    <Suspense fallback={
      <div className="w-full min-h-screen bg-[#B07DD5] bg-gradient-to-b from-[#B07DD5] to-[#6200B3] px-4 md:px-8 py-4 md:py-8 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <NextStepsContent />
    </Suspense>
  );
}
