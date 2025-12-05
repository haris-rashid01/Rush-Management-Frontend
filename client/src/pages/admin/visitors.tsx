import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, UserCheck, LogOut, Trash2, Filter, Building2, User } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { visitorService, Visitor } from "@/services/visitorService";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { format } from "date-fns";

const visitorSchema = z.object({
    name: z.string().min(1, "Name is required"),
    type: z.enum(["visitor", "vendor"]),
    company: z.string().optional(),
    purpose: z.string().min(1, "Purpose is required"),
    host: z.string().optional(),
});

type VisitorFormValues = z.infer<typeof visitorSchema>;

export default function AdminVisitors() {
    const { showSuccess, showError } = useNotifications();
    const [visitors, setVisitors] = useState<Visitor[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Delete dialog state
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<VisitorFormValues>({
        resolver: zodResolver(visitorSchema),
        defaultValues: {
            type: "visitor"
        }
    });

    const watchType = watch("type");

    useEffect(() => {
        fetchVisitors();
    }, [searchQuery, filterType]);

    const fetchVisitors = async () => {
        setIsLoading(true);
        try {
            const params: any = {};
            if (searchQuery) params.search = searchQuery;
            if (filterType !== "all") params.type = filterType;

            const data = await visitorService.getVisitors(params);
            setVisitors(data);
        } catch (error) {
            console.error(error);
            showError("Error", "Failed to load visitors");
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit = async (data: VisitorFormValues) => {
        try {
            await visitorService.createVisitor(data);
            showSuccess("Visitor Added", "New visitor has been checked in.");
            setIsAddDialogOpen(false);
            reset();
            fetchVisitors();
        } catch (error) {
            console.error(error);
            showError("Error", "Failed to add visitor");
        }
    };

    const handleCheckOut = async (id: number) => {
        try {
            await visitorService.updateVisitor(id, { status: "checked-out" });
            showSuccess("Checked Out", "Visitor has been checked out.");
            fetchVisitors();
        } catch (error) {
            console.error(error);
            showError("Error", "Failed to check out visitor");
        }
    };

    const handleDeleteClick = (id: number) => {
        setDeleteId(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        try {
            await visitorService.deleteVisitor(deleteId);
            showSuccess("Deleted", "Visitor record has been deleted.");
            fetchVisitors();
        } catch (error) {
            console.error(error);
            showError("Error", "Failed to delete visitor");
        } finally {
            setIsDeleteDialogOpen(false);
            setDeleteId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Visitor Management</h1>
                    <p className="text-muted-foreground">Track visitors and vendors</p>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Check In Visitor
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>New Visitor Check-in</DialogTitle>
                            <DialogDescription>Enter visitor details</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="type">Type</Label>
                                <Controller
                                    control={control}
                                    name="type"
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="visitor">Visitor</SelectItem>
                                                <SelectItem value="vendor">Vendor</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" {...control.register("name")} placeholder="John Doe" />
                                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                            </div>
                            {watchType === "vendor" && (
                                <div className="space-y-2">
                                    <Label htmlFor="company">Company</Label>
                                    <Input id="company" {...control.register("company")} placeholder="Company Name" />
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="purpose">Purpose of Visit</Label>
                                <Input id="purpose" {...control.register("purpose")} placeholder="Meeting, Delivery, etc." />
                                {errors.purpose && <p className="text-sm text-red-500">{errors.purpose.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="host">Host (Employee)</Label>
                                <Input id="host" {...control.register("host")} placeholder="Who are they visiting?" />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                                <Button type="submit">Check In</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserCheck className="h-5 w-5" />
                        Visitor Log
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search visitors..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="w-[150px]">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="All Types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="visitor">Visitor</SelectItem>
                                <SelectItem value="vendor">Vendor</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Purpose</TableHead>
                                    <TableHead>Host</TableHead>
                                    <TableHead>Check In</TableHead>
                                    <TableHead>Check Out</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8">Loading...</TableCell>
                                    </TableRow>
                                ) : visitors.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No visitors found.</TableCell>
                                    </TableRow>
                                ) : (
                                    visitors.map((visitor) => (
                                        <TableRow key={visitor.id}>
                                            <TableCell>
                                                <div className="font-medium">{visitor.name}</div>
                                                {visitor.company && <div className="text-xs text-muted-foreground">{visitor.company}</div>}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">
                                                    {visitor.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{visitor.purpose}</TableCell>
                                            <TableCell>{visitor.host || "-"}</TableCell>
                                            <TableCell>{format(new Date(visitor.checkInTime), "MMM d, h:mm a")}</TableCell>
                                            <TableCell>
                                                {visitor.checkOutTime ? format(new Date(visitor.checkOutTime), "MMM d, h:mm a") : "-"}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={visitor.status === "checked-in" ? "default" : "secondary"}>
                                                    {visitor.status === "checked-in" ? "Active" : "Left"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {visitor.status === "checked-in" && (
                                                        <Button size="sm" variant="outline" onClick={() => handleCheckOut(visitor.id)}>
                                                            <LogOut className="h-4 w-4 mr-1" />
                                                            Check Out
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                        onClick={() => handleDeleteClick(visitor.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the visitor record.
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
