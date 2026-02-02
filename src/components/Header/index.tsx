import React, { useEffect, useState } from 'react';
import Logo from '../SVG/Logo';

export default function Header() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Sync with current document state on mount
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme) {
      setTheme(currentTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <header className="site-header">
      <div className="header-title">
        <Logo />
        <h1>
          <span>Micro</span> Documentation
        </h1>
      </div>

      <aside>
        <button
          onClick={toggleTheme}
          className="theme-toggle"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          style={{
            background: 'transparent',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--border-radius-sm)',
            padding: '6px 10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-main)'
          }}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </aside>

    </header>
  );
}
