'use client';

import { useState } from 'react';
import Image from 'next/image';
import { debugError } from '../lib/debug-logger';

export default function AboutCreator() {
  const [feedback, setFeedback] = useState('');
  const [wantsReply, setWantsReply] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedback,
          wantsReply,
          email: wantsReply ? email : undefined,
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFeedback('');
        setEmail('');
        setWantsReply(false);
      } else {
        try {
          const text = await response.text();
          debugError('Feedback submission error - Response:', text);
          debugError('Response status:', response.status);
          debugError('Response headers:', response.headers);
          
          // Try to parse as JSON if possible
          try {
            const data = JSON.parse(text);
            debugError('Parsed error:', data);
          } catch (e) {
            // Not JSON, that's ok
          }
        } catch (parseError) {
          debugError('Failed to read error response:', parseError);
        }
        setSubmitStatus('error');
      }
    } catch (error) {
      debugError('Feedback submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background rounded-2xl shadow-lg p-6 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-shrink-0">
          <div className="relative w-28 h-28">
            <Image
              src="/friendly-headshot.jpg"
              alt="Jules Lemee"
              fill
              sizes="(max-width: 640px) 7rem, 7rem"
              className="rounded-full object-cover"
            />
          </div>
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-foreground mb-2">Hi, I'm Jules 👋</h2>
          <p className="text-foreground/60">
            I built this quiz to help bridge divides between people with different opinions and reduce political apathy among young people. 
            To learn more about me or reach out:{' '}
            <a 
              href="https://juleslemee.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:text-primary-dark font-semibold transition-colors"
            >
              juleslemee.com
            </a>
          </p>
        </div>
      </div>

      <div className="pt-4 flex-grow flex flex-col">
        <h3 className="text-lg font-semibold text-foreground mb-3">Have feedback or ideas?</h3>
        <form onSubmit={handleSubmit} className="flex-grow flex flex-col gap-4">
          <div className="flex-grow flex">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your thoughts, suggestions, or feature ideas..."
              className="w-full min-h-[120px] p-3 border border-gray-300 rounded-lg resize-none
                       bg-white text-foreground placeholder-gray-400
                       focus:ring-2 focus:ring-primary focus:border-transparent
                       transition-all flex-grow"
              style={{ height: 'auto' }}
              required
            />
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              id="wantsReply"
              checked={wantsReply}
              onChange={(e) => setWantsReply(e.target.checked)}
              className="mt-1 mr-2 w-4 h-4 text-primary rounded border-gray-300 
                       focus:ring-primary focus:ring-2"
            />
            <label htmlFor="wantsReply" className="text-sm text-foreground/60">
              I want to hear back if you have more questions
            </label>
          </div>

          {wantsReply && (
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="w-full p-3 border border-gray-300 rounded-lg
                         bg-white text-foreground placeholder-gray-400
                         focus:ring-2 focus:ring-primary focus:border-transparent
                         transition-all"
                required={wantsReply}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white 
                     rounded-xl font-medium hover:from-purple-700 hover:to-purple-800 
                     disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300
                     shadow-lg hover:shadow-xl"
          >
            {isSubmitting ? 'Sending...' : 'Send Feedback'}
          </button>

          {submitStatus === 'success' && (
            <p className="text-green-600 text-center text-sm">
              Thank you for your feedback!
            </p>
          )}
          {submitStatus === 'error' && (
            <p className="text-red-600 text-center text-sm">
              Something went wrong. Please try again.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}