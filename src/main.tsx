import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { readTheme, ThemeProvider } from "./theme.tsx";
import "@fontsource-variable/jetbrains-mono";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./index.css";

document.documentElement.dataset.theme = readTheme();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
