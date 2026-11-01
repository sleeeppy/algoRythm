import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { runTransition } from "./transition.ts";

export type ThemeName = "light" | "dark";

type ThemeContextValue = {
  theme: ThemeName;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function readTheme(): ThemeName {
  try {
    const saved = localStorage.getItem("o-theme");
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    /* private mode */
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>(readTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("o-theme", theme);
    } catch {
      /* private mode */
    }
  }, [theme]);

  const toggle = () => {
    runTransition("fade", () => {
      setTheme((current) => {
        const next = current === "dark" ? "light" : "dark";
        document.documentElement.dataset.theme = next;
        try {
          localStorage.setItem("o-theme", next);
        } catch {
          /* private mode */
        }
        return next;
      });
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("ThemeProvider가 없습니다.");
  return value;
}
