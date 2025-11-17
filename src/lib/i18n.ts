import { useState, useEffect } from 'react';

type Locale = 'en' | 'vi';

interface Translations {
    [key: string]: any;
}

// Cache for loaded translations
const translationCache: Record<Locale, Translations> = {
    en: {},
    vi: {}
};

// Default locale - Set to English
const DEFAULT_LOCALE: Locale = 'en';

// Get locale from localStorage or default
export const getStoredLocale = (): Locale => {
    if (typeof window === 'undefined') return DEFAULT_LOCALE;

    const stored = localStorage.getItem('locale') as Locale | null;
    return stored || DEFAULT_LOCALE;
};

// Set locale to localStorage
export const setStoredLocale = (locale: Locale): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('locale', locale);
};

// Force reset to default locale (English)
export const resetToDefaultLocale = (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('locale');
    // Clear translation cache to force reload
    translationCache.en = {};
    translationCache.vi = {};
};

// Load translations from JSON file
const loadTranslations = async (locale: Locale): Promise<Translations> => {
    if (translationCache[locale] && Object.keys(translationCache[locale]).length > 0) {
        return translationCache[locale];
    }

    try {
        const response = await fetch(`/locales/${locale}.json`);
        if (!response.ok) {
            throw new Error(`Failed to load ${locale} translations`);
        }

        const translations = await response.json();
        translationCache[locale] = translations;
        return translations;
    } catch (error) {
        console.error(`Error loading translations for ${locale}:`, error);
        // Fallback to default locale if current locale fails
        if (locale !== DEFAULT_LOCALE) {
            return loadTranslations(DEFAULT_LOCALE);
        }
        return {};
    }
};

// Get nested value from object using dot notation
const getNestedValue = (obj: any, path: string): string => {
    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
        if (current && typeof current === 'object' && key in current) {
            current = current[key];
        } else {
            // If key not found, return the original path
            return path;
        }
    }

    return typeof current === 'string' ? current : path;
};

// Translation function
export const t = (key: string, locale?: Locale): string => {
    const currentLocale = locale || getStoredLocale();
    const translations = translationCache[currentLocale];

    if (!translations || Object.keys(translations).length === 0) {
        // If translations not loaded yet, return the key
        console.log('Translations not loaded for locale:', currentLocale);
        return key;
    }

    const result = getNestedValue(translations, key);
    if (result === key) {
        console.log('Translation not found for key:', key, 'in locale:', currentLocale);
        console.log('Available keys:', Object.keys(translations));
    }
    return result;
};

// Hook for using translations in components
export const useTranslations = (locale?: Locale) => {
    const [currentLocale, setCurrentLocale] = useState<Locale>(locale || getStoredLocale());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadTranslationsForLocale = async () => {
            setIsLoading(true);
            await loadTranslations(currentLocale);
            setIsLoading(false);
        };

        loadTranslationsForLocale();
    }, [currentLocale]);

    const changeLocale = (newLocale: Locale) => {
        setCurrentLocale(newLocale);
        setStoredLocale(newLocale);
    };

    const translate = (key: string) => t(key, currentLocale);

    return {
        t: translate,
        locale: currentLocale,
        changeLocale,
        isLoading
    };
};

// Initialize translations on app start
export const initializeTranslations = async (locale: Locale = getStoredLocale()) => {
    await loadTranslations(locale);
};
