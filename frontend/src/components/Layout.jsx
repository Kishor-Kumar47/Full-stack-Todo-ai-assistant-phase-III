import React from 'react';
import Head from 'next/head';

export default function Layout({ children }) {
  return (
    <>
      <Head>
        <title>Todo App</title>
        <meta name="description" content="A simple todo application with authentication" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen bg-main flex flex-col">
        {/* Navigation */}
        <nav className="bg-dark-900 py-4 px-6 flex justify-between items-center">
          <div className="text-xl font-bold text-primary-500">TodoApp</div>
          <div className="flex space-x-4">
            <a href="/" className="text-secondary hover:text-primary-500 transition-colors">Home</a>
            <a href="/auth/login" className="text-secondary hover:text-primary-500 transition-colors">Login</a>
            <a href="/auth/signup" className="text-secondary hover:text-primary-500 transition-colors">Sign Up</a>
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-dark-900 py-6 px-6 text-center text-muted">
          <p>© 2026 TodoApp. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
}