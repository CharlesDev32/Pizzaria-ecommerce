import { StoreSettings } from '../types/settings.types';
import { apiRequest } from './client';

function apiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';
}

export const settingsApi = {
  get: () => apiRequest<StoreSettings>('/settings'),
  update: (payload: Partial<StoreSettings>) =>
    apiRequest<StoreSettings>('/settings', { method: 'PATCH', body: JSON.stringify(payload) }),
  uploadImage: async (file: File, token: string): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${apiUrl()}/settings/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `HTTP ${response.status}`);
    }
    return response.json();
  },
};
