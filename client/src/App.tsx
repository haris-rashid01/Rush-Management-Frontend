import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { ThemeProvider } from "@/lib/use-theme";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationProvider } from "@/hooks/use-notifications";
import { SocketProvider } from "@/hooks/use-socket";
import { NotificationCenter } from "@/components/notification-center";
import { AuthProvider, useAuth, ProtectedRoute } from "@/hooks/use-auth";
import { UserProfile } from "@/components/user-profile";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Namaz from "@/pages/namaz";
import Duas from "@/pages/duas";
import Timetable from "@/pages/timetable";
import Leave from "@/pages/leave";
import Onboarding from "@/pages/onboarding";
import Documents from "@/pages/documents";
import Company from "@/pages/company";
import Policies from "@/pages/policies";
import Contact from "@/pages/contact";
import Notifications from "@/pages/notifications";
import ProfileSettings from "@/pages/profile-settings";
import NotificationPreferences from "@/pages/notification-preferences";
import AccountSettings from "@/pages/account-settings";
// import PrivacySecurity from "@/pages/privacy-security";
import HelpSupport from "@/pages/help-support";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminEmployees from "@/pages/admin/employees";
import AdminLeaveRequests from "@/pages/admin/leave-requests";
import AdminDocuments from "@/pages/admin/documents";
import AdminPolicies from "@/pages/admin/policies";
import AdminAnnouncements from "@/pages/admin/announcements";
import Announcements from "@/pages/announcements";
import AdminSettings from "@/pages/admin/settings";
// import AdminAnalytics from "@/pages/admin/analytics";
import AdminDepartments from "@/pages/admin/departments";
// import AdminRoles from "@/pages/admin/roles";
import AdminDuasManagement from "@/pages/admin/duas-management";
import AdminLogs from "@/pages/admin/logs";
// import AdminDatabase from "@/pages/admin/database";
import AdminTimetable from "@/pages/admin/timetable";
import AdminPrayerTimes from "@/pages/admin/prayer-times";
import AdminAccessories from "@/pages/admin/accessories";
import AdminVisitors from "@/pages/admin/visitors";

function AuthenticatedApp() {
  const { user } = useAuth();
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  const isAdmin = user?.role === 'admin';

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        {isAdmin ? <AdminSidebar /> : <AppSidebar />}
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b border-border/50 shrink-0 bg-gradient-to-r from-background to-muted/20 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <SidebarTrigger data-testid="button-sidebar-toggle" className="hover:bg-muted/50 transition-colors" />
              <div className="h-6 w-px bg-border/50" />
              <h1 className="font-semibold text-foreground/90 text-sm">
                {isAdmin ? 'Admin Panel' : 'Employee Management System'}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <NotificationCenter />
              <div className="h-6 w-px bg-border/50" />
              <UserProfile />
              <div className="h-6 w-px bg-border/50" />
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto p-6">
              <Switch>
                {isAdmin ? (
                  <>
                    {/* Admin Routes */}
                    <Route path="/" component={AdminDashboard} />
                    <Route path="/admin" component={AdminDashboard} />
                    <Route path="/admin/employees" component={AdminEmployees} />
                    <Route path="/admin/leave-requests" component={AdminLeaveRequests} />
                    <Route path="/admin/documents" component={AdminDocuments} />
                    <Route path="/admin/policies" component={AdminPolicies} />
                    <Route path="/admin/announcements" component={AdminAnnouncements} />
                    <Route path="/admin/settings" component={AdminSettings} />
                    {/* <Route path="/admin/analytics" component={AdminAnalytics} /> */}
                    <Route path="/admin/departments" component={AdminDepartments} />
                    {/* <Route path="/admin/roles" component={AdminRoles} /> */}
                    <Route path="/admin/duas" component={AdminDuasManagement} />
                    <Route path="/admin/logs" component={AdminLogs} />
                    {/* <Route path="/admin/database" component={AdminDatabase} /> */}
                    <Route path="/admin/timetable" component={AdminTimetable} />
                    <Route path="/admin/prayer-times" component={AdminPrayerTimes} />
                    <Route path="/admin/accessories" component={AdminAccessories} />
                    <Route path="/admin/visitors" component={AdminVisitors} />
                    {/* Admin can also access profile settings */}
                    <Route path="/profile-settings" component={ProfileSettings} />
                    <Route path="/notification-preferences" component={NotificationPreferences} />
                    <Route path="/account-settings" component={AccountSettings} />
                    {/* <Route path="/privacy-security" component={PrivacySecurity} /> */}
                    <Route path="/help-support" component={HelpSupport} />
                  </>
                ) : (
                  <>
                    {/* Employee Routes */}
                    <Route path="/" component={Dashboard} />
                    <Route path="/namaz" component={Namaz} />
                    <Route path="/duas" component={Duas} />
                    <Route path="/timetable" component={Timetable} />
                    <Route path="/leave" component={Leave} />
                    <Route path="/onboarding" component={Onboarding} />
                    <Route path="/documents" component={Documents} />
                    <Route path="/company" component={Company} />
                    <Route path="/policies" component={Policies} />
                    <Route path="/announcements" component={Announcements} />
                    <Route path="/contact" component={Contact} />
                    <Route path="/notifications" component={Notifications} />
                    <Route path="/profile-settings" component={ProfileSettings} />
                    <Route path="/notification-preferences" component={NotificationPreferences} />
                    <Route path="/account-settings" component={AccountSettings} />
                    {/* <Route path="/privacy-security" component={PrivacySecurity} /> */}
                    <Route path="/help-support" component={HelpSupport} />
                  </>
                )}
              </Switch>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-muted/20">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Public routes (login, signup)
  const publicRoutes = ['/login', '/signup'];
  const isPublicRoute = publicRoutes.includes(location);

  // If user is authenticated and trying to access public routes, redirect to dashboard
  if (isAuthenticated && isPublicRoute) {
    return <AuthenticatedApp />;
  }

  // If user is not authenticated and trying to access protected routes, show login
  if (!isAuthenticated && !isPublicRoute) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route component={Login} />
      </Switch>
    );
  }

  // If user is authenticated, show the main app
  if (isAuthenticated) {
    return <AuthenticatedApp />;
  }

  // Show public routes
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route component={Login} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <SocketProvider>
              <TooltipProvider>
                <Router />
                <Toaster />
              </TooltipProvider>
            </SocketProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
