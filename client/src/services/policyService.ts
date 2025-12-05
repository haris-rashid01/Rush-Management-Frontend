const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:3001/api";

export interface Policy {
    id: number;
    title: string;
    summary: string;
    content: string;
    category: string;
    status: "active" | "draft" | "archived";
    lastUpdated: string;
    version: string;
    mandatory: boolean;
    readTime: string;
    priority: "high" | "medium" | "low";
    acknowledgmentRequired: boolean;
    views: number;
}

export const policyService = {
    getPolicies: async (): Promise<Policy[]> => {
        const token = localStorage.getItem("rushcorp_token");
        const res = await fetch(`${API_BASE_URL}/policies`, {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });
        if (!res.ok) throw new Error("Failed to fetch policies");
        const json = await res.json();
        return json.data;
    },

    createPolicy: async (policy: Omit<Policy, "id" | "lastUpdated" | "views">): Promise<Policy> => {
        const token = localStorage.getItem("rushcorp_token");
        const res = await fetch(`${API_BASE_URL}/policies`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(policy),
        });
        if (!res.ok) throw new Error("Failed to create policy");
        const json = await res.json();
        return json.data;
    },

    updatePolicy: async (id: number, policy: Partial<Policy>): Promise<Policy> => {
        const token = localStorage.getItem("rushcorp_token");
        const res = await fetch(`${API_BASE_URL}/policies/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(policy),
        });
        if (!res.ok) throw new Error("Failed to update policy");
        const json = await res.json();
        return json.data;
    },

    deletePolicy: async (id: number): Promise<void> => {
        const token = localStorage.getItem("rushcorp_token");
        const res = await fetch(`${API_BASE_URL}/policies/${id}`, {
            method: "DELETE",
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });
        if (!res.ok) throw new Error("Failed to delete policy");
    },
};
