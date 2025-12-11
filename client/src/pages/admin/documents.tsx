import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FolderOpen,
  Upload,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  FileText,
  Video,
  File,
} from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { useAuth } from "@/hooks/use-auth"; // replace with your auth hook
import {
  getDocuments,
  uploadDocument,
  deleteDocument,
  downloadDocument,
} from "@/api/documents";
import { userService } from "@/services/userService";

export default function AdminDocuments() {
  const { token } = useAuth();
  const { showSuccess } = useNotifications();

  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const [employees, setEmployees] = useState<any[]>([]);
  const [targetEmployee, setTargetEmployee] = useState<string>("none");
  const [activeTab, setActiveTab] = useState("company");
  const [selectedEmployeeForView, setSelectedEmployeeForView] = useState<string>("");
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [uploadTargetType, setUploadTargetType] = useState<"all" | "employee">("all");

  const categories = [
    "HR Policies",
    "Employee Handbook",
    "Training Materials",
    "Compliance Documents",
    "Forms & Templates",
    "Company Policies",
    "Islamic Guidelines",
    "Safety Procedures",
  ];

  // Fetch documents from backend
  // Fetch documents from backend
  const fetchDocuments = async () => {
    // Strict Logic: If in Employee tab and no employee selected, do not fetch (or fetch empty)
    if (activeTab === "employee" && !selectedEmployeeForView) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const params: any = {};
      if (searchQuery) params.search = searchQuery;
      if (filterCategory !== "all") params.category = filterCategory;

      if (activeTab === "company") {
        // Company documents = All documents exclude PRIVATE (personal employee docs)
        params.excludeAccessLevel = 'PRIVATE';
      } else if (activeTab === "employee" && selectedEmployeeForView) {
        // Employee documents = Only documents for this specific user
        params.userId = selectedEmployeeForView;
      }

      const res = await getDocuments(params, token);
      setDocuments(res.data.documents);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const [fetchError, setFetchError] = useState<string | null>(null);



  // Fetch employees for dropdown
  const fetchEmployees = async () => {
    setEmployeesLoading(true);
    setFetchError(null);
    try {
      const users = await userService.getUsersSimple();
      if (Array.isArray(users) && users.length) {
        setEmployees(users);
      } else {
        setEmployees([]);
        setFetchError("No employees found.");
      }
    } catch (err: any) {
      console.error("Failed to fetch employees", err);
      setFetchError(err.message || "Failed to fetch employees.");
      setEmployees([]);
    } finally {
      setEmployeesLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [searchQuery, filterCategory, isUploadDialogOpen, token, activeTab, selectedEmployeeForView]);

  useEffect(() => {
    // Fetch employees once on mount (or when token changes)
    fetchEmployees();
  }, [token]);

  // Upload document
  const handleUpload = async () => {
    const fileInput = document.getElementById("fileInput") as HTMLInputElement;
    const titleInput = document.getElementById("docName") as HTMLInputElement;
    const descInput = document.getElementById(
      "description"
    ) as HTMLTextAreaElement;

    if (!fileInput?.files?.length) {
      showSuccess("Error", "Please select a file.");
      return;
    }
    if (!titleInput.value) {
      showSuccess("Error", "Please enter a document name.");
      return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);
    formData.append("title", titleInput.value);
    formData.append("category", filterCategory);
    formData.append("description", descInput.value);

    // Strict Mode Logic
    if (activeTab === "employee") {
      if (!targetEmployee || targetEmployee === "none") {
        showSuccess("Error", "Please select an employee for this document.");
        return;
      }
      formData.append("targetUserId", targetEmployee);
    }
    // If Company tab, we do NOT append targetUserId, effectively making it public/company-wide

    try {
      await uploadDocument(formData, token);
      showSuccess(
        "Document Uploaded",
        `Document successfully uploaded for ${activeTab === 'employee' ? 'Employee' : 'Company'}.`
      );
      setIsUploadDialogOpen(false);
      fetchDocuments();
    } catch (err) {
      console.error(err);
      showSuccess("Error", "Failed to upload document.");
    }
  };

  // Delete document
  const handleDelete = async (id: string) => {
    try {
      await deleteDocument(id, token);
      showSuccess("Document Deleted", "Document has been removed.");
      fetchDocuments();
    } catch (err) {
      console.error(err);
    }
  };

  // Download document
  const handleDownload = async (id: string, title: string) => {
    try {
      const blob = await downloadDocument(id, token);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = title;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  const handleView = async (id: string) => {
    try {
      const blob = await downloadDocument(id, token);
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error("View failed", error);
    }
  };

  // ... delete and download helpers ...

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Document Management
          </h1>
          <p className="text-muted-foreground">
            Upload and manage company documents
          </p>
        </div>
        <Dialog open={isUploadDialogOpen} onOpenChange={(open) => {
          setIsUploadDialogOpen(open);
          if (open) {
            // Reset state based on active tab
            if (activeTab === 'employee') {
              // If we are in employee tab, we MUST select an employee
              setTargetEmployee(selectedEmployeeForView || "none");
            } else {
              // If company tab, target is none
              setTargetEmployee("none");
            }
          }
        }}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              {activeTab === 'employee' ? 'Upload for Employee' : 'Upload Company Document'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {activeTab === 'employee' ? 'Upload Employee-Specific Document' : 'Upload Company Document'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="docName">Document Name</Label>
                <Input id="docName" placeholder={activeTab === 'employee' ? "e.g., Employment Contract" : "e.g., Company Policy 2025"} />
              </div>

              {/* STRICT SEPARATION: Only show Employee Select if in Employee Tab */}
              {activeTab === 'employee' && (
                <div className="space-y-2 border p-3 rounded-md bg-muted/10">
                  <Label htmlFor="targetEmployee" className="font-semibold text-primary">Assign to Employee</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    {employeesLoading ? "Loading..." : `Loaded ${employees.length} users`}
                  </p>
                  {fetchError ? (
                    <div className="text-red-500 text-sm mb-2">
                      <p>Error loading employees: {fetchError}</p>
                      <Button variant="outline" size="sm" onClick={fetchEmployees} className="mt-1">Retry</Button>
                    </div>
                  ) : (
                    <Select value={targetEmployee} onValueChange={setTargetEmployee}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none" disabled>Select an employee</SelectItem>
                        {employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.firstName} {emp.lastName} ({emp.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <p className="text-xs text-muted-foreground">
                    This document will be <strong>Private</strong> and visible ONLY to the selected employee.
                  </p>
                </div>
              )}

              {activeTab === 'company' && (
                <div className="p-3 bg-blue-50 text-blue-800 rounded-md text-sm">
                  This document will be visible to <strong>All Employees</strong> (or filtered by Department).
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={filterCategory}
                  onValueChange={setFilterCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the document..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">File Upload</Label>
                <input type="file" id="fileInput" />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsUploadDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleUpload}>Upload Document</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="company" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="company">Company Documents</TabsTrigger>
          <TabsTrigger value="employee">Employee Documents</TabsTrigger>
        </TabsList>

        <div className="mt-4">
          {activeTab === 'employee' && (
            <div className="mb-6 p-4 border rounded-lg bg-muted/20">
              <Label className="mb-2 block">Select Employee to Manage</Label>
              <Select value={selectedEmployeeForView} onValueChange={setSelectedEmployeeForView}>
                <SelectTrigger className="w-full md:w-[300px]">
                  <SelectValue placeholder="Select an employee..." />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Search and Filter */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Document List */}
          <div className="space-y-3 mt-4">
            {loading ? (
              <p>Loading documents...</p>
            ) : documents.length === 0 ? (
              <p>No documents found</p>
            ) : (
              documents.map((doc) => (
                <Card
                  key={doc.id}
                  className="flex items-center justify-between p-4"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center">
                      {doc.fileType === "PDF" ? (
                        <FileText />
                      ) : doc.fileType === "MP4" ? (
                        <Video />
                      ) : (
                        <File />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{doc.title}</h3>
                        <Badge variant="outline">{doc.fileType}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{doc.category}</span>
                        <span>•</span>
                        <span>{doc.fileSize}</span>
                        <span>•</span>
                        <span>{doc.downloadCount || 0} downloads</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(doc.id, doc.title)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(doc.id)}
                    >
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(doc.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </Tabs>
    </div>
  );
}
