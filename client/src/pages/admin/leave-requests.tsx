import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CheckCircle, XCircle, Clock, Download } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Base URL for backend API
const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:3001/api";

type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

interface ApiLeaveRequest {
  id: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  leaveType: string;
  startDate: string;
  endDate: string;
  reason?: string | null;
  status: LeaveStatus;
  createdAt: string;
  approvedAt?: string | null;
  rejectionReason?: string | null;
}

interface LeaveRequestRow {
  id: string;
  employee: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  submittedDate: string;
  approvedDate?: string;
  rejectedDate?: string;
  rejectionReason?: string;
}

export default function AdminLeaveRequests() {
  const { showSuccess, showError } = useNotifications();
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [requests, setRequests] = useState<LeaveRequestRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch Leave Requests
  useEffect(() => {
    const fetchLeaveRequests = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("rushcorp_token");
        if (!token) throw new Error("Not authenticated");

        const params = new URLSearchParams({ page: "1", limit: "100" });

        const res = await fetch(`${API_BASE_URL}/leave/all?${params.toString()}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const err = await res.text();
          throw new Error(err || "Failed to fetch");
        }

        const json = await res.json();
        const apiRequests: ApiLeaveRequest[] = json.data?.requests ?? [];

        const mapped = apiRequests.map((r) => {
          const start = new Date(r.startDate);
          const end = new Date(r.endDate);
          const days = Math.max(
            1,
            Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1
          );

          return {
            id: r.id,
            employee: `${r.user.firstName} ${r.user.lastName}`.trim(),
            type: r.leaveType,
            startDate: start.toISOString().slice(0, 10),
            endDate: end.toISOString().slice(0, 10),
            days,
            reason: r.reason ?? "",
            status: r.status === "APPROVED" ? "approved" : r.status === "REJECTED" ? "rejected" : "pending",
            submittedDate: new Date(r.createdAt).toISOString().slice(0, 10),
            approvedDate: r.approvedAt ? new Date(r.approvedAt).toISOString().slice(0, 10) : undefined,
            rejectedDate: r.status === "REJECTED" ? new Date(r.createdAt).toISOString().slice(0, 10) : undefined,
            rejectionReason: r.rejectionReason ?? undefined,
          };
        });

        setRequests(mapped);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaveRequests();
  }, []);

  const handleApprove = async (id: string, employee: string) => {
    try {
      const token = localStorage.getItem("rushcorp_token");
      if (!token) return showError("Not Authenticated", "Please log in again.");

      const res = await fetch(`${API_BASE_URL}/leave/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: "approve" }),
      });

      if (!res.ok) return showError("Approve Failed", await res.text());

      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "approved", approvedDate: new Date().toISOString().slice(0, 10) } : r))
      );

      showSuccess("Leave Approved", `${employee}'s leave request has been approved.`);
    } catch {
      showError("Approve Error", "Something went wrong.");
    }
  };

  const handleReject = async (id: string, employee: string) => {
    try {
      const token = localStorage.getItem("rushcorp_token");
      if (!token) return showError("Not Authenticated", "Please log in again.");

      const res = await fetch(`${API_BASE_URL}/leave/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason: "Rejected by admin" }),
      });

      if (!res.ok) return showError("Reject Failed", await res.text());

      setRequests((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, status: "rejected", rejectedDate: new Date().toISOString().slice(0, 10), rejectionReason: "Rejected by admin" }
            : r
        )
      );
      showError("Leave Rejected", `${employee}'s leave request has been rejected.`);
    } catch {
      showError("Reject Error", "Something went wrong.");
    }
  };

  const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("").toUpperCase();

  const filteredRequests = requests.filter((req) => req.status === activeTab);

  const stats = {
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  // 📄 PDF EXPORT
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Leave Requests Report", 14, 10);

    const rows = filteredRequests.map((r) => [
      r.employee,
      r.type,
      r.startDate,
      r.endDate,
      `${r.days} Days`,
      r.status.toUpperCase(),
      r.submittedDate,
      r.approvedDate ?? "-",
      r.rejectionReason ?? "-",
    ]);

    autoTable(doc, {
      head: [["Employee", "Type", "Start", "End", "Days", "Status", "Submitted", "Approved", "Reason"]],
      body: rows,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [33, 150, 243] },
    });

    const filename =
      activeTab === "pending"
        ? "Pending-Leave-Requests.pdf"
        : activeTab === "approved"
        ? "Approved-Leave-Requests.pdf"
        : "Rejected-Leave-Requests.pdf";

    doc.save(filename);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leave Requests</h1>
          <p className="text-muted-foreground">Review and manage employee leave requests</p>
        </div>
        <Button variant="outline" onClick={exportPDF}>
          <Download className="h-4 w-4 mr-2" /> Export Report
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-6"><p className="text-sm">Pending</p><p className="text-2xl">{stats.pending}</p></CardContent></Card>
        <Card><CardContent className="p-6"><p className="text-sm">Approved</p><p className="text-2xl">{stats.approved}</p></CardContent></Card>
        <Card><CardContent className="p-6"><p className="text-sm">Rejected</p><p className="text-2xl">{stats.rejected}</p></CardContent></Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader><CardTitle>All Leave Requests</CardTitle></CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({stats.approved})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4 mt-6">
              {filteredRequests.map((request) => (
                <div key={request.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 flex-1">
                      <Avatar className="h-12 w-12"><AvatarFallback>{getInitials(request.employee)}</AvatarFallback></Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold">{request.employee}</h3>
                        <Badge>{request.status}</Badge> <Badge variant="outline">{request.type}</Badge>
                        <p>From {request.startDate} to {request.endDate} ({request.days} days)</p>
                        <p>Reason: {request.reason}</p>
                      </div>
                    </div>
                    {request.status === "pending" && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleReject(request.id, request.employee)}>
                          <XCircle className="h-4 w-4 mr-1" /> Reject
                        </Button>
                        <Button size="sm" onClick={() => handleApprove(request.id, request.employee)}>
                          <CheckCircle className="h-4 w-4 mr-1" /> Approve
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
