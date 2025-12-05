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
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState({ temp: 22, condition: "Sunny", location: "New York" });
  const [systemStatus, setSystemStatus] = useState({ wifi: 100, battery: 85, performance: 92 });
  const { showInfo } = useNotifications();

  // Fetch dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/dashboard");
      return res.json();
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
    events: { today: 2, thisWeek: 8, upcoming: 5 }, // Still mock for now
    tasks: { completed: 24, pending: 8, overdue: 2 } // Still mock for now
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

  const upcomingEvents = [
    { title: "Team Standup", time: "10:00 AM", type: "Meeting", urgent: false },
    { title: "Client Presentation", time: "2:30 PM", type: "Presentation", urgent: true },
    { title: "Project Review", time: "4:00 PM", type: "Review", urgent: false }
  ];

  const prayerTimes = [
    { name: "Fajr", time: "5:30 AM", passed: true },
    { name: "Dhuhr", time: "12:45 PM", passed: false, next: true },
    { name: "Asr", time: "3:15 PM", passed: false },
    { name: "Maghrib", time: "5:42 PM", passed: false },
    { name: "Isha", time: "7:05 PM", passed: false }
  ];

  const nextPrayer = prayerTimes.find(prayer => prayer.next);
  const timeUntilNextPrayer = nextPrayer ? "2h 30m" : "N/A";

  return (
    <div className="space-y-6">
      {/* Welcome Header with Real-time Info */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {greetingIcon}
            <h1 className="text-2xl font-semibold">{greeting}, John!</h1>
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
              <Users className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              <span className="text-sm font-medium text-foreground">Attendance</span>
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{todayStats.employees.present}</div>
            <div className="text-xs text-muted-foreground">of {todayStats.employees.total} present</div>
            <Progress value={todayStats.employees.percentage} className="mt-2 h-1" />
          </CardContent>
        </Card>

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

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
              <span className="text-sm font-medium text-foreground">Tasks</span>
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{todayStats.tasks.completed}</div>
            <div className="text-xs text-muted-foreground">completed today</div>
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">{todayStats.tasks.overdue} overdue</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-16 flex-col gap-2 hover:shadow-md transition-shadow"
                onClick={() => showInfo("Navigation", `Opening ${action.label}`)}
              >
                <div className={`p-2 rounded-full ${action.color} text-white`}>
                  {action.icon}
                </div>
                <span className="text-xs text-foreground">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today's Schedule
              </div>
              <Badge variant="secondary">{upcomingEvents.length} events</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingEvents.map((event, index) => (
              <div key={index} className={`flex items-center justify-between p-3 rounded-lg border ${event.urgent ? 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800' : 'bg-muted/30'
                }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${event.urgent ? 'bg-red-500 animate-pulse' : 'bg-blue-500'
                    }`} />
                  <div>
                    <h4 className="font-medium text-sm">{event.title}</h4>
                    <p className="text-xs text-muted-foreground">{event.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{event.time}</div>
                  {event.urgent && (
                    <Badge variant="destructive" className="text-xs">Urgent</Badge>
                  )}
                </div>
              </div>
            ))}
            <Button variant="ghost" className="w-full text-sm">
              View Full Schedule <ArrowRight className="h-4 w-4 ml-2" />
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
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">No recent activity</div>
            ) : (
              recentActivity.map((activity: any, index: number) => (
                <div key={index} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg transition-colors">
                  {activity.icon}
                  <div className="flex-1">
                    <p className="text-sm">{activity.text}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))
            )}
            <Separator />
            <Button variant="ghost" className="w-full text-sm">
              View All Activity <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Prayer Times Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Today's Prayer Times
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-3">
            {prayerTimes.map((prayer, index) => (
              <div key={index} className={`text-center p-3 rounded-lg border ${prayer.next
                ? 'bg-primary/10 border-primary'
                : prayer.passed
                  ? 'bg-green-50 border-green-200'
                  : 'bg-muted/30'
                }`}>
                <div className={`text-lg font-bold ${prayer.next ? 'text-primary' : prayer.passed ? 'text-green-600' : 'text-muted-foreground'
                  }`}>
                  {prayer.time}
                </div>
                <div className={`text-sm ${prayer.next ? 'text-primary' : prayer.passed ? 'text-green-600' : 'text-muted-foreground'
                  }`}>
                  {prayer.name}
                </div>
                {prayer.passed && (
                  <CheckCircle className="h-4 w-4 text-green-500 mx-auto mt-1" />
                )}
                {prayer.next && (
                  <Timer className="h-4 w-4 text-primary mx-auto mt-1 animate-pulse" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Daily Dua */}
      <DailyDuaReminder />
    </div>
  );
}
