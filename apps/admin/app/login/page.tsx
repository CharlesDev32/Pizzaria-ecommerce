'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@pizza/shared';
import { useAdminAuthStore } from '@/store/admin-auth.store';
import { UtensilsCrossed } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const setTokens = useAdminAuthStore((s) => s.setTokens);
  const [email, setEmail] = useState('admin@pizzainpizza.local');
  const [password, setPassword] = useState('Admin123!');
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const tokens = await authApi.login({ email, password });
      setTokens(tokens.accessToken, tokens.refreshToken);
      router.push('/dashboard');
    } catch {
      setError('E-mail ou senha incorretos.');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-md space-y-5 card-surface p-8">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-brand bg-brand-red/20 text-brand-yellow">
            <UtensilsCrossed size={24} />
          </div>
          <h1 className="font-brand text-5xl text-brand-white">Sabor Express</h1>
          <p className="text-[10px] font-heading uppercase tracking-[0.24em] text-brand-gray">painel administrativo</p>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-brand-gray">E-mail</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border border-brand bg-brand-navy px-3 py-2" placeholder="admin@email.com" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-brand-gray">Senha</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="w-full rounded-md border border-brand bg-brand-navy px-3 py-2" placeholder="••••••••" />
        </div>
        {error && <p className="text-sm text-red-300">{error}</p>}
        <button className="w-full rounded-full bg-brand-red px-4 py-3 text-xs font-heading uppercase tracking-[0.16em] text-brand-white hover:bg-brand-red2 transition-colors" type="submit">
          Entrar
        </button>
      </form>
    </div>
  );
}
