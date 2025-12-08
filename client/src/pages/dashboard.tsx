import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { DailyDuaReminder } from "@/components/daily-dua-reminder";
import {
  Users,
  FileText,
  Calendar,
  Bell,
  CheckCircle,
  Activity,
  Sun,
  Moon,
  Coffee,
  MapPin,
  Thermometer,
  Wifi,
  Battery,
  Zap,
  ArrowRight,
  Timer
} from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState({ temp: 22, condition: "Sunny", location: "New York" });
  const [systemStatus, setSystemStatus] = useState({ wifi: 100, battery: 85, performance: 92 });
  const { showInfo } = useNotifications();
  const { user } = useAuth();

  // Fetch dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/dashboard");
      const data = await res.json();
      console.log("Dashboard API Response:", data);
      return data;
    }
  });

  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStatus(prev => ({
        wifi: Math.max(85, Math.min(100, prev.wifi + (Math.random() - 0.5) * 5)),
        battery: Math.max(70, Math.min(100, prev.battery + (Math.random() - 0.5) * 2)),
        performance: Math.max(80, Math.min(100, prev.performance + (Math.random() - 0.5) * 3))
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const currentHour = currentTime.getHours();
  const greeting = currentHour < 12 ? "Good Morning" : currentHour < 17 ? "Good Afternoon" : "Good Evening";
  const greetingIcon = currentHour < 12 ? <Sun className="h-5 w-5" /> : currentHour < 17 ? <Coffee className="h-5 w-5" /> : <Moon className="h-5 w-5" />;

  // Use fetched data or defaults
  const counts = dashboardData?.counts || {};
  const upcomingEvents = dashboardData?.upcomingEvents || [];
  const prayerTimes = dashboardData?.prayerTimes || [];

  const todayStats = {
    employees: {
      present: counts.activeToday || 0,
      total: counts.totalEmployees || 0,
      percentage: counts.totalEmployees ? Math.round((counts.activeToday / counts.totalEmployees) * 100) : 0
    },
    leaves: {
      pending: counts.pendingLeaves || 0,
      approved: counts.approvedLeaves || 0,
      total: counts.totalLeaves || 0
    },
    events: {
      today: upcomingEvents.filter((e: any) => e.time.includes('Today') || new Date(e.time).toDateString() === new Date().toDateString()).length,
      thisWeek: upcomingEvents.length,
      upcoming: upcomingEvents.length
    },
    tasks: { completed: dashboardData?.counts?.tasksCompleted || 0, pending: dashboardData?.counts?.tasksPending || 0, overdue: 0 }
  };

  const quickActions = [
    { icon: <FileText className="h-4 w-4" />, label: "Submit Leave", color: "bg-blue-500", href: "/leave" },
    { icon: <Calendar className="h-4 w-4" />, label: "View Schedule", color: "bg-green-500", href: "/timetable" },
    { icon: <Users className="h-4 w-4" />, label: "Team Directory", color: "bg-purple-500", href: "/onboarding" },
    { icon: <Bell className="h-4 w-4" />, label: "Prayer Times", color: "bg-orange-500", href: "/namaz" }
  ];

  const recentActivity = dashboardData?.recentActivity?.map((activity: any) => ({
    icon: activity.type === 'leave' ? <FileText className="h-4 w-4 text-orange-500" /> :
      activity.type === 'document' ? <FileText className="h-4 w-4 text-blue-500" /> :
        <CheckCircle className="h-4 w-4 text-green-500" />,
    text: `${activity.user} ${activity.action}`,
    time: activity.time
  })) || [];

  // Determine next prayer and countdown
  const nextPrayer = prayerTimes.find((prayer: any) => prayer.next) || prayerTimes.find((prayer: any) => !prayer.passed);

  let timeUntilNextPrayer = "N/A";
  if (nextPrayer && nextPrayer.datetime) {
    const prayerTime = new Date(nextPrayer.datetime);
    const diff = Math.floor((prayerTime.getTime() - currentTime.getTime()) / 60000); // Difference in minutes

    if (diff >= 0) {
      const hours = Math.floor(diff / 60);
      const minutes = diff % 60;
      timeUntilNextPrayer = `${hours}h ${minutes}m`;
    } else {
      // If diff is negative but it's marked as next (e.g. slight overlap or passed detection lag), just show Now or Passed
      timeUntilNextPrayer = "Now";
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header with Real-time Info */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {greetingIcon}
            <h1 className="text-2xl font-semibold">{greeting}, {user?.firstName || "User"}!</h1>
          </div>
          <p className="text-muted-foreground">
            {format(currentTime, "EEEE, MMMM do, yyyy")} • {format(currentTime, "h:mm:ss a")}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <MapPin className="h-4 w-4" />
            <span>{weather.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-orange-500" />
            <span className="font-medium">{weather.temp}°C</span>
            <span className="text-sm text-muted-foreground">{weather.condition}</span>
          </div>
        </div>
      </div>

      {/* System Status Bar */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/50 dark:to-green-950/50 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-foreground">Network</span>
                <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200">
                  {Math.round(systemStatus.wifi)}%
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Battery className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-foreground">System</span>
                <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200">
                  {Math.round(systemStatus.battery)}%
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-foreground">Performance</span>
                <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200">
                  {Math.round(systemStatus.performance)}%
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500 dark:text-green-400 animate-pulse" />
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">All Systems Operational</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Prayer Highlight */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/50 dark:to-blue-950/50 border-green-200 dark:border-green-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                <Bell className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-200">Next Prayer: {nextPrayer?.name}</h3>
                <p className="text-sm text-green-600 dark:text-green-400">{nextPrayer?.time} • In {timeUntilNextPrayer}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">{timeUntilNextPrayer}</div>
              <div className="text-sm text-green-600 dark:text-green-400">remaining</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <FileText className="h-5 w-5 text-orange-500 dark:text-orange-400" />
              <span className="text-sm font-medium text-foreground">Leave Requests</span>
            </div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{todayStats.leaves.pending}</div>
            <div className="text-xs text-muted-foreground">pending approval</div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">{todayStats.leaves.approved} approved</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Calendar className="h-5 w-5 text-purple-500 dark:text-purple-400" />
              <span className="text-sm font-medium text-foreground">Events Today</span>
            </div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{todayStats.events.today}</div>
            <div className="text-xs text-muted-foreground">scheduled events</div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">{todayStats.events.thisWeek} this week</div>
          </CardContent>
        </Card>
      </div>


    </div>
  );
}
