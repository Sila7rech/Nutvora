"use client";

import { Check, ChevronDown, Globe2, Moon, Sun } from "lucide-react";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import fr from "@/locales/fr/common.json";
import en from "@/locales/en/common.json";
import ar from "@/locales/ar/common.json";

export type Locale = "fr" | "en" | "ar";
export type Theme = "light" | "dark";
const dictionaries = { fr, en, ar } as const;
const localeNames: Record<Locale, string> = { fr: "FR", en: "EN", ar: "AR" };
const localeLabels: Record<Locale, string> = { fr: "Français", en: "English", ar: "العربية" };
const localeFlags: Record<Locale, string> = { fr: "🇫🇷", en: "🇬🇧", ar: "🇹🇳" };
const locales: Locale[] = ["fr", "en", "ar"];

type PreferencesContextValue = { locale: Locale; theme: Theme; setLocale: (locale: Locale) => void; setTheme: (theme: Theme) => void; t: (key: string) => string; localeNames: typeof localeNames; localeLabels: typeof localeLabels };
const PreferencesContext = createContext<PreferencesContextValue | null>(null);

function readLocale(): Locale { if (typeof window === "undefined") return "fr"; const value = window.localStorage.getItem("nutvora-locale"); return value === "en" || value === "ar" ? value : "fr"; }
function readTheme(): Theme { if (typeof window === "undefined") return "light"; return window.localStorage.getItem("nutvora-theme") === "dark" ? "dark" : "light"; }
function getValue(source: unknown, path: string): string { return path.split(".").reduce<unknown>((value, part) => value && typeof value === "object" ? (value as Record<string, unknown>)[part] : undefined, source) as string || path; }

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fr");
  const [theme, setThemeState] = useState<Theme>("light");
  const setLocale = (next: Locale) => { setLocaleState(next); window.localStorage.setItem("nutvora-locale", next); document.cookie = `nutvora-locale=${next};path=/;max-age=31536000`; };
  const setTheme = (next: Theme) => { setThemeState(next); window.localStorage.setItem("nutvora-theme", next); };
  useEffect(() => { const timer = window.setTimeout(() => { setLocaleState(readLocale()); setThemeState(readTheme()); }, 0); return () => window.clearTimeout(timer); }, []);
  useEffect(() => { document.documentElement.lang = locale; document.documentElement.dir = locale === "ar" ? "rtl" : "ltr"; document.documentElement.dataset.theme = theme; }, [locale, theme]);
  const value = useMemo(() => ({ locale, theme, setLocale, setTheme, t: (key: string) => getValue(dictionaries[locale], key), localeNames, localeLabels }), [locale, theme]);
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}
export function usePreferences() { const value = useContext(PreferencesContext); if (!value) throw new Error("usePreferences must be used inside PreferencesProvider"); return value; }

export function PreferencesMenu() {
  const { locale, theme, setLocale, setTheme, t, localeLabels } = usePreferences();
  const pathname = usePathname(); const router = useRouter();
  const [languageOpen, setLanguageOpen] = useState(false);
  const languageRef = useRef<HTMLDivElement>(null);
  const firstOptionRef = useRef<HTMLButtonElement>(null);
  function changeLocale(next: Locale) { setLocale(next); setLanguageOpen(false); const cleanPath = pathname.replace(/^\/(fr|en|ar)(?=\/|$)/, "") || "/"; router.push(`/${next}${cleanPath === "/" ? "" : cleanPath}`); }
  useEffect(() => {
    function closeOnOutside(event: MouseEvent) { if (!languageRef.current?.contains(event.target as Node)) setLanguageOpen(false); }
    function closeOnEscape(event: KeyboardEvent) { if (event.key === "Escape") setLanguageOpen(false); }
    document.addEventListener("mousedown", closeOnOutside); document.addEventListener("keydown", closeOnEscape);
    return () => { document.removeEventListener("mousedown", closeOnOutside); document.removeEventListener("keydown", closeOnEscape); };
  }, []);
  function toggleLanguage() { setLanguageOpen((open) => !open); }
  function handleLanguageKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) { if ((event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") && !languageOpen) { event.preventDefault(); setLanguageOpen(true); window.setTimeout(() => firstOptionRef.current?.focus(), 0); } }
  return <div className="preferences-menu" aria-label={t("preferences.chooseLanguage")}><div className="language-picker" ref={languageRef}><button className="language-trigger" type="button" aria-label={`${t("preferences.chooseLanguage")}: ${localeLabels[locale]}`} aria-haspopup="menu" aria-expanded={languageOpen} onClick={toggleLanguage} onKeyDown={handleLanguageKeyDown}><Globe2 size={16} aria-hidden="true" /><span>{localeLabels[locale]}</span><ChevronDown className="language-chevron" size={14} aria-hidden="true" /></button>{languageOpen && <div className="language-dropdown" role="menu">{locales.map((item, index) => <button className="language-option" type="button" role="menuitem" key={item} ref={index === 0 ? firstOptionRef : undefined} onClick={() => changeLocale(item)} onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); setLanguageOpen(false); } }}><span aria-hidden="true">{localeFlags[item]}</span><span>{localeLabels[item]}</span>{locale === item && <Check size={14} aria-label="Selected" />}</button>)}</div>}</div><button className="theme-toggle" type="button" aria-label={`${t("preferences.appearance")}: ${theme === "light" ? t("preferences.light") : t("preferences.dark")}`} aria-pressed={theme === "dark"} onClick={() => setTheme(theme === "light" ? "dark" : "light")}><Sun className="theme-sun" size={15} aria-hidden="true" /><span className="theme-track" aria-hidden="true"><span className="theme-knob" /></span><Moon className="theme-moon" size={15} aria-hidden="true" /></button></div>;
}
