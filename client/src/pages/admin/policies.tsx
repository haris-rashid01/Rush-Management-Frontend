import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shield, Plus, Edit, Trash2, Eye, Search, Calendar } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { Policy, policyService } from "@/services/policyService";
import { PolicyDialog } from "@/components/admin/policy-dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminPolicies() {
    const { showSuccess, showError } = useNotifications();
    const [searchQuery, setSearchQuery] = useState("");
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedPolicy, setSelectedPolicy] = useState<Policy | undefined>(undefined);

    // Delete dialog state
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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

    useEffect(() => {
        fetchPolicies();
    }, []);

    const filteredPolicies = policies.filter(policy =>
        policy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        policy.summary.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddPolicy = () => {
        setSelectedPolicy(undefined);
        setDialogOpen(true);
    };

    const handleEditPolicy = (policy: Policy) => {
        setSelectedPolicy(policy);
        setDialogOpen(true);
    };

    const handleDeleteClick = (id: number) => {
        setDeleteId(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        try {
            await policyService.deletePolicy(deleteId);
            showSuccess("Policy Deleted", "Policy has been removed.");
            fetchPolicies();
        } catch (error) {
            console.error(error);
            showError("Error", "Failed to delete policy");
        } finally {
            setIsDeleteDialogOpen(false);
            setDeleteId(null);
        }
    };

    const stats = {
        total: policies.length,
        active: policies.filter(p => p.status === 'active').length,
        draft: policies.filter(p => p.status === 'draft').length,
        totalViews: policies.reduce((sum, p) => sum + (p.views || 0), 0)
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Policy Management</h1>
                    <p className="text-muted-foreground">Create and manage company policies</p>
                </div>
                <Button className="flex items-center gap-2" onClick={handleAddPolicy}>
                    <Plus className="h-4 w-4" />
                    Create Policy
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Policies</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                            <Shield className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Active</p>
                                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                            </div>
                            <Shield className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Drafts</p>
                                <p className="text-2xl font-bold text-orange-600">{stats.draft}</p>
                            </div>
                            <Shield className="h-8 w-8 text-orange-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Views</p>
                                <p className="text-2xl font-bold text-purple-600">{stats.totalViews}</p>
                            </div>
                            <Eye className="h-8 w-8 text-purple-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Policies List */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            All Policies
                        </CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search policies..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    {isLoading ? (
                        <p className="text-center text-muted-foreground">Loading policies...</p>
                    ) : (
                        filteredPolicies.map((policy) => (
                            <div key={policy.id} className="p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-semibold text-lg">{policy.title}</h3>
                                            <Badge variant={policy.status === 'active' ? 'default' : 'secondary'}>
                                                {policy.status}
                                            </Badge>
                                            <Badge variant="outline">{policy.category}</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-3">{policy.summary}</p>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                <span>Updated: {policy.lastUpdated}</span>
                                            </div>
                                            <span>•</span>
                                            <span>Version {policy.version}</span>
                                            <span>•</span>
                                            <div className="flex items-center gap-1">
                                                <Eye className="h-3 w-3" />
                                                <span>{policy.views} views</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handleEditPolicy(policy)}>
                                            <Edit className="h-4 w-4 mr-1" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-red-600 hover:text-red-700"
                                            onClick={() => handleDeleteClick(policy.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>

            <PolicyDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                policy={selectedPolicy}
                onSuccess={fetchPolicies}
            />

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the policy.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}