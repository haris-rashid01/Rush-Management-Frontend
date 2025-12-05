import {
  LayoutDashboard,
  Users,
  Calendar,
  Building2,
  Shield,
  Settings,
  Bell,
  FolderOpen,
  Clock,
  Heart,
  UserCog,
  Database,
  Activity,
  UserCheck
} from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function AdminSidebar() {
  const [location] = useLocation();

  const { data: dashboardData } = useQuery({
    queryKey: ["/api/dashboard"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/dashboard");
      return res.json();
    }
  });

  const counts = dashboardData?.counts || {};

  const adminMenuGroups = [
    {
      label: "Dashboard",
      items: [
        {
          title: "Admin Dashboard",
          url: "/admin",
          icon: LayoutDashboard,
          description: "Overview and analytics"
        }
      ]
    },
    {
      label: "User Management",
      items: [
        {
          title: "All Employees",
          url: "/admin/employees",
          icon: Users,
          description: "Manage employee accounts",
          badge: counts.totalEmployees ? counts.totalEmployees.toString() : undefined
        },
        {
          title: "Departments",
          url: "/admin/departments",
          icon: Building2,
          description: "Manage departments"
        },
      ]
    },
    {
      label: "Front Desk",
      items: [
        {
          title: "Visitors",
          url: "/admin/visitors",
          icon: UserCheck,
          description: "Manage visitors & vendors"
        }
      ]
    },
    {
      label: "Leave & Attendance",
      items: [
        {
          title: "Leave Requests",
          url: "/admin/leave-requests",
          icon: Calendar,
          description: "Approve/reject leave requests",
          badge: counts.pendingLeaves ? `${counts.pendingLeaves} Pending` : undefined
        }
      ]
    },
    {
      label: "Content Management",
      items: [
        {
          title: "Documents",
          url: "/admin/documents",
          icon: FolderOpen,
          description: "Manage company documents"
        },
        {
          title: "Policies",
          url: "/admin/policies",
          icon: Shield,
          description: "Update company policies"
        },
        {
          title: "Announcements",
          url: "/admin/announcements",
          icon: Bell,
          description: "Create announcements"
        },
        {
          title: "Duas & Prayers",
          url: "/admin/duas",
          icon: Heart,
          description: "Manage Islamic content"
        }
      ]
    },
    {
      label: "Scheduling",
      items: [
        {
          title: "Work Timetable",
          url: "/admin/timetable",
          icon: Calendar,
          description: "Manage work schedules"
        },
        {
          title: "Prayer Times",
          url: "/admin/prayer-times",
          icon: Clock,
          description: "Configure prayer times"
        }
      ]
    },
    {
      label: "Assets",
      items: [
        {
          title: "Employee Accessories",
          url: "/admin/accessories",
          icon: UserCog,
          description: "Manage company assets"
        }
      ]
    },
    {
      label: "System",
      items: [
        {
          title: "System Settings",
          url: "/admin/settings",
          icon: Settings,
          description: "Configure system"
        }
      ]
    }
  ];

  return (
    <Sidebar className="border-r border-sidebar-border/50">
      <SidebarHeader className="p-6 border-b border-sidebar-border/50 bg-gradient-to-r from-red-500/10 to-orange-500/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center shadow-sm">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-lg text-sidebar-foreground tracking-tight">Admin Panel</h2>
            <p className="text-xs text-muted-foreground font-medium">Rush Corporation</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        {adminMenuGroups.map((group) => (
          <SidebarGroup key={group.label} className="mb-6">
            <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={location === item.url}
                      className="group relative h-auto p-3 rounded-lg hover:bg-sidebar-accent/50 transition-all duration-200 hover:shadow-sm"
                    >
                      <Link href={item.url}>
                        <div className="flex items-start gap-3 w-full">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center transition-colors ${location === item.url
                            ? 'bg-red-600 text-white shadow-sm'
                            : 'bg-sidebar-accent/30 text-sidebar-foreground/70 group-hover:bg-red-600/10 group-hover:text-red-600'
                            }`}>
                            <item.icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className={`font-medium text-sm truncate ${location === item.url ? 'text-red-600' : 'text-sidebar-foreground'
                                }`}>
                                {item.title}
                              </span>
                              {item.badge && (
                                <Badge
                                  variant={location === item.url ? "default" : "secondary"}
                                  className="text-xs px-2 py-0.5 ml-2 flex-shrink-0 bg-red-600"
                                >
                                  {item.badge}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border/50 bg-gradient-to-r from-red-50/50 to-orange-50/50 dark:from-red-950/20 dark:to-orange-950/20">
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-3 h-3 text-red-600" />
            <span className="font-medium">Administrator Access</span>
          </div>
          <p className="text-xs text-muted-foreground/80">© 2025 Rush Corporation</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}