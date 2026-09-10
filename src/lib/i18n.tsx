"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import fr from "@/locales/fr/common.json";
import en from "@/locales/en/common.json";
import ar from "@/locales/ar/common.json";

export type Locale = "fr" | "en" | "ar";
export type Theme = "light" | "dark";
const dictionaries = { fr, en, ar } as const;
const localeNames: Record<Locale, string> = { fr: "FR", en: "EN", ar: "AR" };
const localeLabels: Record<Locale, string> = { fr: "Français", en: "English", ar: "العربية" };

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
  const { locale, theme, setLocale, setTheme, t, localeNames, localeLabels } = usePreferences();
  const pathname = usePathname(); const router = useRouter();
  function changeLocale(next: Locale) { setLocale(next); const cleanPath = pathname.replace(/^\/(fr|en|ar)(?=\/|$)/, "") || "/"; router.push(`/${next}${cleanPath === "/" ? "" : cleanPath}`); }
  return <div className="preferences-menu" aria-label={t("preferences.chooseLanguage")}><label><span>{t("preferences.language")}</span><select value={locale} onChange={(event) => changeLocale(event.target.value as Locale)} aria-label={t("preferences.language")}>{Object.keys(localeNames).map((item) => <option value={item} key={item}>{localeNames[item as Locale]} · {localeLabels[item as Locale]}</option>)}</select></label><label><span>{t("preferences.appearance")}</span><select value={theme} onChange={(event) => setTheme(event.target.value as Theme)} aria-label={t("preferences.appearance")}><option value="light">☀ {t("preferences.light")}</option><option value="dark">☾ {t("preferences.dark")}</option></select></label></div>;
}
