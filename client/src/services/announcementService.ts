import { api } from "@/lib/api";

export interface Announcement {
    id: number;
    title: string;
    content: string;
    priority: "high" | "medium" | "low" | "urgent";
    status: "published" | "scheduled" | "draft";
    publishDate: string | null;
    author: string;
    views: number;
    targetAudience: string;
}

export const announcementService = {
    getAnnouncements: async (): Promise<Announcement[]> => {
        const response = await api.get('/announcements');
        return response.data.data;
    },

    createAnnouncement: async (announcement: Omit<Announcement, "id" | "views" | "author">): Promise<Announcement> => {
        const response = await api.post('/announcements', announcement);
        return response.data.data;
    },

    updateAnnouncement: async (id: number, announcement: Partial<Announcement>): Promise<Announcement> => {
        const response = await api.put(`/announcements/${id}`, announcement);
        return response.data.data;
    },

    deleteAnnouncement: async (id: number): Promise<void> => {
        await api.delete(`/announcements/${id}`);
    }
};
