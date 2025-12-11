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
  Timer,
  Download
} from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { api } from "@/lib/api";

interface HelperDocument {
  id: number;
  title: string;
  category: string;
  createdAt: string;
  fileSize: number;
  fileType: string;
  uploadedBy: string;
}

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState({ temp: 22, condition: "Sunny", location: "Lahore" });
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

  // Fetch recent documents
  const { data: recentDocuments = [] } = useQuery({
    queryKey: ['recent-documents'],
    queryFn: async () => {
      const res = await api.get('/documents');
      // Client-side sort/slice since API doesn't support limits yet, or assume default ordering
      const docs = res.data?.data?.documents || [];
      return docs
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map((doc: any) => ({
          id: doc.id,
          title: doc.title,
          category: doc.category || "General",
          createdAt: doc.createdAt,
          fileSize: doc.fileSize,
          fileType: doc.fileType,
          uploadedBy: doc.user ? `${doc.user.firstName} ${doc.user.lastName}` : "Unknown"
        }));
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
  const dailyDua = dashboardData?.dailyDua;

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
  }

  const handleDownload = async (doc: any) => {
    try {
      showInfo("Download Started", `Downloading ${doc.title}...`);
      const response = await api.get(`/documents/${doc.id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const extension = doc.fileType?.split('/')[1] || 'file';
      link.setAttribute('download', `${doc.title}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed", error);
    }
  };;

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
  const timeUntilNextPrayer = nextPrayer?.remaining || "N/A";

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

      {/* Prayer Times & Dua Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Prayer Times Card */}
        <Card className="h-full border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-primary" />
              Prayer Times
              <Badge variant="outline" className="ml-auto font-normal">
                {format(currentTime, "EEEE, MMMM do")}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Next Prayer Highlight */}
              <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Next: {nextPrayer?.name || "None"}</h3>
                    <p className="text-sm text-muted-foreground">
                      {nextPrayer ? (timeUntilNextPrayer === "Now" ? "Now" : `In ${timeUntilNextPrayer}`) : "Day complete"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-primary">{nextPrayer?.time}</span>
                </div>
              </div>

              {/* Full Schedule */}
              <div className="grid grid-cols-5 gap-2 text-center text-sm">
                {prayerTimes.map((prayer: any) => (
                  <div
                    key={prayer.name}
                    className={`p-2 rounded-md transition-colors ${prayer.next
                      ? "bg-primary text-primary-foreground font-medium shadow-md"
                      : prayer.passed
                        ? "text-muted-foreground bg-muted/50"
                        : "bg-background border border-border"
                      }`}
                  >
                    <div className="text-xs opacity-80 mb-1">{prayer.name}</div>
                    <div>{prayer.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dua of the Day Card */}
        <Card className="h-full border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-purple-500" />
              Dua of the Day
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dailyDua ? (
              <div className="space-y-4 text-center">
                <h3 className="font-semibold text-lg text-foreground/90">{dailyDua.title}</h3>
                <div className="p-4 bg-background/50 rounded-lg border border-border/50 relative">
                  <p className="text-2xl font-amiri leading-loose text-right dir-rtl mb-2 text-foreground/80">
                    {dailyDua.arabic}
                  </p>
                  <Separator className="my-3 opacity-50" />
                  <p className="text-sm text-muted-foreground italic mb-2">
                    {dailyDua.transliteration}
                  </p>
                  <p className="text-foreground/90 font-medium">
                    {dailyDua.translation}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                <Coffee className="h-12 w-12 mb-4 opacity-20" />
                <p>No Dua available for today</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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

      </div>

      {/* Recent Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            Recent Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentDocuments.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No recent documents found
              </div>
            ) : (
              <div className="space-y-2">
                {recentDocuments.map((doc: any) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-card border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="h-10 w-10 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{doc.title}</div>
                        <div className="text-xs text-muted-foreground flex gap-2">
                          <span>{doc.category}</span>
                          <span>•</span>
                          <span>{format(new Date(doc.createdAt), "MMM d, yyyy")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button variant="outline" className="w-full mt-2" onClick={() => window.location.href = '/documents'}>
              View All Documents
            </Button>
          </div>
        </CardContent>
      </Card>


    </div>
  );
}
