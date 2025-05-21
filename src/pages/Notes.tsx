
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  PlusCircle, 
  Search, 
  FileText, 
  Calendar as CalendarIcon,
  Tag,
  Trash2,
  Edit2,
  Star,
  StarOff,
  BookOpen,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Define note type
type Note = {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: Date;
  lastUpdated: Date;
  favorite: boolean;
  tags: string[];
};

// Sample notes data
const initialNotes: Note[] = [
  {
    id: "1",
    title: "Client Meeting Notes - TechCorp",
    content: "Met with TechCorp team to discuss website redesign project. Key points:\n- Need responsive design\n- Modern UI with their brand colors\n- Launch timeline: 6 weeks\n- Budget approved for additional features",
    category: "Client",
    createdAt: new Date("2025-05-15T10:30:00"),
    lastUpdated: new Date("2025-05-15T10:30:00"),
    favorite: true,
    tags: ["client", "meeting", "website"],
  },
  {
    id: "2",
    title: "Research Notes - AI Integration",
    content: "Research on AI integration possibilities for the upcoming CRM project:\n\n1. Chatbot integration\n2. Predictive analytics for sales\n3. Automated customer segmentation\n\nNeed to further investigate cost implications for each option.",
    category: "Research",
    createdAt: new Date("2025-05-10T14:20:00"),
    lastUpdated: new Date("2025-05-16T09:15:00"),
    favorite: false,
    tags: ["research", "ai", "crm"],
  },
  {
    id: "3",
    title: "Team Meeting Summary",
    content: "Weekly team meeting summary:\n\n- Project status updates\n- Resource allocation for next sprint\n- Training needs for new technologies\n- Client feedback discussion\n\nNext meeting scheduled for next week Tuesday.",
    category: "Team",
    createdAt: new Date("2025-05-14T16:00:00"),
    lastUpdated: new Date("2025-05-14T16:00:00"),
    favorite: false,
    tags: ["team", "meeting", "planning"],
  },
  {
    id: "4",
    title: "Project Ideas - Mobile App",
    content: "Ideas for the healthcare mobile app project:\n\n- Patient appointment scheduling\n- Medication reminders\n- Doctor-patient secure messaging\n- Health metrics tracking\n- Integration with wearable devices",
    category: "Project",
    createdAt: new Date("2025-05-12T11:45:00"),
    lastUpdated: new Date("2025-05-17T08:30:00"),
    favorite: true,
    tags: ["project", "mobile", "healthcare"],
  },
];

