
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Users, FolderKanban, DollarSign, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalClients: number;
  totalSales: number;
  completedTodos: number;
  pendingTodos: number;
  upcomingEvents: number;
  totalNotes: number;
}

interface RecentActivity {
  id: string;
  type: 'project' | 'client' | 'sale' | 'note' | 'todo' | 'event';
  title: string;
  description: string;
  date: string;
  status?: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    totalClients: 0,
    totalSales: 0,
    completedTodos: 0,
    pendingTodos: 0,
    upcomingEvents: 0,
    totalNotes: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch all data in parallel
      const [
        projectsResult,
        clientsResult,
        salesResult,
        todosResult,
        eventsResult,
        notesResult
      ] = await Promise.all([
        supabase.from("projects").select("*").eq("user_id", user?.id),
        supabase.from("clients").select("*").eq("user_id", user?.id),
        supabase.from("sales").select("*").eq("user_id", user?.id),
        supabase.from("todos").select("*").eq("user_id", user?.id),
        supabase.from("calendar_events").select("*").eq("user_id", user?.id),
        supabase.from("notes").select("*").eq("user_id", user?.id)
      ]);

      // Calculate stats
      const projects = projectsResult.data || [];
      const clients = clientsResult.data || [];
      const sales = salesResult.data || [];
      const todos = todosResult.data || [];
      const events = eventsResult.data || [];
      const notes = notesResult.data || [];

      const now = new Date();
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7); // Next 7 days

      setStats({
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'active' || p.status === 'planning').length,
        totalClients: clients.length,
        totalSales: sales.reduce((sum, sale) => sum + (sale.amount || 0), 0),
        completedTodos: todos.filter(t => t.completed).length,
        pendingTodos: todos.filter(t => !t.completed).length,
        upcomingEvents: events.filter(e => new Date(e.start_time) <= todayEnd && new Date(e.start_time) >= now).length,
        totalNotes: notes.length,
      });

      // Create recent activity
      const activities: RecentActivity[] = [];

      // Add recent projects
      projects.slice(0, 3).forEach(project => {
        activities.push({
          id: project.id,
          type: 'project',
          title: project.name,
          description: `Project status: ${project.status}`,
          date: project.created_at,
          status: project.status
        });
      });

      // Add recent clients
      clients.slice(0, 2).forEach(client => {
        activities.push({
          id: client.id,
          type: 'client',
          title: client.name,
          description: `New client added${client.company ? ` from ${client.company}` : ''}`,
          date: client.created_at,
          status: client.status
        });
      });

      // Add recent todos
      todos.slice(0, 3).forEach(todo => {
        activities.push({
          id: todo.id,
          type: 'todo',
          title: todo.title,
          description: todo.completed ? 'Task completed' : 'Task pending',
          date: todo.updated_at,
          status: todo.completed ? 'completed' : 'pending'
        });
      });

      // Sort activities by date and take top 8
      activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentActivity(activities.slice(0, 8));

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your business.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeProjects} active projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              Active business relationships
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalSales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Revenue generated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedTodos + stats.pendingTodos}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedTodos} completed, {stats.pendingTodos} pending
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.upcomingEvents}</div>
            <p className="text-sm text-muted-foreground">Events in the next 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Notes & Documentation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalNotes}</div>
            <p className="text-sm text-muted-foreground">Total notes created</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={`${activity.type}-${activity.id}`} className="flex items-center gap-4 p-4 rounded-lg border">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{activity.title}</p>
                      <Badge variant="outline" className="text-xs">
                        {activity.type}
                      </Badge>
                      {activity.status && (
                        <Badge 
                          variant={
                            activity.status === 'completed' || activity.status === 'active' ? 'default' : 
                            activity.status === 'pending' ? 'secondary' : 'outline'
                          }
                          className="text-xs"
                        >
                          {activity.status}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No recent activity. Start by creating projects, clients, or tasks!
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Attribution */}
      <div className="text-center text-sm text-muted-foreground border-t pt-4">
        <p>Developed by: Faiz Nasir | Owned by: FGCompany Official</p>
      </div>
    </div>
  );
};

export default Dashboard;
