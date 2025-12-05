import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Database, Download, Upload, RefreshCw, Trash2, HardDrive, Activity, AlertCircle, CheckCircle } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { databaseService, DatabaseStats, Backup } from "@/services/databaseService";

export default function AdminDatabase() {
  const { showSuccess, showInfo, showError } = useNotifications();
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [backups, setBackups] = useState<Backup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statsData, backupsData] = await Promise.all([
        databaseService.getStats(),
        databaseService.getBackups()
      ]);
      setStats(statsData);
      setBackups(backupsData);
    } catch (error) {
      console.error(error);
      showError("Error", "Failed to load database information");
    } finally {
      setIsLoading(false);
    }
  };


  if (isLoading && !stats) {
    return <div className="p-8 text-center">Loading database information...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Database Management</h1>
          <p className="text-muted-foreground">Monitor and manage database operations</p>
        </div>
        <div className="flex items-center gap-2">
        </div>
      </div>

      {/* Database Status */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200 dark:border-green-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">Database Status: {stats?.status || 'Unknown'}</h3>
                <p className="text-sm text-green-600 dark:text-green-400">All systems operational • Uptime: {stats?.uptime || 'N/A'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tables</p>
                <p className="text-2xl font-bold">{stats?.tables || 0}</p>
              </div>
              <Database className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Records</p>
                <p className="text-2xl font-bold">{stats?.records.toLocaleString() || 0}</p>
              </div>
              <HardDrive className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Last Backup</p>
                <p className="text-sm font-bold">
                  {stats?.lastBackup ? new Date(stats.lastBackup).toLocaleDateString() : 'Never'}
                </p>
              </div>
              <Download className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Database Tables */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Tables
            </CardTitle>
            <CardDescription>Overview of all database tables</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.details.map((table, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                  <div className="flex-1">
                    <div className="font-medium capitalize">{table.name.replace('_', ' ')}</div>
                    <div className="text-xs text-muted-foreground">
                      {table.records.toLocaleString()} records
                    </div>
                  </div>
                  <div className="text-right">
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}