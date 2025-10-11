'use client';

import { useState, FormEvent } from 'react';
import { HiOutlineMail } from 'react-icons/hi';

interface NewsletterContent {
  heading: string;
  subheading: string;
  placeholder: string;
  buttonText: string;
  successMessage?: string;
  errorMessage?: string;
}

interface NewsletterSignupProps {
  content: NewsletterContent;
}

export default function NewsletterSignup({ content }: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Basic email validation
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setStatus('error');
      return;
    }

    setStatus('loading');

    // TODO: Connect to email service provider
    // For now, just simulate a successful submission
    setTimeout(() => {
      setStatus('success');
      setEmail('');

      // Reset status after 5 seconds
      setTimeout(() => {
        setStatus('idle');
      }, 5000);
    }, 1000);
  };

  return (
    <div className="w-full bg-orange py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-8">
          {/* Email Icon */}
          <div className="flex-shrink-0">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 sm:h-20 sm:w-20">
              <HiOutlineMail className="h-8 w-8 text-white sm:h-10 sm:w-10" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 text-center sm:text-left">
            <h3 className="mb-2 text-2xl font-medium uppercase tracking-wide text-white sm:text-3xl">
              {content.heading}
            </h3>
            <p className="mb-6 text-lg uppercase tracking-wide text-white/90 sm:text-xl">
              {content.subheading}
            </p>

            {/* Form */}
            {status === 'success' ? (
              <div className="rounded-lg bg-white/20 px-4 py-3 text-white">
                {content.successMessage || 'Thank you for subscribing!'}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={content.placeholder}
                  className="flex-1 rounded-full border-2 border-white/30 bg-white/10 px-6 py-3 text-white placeholder:text-white/60 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50"
                  disabled={status === 'loading'}
                  required
                />
                <button
                  type="submit"
                  className="btn btn-primary whitespace-nowrap"
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? 'Subscribing...' : content.buttonText}
                </button>
              </form>
            )}

            {status === 'error' && (
              <p className="mt-2 text-sm text-white/90">
                {content.errorMessage || 'Please enter a valid email address.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
