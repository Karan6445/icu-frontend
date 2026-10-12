import { useState, useEffect } from 'react';

export function useDarkMode() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('icu_theme');
    if (saved) return saved === 'dark';
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('icu_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('icu_theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ isDark: boolean }>;
      if (customEvent.detail && customEvent.detail.isDark !== isDark) {
        setIsDark(customEvent.detail.isDark);
      }
    };
    window.addEventListener('icu_theme_change', handleThemeChange);
    return () => window.removeEventListener('icu_theme_change', handleThemeChange);
  }, [isDark]);

  const toggleDarkMode = () => {
    setIsDark(prev => {
      const next = !prev;
      window.dispatchEvent(new CustomEvent('icu_theme_change', { detail: { isDark: next } }));
      return next;
    });
  };

  return { isDark, toggleDarkMode, setIsDark };
}

