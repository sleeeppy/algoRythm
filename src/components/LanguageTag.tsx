type LanguageTagProps = {
  lang: string;
};

export function LanguageTag({ lang }: LanguageTagProps) {
  return <span className="tag">{lang}</span>;
}
