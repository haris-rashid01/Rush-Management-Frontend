import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Mail, Phone, Edit, Trash2, MapPin, User, Calendar, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface EmployeeCardProps {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  photoUrl?: string;
  joiningDate: string;
  status?: "active" | "onboarding" | "inactive";
  onboardingProgress?: number;
  manager?: string;
  location?: string;
  employeeId?: string;
  skills?: string[];
  onEdit?: () => void;
  onDelete?: () => void;
  testId?: string;
}

export function EmployeeCard({
  name,
  role,
  department,
  email,
  phone,
  photoUrl,
  joiningDate,
  status = "active",
  onboardingProgress = 100,
  manager,
  location,
  employeeId,
  skills = [],
  onEdit,
  onDelete,
  testId
}: EmployeeCardProps) {
  const initials = name.split(' ').map(n => n[0]).join('');

  const getStatusIcon = () => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "onboarding":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "inactive":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "onboarding":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "inactive":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-green-100 text-green-800 border-green-200";
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow" data-testid={testId}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarImage src={photoUrl} alt={name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1">
              {getStatusIcon()}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold truncate" data-testid={`${testId}-name`}>{name}</h3>
                <p className="text-sm text-muted-foreground">{role}</p>
                {employeeId && (
                  <p className="text-xs text-muted-foreground">ID: {employeeId}</p>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <Badge variant="secondary" className="shrink-0 text-xs">{department}</Badge>
                <Badge className={`shrink-0 text-xs ${getStatusColor()}`}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span className="truncate">{email}</span>
              </div>
              {/* <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-3 w-3" />
                <span>{phone}</span>
              </div> */}
              {location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{location}</span>
                </div>
              )}
              {manager && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>Reports to: {manager}</span>
                </div>
              )}
            </div>

            {status === "onboarding" && onboardingProgress < 100 && (
              <div className="mt-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Onboarding Progress</span>
                  <span className="font-medium">{onboardingProgress}%</span>
                </div>
                <Progress value={onboardingProgress} className="h-2" />
              </div>
            )}

            {skills.length > 0 && (
              <div className="mt-3">
                <div className="flex flex-wrap gap-1">
                  {skills.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {skills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{skills.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3">
              <Calendar className="h-3 w-3" />
              <span>Joined: {joiningDate}</span>
            </div>
          </div>
        </div>

        {(onEdit || onDelete) && (
          <div className="flex gap-2 mt-4">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  onEdit();
                  console.log(`Edit ${name}`);
                }}
                data-testid={`${testId}-edit`}
              >
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  onDelete();
                  console.log(`Delete ${name}`);
                }}
                data-testid={`${testId}-delete`}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