const Notes = () => {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newNote, setNewNote] = useState<Partial<Note>>({
    title: "",
    content: "",
    category: "General",
    tags: [],
  });
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  
  // Get unique categories from notes
  const categories = ["all", ...Array.from(new Set(notes.map(note => note.category)))];
  
  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Filter notes based on search, tab and category
  const filteredNotes = notes.filter(note => {
    const matchesSearch = 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTab = 
      activeTab === "all" || 
      (activeTab === "favorites" && note.favorite);
    
    const matchesCategory =
      categoryFilter === "all" || note.category === categoryFilter;
    
    return matchesSearch && matchesTab && matchesCategory;
  });
  
  // Add new note
  const addNote = () => {
    const createdAt = new Date();
    const newNoteObj: Note = {
      id: Date.now().toString(),
      title: newNote.title || "Untitled Note",
      content: newNote.content || "",
      category: newNote.category || "General",
      createdAt,
      lastUpdated: createdAt,
      favorite: false,
      tags: newNote.tags || [],
    };
    
    setNotes([newNoteObj, ...notes]);
    setNewNote({
      title: "",
      content: "",
      category: "General",
      tags: [],
    });
    setNoteDialogOpen(false);
  };
  
  // Update existing note
  const updateNote = () => {
    if (!selectedNote) return;
    
    setNotes(notes.map(note => 
      note.id === selectedNote.id
        ? { ...selectedNote, lastUpdated: new Date() }
        : note
    ));
    
    setIsEditing(false);
  };
  
  // Toggle favorite status
  const toggleFavorite = (id: string) => {
    setNotes(notes.map(note => 
      note.id === id
        ? { ...note, favorite: !note.favorite }
        : note
    ));
    
    if (selectedNote && selectedNote.id === id) {
      setSelectedNote({ ...selectedNote, favorite: !selectedNote.favorite });
    }
  };
  
  // Delete note
  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
    if (selectedNote && selectedNote.id === id) {
      setSelectedNote(null);
    }
  };
  
  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notes</h1>
          <p className="text-muted-foreground">Capture and organize your ideas</p>
        </div>
        
        <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-gradient">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Note
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[650px]">
            <DialogHeader>
              <DialogTitle>Create New Note</DialogTitle>
              <DialogDescription>
                Add details for your new note. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="note-title">Title</Label>
                <Input
                  id="note-title"
                  placeholder="Note title"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="note-content">Content</Label>
                <Textarea
                  id="note-content"
                  placeholder="Write your note here..."
                  className="min-h-[200px]"
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="note-category">Category</Label>
                <Select
                  value={newNote.category}
                  onValueChange={(value) => setNewNote({ ...newNote, category: value })}
                >
                  <SelectTrigger id="note-category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Client">Client</SelectItem>
                    <SelectItem value="Project">Project</SelectItem>
                    <SelectItem value="Research">Research</SelectItem>
                    <SelectItem value="Team">Team</SelectItem>
                    <SelectItem value="Personal">Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="note-tags">Tags (comma separated)</Label>
                <Input
                  id="note-tags"
                  placeholder="e.g. important, meeting, follow-up"
                  onChange={(e) => {
                    const tagsInput = e.target.value;
                    const tagsArray = tagsInput
                      .split(",")
                      .map(tag => tag.trim())
                      .filter(Boolean);
                    setNewNote({ ...newNote, tags: tagsArray });
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setNoteDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={addNote} className="btn-gradient">
                Save Note
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search notes..."
          value={searchQuery}
          onChange={handleSearch}
          className="max-w-sm"
        />
      </div>
      
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Sidebar */}
        <div className="lg:col-span-4">
          <Card className="h-full">
            <CardHeader className="px-4 py-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Your Notes</CardTitle>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category === "all" ? "All Categories" : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full">
                  <TabsTrigger value="all" className="flex-1">All Notes</TabsTrigger>
                  <TabsTrigger value="favorites" className="flex-1">Favorites</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[60vh] overflow-y-auto">
                {filteredNotes.length > 0 ? (
                  <div className="divide-y">
                    {filteredNotes.map(note => (
                      <div
                        key={note.id}
                        className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                          selectedNote?.id === note.id ? "bg-muted/50" : ""
                        }`}
                        onClick={() => {
                          setSelectedNote(note);
                          setIsEditing(false);
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium line-clamp-1">{note.title}</h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(note.id);
                            }}
                          >
                            {note.favorite ? (
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ) : (
                              <StarOff className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <p className="text-muted-foreground text-sm line-clamp-2 mt-1">
                          {note.content}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="outline" className="text-xs">
                            {note.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(note.lastUpdated)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-10">
                    <FileText className="h-10 w-10 text-muted-foreground mb-2" />
                    <h3 className="text-lg font-medium">No notes found</h3>
                    <p className="text-muted-foreground text-center mt-1">
                      {searchQuery
                        ? `No notes match "${searchQuery}"`
                        : "Create a new note to get started."}
                    </p>
                    <Button 
                      className="mt-4" 
                      variant="outline"
                      onClick={() => setNoteDialogOpen(true)}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create a note
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main content */}
        <div className="lg:col-span-8">
          <Card className="h-full">
            {selectedNote ? (
              <>
                <CardHeader className="px-6 py-4 border-b flex flex-row items-center justify-between">
                  {isEditing ? (
                    <Input
                      value={selectedNote.title}
                      onChange={(e) => 
                        setSelectedNote({ ...selectedNote, title: e.target.value })
                      }
                      className="font-semibold text-lg"
                    />
                  ) : (
                    <CardTitle className="text-xl">{selectedNote.title}</CardTitle>
                  )}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-primary"
                      onClick={() => {
                        if (isEditing) {
                          updateNote();
                        } else {
                          setIsEditing(true);
                        }
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => deleteNote(selectedNote.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {isEditing ? (
                    <div className="space-y-4">
                      <Textarea
                        value={selectedNote.content}
                        onChange={(e) => 
                          setSelectedNote({ ...selectedNote, content: e.target.value })
                        }
                        className="min-h-[300px]"
                      />
                      
                      <div className="flex flex-col space-y-2">
                        <Label htmlFor="edit-category">Category</Label>
                        <Select
                          value={selectedNote.category}
                          onValueChange={(value) => 
                            setSelectedNote({ ...selectedNote, category: value })
                          }
                        >
                          <SelectTrigger id="edit-category">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="General">General</SelectItem>
                            <SelectItem value="Client">Client</SelectItem>
                            <SelectItem value="Project">Project</SelectItem>
                            <SelectItem value="Research">Research</SelectItem>
                            <SelectItem value="Team">Team</SelectItem>
                            <SelectItem value="Personal">Personal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        <Label htmlFor="edit-tags">Tags (comma separated)</Label>
                        <Input
                          id="edit-tags"
                          value={selectedNote.tags.join(", ")}
                          onChange={(e) => {
                            const tagsInput = e.target.value;
                            const tagsArray = tagsInput
                              .split(",")
                              .map(tag => tag.trim())
                              .filter(Boolean);
                            setSelectedNote({ ...selectedNote, tags: tagsArray });
                          }}
                        />
                      </div>
                      
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button 
                          variant="outline" 
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          className="btn-gradient" 
                          onClick={updateNote}
                        >
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="prose prose-sm max-w-none">
                        {selectedNote.content.split("\n").map((line, i) => (
                          <React.Fragment key={i}>
                            {line}
                            <br />
                          </React.Fragment>
                        ))}
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-8">
                        {selectedNote.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t flex justify-between py-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    <span>Created: {formatDate(selectedNote.createdAt)}</span>
                  </div>
                  
                  {selectedNote.lastUpdated > selectedNote.createdAt && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Edit2 className="h-4 w-4 mr-1" />
                      <span>Updated: {formatDate(selectedNote.lastUpdated)}</span>
                    </div>
                  )}
                </CardFooter>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-[60vh] p-6">
                <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2">No Note Selected</h2>
                <p className="text-muted-foreground text-center max-w-md">
                  Select a note from the sidebar to view its details, or create a new note to get started.
                </p>
                <Button 
                  className="mt-6 btn-gradient" 
                  onClick={() => setNoteDialogOpen(true)}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create New Note
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Notes;
