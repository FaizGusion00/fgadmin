
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

// Define thesis types
type Chapter = {
  id: string;
  title: string;
  content: string;
  status: "draft" | "review" | "complete";
  lastEdited: Date;
  wordCount: number;
};

type ResearchItem = {
  id: string;
  title: string;
  url: string;
  notes: string;
  date: Date;
};

// Sample thesis data
const initialChapters: Chapter[] = [
  {
    id: "chapter-1",
    title: "Introduction",
    content: "This chapter provides an overview of the research topic and outlines the key research questions and objectives. It introduces the context and significance of the study, highlighting why this research is important and what gaps in the literature it aims to address.\n\nThe primary research questions are:\n1. How can IT companies optimize their project management processes?\n2. What factors contribute to successful client management in IT companies?\n3. What technologies are most effective for improving operational efficiency?",
    status: "complete",
    lastEdited: new Date("2025-05-10"),
    wordCount: 650,
  },
  {
    id: "chapter-2",
    title: "Literature Review",
    content: "This chapter reviews the existing literature on IT company management, project management methodologies, and client relationship management. It analyzes key theories and frameworks and discusses their relevance to the current research.\n\nKey areas covered:\n- Project management methodologies (Agile, Waterfall, Hybrid approaches)\n- Client relationship management strategies in IT services\n- Resource allocation and team management in software development\n- Performance measurement and quality assurance",
    status: "review",
    lastEdited: new Date("2025-05-15"),
    wordCount: 1200,
  },
  {
    id: "chapter-3",
    title: "Methodology",
    content: "This chapter outlines the research methodology, including research design, data collection methods, and analytical approaches. It justifies the chosen methods in relation to the research questions.\n\nThe study employs a mixed-methods approach, combining:\n- Quantitative surveys of IT company managers\n- Qualitative interviews with project leads and clients\n- Case studies of successful IT projects\n\nData analysis will involve statistical analysis of survey data and thematic analysis of interviews.",
    status: "draft",
    lastEdited: new Date("2025-05-17"),
    wordCount: 800,
  },
  {
    id: "chapter-4",
    title: "Results",
    content: "This chapter is currently in development and will present the findings from the research study.",
    status: "draft",
    lastEdited: new Date("2025-05-18"),
    wordCount: 250,
  },
];

const initialResearch: ResearchItem[] = [
  {
    id: "res-1",
    title: "Agile Project Management in IT Companies",
    url: "https://example.com/agile-research",
    notes: "Comprehensive study on Agile implementation across 50 IT companies. Key findings support the hybrid approach for complex projects.",
    date: new Date("2025-04-25"),
  },
  {
    id: "res-2",
    title: "Client Satisfaction Factors in Software Development",
    url: "https://example.com/client-satisfaction",
    notes: "Survey of 200 clients identifies communication frequency and transparency as top factors in satisfaction ratings.",
    date: new Date("2025-05-02"),
  },
  {
    id: "res-3",
    title: "Team Productivity Metrics in Remote IT Teams",
    url: "https://example.com/remote-productivity",
    notes: "Analysis of productivity metrics before and during remote work transition. Suggests new KPIs for remote team performance.",
    date: new Date("2025-05-10"),
  },
];

