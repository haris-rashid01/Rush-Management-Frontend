import { api } from "@/lib/api";

export interface Visitor {
    id: number;
    name: string;
    type: "visitor" | "vendor";
    company?: string;
    purpose: string;
    host?: string;
    checkInTime: string;
    checkOutTime?: string;
    status: "checked-in" | "checked-out";
}

export const visitorService = {
    getVisitors: async (params?: { status?: string; type?: string; search?: string }) => {
        const response = await api.get("/visitors", { params });
        return response.data.data;
    },

    createVisitor: async (data: Omit<Visitor, "id" | "checkInTime" | "status">) => {
        const response = await api.post("/visitors", data);
        return response.data.data;
    },

    updateVisitor: async (id: number, data: Partial<Visitor>) => {
        const response = await api.put(`/visitors/${id}`, data);
        return response.data.data;
    },

    deleteVisitor: async (id: number) => {
        await api.delete(`/visitors/${id}`);
    }
};
