
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
import { ArrowUpRight, CircleDollarSign, PieChart as PieChartIcon, Users, Clock, Activity } from "lucide-react";

const Dashboard = () => {
  // Sample data for charts and stats
  const revenueData = [
    { name: "Jan", value: 12000 },
    { name: "Feb", value: 19000 },
    { name: "Mar", value: 15000 },
    { name: "Apr", value: 25000 },
    { name: "May", value: 30000 },
    { name: "Jun", value: 28000 },
    { name: "Jul", value: 32000 },
  ];
  
  const projectData = [
    { name: "Week 1", completed: 8, pending: 5 },
    { name: "Week 2", completed: 12, pending: 4 },
    { name: "Week 3", completed: 7, pending: 6 },
    { name: "Week 4", completed: 15, pending: 2 },
  ];
  
  const projectStatusData = [
    { name: "Complete", value: 18, color: "#4318FF" },
    { name: "In Progress", value: 12, color: "#2DCBBA" },
    { name: "Not Started", value: 8, color: "#A18BFF" },
    { name: "Delayed", value: 4, color: "#FF4560" },
  ];
  
  const clientData = [
    { name: "Tech", value: 35 },
    { name: "Finance", value: 25 },
    { name: "Healthcare", value: 15 },
    { name: "Education", value: 15 },
    { name: "Other", value: 10 },
  ];
  
  const COLORS = ['#4318FF', '#6259CA', '#2DCBBA', '#A18BFF', '#FF4560'];
  
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
              <h3 className="text-2xl font-bold mt-1">$127,325</h3>
            </div>
            <div className="h-9 w-9 bg-primary/10 flex items-center justify-center rounded-full">
              <CircleDollarSign className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <div className="flex items-center text-sm text-green-500">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>12.5%</span>
            </div>
            <span className="text-xs text-muted-foreground">vs last month</span>
          </div>
        </Card>

        <Card className="stats-card">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Projects</p>
              <h3 className="text-2xl font-bold mt-1">42</h3>
            </div>
            <div className="h-9 w-9 bg-fg-blue/10 flex items-center justify-center rounded-full">
              <PieChartIcon className="h-5 w-5 text-fg-blue" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <div className="flex items-center text-sm text-green-500">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>8.2%</span>
            </div>
            <span className="text-xs text-muted-foreground">vs last month</span>
          </div>
        </Card>

        <Card className="stats-card">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Clients</p>
              <h3 className="text-2xl font-bold mt-1">24</h3>
            </div>
            <div className="h-9 w-9 bg-fg-teal/10 flex items-center justify-center rounded-full">
              <Users className="h-5 w-5 text-fg-teal" />
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
              <p className="text-sm font-medium text-muted-foreground">Hours Tracked</p>
              <h3 className="text-2xl font-bold mt-1">1,280</h3>
            </div>
            <div className="h-9 w-9 bg-fg-light-purple/10 flex items-center justify-center rounded-full">
              <Clock className="h-5 w-5 text-fg-light-purple" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <div className="flex items-center text-sm text-green-500">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>10.3%</span>
            </div>
            <span className="text-xs text-muted-foreground">vs last month</span>
          </div>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  contentStyle={{ background: "white", border: "1px solid #ddd" }}
                  formatter={(value) => [`$${value}`, "Revenue"]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#4318FF"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Project Chart */}
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
                  contentStyle={{ background: "white", border: "1px solid #ddd" }}
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
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Project Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Project Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  contentStyle={{ background: "white", border: "1px solid #ddd" }}
                />
                <Bar dataKey="completed" fill="#4318FF" name="Completed" />
                <Bar dataKey="pending" fill="#A18BFF" name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Client Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Client Industries</CardTitle>
          </CardHeader>
          <CardContent className="flex">
            <ResponsiveContainer width="60%" height={300}>
              <PieChart>
                <Pie
                  data={clientData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {clientData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value}%`, "Distribution"]}
                  contentStyle={{ background: "white", border: "1px solid #ddd" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col justify-center space-y-2">
              {clientData.map((entry, index) => (
                <div key={`item-${index}`} className="flex items-center">
                  <div 
                    className="h-3 w-3 rounded-full mr-2" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <div className="text-sm">
                    <span>{entry.name}: </span>
                    <span className="font-medium">{entry.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Activity</CardTitle>
          <Activity className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                title: "New project created",
                description: "Corporate website redesign",
                time: "2 hours ago",
              },
              {
                title: "Client meeting scheduled",
                description: "Innovatech Solutions - Project kickoff",
                time: "Yesterday at 4:30 PM",
              },
              {
                title: "Invoice paid",
                description: "TechCorp - $12,500",
                time: "Yesterday at 2:15 PM",
              },
              {
                title: "New team member added",
                description: "John Smith joined the Design team",
                time: "2 days ago",
              },
            ].map((item, index) => (
              <div key={index} className="flex items-start space-x-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                  <span className="text-primary text-sm font-medium">{index + 1}</span>
                </div>
                <div className="flex flex-col">
                  <h4 className="text-sm font-medium">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <span className="text-xs text-muted-foreground mt-1">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
