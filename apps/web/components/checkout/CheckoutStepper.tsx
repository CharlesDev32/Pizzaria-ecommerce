import { t } from '@/lib/i18n';

export function CheckoutStepper({ step }: { step: number }) {
  const labels = [t.checkout_step_address, t.checkout_step_delivery, t.checkout_step_payment, t.checkout_step_confirm];
  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
      {labels.map((label, index) => {
        const active = index + 1 <= step;
        return (
          <div key={label} className={`rounded-md border px-3 py-2 text-center text-sm ${active ? 'border-brand-yellow bg-brand-yellow/10 text-brand-yellow' : 'border-brand text-brand-gray'}`}>
            {label}
          </div>
        );
      })}
    </div>
  );
}
