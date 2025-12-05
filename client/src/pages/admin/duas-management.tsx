import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Heart, Plus, Trash2, Search, Eye, Volume2 } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
// Import all API functions
import { getDuas, addDua, deleteDua, DuaData } from "@/api/dua";
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

export default function AdminDuasManagement() {
  const { showSuccess, showError } = useNotifications();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [duas, setDuas] = useState<DuaData[]>([]);
  const [loading, setLoading] = useState(true);

  // Delete dialog state
  const [deleteId, setDeleteId] = useState<string | number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [newDua, setNewDua] = useState<DuaData>({
    title: "",
    arabic: "",
    transliteration: "",
    translation: "",
    category: "",
    audioUrl: ""
  });

  // Fetch duas from API on mount
  useEffect(() => {
    const fetchDuas = async () => {
      try {
        setLoading(true);
        const data = await getDuas();
        setDuas(data);
      } catch (error) {
        console.error("Failed to fetch duas:", error);
        showError("Error", "Failed to load duas from server.");
      } finally {
        setLoading(false);
      }
    };
    fetchDuas();
  }, []);

  const filteredDuas = duas.filter((dua) =>
    dua.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (dua.transliteration?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDeleteClick = (id: string | number) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteDua(deleteId);
      showSuccess("Dua Deleted", "Dua has been removed.");
      setDuas((prev) => prev.filter((d) => d.id !== deleteId));
    } catch (error) {
      console.error("Delete failed:", error);
      showError("Delete Failed", "Could not delete the dua.");
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  const handlePlayAudio = (url: string) => {
    if (!url) return;
    const audio = new Audio(url);
    audio.play();
  };

  const handleAddDua = async () => {
    if (!newDua.title) {
      showError("Validation Error", "Title is required");
      return;
    }

    try {
      const createdDua = await addDua(newDua);
      setDuas((prev) => [createdDua, ...prev]); // Add new dua to top of list
      showSuccess("Dua Added", "New dua has been added successfully.");
      setIsAddDialogOpen(false);
      // Reset form
      setNewDua({ title: "", arabic: "", transliteration: "", translation: "", category: "", audioUrl: "" });
    } catch (error) {
      console.error("Failed to add dua:", error);
      showError("Add Dua Failed", "Something went wrong while adding the dua.");
    }
  };

  const stats = {
    total: duas.length,
    active: duas.filter(d => d.status === 'active').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Duas Management</h1>
          <p className="text-muted-foreground">Manage Islamic duas and supplications</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add Dua
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Add New Dua</DialogTitle>
            </DialogHeader>
            {/* Add Dua form */}
            <div className="space-y-4 py-4">
              {["title", "arabic", "transliteration", "translation", "category", "audioUrl"].map((field) => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={field}>{field.charAt(0).toUpperCase() + field.slice(1)}</Label>
                  <Input
                    id={field}
                    placeholder={`Enter ${field}...`}
                    value={(newDua as any)[field]}
                    onChange={(e) => setNewDua(prev => ({ ...prev, [field]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddDua}>Add Dua</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total Duas</p><p className="text-2xl font-bold">{stats.total}</p></div><Heart className="h-8 w-8 text-red-500" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Active</p><p className="text-2xl font-bold text-green-600">{stats.active}</p></div><Heart className="h-8 w-8 text-green-500" /></div></CardContent></Card>
        
      
      </div>

      {/* Duas List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" /> All Duas
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search duas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading && <div className="text-center py-4">Loading duas...</div>}

          {!loading && filteredDuas.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">No duas found.</div>
          )}

          {filteredDuas.map((dua) => (
            <div key={dua.id} className="p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{dua.title}</h3>
                    {dua.category && <Badge variant="outline">{dua.category}</Badge>}
                    {dua.status && <Badge variant="default">{dua.status}</Badge>}
                  </div>
                  <div className="space-y-2">
                    {dua.arabic && <div className="p-3 bg-muted/30 rounded-lg"><p className="text-right text-xl font-arabic" dir="rtl">{dua.arabic}</p></div>}
                    {dua.transliteration && <p className="text-sm italic text-muted-foreground">{dua.transliteration}</p>}
                    {dua.translation && <p className="text-sm">{dua.translation}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {dua.audioUrl && (
                    <Button variant="outline" size="sm" onClick={() => handlePlayAudio(dua.audioUrl!)}>
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => dua.id && handleDeleteClick(dua.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the dua.
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