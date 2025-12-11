// src/api/dua.ts

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL
    ? `${(import.meta as any).env.VITE_API_BASE_URL}/duas`
    : '/api/duas';

const authHeaders = () => {
  const token = localStorage.getItem('rushcorp_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface DuaData {
  id?: number | string;
  title: string;
  arabic?: string;
  transliteration?: string;
  translation?: string;
  category?: string;
  audioUrl?: string;
  views?: number;
  favorites?: number;
  status?: string;
}

export const getDuas = async (): Promise<DuaData[]> => {
  const response = await fetch(API_BASE, {
    headers: {
      ...authHeaders(),
    },
  });
  if (!response.ok) throw new Error('Failed to fetch duas');

  const result = await response.json();
  // Backend returns { success: true, data: [...] }
  return result.data || [];
};

export const addDua = async (dua: DuaData): Promise<DuaData> => {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(dua),
  });

  if (!response.ok) throw new Error('Failed to create dua');

  const result = await response.json();
  return result.data;
};

export const deleteDua = async (id: string | number): Promise<void> => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    headers: {
      ...authHeaders(),
    },
  });

  if (!response.ok) throw new Error('Failed to delete dua');
};