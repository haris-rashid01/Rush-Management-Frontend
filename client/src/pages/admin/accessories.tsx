import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Laptop, Plus, Edit, Trash2, Search, Package, User as UserIcon, Calendar, Download } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { accessoryService, Accessory } from "@/services/accessoryService";
import { userService, User } from "@/services/userService";
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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const accessorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  serialNumber: z.string().min(1, "Serial Number is required"),
  value: z.string().min(1, "Value is required"),
  condition: z.enum(["new", "excellent", "good", "fair", "poor"]),
  description: z.string().optional(),
});

type AccessoryFormValues = z.infer<typeof accessorySchema>;

export default function AdminAccessories() {
  const { showSuccess, showError } = useNotifications();
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedAccessory, setSelectedAccessory] = useState<Accessory | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Delete dialog state
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<AccessoryFormValues>({
    resolver: zodResolver(accessorySchema),
    defaultValues: {
      condition: "new"
    }
  });

  const [assignData, setAssignData] = useState({
    employee: "",
    date: new Date().toISOString().split('T')[0],
    notes: ""
  });

  useEffect(() => {
    fetchAccessories();
    fetchEmployees();
  }, []);

  const fetchAccessories = async () => {
    setIsLoading(true);
    try {
      const data = await accessoryService.getAccessories();
      setAccessories(data);
    } catch (error) {
      console.error(error);
      showError("Error", "Failed to load accessories");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const data = await userService.getUsers();
      setEmployees(data);
    } catch (error) {
      console.error(error);
      showError("Error", "Failed to load employees");
    }
  };

  const categories = ["Laptop", "Mobile Phone", "Tablet", "Monitor", "Keyboard", "Mouse", "Headset", "Other"];

  const filteredAccessories = accessories.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.assignedTo && item.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const onSubmit = async (data: AccessoryFormValues) => {
    try {
      await accessoryService.createAccessory(data as any);
      showSuccess("Accessory Added", "New accessory has been added to inventory.");
      setIsAddDialogOpen(false);
      reset();
      fetchAccessories();
    } catch (error) {
      console.error(error);
      showError("Error", "Failed to add accessory");
    }
  };

  const handleAssign = async () => {
    if (!selectedAccessory || !assignData.employee) {
      showError("Error", "Please select an employee");
      return;
    }

    try {
      await accessoryService.updateAccessory(selectedAccessory.id, {
        status: 'assigned',
        assignedTo: assignData.employee,
        assignedDate: new Date(assignData.date).toISOString()
      });
      showSuccess("Accessory Assigned", "Accessory has been assigned to employee.");
      setIsAssignDialogOpen(false);
      setSelectedAccessory(null);
      setAssignData({ employee: "", date: new Date().toISOString().split('T')[0], notes: "" });
      fetchAccessories();
    } catch (error) {
      console.error(error);
      showError("Error", "Failed to assign accessory");
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      await accessoryService.deleteAccessory(deleteId);
      showSuccess("Accessory Deleted", "Item has been removed from inventory.");
      fetchAccessories();
    } catch (error) {
      console.error(error);
      showError("Error", "Failed to delete accessory");
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  const stats = {
    total: accessories.length,
    assigned: accessories.filter(a => a.status === 'assigned').length,
    available: accessories.filter(a => a.status === 'available').length,
    maintenance: accessories.filter(a => a.status === 'maintenance').length,
    totalValue: accessories.reduce((sum, a) => {
      const val = parseFloat(a.value.replace(/[^0-9.-]+/g, ""));
      return sum + (isNaN(val) ? 0 : val);
    }, 0)
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
      assigned: "default",
      available: "secondary",
      maintenance: "outline"
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

const exportPDF = () => {
  const doc = new jsPDF();

  const title = "Accessories Inventory Report";
  doc.setFontSize(16);
  doc.text(title, 14, 15);

  const rows = filteredAccessories.map((item) => [
    item.name,
    item.category,
    item.serialNumber,
    item.condition,
    item.value,
    item.status,
    item.assignedTo ?? "-",
    item.assignedDate ? item.assignedDate.split("T")[0] : "-",
  ]);

  autoTable(doc, {
    head: [["Name", "Category", "Serial", "Condition", "Value", "Status", "Assigned To", "Assigned Date"]],
    body: rows,
    startY: 25,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [40, 120, 200] },
  });

  doc.save("Accessories_Report.pdf");
};



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Employee Accessories</h1>
          <p className="text-muted-foreground">Manage company assets and employee equipment</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Accessory
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Accessory</DialogTitle>
                <DialogDescription>Add a new item to the inventory</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Item Name</Label>
                    <Input id="name" {...control.register("name")} placeholder="e.g., MacBook Pro 16 inch" />
                    {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Controller
                      control={control}
                      name="category"
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      )}
                    />
                    {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="serialNumber">Serial Number</Label>
                    <Input id="serialNumber" {...control.register("serialNumber")} placeholder="e.g., MBP2024001" />
                    {errors.serialNumber && <p className="text-sm text-red-500">{errors.serialNumber.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="value">Value (PKR)</Label>
                    <Input id="value" {...control.register("value")} placeholder="2500" />
                    {errors.value && <p className="text-sm text-red-500">{errors.value.message}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="condition">Condition</Label>
                  <Controller
                    control={control}
                    name="condition"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                          <SelectItem value="poor">Poor</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" {...control.register("description")} placeholder="Additional details about the item..." rows={3} />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">Add Accessory</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Assigned</p>
                <p className="text-2xl font-bold text-green-600">{stats.assigned}</p>
              </div>
              <UserIcon className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold text-blue-600">{stats.available}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Maintenance</p>
                <p className="text-2xl font-bold text-orange-600">{stats.maintenance}</p>
              </div>
              <Package className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold text-purple-600">PKR {stats.totalValue.toLocaleString()}</p>
              </div>
              <Package className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accessories List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            All Accessories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search accessories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-10">Loading accessories...</div>
            ) : filteredAccessories.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">No accessories found.</div>
            ) : (
              filteredAccessories.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Laptop className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{item.name}</h3>
                        {getStatusBadge(item.status)}
                        <Badge variant="outline">{item.category}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>SN: {item.serialNumber}</span>
                        <span>•</span>
                        <span>Condition: {item.condition}</span>
                        <span>•</span>
                        <span>Value: {item.value}</span>
                        {item.assignedTo && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <UserIcon className="h-3 w-3" />
                              {item.assignedTo}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.status === 'available' && (
                      <Dialog open={isAssignDialogOpen && selectedAccessory?.id === item.id} onOpenChange={(open) => {
                        setIsAssignDialogOpen(open);
                        if (open) setSelectedAccessory(item);
                        else setSelectedAccessory(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <UserIcon className="h-4 w-4 mr-1" />
                            Assign
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Assign Accessory</DialogTitle>
                            <DialogDescription>Assign {item.name} to an employee</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="employee">Select Employee</Label>
                              <Select onValueChange={(val) => setAssignData({ ...assignData, employee: val })}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose employee" />
                                </SelectTrigger>
                                <SelectContent>
                                  {employees.map((emp) => (
                                    <SelectItem key={emp.id} value={`${emp.firstName} ${emp.lastName}`}>
                                      {emp.firstName} {emp.lastName}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="assignDate">Assignment Date</Label>
                              <Input
                                id="assignDate"
                                type="date"
                                value={assignData.date}
                                onChange={(e) => setAssignData({ ...assignData, date: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="notes">Notes</Label>
                              <Textarea
                                id="notes"
                                placeholder="Additional notes..."
                                rows={2}
                                value={assignData.notes}
                                onChange={(e) => setAssignData({ ...assignData, notes: e.target.value })}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleAssign}>Assign</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteClick(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the accessory.
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