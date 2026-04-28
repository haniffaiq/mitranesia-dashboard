import * as React from "react";

type Theme = "light" | "dark" | "system";

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolved: "light" | "dark";
};

const STORAGE_KEY = "mitranesia-theme";

const ThemeProviderContext = React.createContext<ThemeProviderState | null>(null);

function applyDocumentTheme(theme: Theme): "light" | "dark" {
  const root = window.document.documentElement;
  root.classList.remove("light", "dark");
  let next: "light" | "dark";
  if (theme === "system") {
    next = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } else {
    next = theme;
  }
  root.classList.add(next);
  return next;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
}) {
  const [theme, setThemeState] = React.useState<Theme>(() => {
    if (typeof window === "undefined") return defaultTheme;
    return (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? defaultTheme;
  });
  const [resolved, setResolved] = React.useState<"light" | "dark">("light");

  React.useEffect(() => {
    setResolved(applyDocumentTheme(theme));
  }, [theme]);

  React.useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setResolved(applyDocumentTheme("system"));
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  const setTheme = React.useCallback((next: Theme) => {
    localStorage.setItem(STORAGE_KEY, next);
    setThemeState(next);
  }, []);

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme, resolved }}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export function useTheme() {
  const ctx = React.useContext(ThemeProviderContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
