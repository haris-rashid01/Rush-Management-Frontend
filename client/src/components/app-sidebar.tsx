import {
  Home,
  Bell,
  BookOpen,
  Calendar,
  FileText,
  Users,
  Building2,
  Shield,
  Mail,
  Settings,
  Clock,
  FolderOpen,
  UserCheck,
  Info,
  Phone,
  Briefcase,
  Heart,
  BarChart3,
  Megaphone
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

const menuGroups = [
  {
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        url: "/",
        icon: Home,
        description: "Main overview and analytics"
      }
    ]
  },
  {
    label: "Workplace Management",
    items: [
      {
        title: "Schedule & Timetable",
        url: "/timetable",
        icon: Calendar,
        description: "View work schedules"
      },
      {
        title: "Leave Management",
        url: "/leave",
        icon: FileText,
        description: "Submit and track leave requests"
      },
      {
        title: "Employee Directory",
        url: "/onboarding",
        icon: Users,
        description: "Team members and contacts"
      },
      {
        title: "Documents Center",
        url: "/documents",
        icon: FolderOpen,
        description: "Access company documents"
      }
    ]
  },
  {
    label: "Islamic Services",
    items: [
      {
        title: "Prayer Times",
        url: "/namaz",
        icon: Clock,
        description: "Daily prayer schedule and alarms",
        badge: "5 Today"
      },
      {
        title: "Duas & Supplications",
        url: "/duas",
        icon: Heart,
        description: "Daily duas and Islamic content"
      }
    ]
  },
  {
    label: "Company Resources",
    items: [
      // {
      //   title: "Company Information",
      //   url: "/company",
      //   icon: Building2,
      //   description: "About Rush Corporation"
      // },
      {
        title: "Announcements",
        url: "/announcements",
        icon: Megaphone,
        description: "Latest news and updates"
      },
      {
        title: "Policies & Guidelines",
        url: "/policies",
        icon: Shield,
        description: "Company policies and procedures"
      },
    ]
  },
  {
    label: "System",
    items: [
      {
        title: "Notifications",
        url: "/notifications",
        icon: Bell,
        description: "Manage your notifications",
        badge: "3 New"
      }
    ]
  }
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar className="border-r border-sidebar-border/50">
      <SidebarHeader className="p-6 border-b border-sidebar-border/50 bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm">
            <Briefcase className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-lg text-sidebar-foreground tracking-tight">Rush Corporation</h2>
            <p className="text-xs text-muted-foreground font-medium">Employee Management Portal</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        {menuGroups.map((group, groupIndex) => (
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
                      data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                      className="group relative h-auto p-3 rounded-lg hover:bg-sidebar-accent/50 transition-all duration-200 hover:shadow-sm"
                    >
                      <Link href={item.url}>
                        <div className="flex items-start gap-3 w-full">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center transition-colors ${location === item.url
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'bg-sidebar-accent/30 text-sidebar-foreground/70 group-hover:bg-primary/10 group-hover:text-primary'
                            }`}>
                            <item.icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className={`font-medium text-sm truncate ${location === item.url ? 'text-primary' : 'text-sidebar-foreground'
                                }`}>
                                {item.title}
                              </span>
                              {item.badge && (
                                <Badge
                                  variant={location === item.url ? "default" : "secondary"}
                                  className="text-xs px-2 py-0.5 ml-2 flex-shrink-0"
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

      <SidebarFooter className="p-4 border-t border-sidebar-border/50 bg-gradient-to-r from-muted/30 to-muted/50">
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <BarChart3 className="w-3 h-3" />
            <span className="font-medium">System Status: Online</span>
          </div>
          <p className="text-xs text-muted-foreground/80">© 2025 Rush Corporation. All rights reserved.</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
