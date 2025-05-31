
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreHorizontal, Edit, Trash2, CheckCircle2, Circle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

type Priority = "low" | "medium" | "high";

interface Todo {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  due_date?: string;
  project_id?: string;
  created_at: string;
  updated_at: string;
  projects?: {
    name: string;
  };
}

interface Project {
  id: string;
  name: string;
}

const TodoListPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as Priority,
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
          projects (
            name
          )
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Ensure priority field matches our type
      const typedTodos = data?.map(todo => ({
        ...todo,
        priority: todo.priority as Priority
      })) || [];
      
      setTodos(typedTodos);
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
        .eq("status", "active");

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
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingTodo) {
        const { error } = await supabase
          .from("todos")
          .update({
            title: formData.title,
            description: formData.description,
            priority: formData.priority,
            due_date: formData.due_date || null,
            project_id: formData.project_id || null,
            updated_at: new Date().toISOString(),
          })
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
            user_id: user?.id,
            title: formData.title,
            description: formData.description,
            priority: formData.priority,
            due_date: formData.due_date || null,
            project_id: formData.project_id || null,
          }]);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Todo created successfully",
        });
      }

      setIsDialogOpen(false);
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

  const handleToggleComplete = async (todoId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from("todos")
        .update({
          completed: !completed,
          updated_at: new Date().toISOString(),
        })
        .eq("id", todoId);

      if (error) throw error;
      
      fetchTodos();
    } catch (error) {
      console.error("Error updating todo:", error);
      toast({
        title: "Error",
        description: "Failed to update todo",
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
      project_id: todo.project_id || "",
    });
    setIsDialogOpen(true);
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

  const filteredTodos = todos.filter(todo =>
    todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    todo.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const completedTodos = todos.filter(todo => todo.completed).length;
  const pendingTodos = todos.filter(todo => !todo.completed).length;
  const highPriorityTodos = todos.filter(todo => todo.priority === "high" && !todo.completed).length;

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Todo List</h1>
          <p className="text-muted-foreground">Manage your tasks and stay organized</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Todo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingTodo ? "Edit Todo" : "Add New Todo"}
              </DialogTitle>
              <DialogDescription>
                {editingTodo ? "Update your task" : "Create a new task"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value: Priority) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="project_id">Project</Label>
                <Select value={formData.project_id} onValueChange={(value) => setFormData({ ...formData, project_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingTodo ? "Update" : "Create"} Todo
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search todos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Circle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todos.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTodos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <Circle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highPriorityTodos}</div>
          </CardContent>
        </Card>
      </div>

      {/* Todo List */}
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTodos.map((todo) => (
              <div
                key={todo.id}
                className={`flex items-center gap-4 p-4 rounded-lg border ${
                  todo.completed ? "bg-muted/50" : "bg-background"
                }`}
              >
                <Checkbox
                  checked={todo.completed}
                  onCheckedChange={() => handleToggleComplete(todo.id, todo.completed)}
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className={`font-medium ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
                      {todo.title}
                    </p>
                    <Badge 
                      variant={
                        todo.priority === "high" ? "destructive" : 
                        todo.priority === "medium" ? "secondary" : "outline"
                      }
                    >
                      {todo.priority}
                    </Badge>
                  </div>
                  {todo.description && (
                    <p className={`text-sm ${todo.completed ? "line-through text-muted-foreground" : "text-muted-foreground"}`}>
                      {todo.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {todo.due_date && (
                      <span>Due: {new Date(todo.due_date).toLocaleDateString()}</span>
                    )}
                    {todo.projects?.name && (
                      <span>Project: {todo.projects.name}</span>
                    )}
                  </div>
                </div>
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
            ))}
            {filteredTodos.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No todos found. Create your first task to get started.
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

export default TodoListPage;
