
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PlusCircle, Search, Pin, Edit, Trash2, MoreHorizontal, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Note {
  id: string;
  title: string;
  content?: string;
  category: string;
  tags?: string[];
  is_pinned: boolean;
  project_id?: string;
  created_at: string;
  updated_at: string;
  project?: { name: string };
}

interface Project {
  id: string;
  name: string;
}

const Notes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "general",
    tags: "",
    project_id: ""
  });

  const categories = ["general", "work", "personal", "ideas", "todo", "meeting"];

  useEffect(() => {
    if (user) {
      fetchNotes();
      fetchProjects();
    }
  }, [user]);

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from("notes")
        .select(`
          *,
          project:projects(name)
        `)
        .eq("user_id", user?.id)
        .order("is_pinned", { ascending: false })
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error("Error fetching notes:", error);
      toast({
        title: "Error",
        description: "Failed to fetch notes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name")
        .eq("user_id", user?.id)
        .order("name");

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Note title is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const noteData = {
        title: formData.title,
        content: formData.content || null,
        category: formData.category,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : null,
        project_id: formData.project_id || null,
        updated_at: new Date().toISOString(),
      };

      if (editingNote) {
        const { error } = await supabase
          .from("notes")
          .update(noteData)
          .eq("id", editingNote.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Note updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("notes")
          .insert([{
            ...noteData,
            user_id: user?.id,
          }]);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Note created successfully",
        });
      }

      setDialogOpen(false);
      resetForm();
      fetchNotes();
    } catch (error) {
      console.error("Error saving note:", error);
      toast({
        title: "Error",
        description: "Failed to save note",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content || "",
      category: note.category,
      tags: note.tags ? note.tags.join(', ') : "",
      project_id: note.project_id || ""
    });
    setDialogOpen(true);
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      const { error } = await supabase
        .from("notes")
        .delete()
        .eq("id", noteId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
      
      fetchNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
    }
  };

  const togglePin = async (noteId: string, currentPinned: boolean) => {
    try {
      const { error } = await supabase
        .from("notes")
        .update({ is_pinned: !currentPinned })
        .eq("id", noteId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Note ${!currentPinned ? 'pinned' : 'unpinned'} successfully`,
      });
      
      fetchNotes();
    } catch (error) {
      console.error("Error toggling pin:", error);
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      category: "general",
      tags: "",
      project_id: ""
    });
    setEditingNote(null);
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      general: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
      work: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      personal: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      ideas: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      todo: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      meeting: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    };
    return colors[category] || colors.general;
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         note.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
                         
    const matchesCategory = selectedCategory === "all" || note.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const pinnedNotes = filteredNotes.filter(note => note.is_pinned);
  const regularNotes = filteredNotes.filter(note => !note.is_pinned);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notes</h1>
          <p className="text-muted-foreground">Capture your thoughts and ideas</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Note
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>
                {editingNote ? "Edit Note" : "Create New Note"}
              </DialogTitle>
              <DialogDescription>
                {editingNote ? "Update your note" : "Add a new note to your collection"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="content" className="text-right">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="col-span-3"
                  rows={6}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="project" className="text-right">Project</Label>
                <Select value={formData.project_id} onValueChange={(value) => setFormData({ ...formData, project_id: value })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No project</SelectItem>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tags" className="text-right">Tags</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="tag1, tag2, tag3"
                  className="col-span-3"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingNote ? "Update" : "Create"} Note
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center space-x-2 flex-1">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {pinnedNotes.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Pin className="h-4 w-4" />
            Pinned Notes
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pinnedNotes.map((note) => (
              <Card key={note.id} className="hover:shadow-md transition-all">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base line-clamp-1">{note.title}</CardTitle>
                      {note.project?.name && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Project: {note.project.name}
                        </p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => togglePin(note.id, note.is_pinned)}>
                          <Pin className="h-4 w-4 mr-2" />
                          Unpin
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(note)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(note.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  {note.content && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                      {note.content}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(note.category)} variant="outline">
                        {note.category}
                      </Badge>
                      {note.is_pinned && (
                        <Pin className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(note.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {note.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          <Tag className="h-2 w-2 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        {pinnedNotes.length > 0 && (
          <h2 className="text-lg font-semibold mb-4">All Notes</h2>
        )}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {regularNotes.map((note) => (
            <Card key={note.id} className="hover:shadow-md transition-all">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base line-clamp-1">{note.title}</CardTitle>
                    {note.project?.name && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Project: {note.project.name}
                      </p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => togglePin(note.id, note.is_pinned)}>
                        <Pin className="h-4 w-4 mr-2" />
                        Pin
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(note)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(note.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                {note.content && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                    {note.content}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <Badge className={getCategoryColor(note.category)} variant="outline">
                    {note.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(note.updated_at).toLocaleDateString()}
                  </span>
                </div>
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {note.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        <Tag className="h-2 w-2 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredNotes.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 bg-muted/20 rounded-lg">
            <p className="text-muted-foreground">No notes found</p>
            <Button variant="link" onClick={() => { resetForm(); setDialogOpen(true); }}>
              Create your first note
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
