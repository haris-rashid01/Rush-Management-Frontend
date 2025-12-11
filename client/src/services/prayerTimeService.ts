const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:3001/api";

export interface PrayerSettings {
    location: string;
    latitude: number;
    longitude: number;
    timezone: string;
    calculationMethod: number;
    asrMethod: string;
    highLatitudeRule: string;
    adjustments: {
        fajr: number;
        dhuhr: number;
        asr: number;
        maghrib: number;
        isha: number;
    };
    notifications: {
        enabled: boolean;
        soundEnabled: boolean;
        reminderMinutes: number;
    };
    display: {
        showOnDashboard: boolean;
        showInSidebar: boolean;
        use24HourFormat: boolean;
    };
}

export const prayerTimeService = {
    getSettings: async (): Promise<PrayerSettings> => {
        const token = localStorage.getItem("rushcorp_token");
        const res = await fetch(`${API_BASE_URL}/prayer-times/settings`, {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });
        if (!res.ok) throw new Error("Failed to fetch prayer settings");
        const json = await res.json();
        return json.data;
    },

    updateSettings: async (settings: Partial<PrayerSettings>): Promise<PrayerSettings> => {
        const token = localStorage.getItem("rushcorp_token");
        const res = await fetch(`${API_BASE_URL}/prayer-times/settings`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(settings),
        });
        if (!res.ok) throw new Error("Failed to update prayer settings");
        const json = await res.json();
        return json.data;
    },
};
