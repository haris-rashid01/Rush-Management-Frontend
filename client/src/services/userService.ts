import { api } from "@/lib/api";

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    department?: string | null;
    position?: string | null;
    isActive?: boolean | null;
    createdAt?: string;
    role: "ADMIN" | "MANAGER" | "EMPLOYEE";
    phone?: string | null;
    bio?: string | null;
    location?: string | null;
    timezone?: string | null;
    startDate?: string | null;
    employeeId?: string | null;
    notificationSettings?: any;
    appSettings?: any;
    avatar?: string | null;
}

export const userService = {
    getUsers: async (params?: URLSearchParams): Promise<User[]> => {
        const queryString = params ? `?${params.toString()}` : "";
        const response = await api.get(`/users${queryString}`);
        return response.data.data?.users ?? [];
    },

    updateUser: async (userId: string, data: Partial<User>): Promise<User> => {
        const response = await api.put<User>(`/users/${userId}`, data);
        return response.data;
    },

    subscribeToPush: async (subscription: any) => {
        const response = await api.post('/notifications/subscribe', subscription);
        return response.data;
    }
};
