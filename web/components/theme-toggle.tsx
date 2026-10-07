'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Sun, Moon } from 'lucide-react';
import s from './theme-toggle.module.css';

export type ThemeMode = 'light' | 'dark';

export function ThemeToggle({ className, showLabel = true }: { className?: string; showLabel?: boolean }) {
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('rivet-theme-mode') as ThemeMode | null;
    let initialTheme: ThemeMode = 'light';

    if (saved === 'dark' || saved === 'light') {
      initialTheme = saved;
    } else if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      initialTheme = 'dark';
    }

    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
    document.body?.setAttribute('data-theme', initialTheme);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'rivet-theme-mode' && (e.newValue === 'dark' || e.newValue === 'light')) {
        setTheme(e.newValue);
        document.documentElement.setAttribute('data-theme', e.newValue);
        document.body?.setAttribute('data-theme', e.newValue);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const triggerTransition = useCallback((nextTheme: ThemeMode) => {
    // Add smooth transition class to document root
    const root = document.documentElement;
    root.classList.add('theme-transition');

    const updateDOM = () => {
      root.setAttribute('data-theme', nextTheme);
      document.body?.setAttribute('data-theme', nextTheme);
      try {
        localStorage.setItem('rivet-theme-mode', nextTheme);
      } catch {}
      window.dispatchEvent(new CustomEvent('rivet:theme-change', { detail: { theme: nextTheme } }));
    };

    // Use View Transitions API if supported for fluid visual blend
    if ('startViewTransition' in document && typeof (document as any).startViewTransition === 'function') {
      (document as any).startViewTransition(() => {
        updateDOM();
      });
    } else {
      updateDOM();
    }

    // Clean up transition class after animation completes
    setTimeout(() => {
      root.classList.remove('theme-transition');
    }, 450);
  }, []);

  const toggleTheme = () => {
    const nextTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    triggerTransition(nextTheme);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggleTheme();
    }
  };

  if (!mounted) {
    return (
      <div
        className={`${s.toggleContainer} ${className || ''}`}
        style={{ width: showLabel ? '120px' : '64px', height: '36px', opacity: 0 }}
        aria-hidden="true"
      />
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`${s.toggleContainer} ${className || ''}`}
      onClick={toggleTheme}
      onKeyDown={handleKeyDown}
      title={`Active: ${isDark ? 'Dark mode' : 'Light mode'} (Click to toggle)`}
      data-testid="dark-mode-toggle"
    >
      <div className={s.track}>
        {/* Animated sliding thumb */}
        <div className={`${s.thumb} ${isDark ? s.thumbDark : ''}`}>
          {isDark ? (
            <Moon size={14} className={s.moonIcon} aria-hidden="true" />
          ) : (
            <Sun size={14} className={s.sunIcon} aria-hidden="true" />
          )}
        </div>

        {/* Track icons */}
        <div className={`${s.iconSlot} ${!isDark ? s.iconSlotActive : ''}`}>
          <Sun size={13} aria-hidden="true" />
        </div>
        <div className={`${s.iconSlot} ${isDark ? s.iconSlotActive : ''}`}>
          <Moon size={13} aria-hidden="true" />
        </div>
      </div>

      {showLabel && (
        <span className={s.label}>
          {isDark ? 'Dark' : 'Light'}
        </span>
      )}
    </button>
  );
}
