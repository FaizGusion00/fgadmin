import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Calendar as CalendarIcon, Download, ArrowLeft, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Activity {
  id: string;
  type: 'project' | 'client' | 'sale' | 'note' | 'todo' | 'event';
  title: string;
  description: string;
  date: string;
  status?: string;
  user_id: string;
  created_at: string;
}

type ActivityType = 'project' | 'client' | 'sale' | 'note' | 'todo' | 'event';

const RecentActivityPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityType, setActivityType] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  
  const handleDateRangeChange = (range: { from: Date | undefined; to: Date | undefined }) => {
    setDateRange(range);
  };
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (user) {
      fetchActivities();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [activities, activityType, dateRange]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      
      // Define an array to store all activities
      let allActivities: Activity[] = [];
      
      // Fetch projects
      const projectsResult = await supabase
        .from("projects")
        .select("id, name, description, status, created_at, updated_at")
        .eq("user_id", user?.id)
        .order("updated_at", { ascending: false });
      
      if (projectsResult.error) {
        console.error("Error fetching projects:", projectsResult.error);
      } else if (projectsResult.data) {
        const projectActivities = projectsResult.data.map((project) => ({
          id: project.id,
          type: 'project' as ActivityType,
          title: project.name,
          description: project.description || 'Project updated',
          date: project.updated_at,
          status: project.status,
          user_id: user?.id || '',
          created_at: project.created_at,
        }));
        allActivities = [...allActivities, ...projectActivities];
      }
      
      // Fetch clients
      const clientsResult = await supabase
        .from("clients")
        .select("id, name, email, status, created_at, updated_at")
        .eq("user_id", user?.id)
        .order("updated_at", { ascending: false });
      
      if (clientsResult.error) {
        console.error("Error fetching clients:", clientsResult.error);
      } else if (clientsResult.data) {
        const clientActivities = clientsResult.data.map((client) => ({
          id: client.id,
          type: 'client' as ActivityType,
          title: client.name,
          description: `Client ${client.email ? '(' + client.email + ')' : ''}`,
          date: client.updated_at,
          status: client.status,
          user_id: user?.id || '',
          created_at: client.created_at,
        }));
        allActivities = [...allActivities, ...clientActivities];
      }
      
      // Fetch sales
      const salesResult = await supabase
        .from("sales")
        .select("id, amount, description, status, sale_date, created_at, updated_at")
        .eq("user_id", user?.id)
        .order("updated_at", { ascending: false });
      
      if (salesResult.error) {
        console.error("Error fetching sales:", salesResult.error);
      } else if (salesResult.data) {
        const saleActivities = salesResult.data.map((sale) => ({
          id: sale.id,
          type: 'sale' as ActivityType,
          title: `Sale of $${sale.amount}`,
          description: sale.description || 'Sale recorded',
          date: sale.updated_at,
          status: sale.status,
          user_id: user?.id || '',
          created_at: sale.created_at,
        }));
        allActivities = [...allActivities, ...saleActivities];
      }
      
      // Fetch todos - check schema first
      try {
        const todosResult = await supabase
          .from("todos")
          .select("*")
          .eq("user_id", user?.id)
          .order("updated_at", { ascending: false });
        
        if (todosResult.error) {
          console.error("Error fetching todos:", todosResult.error);
        } else if (todosResult.data && todosResult.data.length > 0) {
          // Determine the actual fields in the todos table
          const todoSample = todosResult.data[0];
          const todoActivities = todosResult.data.map((todo) => ({
            id: todo.id,
            type: 'todo' as ActivityType,
            title: todo.title || 'Task',
            description: todo.description || 'Task updated',
            date: todo.updated_at,
            // For todos, we'll determine status from the completed field
            status: todo.completed ? 'completed' : 'pending',
            user_id: user?.id || '',
            created_at: todo.created_at,
          }));
          allActivities = [...allActivities, ...todoActivities];
        }
      } catch (todoError) {
        console.error("Error processing todos:", todoError);
      }
      
      // Fetch events - check schema with caution
      try {
        // First try to get the column names from the table
        const eventsSchema = await supabase
          .from("calendar_events")
          .select("id")
          .limit(1);
          
        if (eventsSchema.error) {
          console.error("Error checking calendar_events schema:", eventsSchema.error);
        } else {
          // Now fetch the data with the proper fields
          let query = supabase
            .from("calendar_events")
            .select("id, title, description, created_at, updated_at")
            .eq("user_id", user?.id)
            .order("updated_at", { ascending: false });
            
          const eventsResult = await query;
          
          if (eventsResult.error) {
            console.error("Error fetching events:", eventsResult.error);
          } else if (eventsResult.data) {
            const eventActivities = eventsResult.data.map((event: any) => ({
              id: event.id,
              type: 'event' as ActivityType,
              title: event.title || 'Event',
              description: event.description || 'Event scheduled',
              date: event.updated_at,
              status: 'scheduled',
              user_id: user?.id || '',
              created_at: event.created_at,
            }));
            allActivities = [...allActivities, ...eventActivities];
          }
        }
      } catch (eventError) {
        console.error("Error processing events:", eventError);
      }
      
      // Fetch notes
      const notesResult = await supabase
        .from("notes")
        .select("id, title, content, created_at, updated_at")
        .eq("user_id", user?.id)
        .order("updated_at", { ascending: false });
      
      if (notesResult.error) {
        console.error("Error fetching notes:", notesResult.error);
      } else if (notesResult.data) {
        const noteActivities = notesResult.data.map((note) => ({
          id: note.id,
          type: 'note' as ActivityType,
          title: note.title || 'Note',
          description: note.content?.substring(0, 50) + (note.content?.length > 50 ? '...' : '') || 'Note updated',
          date: note.updated_at,
          user_id: user?.id || '',
          created_at: note.created_at,
        }));
        allActivities = [...allActivities, ...noteActivities];
      }
      
      // Sort all activities by date (most recent first)
      allActivities.sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      setActivities(allActivities);


    } catch (error) {
      console.error("Error fetching activities:", error);
      toast({
        title: "Error",
        description: "Failed to fetch activities",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...activities];
    
    // Filter by activity type
    if (activityType !== "all") {
      filtered = filtered.filter(activity => activity.type === activityType);
    }
    
    // Filter by date range
    if (dateRange.from) {
      filtered = filtered.filter(activity => {
        const activityDate = new Date(activity.date);
        if (dateRange.to) {
          return activityDate >= dateRange.from! && activityDate <= dateRange.to;
        }
        return activityDate >= dateRange.from!;
      });
    }
    
    setFilteredActivities(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const resetFilters = () => {
    setActivityType("all");
    setDateRange({ from: undefined, to: undefined });
    setFilteredActivities(activities);
  };

  const downloadCSV = () => {
    // Define which activities to include (filtered or all)
    const dataToExport = filteredActivities;
    
    // Convert data to CSV format
    const headers = ["Type", "Title", "Description", "Date", "Status"];
    let csvContent = headers.join(",") + "\n";
    
    dataToExport.forEach(item => {
      const row = [
        item.type,
        `"${item.title.replace(/"/g, '""')}"`, // Escape quotes in CSV
        `"${item.description.replace(/"/g, '""')}"`,
        new Date(item.date).toLocaleDateString(),
        item.status || ""
      ];
      csvContent += row.join(",") + "\n";
    });
    
    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `activity-log-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Success",
      description: "Activity log exported to CSV",
    });
  };

  // Get current page of activities
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredActivities.slice(startIndex, endIndex);
  };

  // Generate pagination numbers
  const getPaginationItems = () => {
    const items = [];
    
    if (totalPages <= 7) {
      // Show all pages if 7 or less
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      // Complex pagination with ellipsis
      items.push(1);
      
      if (currentPage > 3) {
        items.push('ellipsis');
      }
      
      // Pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        items.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        items.push('ellipsis');
      }
      
      items.push(totalPages);
    }
    
    return items;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate("/dashboard")}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Recent Activity Log</h1>
        </div>
        <Button onClick={downloadCSV} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>
      
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Activity Type</label>
              <Select value={activityType} onValueChange={setActivityType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Activities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activities</SelectItem>
                  <SelectItem value="project">Projects</SelectItem>
                  <SelectItem value="client">Clients</SelectItem>
                  <SelectItem value="sale">Sales</SelectItem>
                  <SelectItem value="todo">Tasks</SelectItem>
                  <SelectItem value="event">Events</SelectItem>
                  <SelectItem value="note">Notes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Date Range</label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-1 justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "MMM dd, yyyy")} -{" "}
                            {format(dateRange.to, "MMM dd, yyyy")}
                          </>
                        ) : (
                          format(dateRange.from, "MMM dd, yyyy")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      viewMode="day"
                      defaultMonth={dateRange.from}
                      selected={dateRange}
                      onSelect={handleDateRangeChange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="flex items-end">
              <Button variant="secondary" onClick={resetFilters}>
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Activity Log Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getCurrentPageItems().map((activity) => (
                    <TableRow key={`${activity.type}-${activity.id}`}>
                      <TableCell>
                        <Badge variant="outline">
                          {activity.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{activity.title}</TableCell>
                      <TableCell>{activity.description}</TableCell>
                      <TableCell>
                        {new Date(activity.date).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {activity.status && (
                          <Badge 
                            variant={
                              activity.status === 'completed' || activity.status === 'active' ? 'default' : 
                              activity.status === 'pending' ? 'secondary' : 'outline'
                            }
                          >
                            {activity.status}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredActivities.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No activities found. Try adjusting your filters.
                </div>
              )}
              
              {/* Pagination */}
              {filteredActivities.length > 0 && (
                <div className="flex justify-between items-center p-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {Math.min(filteredActivities.length, (currentPage - 1) * itemsPerPage + 1)} to {Math.min(filteredActivities.length, currentPage * itemsPerPage)} of {filteredActivities.length} activities
                  </div>
                  
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {getPaginationItems().map((item, i) => (
                        item === 'ellipsis' ? (
                          <PaginationItem key={`ellipsis-${i}`}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        ) : (
                          <PaginationItem key={item}>
                            <PaginationLink 
                              isActive={currentPage === item}
                              onClick={() => setCurrentPage(item as number)}
                            >
                              {item}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RecentActivityPage;
