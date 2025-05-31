
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { ArrowUpRight, CircleDollarSign, PieChart as PieChartIcon, Users, Clock, Activity, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalClients: number;
  totalTodos: number;
  completedTodos: number;
  totalNotes: number;
  totalRevenue: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalClients: 0,
    totalTodos: 0,
    completedTodos: 0,
    totalNotes: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch projects
      const { data: projects } = await supabase
        .from("projects")
        .select("status")
        .eq("user_id", user?.id);

      // Fetch clients
      const { data: clients } = await supabase
        .from("clients")
        .select("id")
        .eq("user_id", user?.id);

      // Fetch todos
      const { data: todos } = await supabase
        .from("todos")
        .select("completed")
        .eq("user_id", user?.id);

      // Fetch notes
      const { data: notes } = await supabase
        .from("notes")
        .select("id")
        .eq("user_id", user?.id);

      // Fetch sales for revenue
      const { data: sales } = await supabase
        .from("sales")
        .select("amount")
        .eq("user_id", user?.id);

      const totalRevenue = sales?.reduce((sum, sale) => sum + (sale.amount || 0), 0) || 0;

      setStats({
        totalProjects: projects?.length || 0,
        activeProjects: projects?.filter(p => p.status === 'in_progress').length || 0,
        completedProjects: projects?.filter(p => p.status === 'completed').length || 0,
        totalClients: clients?.length || 0,
        totalTodos: todos?.length || 0,
        completedTodos: todos?.filter(t => t.completed).length || 0,
        totalNotes: notes?.length || 0,
        totalRevenue
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Sample chart data - in a real app, this would come from your database
  const revenueData = [
    { name: "Jan", value: stats.totalRevenue * 0.1 },
    { name: "Feb", value: stats.totalRevenue * 0.15 },
    { name: "Mar", value: stats.totalRevenue * 0.12 },
    { name: "Apr", value: stats.totalRevenue * 0.18 },
    { name: "May", value: stats.totalRevenue * 0.22 },
    { name: "Jun", value: stats.totalRevenue * 0.23 },
  ];
  
  const projectStatusData = [
    { name: "Completed", value: stats.completedProjects, color: "#22c55e" },
    { name: "Active", value: stats.activeProjects, color: "#3b82f6" },
    { name: "Planning", value: stats.totalProjects - stats.activeProjects - stats.completedProjects, color: "#f59e0b" },
  ].filter(item => item.value > 0);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading dashboard...</div>;
  }
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your FGAdmin dashboard</p>
      </div>
      
      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="stats-card">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Revenue</p>
              <h3 className="text-2xl font-bold mt-1">${stats.totalRevenue.toLocaleString()}</h3>
            </div>
            <div className="h-9 w-9 bg-primary/10 flex items-center justify-center rounded-full">
              <CircleDollarSign className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <div className="flex items-center text-sm text-green-500">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>12.5%</span>
            </div>
            <span className="text-xs text-muted-foreground">vs last month</span>
          </div>
        </Card>

        <Card className="stats-card">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Projects</p>
              <h3 className="text-2xl font-bold mt-1">{stats.totalProjects}</h3>
            </div>
            <div className="h-9 w-9 bg-blue-500/10 flex items-center justify-center rounded-full">
              <PieChartIcon className="h-5 w-5 text-blue-500" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <span className="text-xs text-muted-foreground">
              {stats.activeProjects} active, {stats.completedProjects} completed
            </span>
          </div>
        </Card>

        <Card className="stats-card">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Clients</p>
              <h3 className="text-2xl font-bold mt-1">{stats.totalClients}</h3>
            </div>
            <div className="h-9 w-9 bg-green-500/10 flex items-center justify-center rounded-full">
              <Users className="h-5 w-5 text-green-500" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <div className="flex items-center text-sm text-green-500">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>4.1%</span>
            </div>
            <span className="text-xs text-muted-foreground">vs last month</span>
          </div>
        </Card>

        <Card className="stats-card">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tasks</p>
              <h3 className="text-2xl font-bold mt-1">{stats.totalTodos}</h3>
            </div>
            <div className="h-9 w-9 bg-purple-500/10 flex items-center justify-center rounded-full">
              <Clock className="h-5 w-5 text-purple-500" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <span className="text-xs text-muted-foreground">
              {stats.completedTodos} completed
            </span>
          </div>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}
                  formatter={(value) => [`$${value}`, "Revenue"]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Project Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Project Status</CardTitle>
          </CardHeader>
          <CardContent className="flex">
            <ResponsiveContainer width="60%" height={300}>
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} Projects`, name]}
                  contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col justify-center space-y-2">
              {projectStatusData.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div 
                    className="h-3 w-3 rounded-full mr-2" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <div className="text-sm">
                    <span>{item.name}: </span>
                    <span className="font-medium">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions & Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors">
              <div className="flex items-center space-x-3">
                <PlusCircle className="h-5 w-5 text-primary" />
                <span>New Project</span>
              </div>
            </button>
            <button className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-primary" />
                <span>Add Client</span>
              </div>
            </button>
            <button className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-primary" />
                <span>Create Task</span>
              </div>
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Content Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Notes</span>
              <span className="font-medium">{stats.totalNotes}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Active Projects</span>
              <span className="font-medium">{stats.activeProjects}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Pending Tasks</span>
              <span className="font-medium">{stats.totalTodos - stats.completedTodos}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary text-sm font-medium">1</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Dashboard connected to Supabase</h4>
                  <p className="text-xs text-muted-foreground">Real-time data now available</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary text-sm font-medium">2</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Database initialized</h4>
                  <p className="text-xs text-muted-foreground">All tables created successfully</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
