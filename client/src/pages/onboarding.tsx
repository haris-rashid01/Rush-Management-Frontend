import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { EmployeeCard } from "@/components/employee-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Plus,
  Search,
  Users,
  UserPlus,
  GraduationCap,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Calendar as CalendarIcon,
  Mail,
  MapPin,
  Building,
  Award,
  Target,
  TrendingUp,
  Download,
  Upload,
  Filter
} from "lucide-react";
import { format } from "date-fns";
import { useNotifications } from "@/hooks/use-notifications";

interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  joiningDate: string;
  status: "active" | "onboarding" | "inactive";
  onboardingProgress: number;
  manager?: string;
  location: string;
  employeeId: string;
  startDate: string;
  salary?: number;
  skills: string[];
  photoUrl?: string;
}

interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  category: "documentation" | "training" | "setup" | "meeting";
  completed: boolean;
  dueDate: string;
  assignedTo: string;
  priority: "high" | "medium" | "low";
}

export default function Onboarding() {
  /* Employees state replaced by useQuery */
  const { data: employees = [], isLoading } = useQuery<Employee[]>({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        const response = await api.get('/users');
        if (!response.data?.data?.users) return [];

        return response.data.data.users.map((user: any) => ({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          role: user.position || user.roleLabel || user.role,
          department: user.department || "Unassigned",
          email: user.email,
          joiningDate: user.startDate ? format(new Date(user.startDate), "MMM dd, yyyy") : "N/A",
          status: user.isActive ? "active" : "inactive",
          onboardingProgress: 100, // Default mock
          manager: "N/A",
          location: user.location || "Remote",
          employeeId: user.employeeId || "N/A",
          startDate: user.startDate || "",
          skills: [],
          photoUrl: user.avatar
        }));
      } catch (err) {
        console.error("Failed to fetch employees", err);
        return [];
      }
    }
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  /* Removed add/edit/delete logic for read-only directory */

  const filteredEmployees = employees.filter((employee: Employee) => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === "all" || employee.department.toLowerCase() === departmentFilter.toLowerCase();
    const matchesStatus = statusFilter === "all" || employee.status === statusFilter;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const stats = {
    total: employees.length,
    active: employees.filter(e => e.status === "active").length,
    onboarding: employees.filter(e => e.status === "onboarding").length,
    avgProgress: Math.round(employees.reduce((acc, emp) => acc + emp.onboardingProgress, 0) / employees.length)
  };

  const departments = ["Engineering", "Human Resources", "Design", "Marketing", "Sales", "Finance"];
  const locations = ["New York", "San Francisco", "Chicago", "Remote", "Los Angeles"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Employee Onboarding Hub</h1>
          <p className="text-muted-foreground">Comprehensive employee management and onboarding system</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total Employees</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{stats.active}</div>
            <div className="text-xs text-muted-foreground">Active</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="employees" className="w-full">
        <TabsList className="flex justify-around w-full grid-cols-4">
          <TabsTrigger value="employees">All Employees</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees by name, role, or email..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-employees"
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-48" data-testid="select-department-filter">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept.toLowerCase()}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEmployees.map((employee) => (
              <EmployeeCard
                key={employee.id}
                {...employee}
                testId={`employee-${employee.id}`}
              // Read-only: No onEdit or onDelete passed
              />
            ))}
          </div>
        </TabsContent>

        {/* <TabsContent value="onboarding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Onboarding</CardTitle>
              <CardDescription>
                Employees currently in the onboarding process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {employees.filter(emp => emp.status === "onboarding").map((employee) => (
                  <div key={employee.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{employee.name}</h4>
                      <p className="text-sm text-muted-foreground">{employee.role} • {employee.department}</p>
                      <div className="mt-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Onboarding Progress</span>
                          <span>{employee.onboardingProgress}%</span>
                        </div>
                        <Progress value={employee.onboardingProgress} className="h-2" />
                      </div>
                    </div>
                    <Badge variant={employee.onboardingProgress === 100 ? "default" : "secondary"}>
                      {employee.onboardingProgress === 100 ? "Complete" : "In Progress"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent> */}
      </Tabs>
    </div>
  );
}
