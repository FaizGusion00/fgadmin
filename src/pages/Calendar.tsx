
import React, { useState, useEffect } from "react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Calendar as CalendarIcon, Clock, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  location?: string;
  event_type: string;
  project_id?: string;
  client_id?: string;
  project?: { name: string };
  client?: { name: string };
}

interface Project {
  id: string;
  name: string;
}

interface Client {
  id: string;
  name: string;
}

const Calendar = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    all_day: false,
    location: "",
    event_type: "meeting",
    project_id: "",
    client_id: ""
  });

  useEffect(() => {
    if (user) {
      fetchEvents();
      fetchProjects();
      fetchClients();
    }
  }, [user]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("calendar_events")
        .select(`
          *,
          project:projects(name),
          client:clients(name)
        `)
        .eq("user_id", user?.id)
        .order("start_time");

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast({
        title: "Error",
        description: "Failed to fetch events",
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

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("id, name")
        .eq("user_id", user?.id)
        .order("name");

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Event title is required",
        variant: "destructive",
      });
      return;
    }

    // Ensure we have a valid date
    if (!date) {
      toast({
        title: "Error",
        description: "Please select a valid date",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create a new date object for safety
      const selectedDate = new Date(date);
      const formattedDate = selectedDate.toISOString().split('T')[0];
      
      const startTime = formData.all_day 
        ? new Date(selectedDate).toISOString() 
        : new Date(`${formattedDate}T${formData.start_time}`).toISOString();
      const endTime = formData.all_day 
        ? new Date(selectedDate).toISOString() 
        : new Date(`${formattedDate}T${formData.end_time}`).toISOString();
        
      const eventData = {
        title: formData.title,
        description: formData.description || null,
        start_time: startTime,
        end_time: endTime,
        all_day: formData.all_day,
        location: formData.location || null,
        event_type: formData.event_type,
        project_id: formData.project_id === "none" ? null : formData.project_id,
        client_id: formData.client_id === "none" ? null : formData.client_id,
        updated_at: new Date().toISOString(),
      };

      if (editingEvent) {
        const { error } = await supabase
          .from("calendar_events")
          .update(eventData)
          .eq("id", editingEvent.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Event updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("calendar_events")
          .insert([{
            ...eventData,
            user_id: user?.id,
          }]);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Event created successfully",
        });
      }

      setDialogOpen(false);
      resetForm();
      fetchEvents();
    } catch (error) {
      console.error("Error saving event:", error);
      toast({
        title: "Error",
        description: "Failed to save event",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (event: CalendarEvent) => {
    setEditingEvent(event);
    const startTime = new Date(event.start_time);
    const endTime = new Date(event.end_time);
    const startTimeStr = event.all_day ? "" : startTime.toTimeString().slice(0, 5);
    const endTimeStr = event.all_day ? "" : endTime.toTimeString().slice(0, 5);
    
    setFormData({
      title: event.title,
      description: event.description || "",
      start_time: startTimeStr,
      end_time: endTimeStr,
      all_day: event.all_day,
      location: event.location || "",
      event_type: event.event_type,
      project_id: event.project_id || "none",
      client_id: event.client_id || "none"
    });
    setDate(startTime);
    setDialogOpen(true);
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const { error } = await supabase
        .from("calendar_events")
        .delete()
        .eq("id", eventId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
      
      fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      start_time: "",
      end_time: "",
      all_day: false,
      location: "",
      event_type: "meeting",
      project_id: "none",
      client_id: "none"
    });
    setEditingEvent(null);
  };

  const getEventsForDate = (selectedDate: Date | undefined) => {
    if (!selectedDate) return [];
    
    return events.filter(event => {
      const eventDate = new Date(event.start_time);
      return (
        eventDate.getDate() === selectedDate.getDate() &&
        eventDate.getMonth() === selectedDate.getMonth() &&
        eventDate.getFullYear() === selectedDate.getFullYear()
      );
    });
  };
  
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "meeting":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "internal":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "deadline":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "call":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };
  
  const selectedDateEvents = getEventsForDate(date);
  
  const hasEvents = (day: Date) => {
    return events.some(event => {
      const eventDate = new Date(event.start_time);
      return (
        eventDate.getDate() === day.getDate() &&
        eventDate.getMonth() === day.getMonth() &&
        eventDate.getFullYear() === day.getFullYear()
      );
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">Manage your schedule and events</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? "Edit Event" : "Add New Event"}
              </DialogTitle>
              <DialogDescription>
                {editingEvent ? "Update event details" : "Create a new event in your calendar"}
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
                <Label htmlFor="description" className="text-right">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="event_type" className="text-right">Type</Label>
                <Select value={formData.event_type} onValueChange={(value) => setFormData({ ...formData, event_type: value })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="call">Call</SelectItem>
                    <SelectItem value="internal">Internal</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
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
                    <SelectItem value="none">No project</SelectItem>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="client" className="text-right">Client</Label>
                <Select value={formData.client_id} onValueChange={(value) => setFormData({ ...formData, client_id: value })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No client</SelectItem>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="all_day" className="text-right">All Day</Label>
                <div className="col-span-3">
                  <input
                    type="checkbox"
                    id="all_day"
                    checked={formData.all_day}
                    onChange={(e) => setFormData({ ...formData, all_day: e.target.checked })}
                    className="rounded"
                  />
                </div>
              </div>
              {!formData.all_day && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="start_time" className="text-right">Start Time</Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="end_time" className="text-right">End Time</Label>
                    <Input
                      id="end_time"
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                </>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingEvent ? "Update" : "Add"} Event
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <CalendarComponent
                viewMode="day"
                selected={date}
                onSelect={(selectedDate) => {
                  // Handle different types of selection
                  if (selectedDate instanceof Date) {
                    setDate(selectedDate);
                  } else if (selectedDate && typeof selectedDate === 'object' && 'from' in selectedDate && selectedDate.from) {
                    // If a range is selected, use the 'from' date
                    setDate(selectedDate.from);
                  }
                }}
                className="rounded-md border shadow-sm"
                modifiers={{
                  hasEvent: hasEvents
                }}
                modifiersStyles={{
                  hasEvent: {
                    backgroundColor: 'hsl(var(--primary))',
                    color: 'white'
                  }
                }}
              />
              
              <div className="mt-4">
                <h3 className="font-medium mb-2">Event Types</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Meeting</Badge>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Call</Badge>
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">Internal</Badge>
                  <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Deadline</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {date ? date.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }) : "Select a date"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="day">
                <TabsList>
                  <TabsTrigger value="day">Day</TabsTrigger>
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="month">Month</TabsTrigger>
                </TabsList>
                <TabsContent value="day" className="mt-4 space-y-4">
                  {selectedDateEvents.length > 0 ? (
                    selectedDateEvents.map((event) => (
                      <div 
                        key={event.id} 
                        className="p-4 border rounded-lg hover:shadow-md transition-all"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-medium">{event.title}</h3>
                            {event.project?.name && (
                              <p className="text-sm text-muted-foreground">
                                Project: {event.project.name}
                              </p>
                            )}
                            {event.client?.name && (
                              <p className="text-sm text-muted-foreground">
                                Client: {event.client.name}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getEventTypeColor(event.event_type)}>
                              {event.event_type}
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(event)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDelete(event.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        
                        {!event.all_day && (
                          <div className="flex items-center mt-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>
                              {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                              {new Date(event.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        )}
                        
                        {event.location && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            📍 {event.location}
                          </p>
                        )}
                        
                        {event.description && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            {event.description}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <CalendarIcon className="h-10 w-10 text-muted-foreground mb-2" />
                      <h3 className="text-lg font-medium">No events scheduled</h3>
                      <p className="text-muted-foreground mt-1">
                        No events scheduled for this day. Click "Add Event" to create one.
                      </p>
                      <Button 
                        className="mt-4" 
                        variant="outline"
                        onClick={() => { resetForm(); setDialogOpen(true); }}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add an event
                      </Button>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="week" className="mt-4">
                  {date && (
                    <>
                      <div className="grid grid-cols-7 gap-1 mb-2 text-center font-medium">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                          <div key={day} className="p-2">{day}</div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1 h-[500px]">
                        {(() => {
                          // Calculate the start of the week (Monday)
                          const weekStart = new Date(date);
                          const day = weekStart.getDay();
                          const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
                          weekStart.setDate(diff);
                          weekStart.setHours(0, 0, 0, 0);
                          
                          // Generate the 7 days of the week
                          return Array.from({ length: 7 }, (_, i) => {
                            const currentDate = new Date(weekStart);
                            currentDate.setDate(weekStart.getDate() + i);
                            
                            // Get events for this day
                            const dayEvents = events.filter(event => {
                              const eventDate = new Date(event.start_time);
                              return (
                                eventDate.getDate() === currentDate.getDate() &&
                                eventDate.getMonth() === currentDate.getMonth() &&
                                eventDate.getFullYear() === currentDate.getFullYear()
                              );
                            });
                            
                            const isToday = new Date().toDateString() === currentDate.toDateString();
                            
                            return (
                              <div 
                                key={i} 
                                className={`border rounded-md p-2 overflow-y-auto ${isToday ? 'bg-accent' : ''}`}
                                onClick={() => setDate(new Date(currentDate))}
                              >
                                <div className="font-medium mb-1 sticky top-0 bg-inherit z-10">
                                  {currentDate.getDate()}
                                </div>
                                <div className="space-y-1">
                                  {dayEvents.length > 0 ? (
                                    dayEvents.map((event) => (
                                      <div 
                                        key={event.id} 
                                        className={`p-1 text-xs rounded cursor-pointer ${getEventTypeColor(event.event_type)}`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEdit(event);
                                        }}
                                      >
                                        <div className="font-medium truncate">{event.title}</div>
                                        {!event.all_day && (
                                          <div className="truncate">
                                            {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                          </div>
                                        )}
                                      </div>
                                    ))
                                  ) : null}
                                </div>
                              </div>
                            );
                          });
                        })()} 
                      </div>
                    </>
                  )}
                </TabsContent>
                <TabsContent value="month" className="mt-4">
                  {date && (
                    <>
                      <div className="grid grid-cols-7 gap-1 mb-2 text-center font-medium">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                          <div key={day} className="p-2">{day}</div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1 h-[500px]">
                        {(() => {
                          // Calculate the start of the month view (which may include days from previous/next month)
                          const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
                          const monthStartDay = monthStart.getDay() || 7; // Convert Sunday (0) to 7 for easier calculation
                          const startDate = new Date(monthStart);
                          startDate.setDate(monthStart.getDate() - (monthStartDay - 1)); // Adjust to start from Monday
                          
                          // Generate the days for the month view (6 weeks = 42 days)
                          return Array.from({ length: 42 }, (_, i) => {
                            const currentDate = new Date(startDate);
                            currentDate.setDate(startDate.getDate() + i);
                            
                            // Get events for this day
                            const dayEvents = events.filter(event => {
                              const eventDate = new Date(event.start_time);
                              return (
                                eventDate.getDate() === currentDate.getDate() &&
                                eventDate.getMonth() === currentDate.getMonth() &&
                                eventDate.getFullYear() === currentDate.getFullYear()
                              );
                            });
                            
                            const isToday = new Date().toDateString() === currentDate.toDateString();
                            const isCurrentMonth = currentDate.getMonth() === date.getMonth();
                            
                            return (
                              <div 
                                key={i} 
                                className={`border rounded-md p-1 overflow-y-auto ${isToday ? 'bg-accent' : ''} ${isCurrentMonth ? '' : 'text-muted-foreground opacity-50'}`}
                                onClick={() => setDate(new Date(currentDate))}
                              >
                                <div className="font-medium text-xs mb-1 sticky top-0 bg-inherit z-10">
                                  {currentDate.getDate()}
                                </div>
                                <div className="space-y-1 max-h-[60px] overflow-y-auto">
                                  {dayEvents.length > 0 ? (
                                    dayEvents.slice(0, 3).map((event) => (
                                      <div 
                                        key={event.id} 
                                        className={`p-1 text-xs rounded cursor-pointer ${getEventTypeColor(event.event_type)}`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEdit(event);
                                        }}
                                      >
                                        <div className="font-medium truncate">{event.title}</div>
                                      </div>
                                    ))
                                  ) : null}
                                  {dayEvents.length > 3 && (
                                    <div className="text-xs text-center text-muted-foreground">
                                      +{dayEvents.length - 3} more
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
