import { createContext, useContext, useEffect, useState } from "react";

const SettingsContext = createContext(null);

const STORAGE_KEY = "timevolt_settings";

const DEFAULT_SETTINGS = {
  theme: "light",          // "light" | "dark"
  timeFormat: "24",        // "24" | "12"
  defaultSessionLength: 2, // hours, used to prefill Generate Timetable
};


// ============================================================
// LOAD / PERSIST
// ============================================================

function loadSettings() {

  try {

    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return DEFAULT_SETTINGS;
    }

    return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };

  } catch (err) {

    console.error("Failed to load settings:", err);
    return DEFAULT_SETTINGS;

  }

}


// ============================================================
// PROVIDER
// ============================================================

export function SettingsProvider({ children }) {

  const [settings, setSettings] = useState(loadSettings);

  // Apply the theme to <html data-theme="..."> so every stylesheet's
  // [data-theme="dark"] rules take effect app-wide, and persist
  // every change to localStorage.
  useEffect(() => {

    document.documentElement.setAttribute("data-theme", settings.theme);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (err) {
      console.error("Failed to save settings:", err);
    }

  }, [settings]);

  const setTheme = (theme) => {
    setSettings((previous) => ({ ...previous, theme }));
  };

  const setTimeFormat = (timeFormat) => {
    setSettings((previous) => ({ ...previous, timeFormat }));
  };

  const setDefaultSessionLength = (defaultSessionLength) => {
    setSettings((previous) => ({ ...previous, defaultSessionLength }));
  };

  return (
    <SettingsContext.Provider
      value={{
        ...settings,
        setTheme,
        setTimeFormat,
        setDefaultSessionLength,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );

}


// ============================================================
// HOOK
// ============================================================

export function useSettings() {

  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }

  return context;

}