const Thesis = () => {
  const [chapters, setChapters] = useState<Chapter[]>(initialChapters);
  const [research, setResearch] = useState<ResearchItem[]>(initialResearch);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("writing");
  
  // Calculate total words and completion percentage
  const totalWords = chapters.reduce((sum, chapter) => sum + chapter.wordCount, 0);
  const completeChapters = chapters.filter(chapter => chapter.status === "complete").length;
  const completionPercentage = Math.round((completeChapters / chapters.length) * 100);
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "complete":
        return "bg-green-100 text-green-800";
      case "review":
        return "bg-blue-100 text-blue-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  // Save chapter content
  const saveChapter = () => {
    if (!selectedChapter) return;
    
    setChapters(chapters.map(chapter => 
      chapter.id === selectedChapter.id
        ? { 
            ...selectedChapter, 
            lastEdited: new Date(),
            wordCount: selectedChapter.content.split(/\s+/).filter(Boolean).length
          }
        : chapter
    ));
    
    setEditMode(false);
  };
  
  // Add new chapter
  const addNewChapter = () => {
    const newChapter: Chapter = {
      id: `chapter-${chapters.length + 1}`,
      title: `Chapter ${chapters.length + 1}`,
      content: "",
      status: "draft",
      lastEdited: new Date(),
      wordCount: 0,
    };
    
    setChapters([...chapters, newChapter]);
    setSelectedChapter(newChapter);
    setEditMode(true);
  };
  
  // Add new research item
  const addNewResearch = () => {
    const newResearch: ResearchItem = {
      id: `res-${research.length + 1}`,
      title: "",
      url: "",
      notes: "",
      date: new Date(),
    };
    
    setResearch([newResearch, ...research]);
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
              <div className="h-10 w-10 rounded-full bg-fg-teal/10 flex items-center justify-center mr-3">
                <BarChart4 className="h-5 w-5 text-fg-teal" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Progress</p>
                <div className="flex items-center justify-between mt-1">
                  <h3 className="text-2xl font-bold">{completionPercentage}%</h3>
                </div>
                <Progress value={completionPercentage} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-fg-blue/10 flex items-center justify-center mr-3">
                <BookOpen className="h-5 w-5 text-fg-blue" />
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
      <Tabs defaultValue="writing" value={activeTab} onValueChange={setActiveTab}>
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
                            setEditMode(false);
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{chapter.title}</h3>
                              <div className="flex items-center mt-1 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3 mr-1" />
                                <span>Edited: {formatDate(chapter.lastEdited)}</span>
                              </div>
                            </div>
                            <Badge className={getStatusColor(chapter.status)}>
                              {chapter.status === "complete" ? "Complete" : 
                               chapter.status === "review" ? "In Review" : "Draft"}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">
                              {chapter.wordCount} words
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
                          <span>{selectedChapter.wordCount} words</span>
                          <span className="mx-2">•</span>
                          <span>Last edited on {formatDate(selectedChapter.lastEdited)}</span>
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
                            <React.Fragment key={i}>
                              {line}
                              <br />
                            </React.Fragment>
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
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Research Materials</CardTitle>
              <Button 
                onClick={addNewResearch}
                className="btn-gradient"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Research
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {research.map((item, index) => (
                  <Card key={item.id} className={index === 0 && item.title === "" ? "border-primary" : ""}>
                    <CardContent className="pt-6">
                      {index === 0 && item.title === "" ? (
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="research-title">Title</Label>
                            <Input
                              id="research-title"
                              placeholder="Research title"
                              onChange={(e) => {
                                const newResearch = [...research];
                                newResearch[0] = { ...newResearch[0], title: e.target.value };
                                setResearch(newResearch);
                              }}
                            />
                          </div>
                          <div>
                            <Label htmlFor="research-url">URL / Reference</Label>
                            <Input
                              id="research-url"
                              placeholder="https://example.com/research"
                              onChange={(e) => {
                                const newResearch = [...research];
                                newResearch[0] = { ...newResearch[0], url: e.target.value };
                                setResearch(newResearch);
                              }}
                            />
                          </div>
                          <div>
                            <Label htmlFor="research-notes">Notes</Label>
                            <Textarea
                              id="research-notes"
                              placeholder="Enter your research notes here"
                              className="min-h-[100px]"
                              onChange={(e) => {
                                const newResearch = [...research];
                                newResearch[0] = { ...newResearch[0], notes: e.target.value };
                                setResearch(newResearch);
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium">{item.title}</h3>
                              <a 
                                href={item.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-sm text-primary flex items-center mt-1"
                              >
                                <FileSymlink className="h-3 w-3 mr-1" />
                                {item.url}
                              </a>
                            </div>
                            <Badge variant="outline">
                              {formatDate(item.date)}
                            </Badge>
                          </div>
                          <div className="mt-4">
                            <p className="text-sm text-muted-foreground">
                              {item.notes}
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                
                {research.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10">
                    <FolderOpen className="h-10 w-10 text-muted-foreground mb-2" />
                    <h3 className="text-lg font-medium">No Research Items</h3>
                    <p className="text-muted-foreground mt-1">
                      Add your first research item to get started.
                    </p>
                    <Button 
                      className="mt-4" 
                      variant="outline"
                      onClick={addNewResearch}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Research Item
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Thesis;
