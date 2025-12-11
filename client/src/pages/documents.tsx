import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { DocumentCard } from "@/components/document-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  Search,
  Filter,
  FileText,
  Folder,
  Download,
  Eye,
  Share2,
  Trash2,
  Edit,
  Star,
  Clock,
  Users,
  Shield,
  Archive,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  File,
  Image,
  Video,
  Music
} from "lucide-react";
import { format } from "date-fns";
import { useNotifications } from "@/hooks/use-notifications";

interface Document {
  id: number;
  title: string;
  category: string;
  uploadDate: string;
  fileSize: string;
  fileType: string;
  description?: string;
  userId: string;
  uploadedBy: string;
  version: string;
  tags: string[];
  isStarred: boolean;
  downloadCount: number;
  lastModified: string;
  permissions: "public" | "restricted" | "confidential";
  status: "active" | "archived" | "draft";
}

export default function Documents() {
  /* Documents state replaced by useQuery */
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === 'admin'; // Based on current useAuth mapping

  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ['documents'],
    queryFn: async () => {
      try {
        const response = await api.get('/documents');
        if (!response.data?.data?.documents) return [];
        return response.data.data.documents.map((doc: any) => ({
          id: doc.id,
          title: doc.title,
          category: doc.category || "Uncategorized",
          uploadDate: doc.createdAt,
          fileSize: `${(doc.fileSize / 1024 / 1024).toFixed(2)} MB`,
          fileType: doc.fileType?.split('/')?.[1] || 'file',
          description: doc.description,
          userId: doc.userId,
          uploadedBy: doc.user?.firstName ? `${doc.user.firstName} ${doc.user.lastName}` : "Unknown",
          version: "v1.0", // Mock
          tags: [], // Mock or need BE support
          isStarred: false,
          downloadCount: doc.downloadCount || 0,
          lastModified: doc.updatedAt,
          permissions: doc.accessLevel?.toLowerCase() || "public",
          status: "active"
        }));
      } catch (error) {
        console.error("Failed to fetch documents:", error);
        return [];
      }
    }
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPermission, setSelectedPermission] = useState("all");
  const [selectedFileType, setSelectedFileType] = useState("all");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const [newDocument, setNewDocument] = useState({
    title: "",
    category: "",
    description: "",
    tags: "",
    permissions: "public" as const,
    file: null as File | null,
    targetUserId: ""
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['users', 'employee'],
    queryFn: async () => {
      console.log("Fetching employees... isAdmin:", isAdmin);
      if (!isAdmin) return [];
      try {
        // Fetch all users and filter client-side to ensure robustness
        const res = await api.get('/users?limit=1000');
        console.log("All users response:", res.data);
        const allUsers = res.data.data.users || [];
        return allUsers.filter((u: any) => u.role === 'EMPLOYEE' || u.role === 'employee');
      } catch (err) {
        console.error("Error fetching employees:", err);
        return [];
      }
    },
    enabled: !!isAdmin
  });

  const { showSuccess, showError, showInfo } = useNotifications();

  const categories = ["HR", "Policies", "Training", "Projects", "Legal", "Finance", "IT"];
  const fileTypes = ["pdf", "docx", "xlsx", "pptx", "mp4", "jpg", "png"];
  const permissions = ["public", "restricted", "confidential"];

  const filteredDocuments = documents.filter((doc: Document) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || doc.category.toLowerCase() === selectedCategory;
    const matchesPermission = selectedPermission === "all" || doc.permissions === selectedPermission;
    const matchesFileType = selectedFileType === "all" || doc.fileType === selectedFileType;

    return matchesSearch && matchesCategory && matchesPermission && matchesFileType;
  });

  const handleUpload = async () => {
    if (!newDocument.title || !newDocument.category || !newDocument.file) {
      showError("Missing Information", "Please fill in all required fields and select a file");
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    const formData = new FormData();
    formData.append('file', newDocument.file);
    formData.append('title', newDocument.title);
    formData.append('category', newDocument.category);
    formData.append('description', newDocument.description);
    formData.append('accessLevel', newDocument.permissions.toUpperCase());
    if (newDocument.targetUserId) {
      formData.append('targetUserId', newDocument.targetUserId);
    }

    try {
      await api.post('/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setUploadProgress(percentCompleted);
        }
      });

      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setIsUploadDialogOpen(false);
      setNewDocument({
        title: "",
        category: "",
        description: "",
        tags: "",
        permissions: "public",
        file: null,
        targetUserId: ""
      });
      showSuccess("Document Uploaded", "Document has been uploaded successfully");
    } catch (error) {
      console.error("Upload failed", error);
      showError("Upload Failed", "Failed to upload document. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const toggleStar = (id: number) => {
    showInfo("Coming Soon", "Starring documents feature is currently under development");
  };

  const downloadDocument = async (id: number) => {
    try {
      const response = await api.get(`/documents/${id}/download`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      // You might want to get the filename from headers or use a default
      link.setAttribute('download', `document-${id}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      showSuccess("Download Started", "Document download has started");
    } catch (error) {
      console.error("Download failed", error);
      showError("Download Failed", "Could not download document");
    }
  };

  const viewDocument = async (doc: Document) => {
    try {
      showInfo("Opening Document", `Opening ${doc.title}...`);
      const response = await api.get(`/documents/${doc.id}/download`, {
        responseType: 'blob'
      });

      const fileType = doc.fileType || 'application/pdf';
      const blob = new Blob([response.data], { type: fileType });
      const url = window.URL.createObjectURL(blob);

      window.open(url, '_blank');

      // Note: We can't easily revoke the object URL immediately if we open it in a new tab, 
      // but browsers generally handle this cleanup eventually.
    } catch (error) {
      console.error("View failed", error);
      showError("View Failed", "Could not view document");
    }
  };

  const deleteDocument = async (id: number) => {
    if (!isAdmin) return;

    try {
      await api.delete(`/documents/${id}`);
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      showSuccess("Document Deleted", "Document has been removed");
    } catch (error) {
      console.error("Delete failed", error);
      showError("Delete Failed", "Failed to delete document");
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'docx':
      case 'doc':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'xlsx':
      case 'xls':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'pptx':
      case 'ppt':
        return <FileText className="h-5 w-5 text-orange-500" />;
      case 'mp4':
      case 'avi':
      case 'mov':
        return <Video className="h-5 w-5 text-purple-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image className="h-5 w-5 text-pink-500" />;
      case 'mp3':
      case 'wav':
        return <Music className="h-5 w-5 text-indigo-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case 'public':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'restricted':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confidential':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const stats = {
    total: documents.length,
    starred: documents.filter((d: Document) => d.isStarred).length,
    downloads: documents.reduce((acc: number, doc: Document) => acc + doc.downloadCount, 0),
    categories: new Set(documents.map((d: Document) => d.category)).size
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Document Management System</h1>
          <p className="text-muted-foreground">Centralized document storage with advanced search and organization</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-upload-document">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Upload New Document</DialogTitle>
                  <DialogDescription>
                    Add a new document to the company repository
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="doc-title">Document Title *</Label>
                      <Input
                        id="doc-title"
                        value={newDocument.title}
                        onChange={(e) => setNewDocument(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter document title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="doc-category">Category *</Label>
                      <Select value={newDocument.category} onValueChange={(value) => setNewDocument(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doc-description">Description</Label>
                    <Textarea
                      id="doc-description"
                      value={newDocument.description}
                      onChange={(e) => setNewDocument(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of the document"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="doc-tags">Tags (comma-separated)</Label>
                      <Input
                        id="doc-tags"
                        value={newDocument.tags}
                        onChange={(e) => setNewDocument(prev => ({ ...prev, tags: e.target.value }))}
                        placeholder="policy, handbook, training"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="doc-permissions">Access Level</Label>
                      <Select value={newDocument.permissions} onValueChange={(value: any) => setNewDocument(prev => ({ ...prev, permissions: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">🌐 Public</SelectItem>
                          <SelectItem value="restricted">🔒 Restricted</SelectItem>
                          <SelectItem value="confidential">🔐 Confidential</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="space-y-2">
                      <Label htmlFor="doc-target-user">Assign to Employee (Optional)</Label>
                      <Select
                        value={newDocument.targetUserId || "none"}
                        onValueChange={(value) => setNewDocument(prev => ({ ...prev, targetUserId: value === "none" ? "" : value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None (Self/Company)</SelectItem>
                          {employees.map((emp: any) => (
                            <SelectItem key={emp.id} value={emp.id}>
                              {emp.firstName} {emp.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>File Upload *</Label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Drag and drop your file here, or click to browse
                      </p>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setNewDocument(prev => ({ ...prev, file }));
                          }
                        }}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.mp4,.jpg,.jpeg,.png"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
                      >
                        Choose File
                      </Button>
                      {newDocument.file && (
                        <p className="text-sm text-green-600 mt-2">
                          Selected: {newDocument.file.name}
                        </p>
                      )}
                    </div>
                  </div>

                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)} disabled={isUploading}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpload} disabled={isUploading}>
                    <Upload className="h-4 w-4 mr-2" />
                    {isUploading ? 'Uploading...' : 'Upload Document'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Folder className="h-6 w-6 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total Documents</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Download className="h-6 w-6 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{stats.downloads}</div>
            <div className="text-xs text-muted-foreground">Total Downloads</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">{stats.categories}</div>
            <div className="text-xs text-muted-foreground">Categories</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="flex justify-around align-center w-full grid-cols-5">
          <TabsTrigger value="all">All Documents</TabsTrigger>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.filter((doc: Document) => doc.uploadedBy.includes(user?.firstName || "")).length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No personal documents found.
              </div>
            ) : (
              documents
                .filter((doc: Document) => doc.uploadedBy.includes(user?.firstName || "")) // Note: Ideally filter by ID, but using name for now based on current mapper
                .map((doc: Document) => (
                  <DocumentCard
                    key={doc.id}
                    title={doc.title}
                    category={doc.category}
                    uploadDate={format(new Date(doc.uploadDate), "MMM dd, yyyy")}
                    fileSize={doc.fileSize}
                    fileType={doc.fileType}
                    description={doc.description}
                    uploadedBy={doc.uploadedBy}
                    version={doc.version}
                    tags={doc.tags}
                    isStarred={doc.isStarred}
                    downloadCount={doc.downloadCount}
                    permissions={doc.permissions}
                    onDownload={() => downloadDocument(doc.id)}
                    onView={() => viewDocument(doc)}
                    onStar={() => toggleStar(doc.id)}
                    onDelete={isAdmin ? () => deleteDocument(doc.id) : undefined}
                    testId={`doc-${doc.id}`}
                  />
                )))}
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents by title, description, or tags..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat.toLowerCase()}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedPermission} onValueChange={setSelectedPermission}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Access" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Access</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="restricted">Restricted</SelectItem>
                <SelectItem value="confidential">Confidential</SelectItem>
              </SelectContent>
            </Select>
            {/* <Select value={selectedFileType} onValueChange={setSelectedFileType}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="File Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {fileTypes.map(type => (
                  <SelectItem key={type} value={type}>{type.toUpperCase()}</SelectItem>
                ))}
              </SelectContent>
            </Select> */}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((doc: Document) => (
              <DocumentCard
                key={doc.id}
                title={doc.title}
                category={doc.category}
                uploadDate={format(new Date(doc.uploadDate), "MMM dd, yyyy")}
                fileSize={doc.fileSize}
                fileType={doc.fileType}
                description={doc.description}
                uploadedBy={doc.uploadedBy}
                version={doc.version}
                tags={doc.tags}
                isStarred={doc.isStarred}
                downloadCount={doc.downloadCount}
                permissions={doc.permissions}
                onDownload={() => downloadDocument(doc.id)}
                onView={() => viewDocument(doc)}
                onStar={() => toggleStar(doc.id)}
                onDelete={isAdmin ? () => deleteDocument(doc.id) : undefined}
                testId={`doc-${doc.id}`}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="starred" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.filter((doc: Document) => doc.isStarred).map((doc: Document) => (
              <DocumentCard
                key={doc.id}
                title={doc.title}
                category={doc.category}
                uploadDate={format(new Date(doc.uploadDate), "MMM dd, yyyy")}
                fileSize={doc.fileSize}
                fileType={doc.fileType}
                description={doc.description}
                uploadedBy={doc.uploadedBy}
                version={doc.version}
                tags={doc.tags}
                isStarred={doc.isStarred}
                downloadCount={doc.downloadCount}
                permissions={doc.permissions}
                onDownload={() => downloadDocument(doc.id)}
                onStar={() => toggleStar(doc.id)}
                onDelete={isAdmin ? () => deleteDocument(doc.id) : undefined}
                testId={`doc-${doc.id}`}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents
              .sort((a: Document, b: Document) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
              .slice(0, 6)
              .map((doc: Document) => (
                <DocumentCard
                  key={doc.id}
                  title={doc.title}
                  category={doc.category}
                  uploadDate={format(new Date(doc.uploadDate), "MMM dd, yyyy")}
                  fileSize={doc.fileSize}
                  fileType={doc.fileType}
                  description={doc.description}
                  uploadedBy={doc.uploadedBy}
                  version={doc.version}
                  tags={doc.tags}
                  isStarred={doc.isStarred}
                  downloadCount={doc.downloadCount}
                  permissions={doc.permissions}
                  onDownload={() => downloadDocument(doc.id)}
                  onStar={() => toggleStar(doc.id)}
                  onDelete={isAdmin ? () => deleteDocument(doc.id) : undefined}
                  testId={`doc-${doc.id}`}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="shared" className="space-y-4">
          <Card>
            <CardContent className="p-8 text-center">
              <Share2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Shared Documents</h3>
              <p className="text-muted-foreground">
                Documents shared with external users will appear here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Analytics</CardTitle>
              <CardDescription>
                Usage statistics and insights for document management
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <TrendingUp className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Analytics Dashboard</h3>
              <p className="text-muted-foreground">
                Detailed analytics and reporting features coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
