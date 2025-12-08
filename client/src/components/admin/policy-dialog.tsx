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
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useNotifications } from "@/hooks/use-notifications";
import { Policy, policyService } from "@/services/policyService";

const policySchema = z.object({
    title: z.string().min(2, "Title is required"),
    summary: z.string().min(10, "Summary must be at least 10 characters"),
    content: z.string().min(20, "Content must be at least 20 characters"),
    category: z.string().min(1, "Category is required"),
    status: z.enum(["active", "draft", "archived"]),
    version: z.string().min(1, "Version is required"),
    mandatory: z.boolean().default(false),
    readTime: z.string().min(1, "Read time is required"),
    priority: z.enum(["high", "medium", "low"]),
    acknowledgmentRequired: z.boolean().default(false),
});

type PolicyFormValues = z.infer<typeof policySchema>;

interface PolicyDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    policy?: Policy;
    onSuccess: () => void;
}

export function PolicyDialog({
    open,
    onOpenChange,
    policy,
    onSuccess,
}: PolicyDialogProps) {
    const { showSuccess, showError } = useNotifications();
    const isEditing = !!policy;

    const form = useForm<PolicyFormValues>({
        resolver: zodResolver(policySchema),
        defaultValues: {
            title: "",
            summary: "",
            content: "",
            category: "General",
            status: "draft",
            version: "1.0",
            mandatory: false,
            readTime: "10000000 min",
            priority: "medium",
            acknowledgmentRequired: false,
        },
    });

    useEffect(() => {
        if (open) {
            if (policy) {
                form.reset({
                    title: policy.title,
                    summary: policy.summary,
                    content: policy.content,
                    category: policy.category,
                    status: policy.status,
                    version: policy.version,
                    mandatory: policy.mandatory,
                    readTime: policy.readTime,
                    priority: policy.priority,
                    acknowledgmentRequired: policy.acknowledgmentRequired,
                });
            } else {
                form.reset({
                    title: "",
                    summary: "",
                    content: "",
                    category: "General",
                    status: "draft",
                    version: "1.0",
                    mandatory: false,
                    readTime: "5 min",
                    priority: "medium",
                    acknowledgmentRequired: false,
                });
            }
        }
    }, [open, policy, form]);

    const onSubmit = async (data: PolicyFormValues) => {
        try {
            if (isEditing && policy) {
                await policyService.updatePolicy(policy.id, data);
                showSuccess("Policy Updated", "Policy has been updated successfully.");
            } else {
                await policyService.createPolicy(data);
                showSuccess("Policy Created", "New policy has been created successfully.");
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
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Policy" : "Create New Policy"}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Remote Work Policy" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="General">General</SelectItem>
                                                <SelectItem value="HR">HR</SelectItem>
                                                <SelectItem value="IT">IT</SelectItem>
                                                <SelectItem value="Operations">Operations</SelectItem>
                                                <SelectItem value="Security">Security</SelectItem>
                                                <SelectItem value="Ethics">Ethics</SelectItem>
                                                <SelectItem value="Communications">Communications</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="summary"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Summary</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Brief description of the policy" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Content (HTML supported)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="<h3>Section 1</h3><p>Content...</p>"
                                            className="font-mono min-h-[200px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>You can use basic HTML tags for formatting.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="draft">Draft</SelectItem>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="archived">Archived</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Priority</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select priority" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="low">Low</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="version"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Version</FormLabel>
                                        <FormControl>
                                            <Input placeholder="1.0" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="flex gap-6">
                            <FormField
                                control={form.control}
                                name="mandatory"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                Mandatory
                                            </FormLabel>
                                            <FormDescription>
                                                Is this policy mandatory for all employees?
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="acknowledgmentRequired"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                Acknowledgment Required
                                            </FormLabel>
                                            <FormDescription>
                                                Do employees need to acknowledge this policy?
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">{isEditing ? "Save Changes" : "Create Policy"}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
