import axios from "axios";

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:3001/api";

export const getDocuments = async (params?: any, token?: string) => {
  const res = await axios.get(`${API_BASE}/documents`, {
    params,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data;
};

export const uploadDocument = async (formData: FormData, token?: string) => {
  const res = await axios.post(`${API_BASE}/documents`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return res.data;
};

export const deleteDocument = async (id: string, token?: string) => {
  const res = await axios.delete(`${API_BASE}/documents/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data;
};

export const downloadDocument = async (id: string, token?: string) => {
  const res = await axios.get(`${API_BASE}/documents/${id}/download`, {
    responseType: "blob",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data;
};

export const updateDocument = async (id: string, data: any, token?: string) => {
  const res = await axios.put(`${API_BASE}/documents/${id}`, data, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data;
};

export const getDocument = async (id: string, token?: string) => {
  const res = await axios.get(`${API_BASE}/documents/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data;
};
