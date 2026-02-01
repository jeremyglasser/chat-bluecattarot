import { useState, useEffect } from "react";

export const ThemeToggle = () => {
    const [theme, setTheme] = useState<"light" | "dark">("dark");

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
        const initialTheme = savedTheme || "dark";
        setTheme(initialTheme);
        document.documentElement.setAttribute("data-theme", initialTheme);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        setTheme(newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
    };

    return (
        <button
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label="Toggle light mode"
        >
            {theme === "dark" ? (
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="5" />
                    <g>
                        <rect x="11" y="1" width="2" height="4" rx="1" />
                        <rect x="11" y="19" width="2" height="4" rx="1" />
                        <rect x="1" y="11" width="4" height="2" rx="1" />
                        <rect x="19" y="11" width="4" height="2" rx="1" />
                    </g>
                    <g transform="rotate(45 12 12)">
                        <rect x="11" y="1" width="2" height="4" rx="1" />
                        <rect x="11" y="19" width="2" height="4" rx="1" />
                        <rect x="1" y="11" width="4" height="2" rx="1" />
                        <rect x="19" y="11" width="4" height="2" rx="1" />
                    </g>
                </svg>
            ) : (
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
            )
            }
            <style jsx>{`
        .theme-toggle {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000;
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          color: var(--palette-primary);
          padding: 10px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px var(--shadow-color);
        }
        .theme-toggle:hover {
          transform: scale(1.1);
          border-color: var(--palette-secondary);
        }
        .theme-toggle svg {
          width: 24px;
          height: 24px;
        }
      `}</style>
        </button >
    );
};
