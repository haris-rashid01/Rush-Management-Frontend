// src/api/dua.ts

const API_BASE_URL = '/api/duas'; // Adjust based on your environment variable if needed

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
  const response = await fetch(API_BASE_URL);
  if (!response.ok) throw new Error('Failed to fetch duas');
  
  const result = await response.json();
  // Backend returns { success: true, data: [...] }
  return result.data || [];
};

export const addDua = async (dua: DuaData): Promise<DuaData> => {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dua),
  });

  if (!response.ok) throw new Error('Failed to create dua');
  
  const result = await response.json();
  return result.data;
};

export const deleteDua = async (id: string | number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) throw new Error('Failed to delete dua');
};