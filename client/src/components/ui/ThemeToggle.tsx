import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

export function ThemeToggle() {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'system';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const applyTheme = (currentTheme) => {
            const updateDOM = () => {
                root.classList.remove('light', 'dark');
                if (currentTheme === 'system') {
                    const systemTheme = mediaQuery.matches ? 'dark' : 'light';
                    root.classList.add(systemTheme);
                } else {
                    root.classList.add(currentTheme);
                }
                localStorage.setItem('theme', currentTheme);
            };

            if (!document.startViewTransition) {
                updateDOM();
                return;
            }

            document.startViewTransition(() => updateDOM());
        };

        applyTheme(theme);

        const handleChange = () => {
            if (theme === 'system') {
                applyTheme('system');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    const cycleTheme = () => {
        setTheme((prev) => {
            if (prev === 'light') return 'dark';
            if (prev === 'dark') return 'system';
            return 'light';
        });
    };

    const getIcon = () => {
        if (theme === 'light') return <Sun className="w-4 h-4" />;
        if (theme === 'dark') return <Moon className="w-4 h-4" />;
        return <Monitor className="w-4 h-4" />;
    };

    const getLabel = () => {
        if (theme === 'light') return 'Light';
        if (theme === 'dark') return 'Dark';
        return 'System';
    };

    return (
        <button
            onClick={cycleTheme}
            className="btn-secondary flex items-center gap-2 px-3 py-2 transition-all duration-300"
            title={`Current theme: ${getLabel()}. Click to change.`}
        >
            {getIcon()}
            <span className="text-xs font-medium min-w-[50px] text-left">{getLabel()}</span>
        </button>
    );
}
