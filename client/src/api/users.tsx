import axios from "axios";

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:3001/api";

export const getAllUsers = async (params?: any, token?: string) => {
    const res = await axios.get(`${API_BASE}/users`, {
        params,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.data;
};
