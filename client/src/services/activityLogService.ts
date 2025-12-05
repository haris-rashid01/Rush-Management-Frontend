const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:3001/api";

export interface ActivityLog {
    id: string;
    userId?: string;
    action: string;
    resource: string;
    ipAddress?: string;
    userAgent?: string;
    details?: any;
    createdAt: string;
}

export interface LogResponse {
    logs: ActivityLog[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export const activityLogService = {
    getLogs: async (params?: URLSearchParams): Promise<LogResponse> => {
        const token = localStorage.getItem("rushcorp_token");
        const queryString = params ? `?${params.toString()}` : "";

        const res = await fetch(`${API_BASE_URL}/logs${queryString}`, {
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });

        if (!res.ok) throw new Error("Failed to fetch activity logs");
        const json = await res.json();
        return json.data;
    }
};
