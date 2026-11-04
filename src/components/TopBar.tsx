import { useTheme } from "../theme.tsx";

type TopBarProps = {
  backLabel?: string;
  onBack?: () => void;
};

export function TopBar({ backLabel, onBack }: TopBarProps) {
  const { theme, toggle } = useTheme();

  return (
    <header className="bar">
      <div className="bar-row">
        {onBack ? (
          <button type="button" className="back press" onClick={onBack}>
            {backLabel}
          </button>
        ) : (
          <span className="brand">AlgoRythm</span>
        )}
        <button type="button" className="theme-toggle press" onClick={toggle}>
          {theme === "dark" ? "라이트" : "다크"}
        </button>
      </div>
    </header>
  );
}
