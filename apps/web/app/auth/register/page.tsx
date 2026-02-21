'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { authApi, registerSchema } from '@pizza/shared';
import { UtensilsCrossed } from 'lucide-react';
import { t } from '@/lib/i18n';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  const form = useForm<{ name: string; email: string; password: string }>();

  const onSubmit = form.handleSubmit(async (values) => {
    setError('');
    try {
      registerSchema.parse(values);
      await authApi.register(values);
      router.push('/auth/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : t.auth_error_register);
    }
  });

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-5 card-surface p-8">
      <div className="flex flex-col items-center gap-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-brand bg-brand-red/20 text-brand-yellow">
          <UtensilsCrossed size={24} />
        </div>
        <p className="font-brand text-5xl text-brand-white">{t.brand_name}</p>
        <h1 className="text-xs font-heading uppercase tracking-[0.2em] text-brand-gray">{t.auth_register_title}</h1>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-brand-gray">{t.auth_name}</label>
        <input className="w-full rounded-md border border-brand bg-brand-navy px-3 py-2" placeholder="Seu nome" {...form.register('name')} />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-brand-gray">{t.auth_email}</label>
        <input className="w-full rounded-md border border-brand bg-brand-navy px-3 py-2" placeholder="seu@email.com" {...form.register('email')} />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-brand-gray">{t.auth_password}</label>
        <input type="password" className="w-full rounded-md border border-brand bg-brand-navy px-3 py-2" placeholder="••••••••" {...form.register('password')} />
      </div>
      {error && <p className="text-sm text-red-300">{error}</p>}
      <button className="w-full rounded-full bg-brand-red px-4 py-3 text-xs font-heading uppercase tracking-[0.16em] text-brand-white hover:bg-brand-red2 transition-colors" type="submit">
        {t.auth_register_button}
      </button>
      <p className="text-center text-sm text-brand-gray">
        {t.auth_has_account}{' '}
        <Link href="/auth/login" className="text-brand-yellow hover:underline">{t.auth_login_link}</Link>
      </p>
    </form>
  );
}
