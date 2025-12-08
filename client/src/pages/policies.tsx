import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  FileText,
  Download,
  Share2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  ChevronRight,
  BookOpen,
  Shield,
  Users,
  Building2,
  Scale
} from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { Policy, policyService } from "@/services/policyService";

export default function Policies() {
  const { showSuccess, showError, showInfo } = useNotifications();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPolicies = async () => {
      setIsLoading(true);
      try {
        const data = await policyService.getPolicies();
        setPolicies(data);
      } catch (error) {
        console.error(error);
        showError("Error", "Failed to load policies");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPolicies();
  }, []);

  const categories = [
    { id: "all", name: "All Policies" },
    { id: "General", name: "General" },
    { id: "HR", name: "Human Resources" },
    { id: "IT", name: "IT" },
    { id: "Security", name: "Security" },
    { id: "Operations", name: "Operations" },
    { id: "Ethics", name: "Ethics & Conduct" },
    { id: "Communications", name: "Communications" }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "HR": return <Users className="h-5 w-5" />;
      case "IT": return <Shield className="h-5 w-5" />;
      case "Security": return <Shield className="h-5 w-5" />;
      case "Operations": return <Building2 className="h-5 w-5" />;
      case "Ethics": return <Scale className="h-5 w-5" />;
      case "Communications": return <FileText className="h-5 w-5" />;
      case "General": return <FileText className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || policy.category === selectedCategory;
    return matchesSearch && matchesCategory && policy.status === 'active';
  });

  const handleAcknowledge = (policyId: number) => {
    showSuccess("Policy Acknowledged", "Thank you for reviewing and acknowledging this policy.");
    // In a real app, this would make an API call to record acknowledgment
  };

  const handleDownload = (policy: Policy) => {
    showInfo("Download Started", `Downloading ${policy.title}...`);
  };

  const handleShare = (policy: Policy) => {
    navigator.clipboard.writeText(window.location.href);
    showSuccess("Link Copied", "Policy link copied to clipboard.");
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Company Policies</h1>
          <p className="text-muted-foreground mt-1">
            Access and review all company guidelines, procedures, and standards.
          </p>
        </div>

        {/* Compliance Status Card */}
        <Card className="w-full md:w-auto bg-primary/5 border-primary/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Compliance Status</p>
              <p className="text-xs text-muted-foreground">You have acknowledged all mandatory policies</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-3 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search policies..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground mb-2 px-2">Categories</h3>
            {categories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.id === "all" ? <BookOpen className="h-4 w-4 mr-2" /> : null}
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Policy Content */}
        <div className="lg:col-span-9">
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">All Policies</TabsTrigger>
              <TabsTrigger value="mandatory">Mandatory</TabsTrigger>
              <TabsTrigger value="recent">Recently Updated</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              {isLoading ? (
                <div className="text-center py-10">Loading policies...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPolicies.map(policy => (
                    <Card key={policy.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedPolicy(policy)}>
                      <CardHeader className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="w-fit">
                            {policy.category}
                          </Badge>
                          {policy.mandatory && (
                            <Badge variant="destructive" className="text-[10px]">Mandatory</Badge>
                          )}
                        </div>
                        <CardTitle className="text-xl flex items-center gap-2">
                          {getCategoryIcon(policy.category)}
                          {policy.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {policy.summary}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {policy.readTime}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {policy.lastUpdated}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="ghost" className="w-full group">
                          Read Policy
                          <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="mandatory">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPolicies.filter(p => p.mandatory).map(policy => (
                  <Card key={policy.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedPolicy(policy)}>
                    <CardHeader className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="w-fit">
                          {policy.category}
                        </Badge>
                        <Badge variant="destructive" className="text-[10px]">Mandatory</Badge>
                      </div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        {getCategoryIcon(policy.category)}
                        {policy.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {policy.summary}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {policy.readTime}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {policy.lastUpdated}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="ghost" className="w-full group">
                        Read Policy
                        <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="recent">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPolicies
                  .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
                  .slice(0, 4)
                  .map(policy => (
                    <Card key={policy.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedPolicy(policy)}>
                      <CardHeader className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="w-fit">
                            {policy.category}
                          </Badge>
                          {policy.mandatory && (
                            <Badge variant="destructive" className="text-[10px]">Mandatory</Badge>
                          )}
                        </div>
                        <CardTitle className="text-xl flex items-center gap-2">
                          {getCategoryIcon(policy.category)}
                          {policy.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {policy.summary}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {policy.readTime}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {policy.lastUpdated}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="ghost" className="w-full group">
                          Read Policy
                          <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Policy Detail Dialog/Modal would go here - for now just showing content in a simple way if selected */}
      {selectedPolicy && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <Button variant="ghost" size="sm" onClick={() => setSelectedPolicy(null)}>
                  Back to List
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleShare(selectedPolicy)}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDownload(selectedPolicy)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Badge>{selectedPolicy.category}</Badge>
                {selectedPolicy.mandatory && <Badge variant="destructive">Mandatory</Badge>}
                <span className="text-sm text-muted-foreground">Version {selectedPolicy.version}</span>
              </div>
              <CardTitle className="text-3xl">{selectedPolicy.title}</CardTitle>
              <CardDescription className="text-lg mt-2">{selectedPolicy.summary}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6 text-sm text-muted-foreground border-y py-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Last Updated: {selectedPolicy.lastUpdated}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Read Time: {selectedPolicy.readTime}
                </div>
              </div>

              <div
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: selectedPolicy.content }}
              />

              {selectedPolicy.acknowledgmentRequired && (
                <div className="bg-muted/50 p-6 rounded-lg mt-8 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Acknowledgment Required</p>
                      <p className="text-sm text-muted-foreground">Please confirm you have read and understood this policy.</p>
                    </div>
                  </div>
                  <Button onClick={() => handleAcknowledge(selectedPolicy.id)}>
                    I Acknowledge
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
