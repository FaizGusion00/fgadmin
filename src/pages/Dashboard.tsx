
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Users, FolderKanban, DollarSign, CheckCircle2, AlertCircle, BarChart, PieChart, LineChart, Activity, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, RadialLinearScale, Title, Filler } from 'chart.js';
import { Pie, Line, Bar, Radar } from 'react-chartjs-2';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, RadialLinearScale, Title, Filler);

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalClients: number;
  totalSales: number;
  completedTodos: number;
  pendingTodos: number;
  upcomingEvents: number;
  totalNotes: number;
  projectStatusCount: { [key: string]: number };
  taskCompletionByDay: { [key: string]: { completed: number; pending: number } };
  revenueByMonth: { [key: string]: number };
  activityDistribution: { [key: string]: number };
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
  const { toast } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const refreshButtonRef = useRef<HTMLButtonElement>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    totalClients: 0,
    totalSales: 0,
    completedTodos: 0,
    pendingTodos: 0,
    upcomingEvents: 0,
    totalNotes: 0,
    projectStatusCount: {},
    taskCompletionByDay: {},
    revenueByMonth: {},
    activityDistribution: {},
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);
  
  const handleRefresh = async () => {
    if (refreshButtonRef.current) {
      refreshButtonRef.current.classList.add('animate-spin');
    }
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    toast({
      title: "Dashboard Updated",
      description: "Your dashboard data has been refreshed.",
    });
    if (refreshButtonRef.current) {
      refreshButtonRef.current.classList.remove('animate-spin');
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
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

      // Calculate project status distribution for chart
      const projectStatusCount: { [key: string]: number } = {};
      projects.forEach(project => {
        const status = project.status || 'undefined';
        projectStatusCount[status] = (projectStatusCount[status] || 0) + 1;
      });

      // Calculate task completion by day (last 7 days)
      const taskCompletionByDay: { [key: string]: { completed: number; pending: number } } = {};
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();
      
      last7Days.forEach(day => {
        taskCompletionByDay[day] = { completed: 0, pending: 0 };
      });

      todos.forEach(todo => {
        const todoDate = new Date(todo.created_at).toISOString().split('T')[0];
        if (taskCompletionByDay[todoDate]) {
          if (todo.completed) {
            taskCompletionByDay[todoDate].completed += 1;
          } else {
            taskCompletionByDay[todoDate].pending += 1;
          }
        }
      });

      // Calculate revenue by month (last 6 months)
      const revenueByMonth: { [key: string]: number } = {};
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }).reverse();

      last6Months.forEach(month => {
        revenueByMonth[month] = 0;
      });

      sales.forEach(sale => {
        const saleDate = new Date(sale.sale_date || sale.created_at);
        const saleMonth = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, '0')}`;
        if (revenueByMonth[saleMonth] !== undefined) {
          revenueByMonth[saleMonth] += (sale.amount || 0);
        }
      });

      // Calculate activity distribution
      const activityDistribution = {
        Projects: projects.length || 1,  // Ensure we have at least 1 for visualization
        Clients: clients.length || 1,
        Sales: sales.length || 1,
        Tasks: todos.length || 1,
        Events: events.length || 1,
        Notes: notes.length || 1,
      };

      setStats({
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'active' || p.status === 'planning').length,
        totalClients: clients.length,
        totalSales: sales.reduce((sum, sale) => sum + (sale.amount || 0), 0),
        completedTodos: todos.filter(t => t.completed).length,
        pendingTodos: todos.filter(t => !t.completed).length,
        upcomingEvents: events.filter(e => new Date(e.start_time) <= todayEnd && new Date(e.start_time) >= now).length,
        totalNotes: notes.length,
        projectStatusCount,
        taskCompletionByDay,
        revenueByMonth,
        activityDistribution,
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
          description: todo.completed ? 'Task completed' : 'Task created',
          date: todo.created_at,
          status: todo.completed ? 'completed' : 'pending'
        });
      });

      // Add upcoming events
      events
        .filter(event => new Date(event.start_time) > now)
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
        .slice(0, 2)
        .forEach(event => {
          activities.push({
            id: event.id,
            type: 'event',
            title: event.title,
            description: `Upcoming ${event.event_type} on ${new Date(event.start_time).toLocaleDateString()}`,
            date: event.start_time,
            status: 'scheduled'
          });
        });

      // Sort by date (newest first)
      activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentActivity(activities);

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
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="overflow-hidden border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <FolderKanban className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProjects}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeProjects} active projects
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="overflow-hidden border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClients}</div>
              <p className="text-xs text-muted-foreground">
                Client management
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="overflow-hidden border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.totalSales.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Revenue from all sales
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="overflow-hidden border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Task Status</CardTitle>
              <Activity className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="text-2xl font-bold">{stats.completedTodos}</div>
                <CheckCircle2 className="ml-2 h-4 w-4 text-green-500" />
              </div>
              <div className="flex items-center">
                <div className="text-sm text-muted-foreground">{stats.pendingTodos}</div>
                <AlertCircle className="ml-2 h-4 w-4 text-amber-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
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

      {/* Charts Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Analytics & Insights</h2>
        
        {/* Chart Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="revenue" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Revenue
            </TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Activity Distribution Chart - Modernized & Responsive */}
              <motion.div 
                className="col-span-4 md:col-span-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="shadow-sm hover:shadow-md transition-shadow duration-300 h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-lg font-medium">
                      <PieChart className="h-4 w-4 mr-2 text-indigo-500" />
                      <span>Activity Distribution</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-1 sm:p-4 md:p-6">
                    <div className="h-[280px] md:h-[320px] w-full flex flex-col items-center justify-center">
                      {Object.keys(stats.activityDistribution).length > 0 ? (
                        <div className="w-full h-full flex flex-col sm:flex-row items-center">
                          <div className="relative w-full sm:w-3/5 h-[200px] sm:h-full">
                            <Pie 
                              data={{
                                labels: Object.keys(stats.activityDistribution).map(label => 
                                  // Capitalize first letter of each word
                                  label.split(' ').map(word => 
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                  ).join(' ')
                                ),
                                datasets: [
                                  {
                                    data: Object.values(stats.activityDistribution),
                                    backgroundColor: [
                                      'rgba(79, 70, 229, 0.85)', // Indigo - Projects
                                      'rgba(16, 185, 129, 0.85)', // Emerald - Clients
                                      'rgba(99, 102, 241, 0.85)', // Indigo-lighter - Sales
                                      'rgba(245, 158, 11, 0.85)', // Amber - Tasks
                                      'rgba(239, 68, 68, 0.85)',  // Red - Events
                                      'rgba(6, 182, 212, 0.85)',  // Cyan - Notes
                                    ],
                                    borderColor: 'rgba(255, 255, 255, 0.8)',
                                    borderWidth: 2,
                                    hoverOffset: 5,
                                    borderRadius: 4,
                                    spacing: 2,
                                  },
                                ],
                              }}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                layout: {
                                  padding: {
                                    top: 5,
                                    bottom: 5,
                                    left: 0,
                                    right: 0,
                                  }
                                },
                                plugins: {
                                  legend: {
                                    display: false, // Hide default legend, we'll use custom one
                                    position: 'top' as const,
                                  },
                                  tooltip: {
                                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                                    titleFont: {
                                      size: 13,
                                      family: 'Inter, system-ui, sans-serif',
                                      weight: 'bold',
                                    },
                                    bodyFont: {
                                      size: 12,
                                      family: 'Inter, system-ui, sans-serif',
                                    },
                                    padding: 10,
                                    cornerRadius: 6,
                                    displayColors: true,
                                    boxPadding: 4,
                                    usePointStyle: true,
                                    callbacks: {
                                      label: function(context) {
                                        const label = context.label || '';
                                        const value = Number(context.raw || 0);
                                        const total = context.chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
                                        const percentage = typeof total === 'number' && total > 0 ? Math.round((value / total) * 100) : 0;
                                        return `${label}: ${value} (${percentage}%)`;
                                      }
                                    }
                                  }
                                },
                                cutout: '60%',
                                animation: {
                                  animateScale: true,
                                  animateRotate: true,
                                  duration: 800,
                                  easing: 'easeOutQuart',
                                },
                              }}
                            />
                          </div>
                          
                          {/* Custom Legend - Responsive & Minimalist */}
                          <div className="w-full sm:w-2/5 mt-3 sm:mt-0 px-2 flex flex-wrap sm:flex-col justify-center sm:justify-start gap-2 text-sm">
                            {Object.entries(stats.activityDistribution).map(([label, value], index) => {
                              const colors = [
                                'rgba(79, 70, 229, 0.85)', // Indigo
                                'rgba(16, 185, 129, 0.85)', // Emerald
                                'rgba(99, 102, 241, 0.85)', // Indigo-lighter
                                'rgba(245, 158, 11, 0.85)', // Amber
                                'rgba(239, 68, 68, 0.85)',  // Red
                                'rgba(6, 182, 212, 0.85)',  // Cyan
                              ];
                              const total = Object.values(stats.activityDistribution).reduce((a: number, b: any) => a + Number(b), 0);
                              const percentage = typeof total === 'number' && total > 0 ? Math.round((Number(value) / total) * 100) : 0;
                              
                              // Capitalize first letter of each word
                              const formattedLabel = label.split(' ').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1)
                              ).join(' ');
                              
                              return (
                                <div key={label} className="flex items-center gap-2 min-w-[100px]">
                                  <div 
                                    className="w-3 h-3 rounded-sm" 
                                    style={{ backgroundColor: colors[index % colors.length] }}
                                  />
                                  <span className="text-xs font-medium whitespace-nowrap">{formattedLabel}</span>
                                  <span className="text-xs text-muted-foreground ml-auto">{percentage}%</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <p className="text-muted-foreground">No activity data available</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>
          
          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Project Status Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-96">
                {Object.keys(stats.projectStatusCount).length > 0 ? (
                  <Bar
                    data={{
                      labels: Object.keys(stats.projectStatusCount).map(
                        status => status.charAt(0).toUpperCase() + status.slice(1)
                      ),
                      datasets: [
                        {
                          label: 'Number of Projects',
                          data: Object.values(stats.projectStatusCount),
                          backgroundColor: [
                            'rgba(34, 197, 94, 0.7)',
                            'rgba(99, 102, 241, 0.7)',
                            'rgba(245, 158, 11, 0.7)',
                            'rgba(249, 115, 22, 0.7)',
                            'rgba(239, 68, 68, 0.7)',
                          ],
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            precision: 0,
                          },
                        },
                      },
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No project data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Task Completion (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent className="h-96">
                {Object.keys(stats.taskCompletionByDay).length > 0 ? (
                  <Line
                    data={{
                      labels: Object.keys(stats.taskCompletionByDay).map(date => {
                        const d = new Date(date);
                        return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
                      }),
                      datasets: [
                        {
                          label: 'Completed',
                          data: Object.values(stats.taskCompletionByDay).map(v => v.completed),
                          borderColor: 'rgb(34, 197, 94)',
                          backgroundColor: 'rgba(34, 197, 94, 0.5)',
                          tension: 0.2,
                          fill: true,
                        },
                        {
                          label: 'Pending',
                          data: Object.values(stats.taskCompletionByDay).map(v => v.pending),
                          borderColor: 'rgb(245, 158, 11)',
                          backgroundColor: 'rgba(245, 158, 11, 0.5)',
                          tension: 0.2,
                          fill: true,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            precision: 0,
                          },
                        },
                      },
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No task data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue (Last 6 Months)</CardTitle>
              </CardHeader>
              <CardContent className="h-96">
                {Object.keys(stats.revenueByMonth).length > 0 ? (
                  <Bar
                    data={{
                      labels: Object.keys(stats.revenueByMonth).map(month => {
                        const [year, monthNum] = month.split('-');
                        return `${new Date(0, parseInt(monthNum) - 1).toLocaleString('default', { month: 'short' })} ${year}`;
                      }),
                      datasets: [
                        {
                          label: 'Revenue ($)',
                          data: Object.values(stats.revenueByMonth),
                          backgroundColor: 'rgba(99, 102, 241, 0.7)',
                          borderColor: 'rgb(99, 102, 241)',
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No revenue data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Recent Activity</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.location.href = "/recent-activity"}
            className="text-xs"
          >
            More
          </Button>
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

// Add custom scrollbar styles to the global stylesheet
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, 0.1);
      border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background-color: rgba(0, 0, 0, 0.2);
    }
    .dark .custom-scrollbar::-webkit-scrollbar-thumb {
      background-color: rgba(255, 255, 255, 0.1);
    }
    .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }
  `;
  document.head.appendChild(style);
}

export default Dashboard;
