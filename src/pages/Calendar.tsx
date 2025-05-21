
import React, { useState } from "react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Calendar as CalendarIcon, Clock } from "lucide-react";

// Sample events data
const eventsData = [
  {
    id: 1,
    title: "Client Meeting - TechCorp",
    date: new Date(2025, 4, 22),
    startTime: "10:00 AM",
    endTime: "11:30 AM",
    type: "meeting",
    description: "Project kickoff meeting with the TechCorp team."
  },
  {
    id: 2,
    title: "Website Design Review",
    date: new Date(2025, 4, 23),
    startTime: "2:00 PM",
    endTime: "3:30 PM",
    type: "internal",
    description: "Review the design mockups for the new client website."
  },
  {
    id: 3,
    title: "Team Standup",
    date: new Date(2025, 4, 23),
    startTime: "9:30 AM",
    endTime: "10:00 AM",
    type: "internal",
    description: "Daily team standup meeting."
  },
  {
    id: 4,
    title: "Project Deadline - Mobile App",
    date: new Date(2025, 4, 26),
    type: "deadline",
    description: "Final delivery deadline for the mobile app project."
  },
  {
    id: 5,
    title: "Client Presentation - HealthFirst",
    date: new Date(2025, 4, 24),
    startTime: "1:00 PM",
    endTime: "2:00 PM",
    type: "meeting",
    description: "Present the project progress to the client."
  },
];

const Calendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const getEventsForDate = (selectedDate: Date | undefined) => {
    if (!selectedDate) return [];
    
    return eventsData.filter(
      (event) => 
        event.date.getDate() === selectedDate.getDate() &&
        event.date.getMonth() === selectedDate.getMonth() &&
        event.date.getFullYear() === selectedDate.getFullYear()
    );
  };
  
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "meeting":
        return "bg-blue-100 text-blue-800";
      case "internal":
        return "bg-purple-100 text-purple-800";
      case "deadline":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  const selectedDateEvents = getEventsForDate(date);
  
  // Function to check if a date has events
  const hasEvents = (day: Date) => {
    return eventsData.some(
      (event) => 
        event.date.getDate() === day.getDate() &&
        event.date.getMonth() === day.getMonth() &&
        event.date.getFullYear() === day.getFullYear()
    );
  };
  
  // Custom rendering of days
  const renderDay = (day: Date) => {
    const hasEventsOnDay = hasEvents(day);
    
    return (
      <div className="relative">
        <div>{day.getDate()}</div>
        {hasEventsOnDay && (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></div>
        )}
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">Manage your schedule and events</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-gradient">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Add New Event</DialogTitle>
              <DialogDescription>
                Create a new event in your calendar. Fill out the details below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  placeholder="Event title"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  className="col-span-3"
                  defaultValue={date?.toISOString().split('T')[0]}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Client Meeting</SelectItem>
                    <SelectItem value="internal">Internal Meeting</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="startTime" className="text-right">
                  Start Time
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="endTime" className="text-right">
                  End Time
                </Label>
                <Input
                  id="endTime"
                  type="time"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  placeholder="Event description"
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="btn-gradient" onClick={() => setDialogOpen(false)}>
                Add Event
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border shadow-sm"
                renderDay={renderDay}
              />
              
              <div className="mt-4">
                <h3 className="font-medium mb-2">Event Types</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-blue-100 text-blue-800">Client Meeting</Badge>
                  <Badge className="bg-purple-100 text-purple-800">Internal Meeting</Badge>
                  <Badge className="bg-red-100 text-red-800">Deadline</Badge>
                </div>
              </div>
              
              <div className="mt-4">
                <h3 className="font-medium mb-2">Quick Add</h3>
                <div className="space-y-2">
                  <Button className="w-full justify-start" variant="outline">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Meeting
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Deadline
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Event
                  </Button>
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
                        className="p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium">{event.title}</h3>
                          <Badge className={getEventTypeColor(event.type)}>
                            {event.type === "meeting" ? "Meeting" : 
                             event.type === "internal" ? "Internal" : 
                             event.type === "deadline" ? "Deadline" : "Event"}
                          </Badge>
                        </div>
                        
                        {(event.startTime && event.endTime) && (
                          <div className="flex items-center mt-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{event.startTime} - {event.endTime}</span>
                          </div>
                        )}
                        
                        <p className="mt-2 text-sm text-muted-foreground">
                          {event.description}
                        </p>
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
                        onClick={() => setDialogOpen(true)}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add an event
                      </Button>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="week">
                  <div className="py-10 text-center">
                    <h3 className="text-lg font-medium">Week View</h3>
                    <p className="text-muted-foreground mt-1">
                      Week view will be implemented in the next version.
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="month">
                  <div className="py-10 text-center">
                    <h3 className="text-lg font-medium">Month View</h3>
                    <p className="text-muted-foreground mt-1">
                      Month view will be implemented in the next version.
                    </p>
                  </div>
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
