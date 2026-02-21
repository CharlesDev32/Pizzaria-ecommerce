export function PromoBadge({ text }: { text: string }) {
  return <span className="rounded-full bg-brand-yellow px-2 py-1 text-xs font-semibold text-brand-navy">{text}</span>;
}