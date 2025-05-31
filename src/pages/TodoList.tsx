
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PlusCircle, Search, Calendar, Edit, Trash2, MoreHorizontal, CheckCircle, Circle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: string;
  due_date?: string;
  project_id?: string;
  created_at: string;
  updated_at: string;
  project?: { name: string };
}

interface Project {
  id: string;
  name: string;
}

const TodoList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    due_date: "",
    project_id: ""
  });

  useEffect(() => {
    if (user) {
      fetchTodos();
      fetchProjects();
    }
  }, [user]);

  const fetchTodos = async () => {
    try {
      const { data, error } = await supabase
        .from("todos")
        .select(`
          *,
          project:projects(name)
        `)
        .eq("user_id", user?.id)
        .order("completed")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTodos(data || []);
    } catch (error) {
      console.error("Error fetching todos:", error);
      toast({
        title: "Error",
        description: "Failed to fetch todos",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Todo title is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const todoData = {
        title: formData.title,
        description: formData.description || null,
        priority: formData.priority,
        due_date: formData.due_date || null,
        project_id: formData.project_id || null,
        updated_at: new Date().toISOString(),
      };

      if (editingTodo) {
        const { error } = await supabase
          .from("todos")
          .update(todoData)
          .eq("id", editingTodo.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Todo updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("todos")
          .insert([{
            ...todoData,
            user_id: user?.id,
          }]);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Todo created successfully",
        });
      }

      setDialogOpen(false);
      resetForm();
      fetchTodos();
    } catch (error) {
      console.error("Error saving todo:", error);
      toast({
        title: "Error",
        description: "Failed to save todo",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setFormData({
      title: todo.title,
      description: todo.description || "",
      priority: todo.priority,
      due_date: todo.due_date || "",
      project_id: todo.project_id || ""
    });
    setDialogOpen(true);
  };

  const handleDelete = async (todoId: string) => {
    if (!confirm("Are you sure you want to delete this todo?")) return;

    try {
      const { error } = await supabase
        .from("todos")
        .delete()
        .eq("id", todoId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Todo deleted successfully",
      });
      
      fetchTodos();
    } catch (error) {
      console.error("Error deleting todo:", error);
      toast({
        title: "Error",
        description: "Failed to delete todo",
        variant: "destructive",
      });
    }
  };

  const toggleComplete = async (todoId: string, currentCompleted: boolean) => {
    try {
      const { error } = await supabase
        .from("todos")
        .update({ 
          completed: !currentCompleted,
          updated_at: new Date().toISOString()
        })
        .eq("id", todoId);

      if (error) throw error;
      
      fetchTodos();
    } catch (error) {
      console.error("Error toggling todo:", error);
      toast({
        title: "Error",
        description: "Failed to update todo",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      priority: "medium",
      due_date: "",
      project_id: ""
    });
    setEditingTodo(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const filteredTodos = todos.filter(todo => {
    const matchesSearch = todo.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         todo.description?.toLowerCase().includes(searchQuery.toLowerCase());
                         
    const matchesPriority = filterPriority === "all" || todo.priority === filterPriority;
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "completed" && todo.completed) ||
                         (filterStatus === "pending" && !todo.completed);
    
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    pending: todos.filter(t => !t.completed).length,
    overdue: todos.filter(t => !t.completed && isOverdue(t.due_date)).length
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Todo List</h1>
          <p className="text-muted-foreground">Manage your tasks and stay organized</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Todo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>
                {editingTodo ? "Edit Todo" : "Create New Todo"}
              </DialogTitle>
              <DialogDescription>
                {editingTodo ? "Update your todo" : "Add a new task to your list"}
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
                <Label htmlFor="priority" className="text-right">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="due_date" className="text-right">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="project" className="text-right">Project</Label>
                <Select value={formData.project_id} onValueChange={(value) => setFormData({ ...formData, project_id: value })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No project</SelectItem>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingTodo ? "Update" : "Create"} Todo
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Circle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <Calendar className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center space-x-2 flex-1">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search todos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Todo List */}
      <div className="space-y-4">
        {filteredTodos.map((todo) => (
          <Card key={todo.id} className={`transition-all ${todo.completed ? 'opacity-60' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Checkbox
                  checked={todo.completed}
                  onCheckedChange={() => toggleComplete(todo.id, todo.completed)}
                  className="mt-1"
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={`font-medium ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {todo.title}
                      </h3>
                      {todo.project?.name && (
                        <p className="text-sm text-muted-foreground">
                          Project: {todo.project.name}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(todo.priority)} variant="outline">
                        {todo.priority} priority
                      </Badge>
                      {todo.due_date && (
                        <Badge 
                          variant={isOverdue(todo.due_date) && !todo.completed ? "destructive" : "secondary"}
                          className="text-xs"
                        >
                          {isOverdue(todo.due_date) && !todo.completed ? "Overdue" : "Due"}: {new Date(todo.due_date).toLocaleDateString()}
                        </Badge>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(todo)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(todo.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  {todo.description && (
                    <p className={`text-sm ${todo.completed ? 'text-muted-foreground line-through' : 'text-muted-foreground'}`}>
                      {todo.description}
                    </p>
                  )}
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Created: {new Date(todo.created_at).toLocaleDateString()}</span>
                    {todo.updated_at !== todo.created_at && (
                      <span>Updated: {new Date(todo.updated_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredTodos.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 bg-muted/20 rounded-lg">
            <p className="text-muted-foreground">No todos found</p>
            <Button variant="link" onClick={() => { resetForm(); setDialogOpen(true); }}>
              Create your first todo
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoList;
