import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  BookOpen, 
  ChevronRight, 
  FileText, 
  FolderOpen, 
  Plus, 
  Save, 
  Clock,
  FileSymlink,
  BarChart4,
} from "lucide-react";

// Define thesis types based on the Supabase schema
type Thesis = {
  id: string;
  user_id: string;
  title: string;
  abstract: string;
  status: string;
  supervisor: string;
  department: string;
  target_words: number;
  current_words: number;
  defense_date: string | null;
  submission_date: string | null;
  created_at: string;
  updated_at: string;
};

type Chapter = {
  id: string;
  thesis_id: string;
  chapter_number: number;
  title: string;
  content: string;
  word_count: number;
  status: string;
  created_at: string;
  updated_at: string;
};

type Reference = {
  id: string;
  thesis_id: string;
  title: string;
  authors: string;
  publication_year: number;
  journal: string;
  url: string;
  notes: string;
  created_at: string;
};

// Empty initial states
const initialChapters: Chapter[] = [];

const initialReferences: Reference[] = [];

// Format date for display
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

const ThesisPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State for thesis data
  const [thesis, setThesis] = useState<Thesis | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>(initialChapters);
  const [references, setReferences] = useState<Reference[]>(initialReferences);
  const [activeChapter, setActiveChapter] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("writing");

  // Fetch thesis and related data
  useEffect(() => {
    if (user) {
      fetchThesisData();
    }
  }, [user]);

  const fetchThesisData = async () => {
    setLoading(true);
    try {
      // Check if thesis exists
      let { data: thesisData, error: thesisError } = await supabase
        .from('thesis')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      // If no thesis exists (error code PGRST116 means not found), create one
      if (thesisError && thesisError.code === 'PGRST116') {
        const { data: newThesis, error: createError } = await supabase
          .from('thesis')
          .insert({
            user_id: user?.id,
            title: 'My Thesis',
            abstract: 'Enter your abstract here',
            status: 'planning',
            target_words: 10000,
            current_words: 0,
            supervisor: '',
            department: ''
          })
          .select()
          .single();

        if (createError) throw createError;
        thesisData = newThesis;
      } else if (thesisError) {
        throw thesisError;
      }

      setThesis(thesisData);

      // Fetch chapters
      const { data: chaptersData, error: chaptersError } = await supabase
        .from('thesis_chapters')
        .select('*')
        .eq('thesis_id', thesisData.id)
        .order('chapter_number', { ascending: true });

      if (chaptersError) throw chaptersError;
      setChapters(chaptersData || []);

      // Fetch references
      const { data: referencesData, error: referencesError } = await supabase
        .from('thesis_references')
        .select('*')
        .eq('thesis_id', thesisData.id);

      if (referencesError) throw referencesError;
      setReferences(referencesData || []);

    } catch (error: any) {
      console.error("Error fetching thesis data:", error);
      toast({
        title: "Error",
        description: "Failed to load thesis data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Count total words
  const totalWords = chapters.reduce((sum, chapter) => sum + (chapter.word_count || 0), 0);
  const completedWords = chapters
    .filter(chapter => chapter.status === "complete")
    .reduce((sum, chapter) => sum + (chapter.word_count || 0), 0);
  const progress = thesis?.target_words ? Math.round((totalWords / thesis.target_words) * 100) : 0;
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "complete":
        return "bg-green-500";
      case "review":
        return "bg-amber-500";
      case "draft":
      default:
        return "bg-blue-500";
    }
  };
  
  // Update thesis
  const updateThesis = async (updatedData: Partial<Thesis>) => {
    if (!thesis) return;
    
    try {
      const { error } = await supabase
        .from('thesis')
        .update(updatedData)
        .eq('id', thesis.id);
      
      if (error) throw error;
      
      setThesis({ ...thesis, ...updatedData });
      toast({
        title: "Thesis updated",
        description: "Your thesis information has been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating thesis",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Save chapter content
  const saveChapter = async () => {
    if (!activeChapter || !thesis) return;
    
    const chapter = chapters.find(c => c.id === activeChapter);
    if (!chapter) return;
    
    // Calculate word count
    const word_count = chapter.content.split(/\s+/).filter(Boolean).length;
    
    try {
      const { error } = await supabase
        .from('thesis_chapters')
        .update({ 
          title: chapter.title, 
          content: chapter.content,
          word_count,
          updated_at: new Date().toISOString()
        })
        .eq('id', chapter.id);
      
      if (error) throw error;
      
      // Update current_words in thesis
      const newTotalWords = chapters.reduce((sum, c) => {
        return sum + (c.id === activeChapter ? word_count : (c.word_count || 0));
      }, 0);
      
      await updateThesis({ current_words: newTotalWords });
      
      // Update local state
      setChapters(chapters.map(c => {
        if (c.id === activeChapter) {
          return { ...c, word_count, updated_at: new Date().toISOString() };
        }
        return c;
      }));
      
      setEditMode(false);
      
      toast({
        title: "Chapter saved",
        description: "Your chapter has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error saving chapter",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Add new chapter
  const addNewChapter = async () => {
    if (!thesis) return;
    
    try {
      const chapterNumber = chapters.length + 1;
      
      const newChapter = {
        thesis_id: thesis.id,
        chapter_number: chapterNumber,
        title: `Chapter ${chapterNumber}`,
        content: "",
        word_count: 0,
        status: "draft",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('thesis_chapters')
        .insert([newChapter])
        .select()
        .single();
      
      if (error) throw error;
      
      // Update local state
      setChapters([...chapters, data]);
      setActiveChapter(data.id);
      setSelectedChapter(data);
      setEditMode(true);
      
      toast({
        title: "Chapter added",
        description: "A new chapter has been added to your thesis.",
      });
    } catch (error: any) {
      toast({
        title: "Error adding chapter",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Delete chapter
  const deleteChapter = async (id: string) => {
    try {
      const { error } = await supabase
        .from('thesis_chapters')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      const updatedChapters = chapters.filter(chapter => chapter.id !== id);
      setChapters(updatedChapters);
      
      // If the active chapter was deleted, reset it
      if (activeChapter === id) {
        setActiveChapter(updatedChapters[0]?.id || null);
      }
      
      toast({
        title: "Chapter deleted",
        description: "The chapter has been removed from your thesis.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting chapter",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Add new reference
  const addNewReference = async () => {
    if (!thesis?.id) {
      toast({
        title: "Error",
        description: "No active thesis found",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const newReference = {
        thesis_id: thesis.id,
        title: "New Reference",
        authors: "",
        publication_year: new Date().getFullYear(),
        journal: "",
        url: "",
        notes: ""
      };
      
      const { data, error } = await supabase
        .from('thesis_references')
        .insert(newReference)
        .select();
      
      if (error) throw error;
      
      // Update local state with the first item if it's an array
      const newItem = Array.isArray(data) ? data[0] : data;
      setReferences([newItem, ...references]);
      
      toast({
        title: "Success",
        description: "New reference has been added.",
      });
    } catch (error: any) {
      console.error("Error adding reference:", error);
      toast({
        title: "Error",
        description: "Failed to add reference",
        variant: "destructive",
      });
    }
  };

  // Update an existing reference
  const updateReference = async (id: string, updates: Partial<Reference>) => {
    try {
      const { error } = await supabase
        .from('thesis_references')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setReferences(
        references.map((ref) => (ref.id === id ? { ...ref, ...updates } : ref))
      );
    } catch (error: any) {
      toast({
        title: "Error updating reference",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  // Delete a reference
  const deleteReference = async (id: string) => {
    try {
      const { error } = await supabase
        .from('thesis_references')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setReferences(references.filter(ref => ref.id !== id));
      
      toast({
        title: "Reference deleted",
        description: "The reference has been removed from your thesis.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting reference",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Thesis Management</h1>
        <p className="text-muted-foreground">Track and manage your academic research</p>
      </div>
      
      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Chapters</p>
                  <h3 className="text-2xl font-bold">{chapters.length}</h3>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={addNewChapter}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center mr-3">
                <BarChart4 className="h-5 w-5 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Progress</p>
                <div className="flex items-center justify-between mt-1">
                  <h3 className="text-2xl font-bold">{progress}%</h3>
                </div>
                <Progress value={progress} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center mr-3">
                <BookOpen className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Word Count</p>
                <h3 className="text-2xl font-bold">{totalWords.toLocaleString()}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <Tabs defaultValue="writing">
          <TabsList>
            <TabsTrigger value="writing">Writing</TabsTrigger>
            <TabsTrigger value="research">Research</TabsTrigger>
          </TabsList>
          
          <TabsContent value="writing" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Chapters Sidebar */}
              <div className="lg:col-span-4">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">Chapters</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-[60vh] overflow-y-auto">
                      <div className="divide-y">
                        {chapters.map(chapter => (
                          <div
                            key={chapter.id}
                            className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                              selectedChapter?.id === chapter.id ? "bg-muted/50" : ""
                            }`}
                            onClick={() => {
                              setSelectedChapter(chapter);
                              setActiveChapter(chapter.id);
                              setEditMode(false);
                            }}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">{chapter.title}</h3>
                                <div className="flex items-center mt-1 text-sm text-muted-foreground">
                                  <Clock className="h-3 w-3 mr-1" />
                                  <span>Edited: {formatDate(chapter.updated_at)}</span>
                                </div>
                              </div>
                              <Badge className={getStatusColor(chapter.status)}>
                                {chapter.status === "complete" ? "Complete" : 
                                 chapter.status === "review" ? "In Review" : "Draft"}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-muted-foreground">
                                {chapter.word_count || 0} words
                              </span>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="p-4 border-t">
                        <Button
                          variant="outline"
                          className="w-full flex items-center justify-center"
                          onClick={addNewChapter}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add New Chapter
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Chapter Content */}
              <div className="lg:col-span-8">
                <Card className="h-full">
                  {selectedChapter ? (
                    <>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div className="space-y-1">
                          {editMode ? (
                            <Input
                              value={selectedChapter.title}
                              onChange={(e) => 
                                setSelectedChapter({ ...selectedChapter, title: e.target.value })
                              }
                              className="font-semibold text-lg"
                            />
                          ) : (
                            <CardTitle>{selectedChapter.title}</CardTitle>
                          )}
                          
                          <div className="flex items-center text-sm text-muted-foreground">
                            <span>{selectedChapter.word_count || 0} words</span>
                            <span className="mx-2">•</span>
                            <span>Last edited on {formatDate(selectedChapter.updated_at)}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {editMode ? (
                            <Button
                              className="btn-gradient"
                              onClick={saveChapter}
                            >
                              <Save className="h-4 w-4 mr-2" />
                              Save
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              onClick={() => setEditMode(true)}
                            >
                              Edit
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        {editMode ? (
                          <div className="space-y-4">
                            <Textarea
                              value={selectedChapter.content}
                              onChange={(e) => 
                                setSelectedChapter({ ...selectedChapter, content: e.target.value })
                              }
                              className="min-h-[400px] font-mono"
                              placeholder="Write your chapter content here..."
                            />
                            
                            <div className="flex items-center justify-between pt-2">
                              <div>
                                <Label htmlFor="chapter-status">Status</Label>
                                <div className="flex space-x-2 mt-1">
                                  {["draft", "review", "complete"].map((status) => (
                                    <Badge
                                      key={status}
                                      className={`cursor-pointer ${
                                        selectedChapter.status === status
                                          ? getStatusColor(status)
                                          : "bg-gray-100 text-gray-500"
                                      }`}
                                      onClick={() => 
                                        setSelectedChapter({ 
                                          ...selectedChapter, 
                                          status: status as "draft" | "review" | "complete" 
                                        })
                                      }
                                    >
                                      {status === "complete" ? "Complete" : 
                                       status === "review" ? "In Review" : "Draft"}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <Button
                                className="btn-gradient"
                                onClick={saveChapter}
                              >
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="prose prose-sm max-w-none">
                            {selectedChapter.content.split("\n").map((line, i) => (
                              <span key={i}>
                                {line}
                                <br />
                              </span>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[60vh]">
                      <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
                      <h2 className="text-2xl font-bold mb-2">No Chapter Selected</h2>
                      <p className="text-muted-foreground text-center max-w-md">
                        Select a chapter from the sidebar to view or edit its content, or create a new chapter.
                      </p>
                      <Button 
                        className="mt-6" 
                        onClick={addNewChapter}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Chapter
                      </Button>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="research" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Research & References</CardTitle>
                  <Button onClick={() => addNewReference()} className="w-full mt-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Reference
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {references.length > 0 && (
                    <div className="grid gap-4">
                      {references.map((item, index) => (
                        <Card key={item.id}>
                          <CardContent className="p-4">
                            {index === 0 && item.title === "New Reference" ? (
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="reference-title">Title</Label>
                                  <Input
                                    id="reference-title"
                                    placeholder="Reference Title"
                                    value={item.title}
                                    onChange={(e) => {
                                      updateReference(item.id, { title: e.target.value });
                                    }}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="reference-authors">Authors</Label>
                                  <Input
                                    id="reference-authors"
                                    placeholder="Authors"
                                    value={item.authors}
                                    onChange={(e) => {
                                      updateReference(item.id, { authors: e.target.value });
                                    }}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="reference-year">Publication Year</Label>
                                  <Input
                                    id="reference-year"
                                    type="number"
                                    placeholder="Year"
                                    value={item.publication_year.toString()}
                                    onChange={(e) => {
                                      updateReference(item.id, { 
                                        publication_year: parseInt(e.target.value) || new Date().getFullYear() 
                                      });
                                    }}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="reference-journal">Journal/Source</Label>
                                  <Input
                                    id="reference-journal"
                                    placeholder="Journal or publication source"
                                    value={item.journal || ''}
                                    onChange={(e) => {
                                      updateReference(item.id, { journal: e.target.value });
                                    }}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="reference-url">URL</Label>
                                  <Input
                                    id="reference-url"
                                    placeholder="https://example.com/article"
                                    value={item.url || ''}
                                    onChange={(e) => {
                                      updateReference(item.id, { url: e.target.value });
                                    }}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="reference-notes">Notes</Label>
                                  <Textarea
                                    id="reference-notes"
                                    placeholder="Enter your notes about this reference"
                                    className="min-h-[100px]"
                                    value={item.notes || ''}
                                    onChange={(e) => {
                                      updateReference(item.id, { notes: e.target.value });
                                    }}
                                  />
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => deleteReference(item.id)}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h3 className="font-medium">{item.title}</h3>
                                    <div className="text-sm text-muted-foreground mt-1">
                                      {item.authors} ({item.publication_year})
                                    </div>
                                    {item.journal && (
                                      <div className="text-sm italic mt-1">{item.journal}</div>
                                    )}
                                    {item.url && (
                                      <a 
                                        href={item.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-sm text-primary flex items-center mt-1"
                                      >
                                        <FileSymlink className="h-3 w-3 mr-1" />
                                        {item.url}
                                      </a>
                                    )}
                                  </div>
                                  <div className="flex space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        // Set to edit mode by updating the item to the first position
                                        const newRefs = [...references];
                                        const idx = newRefs.findIndex(r => r.id === item.id);
                                        if (idx >= 0) {
                                          const [ref] = newRefs.splice(idx, 1);
                                          newRefs.unshift(ref);
                                          setReferences(newRefs);
                                        }
                                      }}
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => deleteReference(item.id)}
                                    >
                                      Delete
                                    </Button>
                                  </div>
                                </div>
                                {item.notes && (
                                  <div className="mt-4">
                                    <p className="text-sm text-muted-foreground">
                                      {item.notes}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                  
                  {references.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10">
                      <FolderOpen className="h-10 w-10 text-muted-foreground mb-2" />
                      <h3 className="text-lg font-medium">No References</h3>
                      <p className="text-muted-foreground mt-1">
                        Add your first reference to get started.
                      </p>
                      <Button 
                        className="mt-4" 
                        variant="outline"
                        onClick={() => addNewReference()}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Reference
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ThesisPage;