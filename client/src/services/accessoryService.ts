
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:3001/api";

export interface Accessory {
    id: number;
    name: string;
    category: string;
    serialNumber: string;
    assignedTo: string | null;
    assignedDate: string | null;
    status: 'assigned' | 'available' | 'maintenance';
    condition: 'new' | 'excellent' | 'good' | 'fair' | 'poor';
    value: string;
    description?: string;
}

export const accessoryService = {
    getAccessories: async (): Promise<Accessory[]> => {
        const token = localStorage.getItem("rushcorp_token");
        const res = await fetch(`${API_BASE_URL}/accessories`, {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });
        if (!res.ok) throw new Error("Failed to fetch accessories");
        const json = await res.json();
        return json.data;
    },

    createAccessory: async (accessory: Omit<Accessory, 'id' | 'assignedTo' | 'assignedDate' | 'status'>): Promise<Accessory> => {
        const token = localStorage.getItem("rushcorp_token");
        const res = await fetch(`${API_BASE_URL}/accessories`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(accessory),
        });
        if (!res.ok) throw new Error("Failed to create accessory");
        const json = await res.json();
        return json.data;
    },

    updateAccessory: async (id: number, updates: Partial<Accessory>): Promise<Accessory> => {
        const token = localStorage.getItem("rushcorp_token");
        const res = await fetch(`${API_BASE_URL}/accessories/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error("Failed to update accessory");
        const json = await res.json();
        return json.data;
    },

    deleteAccessory: async (id: number): Promise<void> => {
        const token = localStorage.getItem("rushcorp_token");
        const res = await fetch(`${API_BASE_URL}/accessories/${id}`, {
            method: "DELETE",
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });
        if (!res.ok) throw new Error("Failed to delete accessory");
    },
};
