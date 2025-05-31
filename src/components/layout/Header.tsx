
import { useState, useEffect } from "react";
import { Bell, Search, Settings, User, Menu, FilePlus, UserPlus, Calendar, ListTodo, FileText, DollarSign } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";

// Extend User type to include metadata
declare module '@supabase/supabase-js' {
  interface User {
    metadata: {
      notifications_count?: number;
      [key: string]: any;
    };
  }
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'client' | 'project' | 'sale' | 'system' | 'todo' | 'event';
  read: boolean;
  created_at: string;
  user_id: string;
}

export const Header = () => {
  const { user, logout } = useAuth();
  const { toggleSidebar, state } = useSidebar();
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  
  // Fetch notifications when user changes
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);
  
  // Fetch notifications from the database
  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      setNotificationsLoading(true);
      
      // Get session to ensure we have authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('No active session found');
        return;
      }
      
      // Check if notifications table exists by trying to query it
      try {
        // Explicitly type the query to avoid deep type instantiation issues
        const result = await supabase
          .from('notifications')
          .select('id, title, message, type, read, created_at, user_id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);
        
        // Use explicit type casting to fix TypeScript errors
        const { data, error } = result;
        
        if (!error) {
          // Table exists and query succeeded
          const notificationData = data as Notification[];
          
          // Update notification count in user metadata
          const unreadCount = notificationData.filter(n => !n.read).length;
          
          try {
            if (user.user_metadata?.notifications_count !== unreadCount) {
              const metadata = { ...user.user_metadata, notifications_count: unreadCount };
              await supabase.auth.updateUser({ data: metadata });
            }
          } catch (e) {
            console.error('Error updating user metadata:', e);
          }
          
          setNotifications(notificationData);
          return;
        }
      } catch (tableError) {
        console.log('Notifications table might not exist yet:', tableError);
      }
      
      // If we get here, either the table doesn't exist or there was an error
      // Fall back to mock data
      console.log('Using mock notification data until table is created');
      
      // Mock data for demonstration purposes
      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'New client added',
          message: 'A new client has been added to your account',
          type: 'client',
          read: false,
          created_at: new Date(Date.now() - 1000 * 60 * 2).toISOString(), // 2 minutes ago
          user_id: user.id
        },
        {
          id: '2',
          title: 'System update completed',
          message: 'The system has been updated successfully',
          type: 'system',
          read: false,
          created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
          user_id: user.id
        }
      ];
      
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setNotificationsLoading(false);
    }
  };
  
  // Format notification time relative to now
  const formatNotificationTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };
  
  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'client':
        return <UserPlus className="h-4 w-4 text-primary" />;
      case 'project':
        return <FilePlus className="h-4 w-4 text-primary" />;
      case 'sale':
        return <DollarSign className="h-4 w-4 text-primary" />;
      case 'todo':
        return <ListTodo className="h-4 w-4 text-primary" />;
      case 'event':
        return <Calendar className="h-4 w-4 text-primary" />;
      default:
        return <Settings className="h-4 w-4 text-primary" />;
    }
  };
  
  // Mark single notification as read
  const handleMarkNotificationAsRead = async (notificationId: string) => {
    if (!user) return;
    
    try {
      // Skip database update since notifications table doesn't exist in the schema
      console.log('Updating notification in local state only');
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
      
      // Update user's notification count
      try {
        const notificationCount = notifications.filter(n => !n.read && n.id !== notificationId).length;
        const metadata = { ...user.metadata, notifications_count: notificationCount };
        await supabase.auth.updateUser({ data: metadata });
      } catch (e) {
        console.error('Error updating user metadata:', e);
      }
      
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  // Mark all notifications as read
  const handleMarkAllNotificationsAsRead = async () => {
    if (!user || notifications.length === 0) return;
    
    try {
      // Skip database update since notifications table doesn't exist in the schema
      console.log('Updating all notifications in local state only');
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      // Update user's notification count
      try {
        const metadata = { ...user.metadata, notifications_count: 0 };
        await supabase.auth.updateUser({ data: metadata });
      } catch (e) {
        console.error('Error updating user metadata:', e);
      }
      
      toast({
        title: "Notifications cleared",
        description: "All notifications have been marked as read."
      });
      
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  
  // Search results
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    projects: any[];
    clients: any[];
    sales: any[];
    todos: any[];
    notes: any[];
    events: any[];
  }>({
    projects: [],
    clients: [],
    sales: [],
    todos: [],
    notes: [],
    events: [],
  });
  
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() === "") return;
    
    setOpen(true);
    await performSearch(searchQuery);
  };
  
  const performSearch = async (query: string) => {
    if (!user || query.trim().length < 2) return;
    
    try {
      setLoading(true);
      
      // Get session to ensure we have authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('No active session found');
        return;
      }
      
      // Format the query properly for searching - prevent URL encoding issues
      const searchTerm = `%${query.trim()}%`;
      
      // Search across all tables - using correct OR string format for Supabase
      const [projectsResult, clientsResult, salesResult, todosResult, notesResult, eventsResult] = await Promise.all([
        supabase
          .from("projects")
          .select("*")
          .eq("user_id", user.id)
          .ilike("name", searchTerm)
          .limit(5),
        supabase
          .from("clients")
          .select("*")
          .eq("user_id", user.id)
          .or(`name.ilike.${searchTerm},company.ilike.${searchTerm}`)
          .limit(5),
        supabase
          .from("sales")
          .select("*")
          .eq("user_id", user.id)
          .or(`client_name.ilike.${searchTerm},description.ilike.${searchTerm}`)
          .limit(5),
        supabase
          .from("todos")
          .select("*")
          .eq("user_id", user.id)
          .ilike("title", searchTerm)
          .limit(5),
        supabase
          .from("notes")
          .select("*")
          .eq("user_id", user.id)
          .or(`title.ilike.${searchTerm},content.ilike.${searchTerm}`)
          .limit(5),
        supabase
          .from("calendar_events")
          .select("*")
          .eq("user_id", user.id)
          .ilike("title", searchTerm)
          .limit(5)
      ]);
      
      setResults({
        projects: projectsResult.data || [],
        clients: clientsResult.data || [],
        sales: salesResult.data || [],
        todos: todosResult.data || [],
        notes: notesResult.data || [],
        events: eventsResult.data || [],
      });
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search Failed",
        description: "There was a problem with your search. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Get user display name and avatar from metadata or email
  const getUserDisplayName = () => {
    if (!user) return "User";
    
    // Try to get name from user metadata
    const firstName = user.user_metadata?.first_name || user.user_metadata?.name;
    const lastName = user.user_metadata?.last_name;
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (user.email) {
      // Extract name from email if no metadata
      return user.email.split('@')[0];
    }
    
    return "User";
  };

  const getUserInitials = () => {
    const displayName = getUserDisplayName();
    if (displayName && displayName !== "User") {
      return displayName.charAt(0).toUpperCase();
    }
    return "U";
  };

  const getUserAvatar = () => {
    return user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;
  };
  
  return (
    <header className="h-16 border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 dark:border-slate-700 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6">
      {/* Menu button - visible on all screens for easy sidebar toggle */}
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={toggleSidebar}
        className="mr-2 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        aria-label="Toggle Menu"
      >
        <Menu className="h-5 w-5" />
      </Button>
      
      {/* Left side - Search */}
      <div className="flex-1 max-w-md">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search... (Ctrl+K)"
            className="w-full bg-background pl-8 md:w-[300px] lg:w-[400px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClick={() => setOpen(true)}
          />
        </form>
      </div>
      
      {/* Global Search Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Search across your workspace..."
          value={searchQuery}
          onValueChange={(value) => {
            setSearchQuery(value);
            if (value.trim().length >= 2) {
              performSearch(value);
            }
          }}
        />
        <CommandList>
          {notificationsLoading && (
            <div className="py-6 text-center text-sm">
              <div className="flex items-center justify-center space-x-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                <p>Searching...</p>
              </div>
            </div>
          )}
          
          {!loading && (
            searchQuery.trim().length < 2 ? (
              <CommandEmpty>Type at least 2 characters to search</CommandEmpty>
            ) : (
              <>
                {results.projects.length === 0 &&
                  results.clients.length === 0 &&
                  results.sales.length === 0 &&
                  results.todos.length === 0 &&
                  results.notes.length === 0 &&
                  results.events.length === 0 && (
                    <CommandEmpty>No results found</CommandEmpty>
                  )}
                
                {results.projects.length > 0 && (
                  <CommandGroup heading="Projects">
                    {results.projects.map((project) => (
                      <CommandItem
                        key={project.id}
                        value={`project-${project.id}`}
                        onSelect={() => {
                          navigate(`/projects/${project.id}`);
                          setOpen(false);
                        }}
                      >
                        <FilePlus className="mr-2 h-4 w-4" />
                        <div className="flex-1 flex items-center justify-between">
                          <span>{project.name}</span>
                          <Badge variant="outline" className="ml-2">
                            {project.status}
                          </Badge>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                
                {results.clients.length > 0 && (
                  <CommandGroup heading="Clients">
                    {results.clients.map((client) => (
                      <CommandItem
                        key={client.id}
                        value={`client-${client.id}`}
                        onSelect={() => {
                          navigate(`/clients/${client.id}`);
                          setOpen(false);
                        }}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        <div className="flex-1">
                          <span>{client.name}</span>
                          {client.company && (
                            <span className="text-muted-foreground text-xs ml-2">
                              {client.company}
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                
                {results.sales.length > 0 && (
                  <CommandGroup heading="Sales">
                    {results.sales.map((sale) => (
                      <CommandItem
                        key={sale.id}
                        value={`sale-${sale.id}`}
                        onSelect={() => {
                          navigate(`/sales/${sale.id}`);
                          setOpen(false);
                        }}
                      >
                        <DollarSign className="mr-2 h-4 w-4" />
                        <div className="flex-1 flex items-center justify-between">
                          <span>{sale.client_name} - ${sale.amount}</span>
                          <span className="text-muted-foreground text-xs">
                            {new Date(sale.date).toLocaleDateString()}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                
                {results.todos.length > 0 && (
                  <CommandGroup heading="Tasks">
                    {results.todos.map((todo) => (
                      <CommandItem
                        key={todo.id}
                        value={`todo-${todo.id}`}
                        onSelect={() => {
                          navigate(`/todos`);
                          setOpen(false);
                        }}
                      >
                        <ListTodo className="mr-2 h-4 w-4" />
                        <div className="flex-1 flex items-center justify-between">
                          <span>{todo.title}</span>
                          <Badge variant={todo.completed ? "default" : "outline"} className="ml-2">
                            {todo.completed ? "Completed" : "Pending"}
                          </Badge>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                
                {results.notes.length > 0 && (
                  <CommandGroup heading="Notes">
                    {results.notes.map((note) => (
                      <CommandItem
                        key={note.id}
                        value={`note-${note.id}`}
                        onSelect={() => {
                          navigate(`/notes/${note.id}`);
                          setOpen(false);
                        }}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        <div className="flex-1">
                          <span>{note.title}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                
                {results.events.length > 0 && (
                  <CommandGroup heading="Calendar Events">
                    {results.events.map((event) => (
                      <CommandItem
                        key={event.id}
                        value={`event-${event.id}`}
                        onSelect={() => {
                          navigate(`/calendar`);
                          setOpen(false);
                        }}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        <div className="flex-1 flex items-center justify-between">
                          <span>{event.title}</span>
                          <span className="text-muted-foreground text-xs">
                            {new Date(event.start_time).toLocaleDateString()}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </>
            )
          )}
          
          <CommandSeparator />
          <CommandGroup>
            <CommandItem
              onSelect={() => {
                setOpen(false);
                navigate("/search", { state: { query: searchQuery } });
              }}
            >
              <Search className="mr-2 h-4 w-4" />
              <span>View all results</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
      
      {/* Right side - Actions */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <ThemeToggle variant="button" />
        
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {user?.metadata?.notifications_count > 0 && (
                <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-destructive"></span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between p-2">
              <p className="font-medium">Notifications</p>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleMarkAllNotificationsAsRead()}
              >
                Mark all as read
              </Button>
            </div>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center items-center py-4">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                </div>
              ) : notifications.length > 0 ? (
                <div className="p-2 text-sm">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`flex items-center gap-2 rounded-md p-2 hover:bg-muted ${!notification.read ? 'bg-muted/50' : ''}`}
                    >
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-xs text-muted-foreground">{formatNotificationTime(notification.created_at)}</p>
                      </div>
                      {!notification.read && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0" 
                          onClick={() => handleMarkNotificationAsRead(notification.id)}
                        >
                          <span className="sr-only">Mark as read</span>
                          <span className="h-2 w-2 rounded-full bg-primary"></span>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No notifications
                </div>
              )}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-center cursor-pointer"
              onClick={() => navigate('/notifications')}
            >
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* User menu */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8 border">
                  <AvatarImage src={getUserAvatar()} alt={getUserDisplayName()} />
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{getUserDisplayName()}</p>
                  <p className="w-[200px] truncate text-sm text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={() => window.location.href = "/settings"}
              >
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-destructive focus:text-destructive" 
                onClick={logout}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
};
