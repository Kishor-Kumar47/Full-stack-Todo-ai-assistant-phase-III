import React from 'react';

export default function HeroSection() {
  return (
    <div className="text-center py-16 md:py-24">
      <h1 className="text-4xl md:text-6xl font-bold text-secondary mb-6">
        Manage Your Tasks Effortlessly
      </h1>
      <p className="text-xl text-muted mb-8 max-w-2xl mx-auto">
        A beautiful and secure todo application that helps you stay organized and productive.
        Sign up today to start managing your tasks with ease.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <a
          href="/auth/signup"
          className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300 shadow-lg hover:shadow-xl"
        >
          Get Started
        </a>
        <a
          href="/auth/login"
          className="bg-transparent hover:bg-dark-700 text-secondary font-semibold py-3 px-8 rounded-lg border border-dark-600 transition-colors duration-300"
        >
          Sign In
        </a>
      </div>
    </div>
  );
}