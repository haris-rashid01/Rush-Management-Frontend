import { api } from "@/lib/api";

export const authService = {
    changePassword: async (passwordData: any) => {
        const response = await api.post("/auth/change-password", passwordData);
        return response.data;
    }
};
