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

  const triggerTransition = useCallback((nextTheme: ThemeMode, x: number, y: number) => {
    const root = document.documentElement;
    const updateDOM = () => {
      root.setAttribute('data-theme', nextTheme);
      document.body?.setAttribute('data-theme', nextTheme);
      try {
        localStorage.setItem('rivet-theme-mode', nextTheme);
      } catch {}
      window.dispatchEvent(new CustomEvent('rivet:theme-change', { detail: { theme: nextTheme } }));
    };

    if ('startViewTransition' in document && typeof (document as any).startViewTransition === 'function') {
      const radius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      root.style.setProperty('--toggle-x', `${x}px`);
      root.style.setProperty('--toggle-y', `${y}px`);
      root.style.setProperty('--toggle-radius', `${radius}px`);

      (document as any).startViewTransition(() => {
        updateDOM();
      });
    } else {
      // Fallback for browsers without View Transitions API
      root.classList.add('theme-transition');
      updateDOM();
      setTimeout(() => {
        root.classList.remove('theme-transition');
      }, 450);
    }
  }, []);

  const toggleTheme = (e?: React.MouseEvent | React.KeyboardEvent) => {
    const nextTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    
    if (e && 'clientX' in e) {
      x = (e as React.MouseEvent).clientX;
      y = (e as React.MouseEvent).clientY;
    }

    setTheme(nextTheme);
    triggerTransition(nextTheme, x, y);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggleTheme(e);
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
