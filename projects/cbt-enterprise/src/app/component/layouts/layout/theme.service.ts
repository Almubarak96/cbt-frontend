// theme.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface Theme {
  name: string;
  displayName: string;
  properties: {
    '--primary-color': string;
    '--secondary-color': string;
    '--accent-color': string;
    '--background-color': string;
    '--surface-color': string;
    '--text-primary': string;
    '--text-secondary': string;
    '--sidebar-gradient': string;
    '--navbar-bg': string;
    '--card-bg': string;
    '--border-color': string;
    '--shadow-color': string;
    '--success-color': string;
    '--warning-color': string;
    '--error-color': string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentThemeSubject: BehaviorSubject<Theme>;
  public currentTheme$: Observable<Theme>;

  private readonly THEME_KEY = 'admin-panel-theme';
  private readonly DARK_MODE_KEY = 'admin-panel-dark-mode';

  private themes: Theme[] = [
    {
      name: 'blue-ocean',
      displayName: 'Blue Ocean',
      properties: {
        '--primary-color': '#0d6efd',
        '--secondary-color': '#6c757d',
        '--accent-color': '#ff6b35',
        '--background-color': '#f8f9fa',
        '--surface-color': '#ffffff',
        '--text-primary': '#212529',
        '--text-secondary': '#6c757d',
        '--sidebar-gradient': 'linear-gradient(135deg, #0d6efd 0%, #2565d1 50%, #3a7bdb 100%)',
        '--navbar-bg': '#0d6efd',
        '--card-bg': '#ffffff',
        '--border-color': '#dee2e6',
        '--shadow-color': 'rgba(0,0,0,0.1)',
        '--success-color': '#198754',
        '--warning-color': '#ffc107',
        '--error-color': '#dc3545'
      }
    },
    {
      name: 'deep-purple',
      displayName: 'Deep Purple',
      properties: {
        '--primary-color': '#6f42c1',
        '--secondary-color': '#e83e8c',
        '--accent-color': '#20c997',
        '--background-color': '#f8f9fa',
        '--surface-color': '#ffffff',
        '--text-primary': '#212529',
        '--text-secondary': '#6c757d',
        '--sidebar-gradient': 'linear-gradient(135deg, #6f42c1 0%, #5a32a3 50%, #8b5dd9 100%)',
        '--navbar-bg': '#6f42c1',
        '--card-bg': '#ffffff',
        '--border-color': '#dee2e6',
        '--shadow-color': 'rgba(0,0,0,0.1)',
        '--success-color': '#198754',
        '--warning-color': '#ffc107',
        '--error-color': '#dc3545'
      }
    },
    {
      name: 'emerald-green',
      displayName: 'Emerald Green',
      properties: {
        '--primary-color': '#198754',
        '--secondary-color': '#fd7e14',
        '--accent-color': '#0dcaf0',
        '--background-color': '#f8f9fa',
        '--surface-color': '#ffffff',
        '--text-primary': '#212529',
        '--text-secondary': '#6c757d',
        '--sidebar-gradient': 'linear-gradient(135deg, #198754 0%, #146c43 50%, #20c997 100%)',
        '--navbar-bg': '#198754',
        '--card-bg': '#ffffff',
        '--border-color': '#dee2e6',
        '--shadow-color': 'rgba(0,0,0,0.1)',
        '--success-color': '#198754',
        '--warning-color': '#ffc107',
        '--error-color': '#dc3545'
      }
    },
    {
      name: 'sunset-orange',
      displayName: 'Sunset Orange',
      properties: {
        '--primary-color': '#fd7e14',
        '--secondary-color': '#6f42c1',
        '--accent-color': '#0dcaf0',
        '--background-color': '#f8f9fa',
        '--surface-color': '#ffffff',
        '--text-primary': '#212529',
        '--text-secondary': '#6c757d',
        '--sidebar-gradient': 'linear-gradient(135deg, #fd7e14 0%, #e56f0c 50%, #ff922b 100%)',
        '--navbar-bg': '#fd7e14',
        '--card-bg': '#ffffff',
        '--border-color': '#dee2e6',
        '--shadow-color': 'rgba(0,0,0,0.1)',
        '--success-color': '#198754',
        '--warning-color': '#ffc107',
        '--error-color': '#dc3545'
      }
    }
  ];

  private darkThemes: Theme[] = [
    {
      name: 'dark-blue',
      displayName: 'Dark Blue',
      properties: {
        '--primary-color': '#3a7bdb',
        '--secondary-color': '#6c757d',
        '--accent-color': '#ff6b35',
        '--background-color': '#1a1d23',
        '--surface-color': '#2d3239',
        '--text-primary': '#e9ecef',
        '--text-secondary': '#adb5bd',
        '--sidebar-gradient': 'linear-gradient(135deg, #1e2a3a 0%, #2d3d5e 50%, #3a4d75 100%)',
        '--navbar-bg': '#1e2a3a',
        '--card-bg': '#2d3239',
        '--border-color': '#495057',
        '--shadow-color': 'rgba(0,0,0,0.3)',
        '--success-color': '#20c997',
        '--warning-color': '#ffd43b',
        '--error-color': '#ff6b6b'
      }
    },
    {
      name: 'dark-purple',
      displayName: 'Dark Purple',
      properties: {
        '--primary-color': '#8b5dd9',
        '--secondary-color': '#e83e8c',
        '--accent-color': '#20c997',
        '--background-color': '#1a1b23',
        '--surface-color': '#2d2e39',
        '--text-primary': '#e9ecef',
        '--text-secondary': '#adb5bd',
        '--sidebar-gradient': 'linear-gradient(135deg, #2d1b69 0%, #4a2a9c 50%, #6f42c1 100%)',
        '--navbar-bg': '#2d1b69',
        '--card-bg': '#2d2e39',
        '--border-color': '#495057',
        '--shadow-color': 'rgba(0,0,0,0.3)',
        '--success-color': '#20c997',
        '--warning-color': '#ffd43b',
        '--error-color': '#ff6b6b'
      }
    }
  ];

  private isDarkMode = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    const savedTheme = this.getSavedTheme();
    this.currentThemeSubject = new BehaviorSubject<Theme>(savedTheme);
    this.currentTheme$ = this.currentThemeSubject.asObservable();
    this.applyTheme(savedTheme);
  }

  getThemes(): Theme[] {
    return this.isDarkMode ? this.darkThemes : this.themes;
  }

  getAllThemes(): Theme[] {
    return [...this.themes, ...this.darkThemes];
  }

  setTheme(themeName: string): void {
    const theme = this.getAllThemes().find(t => t.name === themeName);
    if (theme) {
      this.currentThemeSubject.next(theme);
      this.applyTheme(theme);
      this.saveTheme(theme);
    }
  }

  getCurrentTheme(): Theme {
    return this.currentThemeSubject.value;
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.DARK_MODE_KEY, this.isDarkMode.toString());
    }
    
    // Switch to a dark theme if currently in light mode, or vice versa
    const currentTheme = this.getCurrentTheme();
    const newThemes = this.isDarkMode ? this.darkThemes : this.themes;
    const equivalentTheme = newThemes.find(t => 
      t.name.includes(currentTheme.name.split('-').slice(1).join('-')) ||
      newThemes.some(nt => nt.displayName === currentTheme.displayName)
    ) || newThemes[0];
    
    this.setTheme(equivalentTheme.name);
  }

  isDarkModeEnabled(): boolean {
    return this.isDarkMode;
  }

  private applyTheme(theme: Theme): void {
    if (isPlatformBrowser(this.platformId)) {
      const root = document.documentElement;
      Object.entries(theme.properties).forEach(([property, value]) => {
        root.style.setProperty(property, value);
      });
    }
  }

  private getSavedTheme(): Theme {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem(this.THEME_KEY);
      const darkMode = localStorage.getItem(this.DARK_MODE_KEY) === 'true';
      this.isDarkMode = darkMode;
      
      if (saved) {
        const theme = this.getAllThemes().find(t => t.name === saved);
        if (theme) return theme;
      }
    }
    return this.themes[0];
  }

  private saveTheme(theme: Theme): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.THEME_KEY, theme.name);
    }
  }
}