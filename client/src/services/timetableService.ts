const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:3001/api";

export interface WorkSchedule {
    id: number;
    department: string;
    shift: string;
    startTime: string;
    endTime: string;
    workDays: string[];
    employees: number;
    breakTime: string;
    status: string;
}

export const timetableService = {
    getSchedules: async (): Promise<WorkSchedule[]> => {
        const token = localStorage.getItem("rushcorp_token");
        const res = await fetch(`${API_BASE_URL}/timetable`, {
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });

        if (!res.ok) throw new Error("Failed to fetch schedules");
        const json = await res.json();
        return json.data;
    },

    createSchedule: async (data: Omit<WorkSchedule, "id" | "employees" | "status">): Promise<WorkSchedule> => {
        const token = localStorage.getItem("rushcorp_token");
        const res = await fetch(`${API_BASE_URL}/timetable`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error("Failed to create schedule");
        const json = await res.json();
        return json.data;
    },

    updateSchedule: async (id: number, data: Partial<WorkSchedule>): Promise<WorkSchedule> => {
        const token = localStorage.getItem("rushcorp_token");
        const res = await fetch(`${API_BASE_URL}/timetable/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error("Failed to update schedule");
        const json = await res.json();
        return json.data;
    },

    deleteSchedule: async (id: number): Promise<void> => {
        const token = localStorage.getItem("rushcorp_token");
        const res = await fetch(`${API_BASE_URL}/timetable/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });

        if (!res.ok) throw new Error("Failed to delete schedule");
    }
};
