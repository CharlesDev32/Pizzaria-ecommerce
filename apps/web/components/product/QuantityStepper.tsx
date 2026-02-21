export function QuantityStepper({ value, onChange }: { value: number; onChange: (next: number) => void }) {
  return (
    <div className="inline-flex items-center rounded-md border border-brand">
      <button className="px-3 py-1" onClick={() => onChange(Math.max(1, value - 1))} aria-label="Decrease quantity">-</button>
      <span className="px-3 py-1">{value}</span>
      <button className="px-3 py-1" onClick={() => onChange(value + 1)} aria-label="Increase quantity">+</button>
    </div>
  );
}