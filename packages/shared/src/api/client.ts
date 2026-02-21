export interface TokenState {
  accessToken: string | null;
  refreshToken: string | null;
}

export type TokenGetter = () => TokenState;
export type TokenSetter = (tokens: TokenState) => void;
export type LogoutHandler = () => void;

let getTokensRef: TokenGetter | null = null;
let setTokensRef: TokenSetter | null = null;
let onLogoutRef: LogoutHandler | null = null;

let refreshingPromise: Promise<void> | null = null;

export function registerTokenHandlers(getter: TokenGetter, setter: TokenSetter, onLogout: LogoutHandler): void {
  getTokensRef = getter;
  setTokensRef = setter;
  onLogoutRef = onLogout;
}

function apiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';
}

async function refreshTokenFlow(): Promise<void> {
  if (!getTokensRef || !setTokensRef) return;
  const state = getTokensRef();
  if (!state.refreshToken) {
    onLogoutRef?.();
    return;
  }

  const response = await fetch(`${apiUrl()}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: state.refreshToken }),
  });

  if (!response.ok) {
    onLogoutRef?.();
    throw new Error('Refresh token failed');
  }

  const data = (await response.json()) as { accessToken: string; refreshToken: string };
  setTokensRef({ accessToken: data.accessToken, refreshToken: data.refreshToken });
}

export async function apiRequest<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers ?? {});
  headers.set('Content-Type', headers.get('Content-Type') ?? 'application/json');

  const token = getTokensRef?.().accessToken;
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${apiUrl()}${path}`, { ...init, headers });

  if (response.status === 401 && retry && path !== '/auth/refresh') {
    if (!refreshingPromise) {
      refreshingPromise = refreshTokenFlow().finally(() => {
        refreshingPromise = null;
      });
    }
    await refreshingPromise;
    return apiRequest<T>(path, init, false);
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}`);
  }

  return (await response.json()) as T;
}
