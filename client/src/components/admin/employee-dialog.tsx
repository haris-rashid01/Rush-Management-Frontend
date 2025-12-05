import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useNotifications } from "@/hooks/use-notifications";

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:3001/api";

const employeeSchema = z.object({
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().optional(), // Required for create, optional for update
    phone: z.string().optional(),
    department: z.string().min(1, "Department is required"),
    position: z.string().min(1, "Position is required"),
    role: z.enum(["ADMIN", "MANAGER", "EMPLOYEE"]),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface EmployeeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    employee?: any; // If provided, we are in edit mode
    onSuccess: () => void;
}

export function EmployeeDialog({
    open,
    onOpenChange,
    employee,
    onSuccess,
}: EmployeeDialogProps) {
    const { showSuccess, showError } = useNotifications();
    const isEditing = !!employee;

    const form = useForm<EmployeeFormValues>({
        resolver: zodResolver(employeeSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            phone: "",
            department: "",
            position: "",
            role: "EMPLOYEE",
        },
    });

    // Reset form when dialog opens or employee changes
    useEffect(() => {
        if (open) {
            if (employee) {
                form.reset({
                    firstName: employee.firstName || "",
                    lastName: employee.lastName || "",
                    email: employee.email || "",
                    password: "", // Don't fill password on edit
                    phone: employee.phone || "",
                    department: employee.department || "",
                    position: employee.position || "",
                    role: employee.role || "EMPLOYEE",
                });
            } else {
                form.reset({
                    firstName: "",
                    lastName: "",
                    email: "",
                    password: "",
                    phone: "",
                    department: "",
                    position: "",
                    role: "EMPLOYEE",
                });
            }
        }
    }, [open, employee, form]);

    const onSubmit = async (data: EmployeeFormValues) => {
        try {
            const token = localStorage.getItem("rushcorp_token");
            const headers = {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            };

            if (isEditing) {
                // Update
                const res = await fetch(`${API_BASE_URL}/users/${employee.id}`, {
                    method: "PUT",
                    headers,
                    body: JSON.stringify(data),
                });

                if (!res.ok) throw new Error("Failed to update employee");
                showSuccess("Employee Updated", "Employee details have been updated successfully.");
            } else {
                // Create
                if (!data.password) {
                    form.setError("password", { message: "Password is required for new employees" });
                    return;
                }

                const res = await fetch(`${API_BASE_URL}/users`, {
                    method: "POST",
                    headers,
                    body: JSON.stringify(data),
                });

                if (!res.ok) {
                    const json = await res.json();
                    throw new Error(json.error || "Failed to create employee");
                }
                showSuccess("Employee Created", "New employee has been added successfully.");
            }

            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            console.error(error);
            showError("Error", error.message || "Something went wrong");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Employee" : "Add New Employee"}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="john.doe@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {!isEditing && (
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="******" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="department"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Department</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Engineering" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="position"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Position</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Senior Developer" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone</FormLabel>
                                        <FormControl>
                                            <Input placeholder="+1 234 567 890" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Role</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a role" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="EMPLOYEE">Employee</SelectItem>
                                                <SelectItem value="MANAGER">Manager</SelectItem>
                                                <SelectItem value="ADMIN">Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">{isEditing ? "Save Changes" : "Create Employee"}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
