"use client";

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { saveEmailToWaitlist } from '@/lib/quiz';

const carouselScreenshots = [
  { src: '/Page 1 - Learn.svg', alt: 'Learn civics screenshot' },
  { src: '/Page 2 - Act.svg', alt: 'Act on issues screenshot' },
  { src: '/Page 3 - Map.svg', alt: 'Map of local action screenshot' },
];

function NextStepsContent() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [autoSlide, setAutoSlide] = useState(true);

  // Auto-slide every 4s unless user has interacted
  useEffect(() => {
    if (!autoSlide) return;
    const timer = setTimeout(() => {
      setCarouselIdx((prev) => (prev + 1) % carouselScreenshots.length);
    }, 4000);
    return () => clearTimeout(timer);
  }, [carouselIdx, autoSlide]);

  const handleArrow = (dir: -1 | 1) => {
    setAutoSlide(false);
    setCarouselIdx((prev) => (prev + dir + carouselScreenshots.length) % carouselScreenshots.length);
  };
  const handleDot = (idx: number) => {
    setAutoSlide(false);
    setCarouselIdx(idx);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;
    try {
      setIsSubmitting(true);
      // Add to waitlist (emails are no longer associated with quiz results)
      await saveEmailToWaitlist(email);
      setIsSuccess(true);
    } catch (error) {
      console.error('Error saving email:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#B07DD5] bg-gradient-to-b from-[#B07DD5] to-[#6200B3] px-4 md:px-8 py-4 md:py-8 overflow-x-hidden max-w-screen-sm md:max-w-full mx-auto">
      <div className="w-full max-w-full flex flex-col md:flex-row gap-4 md:gap-8 items-center justify-center min-h-screen">
        {/* Left column: logo/title, subtitle, form */}
        <div className="flex flex-col h-full justify-center items-center text-center w-full md:w-3/5 max-w-xl md:max-w-2xl md:min-h-[80vh] gap-y-0 md:gap-y-12">
          {/* Top: Logo + Title + Subtitle */}
          <div className="flex flex-col items-center text-center w-full">
            <div className="w-16 h-16 md:w-20 md:h-20 relative flex-shrink-0 mx-auto">
              <Image src="/logo.svg" alt="Votely Logo" fill className="object-contain" priority />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-4xl font-bold text-white font-ubuntu break-words mt-2 w-full max-w-2xl mx-auto drop-shadow-lg">
              Ready to Take Action?
            </h2>
            <div className="w-full flex justify-center mt-2 md:mt-4">
              <p className="text-center text-lg sm:text-xl md:text-2xl text-white/90 break-words max-w-xl">
                Join people like you getting alerts for local events,<br />candidate forums, and ways to make impact.<br /><br /><br />Sign up to here about app's upcoming release:
              </p>
            </div>
          </div>
          {/* Small fixed gap below subtitle */}
          <div className="mt-4 md:mt-4" />
          {/* Bottom: Form section */}
          <div className="space-y-6 w-full max-w-md mx-auto md:mx-0">
            {!isSuccess ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full p-4 text-xl rounded-xl bg-white/95 placeholder-[#B07DD5] text-[#6200B3] text-center"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full p-4 text-2xl font-bold text-white rounded-xl shadow-lg 
                    ${isSubmitting 
                      ? 'bg-[#6200B3]/50' 
                      : 'bg-[#6200B3] hover:bg-[#6200B3]/80'} 
                    transition-colors`}
                >
                  {isSubmitting ? 'Joining...' : 'Commit To Civic Action'}
                </button>
                <p className="text-white/70 text-sm text-center px-2">
                  🔒 For your privacy, your email won't be linked to your quiz results
                </p>
              </form>
            ) : (
              <div className="bg-white/10 p-6 rounded-xl text-white text-center">
                <h3 className="text-xl font-semibold mb-2">You're on the list!</h3>
                <p>We'll notify you when Votely launches in your area.</p>
              </div>
            )}
          </div>
        </div>
        {/* Right column: carousel */}
        {/* Divider for desktop */}
        <div className="hidden md:block h-[60vh] w-px bg-white/20 mx-6 rounded-full" />
        <div className="flex flex-col items-center w-full md:w-2/5 max-w-md md:max-w-lg mx-auto md:mx-0 gap-2 md:gap-4 justify-center h-full md:min-h-[80vh]">
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
          <div className="w-full aspect-[9/19] max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto relative max-h-[80vh]">
            <Image
              src={carouselScreenshots[carouselIdx].src}
              alt={carouselScreenshots[carouselIdx].alt}
              fill
              className="object-contain"
              priority
            />
            {/* Desktop arrows: absolute, vertically centered, no dots */}
            <button
              aria-label="Previous"
              className="hidden md:flex bg-white/80 hover:bg-white text-[#6200B3] rounded-full p-2 shadow transition items-center justify-center pointer-events-auto absolute left-0 top-1/2 -translate-y-1/2 z-10"
              style={{ transform: 'translateY(-50%)' }}
              onClick={() => handleArrow(-1)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              aria-label="Next"
              className="hidden md:flex bg-white/80 hover:bg-white text-[#6200B3] rounded-full p-2 shadow transition items-center justify-center pointer-events-auto absolute right-0 top-1/2 -translate-y-1/2 z-10"
              style={{ transform: 'translateY(-50%)' }}
              onClick={() => handleArrow(1)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
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
