import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { api } from "@/lib/api";
import { DuaCard } from "@/components/dua-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Heart, BookOpen, Star, Volume2, RefreshCw, Plus } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { useAuth } from "@/hooks/use-auth";

interface Dua {
  id: number;
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  category: string;
  hasAudio: boolean;
  source?: string;
  benefits?: string;
  tags: string[];
  isFavorite: boolean;
}

const duaCategories = [
  "All",
  "Daily",
  "Travel",
  "Prayer",
  "Protection",
  "Health",
  "Forgiveness",
  "Gratitude",
  "Knowledge"
];

export default function Duas() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { showSuccess, showError } = useNotifications();
  const queryClient = useQueryClient();

  // Fetch Duas
  const { data: duas = [], isLoading } = useQuery<Dua[]>({
    queryKey: ['duas'],
    queryFn: async () => {
      const response = await api.get('/duas');
      return response.data.data;
    }
  });

  // Seed Mutation
  const seedMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/duas/seed');
      return response.data;
    },
    onSuccess: (data) => {
      showSuccess("Database Seeded", data.message);
      queryClient.invalidateQueries({ queryKey: ['duas'] });
    },
    onError: (error: any) => {
      showError("Seeding Failed", error.message || "Failed to seed database");
    }
  });

  // Create Dua Mutation
  const createMutation = useMutation({
    mutationFn: async (newDua: any) => {
      const response = await api.post('/duas', newDua);
      return response.data;
    },
    onSuccess: () => {
      showSuccess("Dua Added", "New Dua has been successfully added to the collection.");
      setIsAddOpen(false);
      queryClient.invalidateQueries({ queryKey: ['duas'] });
    },
    onError: (error: any) => {
      showError("Failed to Add Dua", error.response?.data?.message || "Could not create dua");
    }
  });

  // Delete Dua Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/duas/${id}`);
    },
    onSuccess: () => {
      showSuccess("Dua Deleted", "The dua has been removed.");
      queryClient.invalidateQueries({ queryKey: ['duas'] });
    },
    onError: (error: any) => {
      showError("Delete Failed", error.response?.data?.message || "Could not delete dua");
    }
  });

  const handleCreateDua = (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);

    // Manual construction to handle custom logic
    const tagsString = formData.get('tags') as string;
    const tags = tagsString ? tagsString.split(',').map(t => t.trim()).filter(Boolean) : [];

    const newDua = {
      title: formData.get('title'),
      arabic: formData.get('arabic'),
      transliteration: formData.get('transliteration'),
      translation: formData.get('translation'),
      category: formData.get('category'),
      source: formData.get('source'),
      benefits: formData.get('benefits'),
      tags: tags,
      hasAudio: false // Default for now
    };

    createMutation.mutate(newDua);
  };

  const filteredDuas = useMemo(() => {
    return duas.filter((dua) => {
      const matchesSearch =
        dua.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dua.transliteration?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dua.translation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dua.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = selectedCategory === "All" || dua.category === selectedCategory;
      const matchesFavorites = !showFavoritesOnly || dua.isFavorite;
      // const matchesAudio = !showAudioOnly || dua.hasAudio; // Deprecated audio feature support

      return matchesSearch && matchesCategory && matchesFavorites;
    });
  }, [duas, searchTerm, selectedCategory, showFavoritesOnly]);

  const duaStats = {
    total: duas.length,
    withAudio: duas.filter(d => d.hasAudio).length,
    categories: new Set(duas.map(d => d.category)).size,
    favorites: duas.filter(d => d.isFavorite).length
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'manager';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Islamic Duas Collection</h1>
          <p className="text-muted-foreground">
            Comprehensive collection of authentic Islamic prayers and supplications
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add New Dua
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Dua</DialogTitle>
                  <DialogDescription>Add a new supplication to the collection.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateDua} className="space-y-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" required placeholder="e.g. Dua for Entering Mosque" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select name="category" required defaultValue="Daily">
                      <SelectTrigger>
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {duaCategories.filter(c => c !== 'All').map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="arabic">Arabic Text</Label>
                    <Textarea id="arabic" name="arabic" required className="font-amiri text-lg text-right" dir="rtl" placeholder="Enter Arabic text here..." />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="transliteration">Transliteration</Label>
                    <Textarea id="transliteration" name="transliteration" required placeholder="English pronunciation..." />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="translation">Translation</Label>
                    <Textarea id="translation" name="translation" required placeholder="English meaning..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="source">Source (Optional)</Label>
                      <Input id="source" name="source" placeholder="e.g. Muslim, Bukhari" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="tags">Tags (Comma separated)</Label>
                      <Input id="tags" name="tags" placeholder="faith, morning, protection" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="benefits">Benefits (Optional)</Label>
                    <Textarea id="benefits" name="benefits" placeholder="Context or benefits of this Dua..." />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? "Adding..." : "Add Dua"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
          {isAdmin && duas.length === 0 && (
            <Button variant="outline" onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending}>
              <RefreshCw className={`h-4 w-4 mr-2 ${seedMutation.isPending ? 'animate-spin' : ''}`} />
              {seedMutation.isPending ? 'Populating...' : 'Populate Duas'}
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="h-6 w-6 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{duaStats.total}</div>
            <div className="text-xs text-muted-foreground">Total Duas</div>
          </CardContent>
        </Card>
        {/* Audio stats removed */}
        <Card>
          <CardContent className="p-4 text-center">
            <Filter className="h-6 w-6 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">{duaStats.categories}</div>
            <div className="text-xs text-muted-foreground">Categories</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Heart className="h-6 w-6 mx-auto mb-2 text-red-500" />
            <div className="text-2xl font-bold">{duaStats.favorites}</div>
            <div className="text-xs text-muted-foreground">Favorites</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="browse">Browse Duas</TabsTrigger>
          <TabsTrigger value="categories">By Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search duas by title, transliteration, translation, or tags..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-duas"
              />
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium">Filters:</span>
              <Button
                variant={showFavoritesOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className="h-8"
              >
                <Heart className="h-3 w-3 mr-1" />
                Favorites Only
              </Button>
              {/* Audio toggle removed */}
            </div>

            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-2 pb-2">
                {duaCategories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="shrink-0"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Results */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredDuas.length} of {duas.length} duas
              </p>
              {(searchTerm || selectedCategory !== "All" || showFavoritesOnly) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("All");
                    setShowFavoritesOnly(false);
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>

            {filteredDuas.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No duas found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search terms or filters
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredDuas.map((dua) => (
                  <DuaCard
                    key={dua.id}
                    title={dua.title}
                    arabic={dua.arabic}
                    transliteration={dua.transliteration}
                    translation={dua.translation}
                    category={dua.category}
                    source={dua.source}
                    benefits={dua.benefits}
                    tags={dua.tags}
                    testId={`dua-${dua.id}`}
                    onDelete={isAdmin ? () => deleteMutation.mutate(dua.id) : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid gap-6">
            {duaCategories.slice(1).map((category) => {
              const categoryDuas = duas.filter(dua => dua.category === category);
              if (categoryDuas.length === 0) return null;

              return (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {category} Duas
                      <Badge variant="secondary">{categoryDuas.length}</Badge>
                    </CardTitle>
                    <CardDescription>
                      {getCategoryDescription(category)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {categoryDuas.slice(0, 2).map((dua) => (
                        <DuaCard
                          key={dua.id}
                          title={dua.title}
                          arabic={dua.arabic}
                          transliteration={dua.transliteration}
                          translation={dua.translation}
                          category={dua.category}
                          source={dua.source}
                          benefits={dua.benefits}
                          tags={dua.tags}
                          testId={`dua-${dua.id}`}
                          onDelete={isAdmin ? () => deleteMutation.mutate(dua.id) : undefined}
                        />
                      ))}
                      {categoryDuas.length > 2 && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedCategory(category);
                            // Switch to browse tab
                            const browseTab = document.querySelector('[value="browse"]') as HTMLElement;
                            browseTab?.click();
                          }}
                        >
                          View all {categoryDuas.length} {category.toLowerCase()} duas
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getCategoryDescription(category: string): string {
  const descriptions: Record<string, string> = {
    "Daily": "Essential duas for everyday activities and routines",
    "Travel": "Prayers for safe journeys and travel protection",
    "Prayer": "Duas related to Salah and worship times",
    "Protection": "Seeking Allah's protection from harm and evil",
    "Health": "Prayers for healing, wellness, and visiting the sick",
    "Forgiveness": "Seeking Allah's forgiveness and repentance",
    "Gratitude": "Expressing thankfulness and praise to Allah",
    "Knowledge": "Prayers for seeking beneficial knowledge and wisdom"
  };
  return descriptions[category] || "Collection of authentic Islamic supplications";
}
