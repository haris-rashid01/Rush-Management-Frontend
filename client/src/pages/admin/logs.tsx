import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, Search, Download, Filter, User, FileText, Settings, Shield, AlertCircle, CheckCircle, Info } from "lucide-react";
import { activityLogService, ActivityLog } from "@/services/activityLogService";
import { useNotifications } from "@/hooks/use-notifications";

export default function AdminLogs() {
  const { showError } = useNotifications();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 1
  });

  useEffect(() => {
    fetchLogs();
  }, [pagination.page, searchQuery, filterType]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", pagination.page.toString());
      params.append("limit", pagination.limit.toString());
      if (searchQuery) params.append("search", searchQuery);
      if (filterType !== "all") params.append("type", filterType);

      const data = await activityLogService.getLogs(params);
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (error) {
      console.error(error);
      showError("Error", "Failed to load activity logs");
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    // Map resource types to icons
    const lowerType = type.toLowerCase();
    if (lowerType.includes('user') || lowerType.includes('auth')) return <User className="h-4 w-4" />;
    if (lowerType.includes('document')) return <FileText className="h-4 w-4" />;
    if (lowerType.includes('setting')) return <Settings className="h-4 w-4" />;
    if (lowerType.includes('policy')) return <Shield className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  // Since we don't have explicit 'level' in backend yet, we can infer or default to info
  const getLevelBadge = (action: string) => {
    let level = 'info';
    let variant: "default" | "destructive" | "secondary" | "outline" = "secondary";
    let icon = <Info className="h-3 w-3" />;

    const lowerAction = action.toLowerCase();
    if (lowerAction.includes('fail') || lowerAction.includes('error') || lowerAction.includes('delete')) {
      level = 'warning';
      variant = 'destructive';
      icon = <AlertCircle className="h-3 w-3" />;
    } else if (lowerAction.includes('success') || lowerAction.includes('create') || lowerAction.includes('update')) {
      level = 'success';
      variant = 'default';
      icon = <CheckCircle className="h-3 w-3" />;
    }

    return (
      <Badge variant={variant} className="flex items-center gap-1">
        {icon}
        {level}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Activity Logs</h1>
          <p className="text-muted-foreground">Monitor system activities and user actions</p>
        </div>
        <Button variant="outline" onClick={fetchLogs}>
          <Activity className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Logs List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Activity Logs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="document">Document</SelectItem>
                <SelectItem value="settings">Settings</SelectItem>
                <SelectItem value="auth">Auth</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            {isLoading ? (
              <div className="text-center py-10">Loading logs...</div>
            ) : logs.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">No logs found.</div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex items-start gap-4 p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-2 min-w-[140px]">
                    <span className="text-xs text-muted-foreground font-mono">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 min-w-[100px]">
                    {getTypeIcon(log.resource)}
                    <Badge variant="outline" className="text-xs">{log.resource}</Badge>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{log.action}</span>
                      {getLevelBadge(log.action)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {log.details ? JSON.stringify(log.details) : 'No details'}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>User ID: {log.userId || 'System'}</span>
                      <span>•</span>
                      <span>IP: {log.ipAddress || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.pages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination({ ...pagination, page: Math.max(1, pagination.page - 1) })}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination({ ...pagination, page: Math.min(pagination.pages, pagination.page + 1) })}
                disabled={pagination.page === pagination.pages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}