import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, BellOff, Check, Clock, FileText, AlertCircle, Calendar, DollarSign, UserPlus, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  related_id: string;
  read: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

const Notifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Fetch notifications from the database
  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Get session to ensure we have authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('No active session found');
        return;
      }
      
      let { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching notifications:', error);
        
        // Fallback to mock data if the notifications table doesn't exist yet
        data = generateMockNotifications();
      }
      
      // Update notifications state
      setNotifications(data || []);
      
      // Update user metadata with unread count
      updateUnreadCount(data || []);
    } catch (error) {
      console.error('Error in fetchNotifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate mock notifications for development
  const generateMockNotifications = (): Notification[] => {
    return [
      {
        id: '1',
        title: 'New Project Created',
        message: 'You created a new project "Website Redesign"',
        type: 'project',
        related_id: '123',
        read: false,
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        user_id: user?.id || ''
      },
      {
        id: '2',
        title: 'Task Deadline Approaching',
        message: 'Task "Update documentation" is due tomorrow',
        type: 'todo',
        related_id: '456',
        read: true,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        user_id: user?.id || ''
      },
      {
        id: '3',
        title: 'New Client Added',
        message: 'Client "Acme Corp" has been added to your list',
        type: 'client',
        related_id: '789',
        read: false,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        user_id: user?.id || ''
      },
      {
        id: '4',
        title: 'Calendar Event Reminder',
        message: 'Meeting with Design Team in 1 hour',
        type: 'event',
        related_id: '101',
        read: false,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
        updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        user_id: user?.id || ''
      },
      {
        id: '5',
        title: 'Sales Target Achieved',
        message: 'You have reached your monthly sales target! Congratulations!',
        type: 'sale',
        related_id: '202',
        read: true,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
        updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        user_id: user?.id || ''
      }
    ];
  };

  // Mark a notification as read
  const handleMarkNotificationAsRead = async (notificationId: string) => {
    try {
      // Update local state first for immediate UI feedback
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === notificationId ? { ...notification, read: true } : notification
        )
      );
      
      // Try to update in the database
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', user?.id);
        
      if (error) {
        console.error('Error marking notification as read:', error);
      }
      
      // Update user metadata with new unread count
      updateUnreadCount(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      
    } catch (error) {
      console.error('Error in handleMarkNotificationAsRead:', error);
    }
  };

  // Mark all notifications as read
  const handleMarkAllNotificationsAsRead = async () => {
    try {
      // Update local state first for immediate UI feedback
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
      
      // Try to update in the database
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('user_id', user?.id)
        .eq('read', false);
        
      if (error) {
        console.error('Error marking all notifications as read:', error);
      }
      
      // Update user metadata with zero unread
      updateUnreadCount(notifications.map(n => ({ ...n, read: true })));
      
      toast({
        title: "Notifications Updated",
        description: "All notifications have been marked as read.",
      });
      
    } catch (error) {
      console.error('Error in handleMarkAllNotificationsAsRead:', error);
    }
  };

  // Delete a notification
  const handleDeleteNotification = async (notificationId: string) => {
    try {
      // Update local state first for immediate UI feedback
      setNotifications(prevNotifications =>
        prevNotifications.filter(notification => notification.id !== notificationId)
      );
      
      // Try to delete from the database
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user?.id);
        
      if (error) {
        console.error('Error deleting notification:', error);
      }
      
      // Update user metadata with new unread count
      updateUnreadCount(notifications.filter(n => n.id !== notificationId));
      
      toast({
        title: "Notification Deleted",
        description: "The notification has been removed.",
      });
      
    } catch (error) {
      console.error('Error in handleDeleteNotification:', error);
    }
  };

  // Track previous unread count to avoid unnecessary updates
  const prevUnreadCountRef = useRef<number | null>(null);
  
  // Store last update timestamp to implement throttling
  const lastUpdateTimeRef = useRef<number>(0);
  
  // Minimum time between user metadata updates (in milliseconds)
  const MIN_UPDATE_INTERVAL = 60000; // 1 minute

  // Update user metadata with unread notification count (with throttling and conditional updates)
  const updateUnreadCount = async (notificationsArray: Notification[]) => {
    try {
      const unreadCount = notificationsArray.filter(n => !n.read).length;
      const now = Date.now();
      
      // Only update if:
      // 1. The count has changed from previous value, AND
      // 2. Sufficient time has passed since last update to avoid rate limiting
      if ((prevUnreadCountRef.current === null || prevUnreadCountRef.current !== unreadCount) && 
          (now - lastUpdateTimeRef.current > MIN_UPDATE_INTERVAL)) {
        
        // Get session to ensure authentication is valid
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.warn('No active session found, skipping user metadata update');
          return;
        }
        
        // Update user metadata
        const { error } = await supabase.auth.updateUser({
          data: { notifications_count: unreadCount }
        });
        
        if (error) {
          if (error.message.includes('rate limit')) {
            console.warn('Rate limit reached, will retry later:', error.message);
          } else {
            console.error('Error updating user metadata:', error);
          }
        } else {
          // Update was successful
          prevUnreadCountRef.current = unreadCount;
          lastUpdateTimeRef.current = now;
        }
      } else {
        // Skip update but still track the current count
        prevUnreadCountRef.current = unreadCount;
      }
    } catch (error) {
      console.error('Error in updateUnreadCount:', error);
    }
  };

  // Format the notification time
  const formatNotificationTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.round(diffMs / (1000 * 60));
      const diffHours = Math.round(diffMs / (1000 * 60 * 60));
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffMins < 60) {
        return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
      } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      } else if (diffDays < 7) {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Unknown date';
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'project':
        return <FileText className="h-4 w-4" />;
      case 'todo':
        return <Clock className="h-4 w-4" />;
      case 'client':
        return <UserPlus className="h-4 w-4" />;
      case 'event':
        return <Calendar className="h-4 w-4" />;
      case 'sale':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Get notification color based on type
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'project':
        return 'bg-blue-100 dark:bg-blue-900/20';
      case 'todo':
        return 'bg-yellow-100 dark:bg-yellow-900/20';
      case 'client':
        return 'bg-green-100 dark:bg-green-900/20';
      case 'event':
        return 'bg-purple-100 dark:bg-purple-900/20';
      case 'sale':
        return 'bg-emerald-100 dark:bg-emerald-900/20';
      default:
        return 'bg-gray-100 dark:bg-gray-800';
    }
  };

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.read;
    if (activeTab === 'read') return notification.read;
    return notification.type === activeTab;
  });

  // Count notifications by status
  const unreadCount = notifications.filter(n => !n.read).length;
  const readCount = notifications.filter(n => n.read).length;
  
  // Count notifications by type
  const typeCount = {
    project: notifications.filter(n => n.type === 'project').length,
    todo: notifications.filter(n => n.type === 'todo').length,
    client: notifications.filter(n => n.type === 'client').length,
    event: notifications.filter(n => n.type === 'event').length,
    sale: notifications.filter(n => n.type === 'sale').length,
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleMarkAllNotificationsAsRead}
            disabled={unreadCount === 0}
          >
            <Check className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchNotifications}
          >
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center">
          <TabsList className="grid grid-cols-2 md:grid-cols-7 w-full md:w-auto">
            <TabsTrigger value="all" className="text-xs md:text-sm">
              All
              <Badge variant="secondary" className="ml-1">{notifications.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="unread" className="text-xs md:text-sm">
              Unread
              <Badge variant="secondary" className="ml-1">{unreadCount}</Badge>
            </TabsTrigger>
            <TabsTrigger value="project" className="hidden md:inline-flex text-xs md:text-sm">
              Projects
              <Badge variant="secondary" className="ml-1">{typeCount.project}</Badge>
            </TabsTrigger>
            <TabsTrigger value="todo" className="hidden md:inline-flex text-xs md:text-sm">
              Tasks
              <Badge variant="secondary" className="ml-1">{typeCount.todo}</Badge>
            </TabsTrigger>
            <TabsTrigger value="client" className="hidden md:inline-flex text-xs md:text-sm">
              Clients
              <Badge variant="secondary" className="ml-1">{typeCount.client}</Badge>
            </TabsTrigger>
            <TabsTrigger value="event" className="hidden md:inline-flex text-xs md:text-sm">
              Events
              <Badge variant="secondary" className="ml-1">{typeCount.event}</Badge>
            </TabsTrigger>
            <TabsTrigger value="sale" className="hidden md:inline-flex text-xs md:text-sm">
              Sales
              <Badge variant="secondary" className="ml-1">{typeCount.sale}</Badge>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="all" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>All Notifications</CardTitle>
              <CardDescription>View and manage all your notifications</CardDescription>
            </CardHeader>
            <CardContent>
              {renderNotificationsList()}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="unread" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Unread Notifications</CardTitle>
              <CardDescription>Notifications you haven't read yet</CardDescription>
            </CardHeader>
            <CardContent>
              {renderNotificationsList()}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="project" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Project Notifications</CardTitle>
              <CardDescription>Updates related to your projects</CardDescription>
            </CardHeader>
            <CardContent>
              {renderNotificationsList()}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="todo" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Task Notifications</CardTitle>
              <CardDescription>Updates related to your tasks</CardDescription>
            </CardHeader>
            <CardContent>
              {renderNotificationsList()}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="client" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Client Notifications</CardTitle>
              <CardDescription>Updates related to your clients</CardDescription>
            </CardHeader>
            <CardContent>
              {renderNotificationsList()}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="event" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Event Notifications</CardTitle>
              <CardDescription>Updates related to your calendar events</CardDescription>
            </CardHeader>
            <CardContent>
              {renderNotificationsList()}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sale" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Sales Notifications</CardTitle>
              <CardDescription>Updates related to your sales</CardDescription>
            </CardHeader>
            <CardContent>
              {renderNotificationsList()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  // Helper function to render notifications list
  function renderNotificationsList() {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      );
    }
    
    if (filteredNotifications.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <BellOff className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No notifications</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {activeTab === 'unread' ? 'You have read all your notifications' : 'You don\'t have any notifications yet'}
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        {filteredNotifications.map((notification) => (
          <div 
            key={notification.id} 
            className={`flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors ${!notification.read ? 'bg-muted/30' : ''}`}
          >
            <div className={`h-10 w-10 rounded-full ${getNotificationColor(notification.type)} flex items-center justify-center flex-shrink-0`}>
              {getNotificationIcon(notification.type)}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h4 className="font-medium">{notification.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                </div>
                
                {!notification.read && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8" 
                    onClick={() => handleMarkNotificationAsRead(notification.id)}
                  >
                    <Check className="h-4 w-4" />
                    <span className="sr-only">Mark as read</span>
                  </Button>
                )}
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {notification.type}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatNotificationTime(notification.created_at)}
                  </span>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" 
                  onClick={() => handleDeleteNotification(notification.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
};

export default Notifications;
