export function AdminTable<T extends object>({
  rows,
  columns,
}: {
  rows: T[];
  columns: Array<{ key: keyof T; label: string }>;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-brand">
      <table className="w-full text-left text-sm">
        <thead className="bg-brand-navy2">
          <tr>{columns.map((c) => <th key={String(c.key)} className="px-3 py-2">{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-brand">
              {columns.map((c) => <td key={String(c.key)} className="px-3 py-2">{String(row[c.key] ?? '')}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
