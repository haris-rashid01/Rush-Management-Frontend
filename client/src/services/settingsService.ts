import { api } from "@/lib/api";

export interface Settings {
    // General
    companyName: string;
    companyEmail: string;
    companyPhone: string;
    timezone: string;
    dateFormat: string;

    // Email
    emailNotifications: boolean;
    emailHost: string;
    emailPort: string;
    emailUsername: string;

    // Security
    passwordMinLength: number;
    passwordRequireSpecialChar: boolean;
    sessionTimeout: number;
    twoFactorAuth: boolean;
    ipWhitelist: boolean;

    // System
    maintenanceMode: boolean;
    autoBackup: boolean;
    backupFrequency: string;
    maxFileSize: number;

    // Prayer
    prayerNotifications: boolean;
    prayerCalculationMethod: string;
    prayerSoundEnabled: boolean;
}

export const settingsService = {
    getSettings: async (): Promise<Partial<Settings>> => {
        const response = await api.get('/settings');
        return response.data.data;
    },

    updateSettings: async (settings: Partial<Settings>): Promise<any> => {
        const response = await api.put('/settings', settings);
        return response.data;
    }
};
