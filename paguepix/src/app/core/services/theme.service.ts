import { Injectable, signal, effect } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private readonly THEME_KEY = 'paguepix-theme';
    theme = signal<'light' | 'dark'>(this.getInitialTheme());

    constructor() {
        effect(() => {
            const currentTheme = this.theme();
            localStorage.setItem(this.THEME_KEY, currentTheme);
            this.applyTheme(currentTheme);
        });
    }

    isDarkMode() {
        return this.theme() === 'dark';
    }

    toggleTheme() {
        this.theme.update(t => t === 'light' ? 'dark' : 'light');
    }

    setTheme(theme: 'light' | 'dark') {
        this.theme.set(theme);
    }

    private getInitialTheme(): 'light' | 'dark' {
        const saved = localStorage.getItem(this.THEME_KEY);
        if (saved === 'light' || saved === 'dark') return saved;

        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    private applyTheme(theme: 'light' | 'dark') {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }
}
