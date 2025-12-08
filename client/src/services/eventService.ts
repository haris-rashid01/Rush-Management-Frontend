
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:3001/api";

export interface Event {
    id: string; // Changed from number to string for UUID
    title: string;
    description?: string;
    date: string;
    startTime: string;
    endTime: string;
    type: string;
    location?: string;
    priority: 'low' | 'medium' | 'high';
    reminder: boolean;
    reminderMinutes: number;
}

export const eventService = {
    getMyEvents: async (filters?: { startDate?: string; endDate?: string; type?: string }): Promise<Event[]> => {
        const token = localStorage.getItem("rushcorp_token");
        const query = new URLSearchParams(filters as any).toString();
        const res = await fetch(`${API_BASE_URL}/events?${query}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!res.ok) throw new Error("Failed to fetch events");
        const json = await res.json();
        return json.data;
    },

    createEvent: async (data: Omit<Event, "id">): Promise<Event> => {
        const token = localStorage.getItem("rushcorp_token");
        const res = await fetch(`${API_BASE_URL}/events`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error("Failed to create event");
        const json = await res.json();
        return json.data;
    },

    updateEvent: async (id: string, data: Partial<Event>): Promise<Event> => {
        const token = localStorage.getItem("rushcorp_token");
        const res = await fetch(`${API_BASE_URL}/events/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error("Failed to update event");
        const json = await res.json();
        return json.data;
    },

    deleteEvent: async (id: string): Promise<void> => {
        const token = localStorage.getItem("rushcorp_token");
        const res = await fetch(`${API_BASE_URL}/events/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!res.ok) throw new Error("Failed to delete event");
    },
};
