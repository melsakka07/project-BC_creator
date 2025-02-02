import React from 'react';
import { Brain, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

export default function Header({ theme, onThemeToggle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-white/70 dark:bg-neutral-900/70 
      border-b border-neutral-200 dark:border-neutral-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-secondary-400 
                rounded-lg blur-lg opacity-30 animate-pulse"></div>
              <Brain className="h-8 w-8 sm:h-10 sm:w-10 text-primary-600 dark:text-primary-400 
                relative animate-float" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary-600 
                to-secondary-600 dark:from-primary-400 dark:to-secondary-400 
                bg-clip-text text-transparent">
                Business Case Generator
              </h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                AI-Powered Business Analysis
              </p>
            </div>
          </div>

          <button
            onClick={onThemeToggle}
            className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 
              hover:bg-neutral-200 dark:hover:bg-neutral-700
              focus:outline-none focus:ring-2 focus:ring-primary-500 
              dark:focus:ring-primary-400 transition-all duration-200
              group relative overflow-hidden"
            aria-label="Toggle theme"
          >
            <div className="relative z-10 transition-transform duration-500 
              ease-in-out transform group-hover:scale-110">
              {theme === 'light' ? (
                <Moon className="h-5 w-5 text-neutral-700 dark:text-neutral-200" />
              ) : (
                <Sun className="h-5 w-5 text-neutral-200" />
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-primary-400/10 
              to-secondary-400/10 dark:from-primary-400/5 dark:to-secondary-400/5 
              transform scale-x-0 group-hover:scale-x-100 transition-transform 
              duration-500 ease-out origin-left"></div>
          </button>
        </div>
      </div>
    </header>
  );
} 