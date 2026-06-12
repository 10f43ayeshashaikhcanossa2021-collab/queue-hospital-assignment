import { useEffect, useState } from 'react';

function useTheme() {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('queue-cure-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    const stored = localStorage.getItem('queue-cure-theme');
    if (stored) {
      setDarkMode(stored === 'dark');
    }
  }, []);

  return { darkMode, setDarkMode };
}

export default useTheme;