import { api } from "@/lib/api";

export interface DatabaseStats {
    totalSize: string;
    tables: number;
    records: number;
    lastBackup: string;
    status: string;
    uptime: string;
    details: {
        name: string;
        records: number;
    }[];
}

export interface Backup {
    id: string;
    date: string;
    size: string;
    type: string;
    status: string;
    duration: string;
}

export const databaseService = {
    getStats: async (): Promise<DatabaseStats> => {
        const response = await api.get('/database/stats');
        return response.data.data;
    },

    getBackups: async (): Promise<Backup[]> => {
        const response = await api.get('/database/backups');
        return response.data.data;
    },

    createBackup: async (): Promise<Backup> => {
        const response = await api.post('/database/backup');
        return response.data.data;
    }
};
