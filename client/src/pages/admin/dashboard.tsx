import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Calendar,
  FileText,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  DollarSign,
  UserCheck,
  UserX,
  ArrowRight,
  Loader2
} from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useNotifications } from "@/hooks/use-notifications";

interface DashboardData {
  stats: {
    title: string;
    value: string;
    change: string;
    trend: "up" | "down" | "neutral";
    icon: string;
    color: string;
    bgColor: string;
  }[];
  recentActivity: {
    user: string;
    action: string;
    time: string;
    type: string;
    status: string;
  }[];
  pendingApprovals: {
    id: number;
    employee: string;
    type: string;
    dates: string;
    days: number;
    status: string;
  }[];
  departmentStats: {
    name: string;
    employees: number;
    attendance: number;
  }[];
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { showSuccess, showError } = useNotifications();

  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/dashboard");
      return res.json();
    }
  });

  const handleApprove = async (id: number, employee: string) => {
    try {
      const token = localStorage.getItem("rushcorp_token");
      if (!token) {
        showError("Not Authenticated", "Please log in again.");
        return;
      }

      const res = await fetch(`/api/leave/${id}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "approve" }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        showError("Approve Failed", `Server responded: ${errorText}`);
        return;
      }

      showSuccess("Leave Approved", `${employee}'s leave request has been approved.`);
      // Invalidate dashboard query to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    } catch (err) {
      console.error("Approve leave error", err);
      showError("Approve Failed", "An error occurred while approving leave.");
    }
  };

  const handleReject = async (id: number, employee: string) => {
    try {
      const token = localStorage.getItem("rushcorp_token");
      if (!token) {
        showError("Not Authenticated", "Please log in again.");
        return;
      }

      const res = await fetch(`/api/leave/${id}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: "Rejected from dashboard" }),
      });

      if (!res.ok) {
        showError("Reject Failed", `Could not reject leave (${res.status})`);
        return;
      }

      showSuccess("Leave Rejected", `${employee}'s leave request has been rejected.`);
      // Invalidate dashboard query to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    } catch (err) {
      console.error("Reject leave error", err);
      showError("Reject Failed", "An error occurred while rejecting leave.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[500px] text-destructive">
        <AlertCircle className="h-8 w-8 mr-2" />
        <span>Failed to load dashboard data</span>
      </div>
    );
  }

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Users": return <Users className="h-5 w-5" />;
      case "Calendar": return <Calendar className="h-5 w-5" />;
      case "UserCheck": return <UserCheck className="h-5 w-5" />;
      case "FileText": return <FileText className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, Admin! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center ${stat.color}`}>
                  {getIcon(stat.icon)}
                </div>
                {stat.trend === "up" ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : stat.trend === "down" ? (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                ) : (
                  <div className="h-4 w-4" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Leave Approvals */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Pending Leave Approvals
              </CardTitle>
              <Badge variant="destructive">{data.pendingApprovals.length} Pending</Badge>
            </div>
            <CardDescription>Review and approve employee leave requests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.pendingApprovals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No pending requests
              </div>
            ) : (
              data.pendingApprovals.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{request.employee}</div>
                    <div className="text-xs text-muted-foreground">{request.type} • {request.dates}</div>
                    <div className="text-xs text-muted-foreground">{request.days} days</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleReject(request.id, request.employee)}
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleApprove(request.id, request.employee)}
                    >
                      Approve
                    </Button>
                  </div>
                </div>
              ))
            )}
            <Button variant="ghost" className="w-full" onClick={() => setLocation("/admin/leave-requests")}>
              View All Requests <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest actions across the system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg transition-colors">
                <div className={`w-2 h-2 rounded-full ${activity.status === 'completed' ? 'bg-green-500' : 'bg-orange-500'
                  }`} />
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user}</span> {activity.action}
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
                {activity.status === 'completed' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Clock className="h-4 w-4 text-orange-500" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Department Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Department Overview
          </CardTitle>
          <CardDescription>Employee distribution and attendance by department</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.departmentStats.map((dept, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-sm">{dept.name}</span>
                    <Badge variant="secondary">{dept.employees} employees</Badge>
                  </div>
                  <span className="text-sm font-medium">{dept.attendance}% attendance</span>
                </div>
                <Progress value={dept.attendance} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => setLocation("/admin/employees")}>
              <Users className="h-5 w-5" />
              <span className="text-xs">Manage Employees</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => setLocation("/admin/announcements")}>
              <FileText className="h-5 w-5" />
              <span className="text-xs">Create Announcement</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => setLocation("/admin/documents")}>
              <FileText className="h-5 w-5" />
              <span className="text-xs">Upload Document</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => setLocation("/admin/settings")}>
              <Activity className="h-5 w-5" />
              <span className="text-xs">System Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}