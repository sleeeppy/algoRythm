type MentionProps = {
  href: string;
  label: string;
};

export function Mention({ href, label }: MentionProps) {
  return (
    <a className="mention press" href={href} target="_blank" rel="noreferrer">
      <svg className="mention-icon" viewBox="0 0 16 16" aria-hidden="true">
        <rect x="2.25" y="1.75" width="11.5" height="12.5" rx="2" />
        <path d="M5 6h6M5 8.5h6M5 11h4" />
      </svg>
      {label}
    </a>
  );
}
