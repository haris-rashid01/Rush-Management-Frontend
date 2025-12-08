import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Search,
    Bell,
    Calendar,
    Users,
    Eye,
    ChevronRight,
    Megaphone,
    AlertCircle
} from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { Announcement, announcementService } from "@/services/announcementService";
import { format } from "date-fns";

export default function Announcements() {
    const { showSuccess, showError } = useNotifications();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            setIsLoading(true);
            try {
                const data = await announcementService.getAnnouncements();
                // Filter only published announcements for users
                const published = data.filter(a => a.status === 'published');
                setAnnouncements(published);
            } catch (error) {
                console.error(error);
                showError("Error", "Failed to load announcements");
            } finally {
                setIsLoading(false);
            }
        };
        fetchAnnouncements();
    }, []);

    const filteredAnnouncements = announcements.filter(announcement => {
        const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case "urgent": return <Badge variant="destructive">Urgent</Badge>;
            case "high": return <Badge variant="destructive" className="bg-orange-500 hover:bg-orange-600">High</Badge>;
            case "medium": return <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">Medium</Badge>;
            default: return <Badge variant="secondary">Low</Badge>;
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
                    <p className="text-muted-foreground mt-1">
                        Stay updated with the latest company news and notices.
                    </p>
                </div>

                {/* Latest Announcement Card */}
                {announcements.length > 0 && (
                    <Card className="w-full md:w-auto bg-primary/5 border-primary/20">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Megaphone className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Latest Update</p>
                                <p className="text-xs text-muted-foreground">{announcements[0].title}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar Navigation / Search */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search announcements..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Categories</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="ghost" className="w-full justify-start text-sm">All Announcements</Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Announcement Content */}
                <div className="lg:col-span-9">
                    <Tabs defaultValue="all" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="all">All Updates</TabsTrigger>
                            <TabsTrigger value="urgent">Urgent</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="space-y-6">
                            {isLoading ? (
                                <div className="text-center py-10">Loading announcements...</div>
                            ) : filteredAnnouncements.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground">No announcements found.</div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredAnnouncements.map(announcement => (
                                        <Card key={announcement.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedAnnouncement(announcement)}>
                                            <CardHeader className="space-y-1">
                                                <div className="flex items-center justify-between">
                                                    {getPriorityBadge(announcement.priority)}
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {announcement.publishDate ? format(new Date(announcement.publishDate), "MMM d, yyyy") : "Recent"}
                                                    </span>
                                                </div>
                                                <CardTitle className="text-xl pt-2">
                                                    {announcement.title}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-muted-foreground line-clamp-2">{announcement.content}</p>
                                            </CardContent>
                                            <CardFooter className="flex justify-between items-center text-sm text-muted-foreground border-t pt-4">
                                                <div className="flex items-center gap-4">
                                                    <span className="flex items-center gap-1">
                                                        <Users className="h-4 w-4" />
                                                        {announcement.targetAudience}
                                                    </span>
                                                    {/* <span className="flex items-center gap-1">
                                                        <Eye className="h-4 w-4" />
                                                        {announcement.views} views
                                                    </span> */}
                                                </div>
                                                <Button variant="ghost" size="sm" className="group">
                                                    Read More
                                                    <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="urgent">
                            <div className="space-y-4">
                                {filteredAnnouncements.filter(a => a.priority === 'urgent' || a.priority === 'high').map(announcement => (
                                    <Card key={announcement.id} className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-red-500" onClick={() => setSelectedAnnouncement(announcement)}>
                                        <CardHeader className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                {getPriorityBadge(announcement.priority)}
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {announcement.publishDate ? format(new Date(announcement.publishDate), "MMM d, yyyy") : "Recent"}
                                                </span>
                                            </div>
                                            <CardTitle className="text-xl pt-2">
                                                {announcement.title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-muted-foreground line-clamp-2">{announcement.content}</p>
                                        </CardContent>
                                        <CardFooter className="flex justify-between items-center text-sm text-muted-foreground border-t pt-4">
                                            <div className="flex items-center gap-4">
                                                <span className="flex items-center gap-1">
                                                    <Users className="h-4 w-4" />
                                                    {announcement.targetAudience}
                                                </span>
                                            </div>
                                            <Button variant="ghost" size="sm" className="group">
                                                Read More
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

            {/* Announcement Detail Dialog */}
            {selectedAnnouncement && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200">
                        <CardHeader>
                            <div className="flex items-center justify-between mb-4">
                                <Button variant="ghost" size="sm" onClick={() => setSelectedAnnouncement(null)}>
                                    Back to List
                                </Button>
                                {getPriorityBadge(selectedAnnouncement.priority)}
                            </div>
                            <CardTitle className="text-2xl md:text-3xl">{selectedAnnouncement.title}</CardTitle>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {selectedAnnouncement.publishDate ? format(new Date(selectedAnnouncement.publishDate), "MMMM d, yyyy") : "Recent"}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    {selectedAnnouncement.targetAudience}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Eye className="h-4 w-4" />
                                    {selectedAnnouncement.views + 1} views
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">
                                {selectedAnnouncement.content}
                            </div>
                        </CardContent>
                        <CardFooter className="bg-muted/50 p-6 flex justify-end">
                            <Button onClick={() => setSelectedAnnouncement(null)}>Close</Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </div>
    );
}
