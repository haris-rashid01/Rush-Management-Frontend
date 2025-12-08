import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, X, Calendar } from "lucide-react";

interface LeaveRequestCardProps {
  employeeName: string;
  employeePhoto?: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  onApprove?: () => void;
  onReject?: () => void;
  onCancel?: () => void;
  testId?: string;
}

export function LeaveRequestCard({
  employeeName,
  employeePhoto,
  leaveType,
  startDate,
  endDate,
  reason,
  status,
  onApprove,
  onReject,
  onCancel,
  testId
}: LeaveRequestCardProps) {
  const initials = employeeName.split(' ').map(n => n[0]).join('');

  const statusColors = {
    pending: "secondary",
    approved: "default",
    rejected: "destructive",
    cancelled: "outline"
  } as const;

  return (
    <Card data-testid={testId}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={employeePhoto} alt={employeeName} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{employeeName}</CardTitle>
              <p className="text-sm text-muted-foreground">{leaveType}</p>
            </div>
          </div>
          <Badge variant={statusColors[status] || "secondary"} data-testid={`${testId}-status`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{startDate} - {endDate}</span>
        </div>
        <div>
          <p className="text-sm font-medium mb-1">Reason:</p>
          <p className="text-sm text-muted-foreground">{reason}</p>
        </div>
        {status === "pending" && (
          <div className="flex gap-2 pt-2">
            {(onApprove || onReject) && (
              <>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    onApprove?.();
                  }}
                  data-testid={`${testId}-approve`}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    onReject?.();
                  }}
                  data-testid={`${testId}-reject`}
                >
                  <X className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </>
            )}
            {onCancel && (
              <Button
                size="sm"
                variant="destructive"
                className="flex-1"
                onClick={() => {
                  onCancel?.();
                }}
                data-testid={`${testId}-cancel`}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel Request
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
