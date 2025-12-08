import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Briefcase } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { timetableService, WorkSchedule } from "@/services/timetableService";

export default function Timetable() {
  const { showError } = useNotifications();
  const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load schedules from backend
  const fetchSchedules = async () => {
    try {
      setIsLoading(true);
      const data = await timetableService.getSchedules();
      setSchedules(data);
    } catch (err) {
      console.error("Failed to load schedules", err);
      showError("Error", "Failed to load schedules");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Company Timetable</h1>
          <p className="text-muted-foreground">View all department schedules and shifts</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Schedules</p>
                <p className="text-2xl font-bold">{schedules.length}</p>
              </div>
              <Briefcase className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Shifts</p>
                <p className="text-2xl font-bold text-green-600">
                  {schedules.filter((s) => s.status === "active").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Staff</p>
                <p className="text-2xl font-bold">{schedules.reduce((sum, s) => sum + s.employees, 0)}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Departments</p>
                <p className="text-2xl font-bold">{new Set(schedules.map(s => s.department)).size}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schedules List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-2 text-center py-10">Loading schedules...</div>
        ) : schedules.length === 0 ? (
          <div className="col-span-2 text-center py-10 text-muted-foreground">No company schedules found.</div>
        ) : (
          schedules.map((schedule) => (
            <Card key={schedule.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{schedule.department}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Badge variant="default">{schedule.shift}</Badge>
                      <Badge variant="secondary">{schedule.employees} employees</Badge>
                    </CardDescription>
                  </div>
                  <div>
                    <Badge variant={schedule.status === 'active' ? 'default' : 'secondary'}>{schedule.status}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Start Time</p>
                    <p className="font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {schedule.startTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">End Time</p>
                    <p className="font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {schedule.endTime}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Work Days</p>
                  <div className="flex flex-wrap gap-2">
                    {schedule.workDays.map((day) => (
                      <Badge key={day} variant="outline">{day.slice(0, 3)}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm text-muted-foreground">Break Time: {schedule.breakTime}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
