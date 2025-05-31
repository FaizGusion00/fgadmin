
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Calendar as CalendarIcon, Filter, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  project_id?: string;
  created_at: string;
  updated_at: string;
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
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  
  // Form states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    due_date: undefined as Date | undefined,
    project_id: undefined as string | undefined,
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
        .from('todos')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTodos(data || []);
    } catch (error) {
      console.error('Error fetching todos:', error);
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
        .from('projects')
        .select('id, name')
        .eq('user_id', user?.id);

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a todo title",
        variant: "destructive",
      });
      return;
    }

    try {
      const todoData = {
        title: formData.title,
        description: formData.description || null,
        priority: formData.priority,
        due_date: formData.due_date ? format(formData.due_date, 'yyyy-MM-dd') : null,
        project_id: formData.project_id || null,
        user_id: user?.id,
      };

      if (editingTodo) {
        const { error } = await supabase
          .from('todos')
          .update(todoData)
          .eq('id', editingTodo.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Todo updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('todos')
          .insert([todoData]);

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
      console.error('Error saving todo:', error);
      toast({
        title: "Error",
        description: "Failed to save todo",
        variant: "destructive",
      });
    }
  };

  const handleToggleComplete = async (todo: Todo) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ completed: !todo.completed })
        .eq('id', todo.id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Todo marked as ${!todo.completed ? 'completed' : 'pending'}`,
      });
      
      fetchTodos();
    } catch (error) {
      console.error('Error updating todo:', error);
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
      description: todo.description || '',
      priority: todo.priority,
      due_date: todo.due_date ? new Date(todo.due_date) : undefined,
      project_id: todo.project_id || undefined,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Todo deleted successfully",
      });
      
      fetchTodos();
    } catch (error) {
      console.error('Error deleting todo:', error);
      toast({
        title: "Error",
        description: "Failed to delete todo",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      due_date: undefined,
      project_id: undefined,
    });
    setEditingTodo(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="h-4 w-4" />;
      case 'medium': return <Clock className="h-4 w-4" />;
      case 'low': return <CheckCircle2 className="h-4 w-4" />;
      default: return null;
    }
  };

  const filteredTodos = todos.filter(todo => {
    const statusMatch = filter === 'all' || 
      (filter === 'completed' && todo.completed) || 
      (filter === 'pending' && !todo.completed);
    
    const priorityMatch = priorityFilter === 'all' || todo.priority === priorityFilter;
    
    return statusMatch && priorityMatch;
  });

  const getProjectName = (projectId: string | undefined) => {
    if (!projectId) return null;
    const project = projects.find(p => p.id === projectId);
    return project?.name;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading todos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Todo List</h1>
          <p className="text-muted-foreground">Manage your tasks and stay organized</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Todo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>{editingTodo ? 'Edit Todo' : 'Create New Todo'}</DialogTitle>
              <DialogDescription>
                {editingTodo ? 'Update your todo details.' : 'Add a new todo to your list.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter todo title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter todo description (optional)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={formData.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setFormData({ ...formData, priority: value })}>
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
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.due_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.due_date ? format(formData.due_date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.due_date}
                        onSelect={(date) => setFormData({ ...formData, due_date: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Project</Label>
                <Select value={formData.project_id || ''} onValueChange={(value) => setFormData({ ...formData, project_id: value || undefined })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No project</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingTodo ? 'Update Todo' : 'Create Todo'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Select value={filter} onValueChange={(value: 'all' | 'completed' | 'pending') => setFilter(value)}>
          <SelectTrigger className="w-[150px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Todos</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={(value: 'all' | 'low' | 'medium' | 'high') => setPriorityFilter(value)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High Priority</SelectItem>
            <SelectItem value="medium">Medium Priority</SelectItem>
            <SelectItem value="low">Low Priority</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Todos List */}
      <div className="grid gap-4">
        {filteredTodos.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No todos found</h3>
              <p className="text-muted-foreground text-center">
                {filter === 'all' 
                  ? "You don't have any todos yet. Create your first todo to get started!"
                  : `No ${filter} todos found. Try adjusting your filters.`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTodos.map((todo) => (
            <Card key={todo.id} className={cn(
              "transition-all hover:shadow-md",
              todo.completed && "opacity-75"
            )}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() => handleToggleComplete(todo)}
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        <h3 className={cn(
                          "font-semibold",
                          todo.completed && "line-through text-muted-foreground"
                        )}>
                          {todo.title}
                        </h3>
                        <Badge className={getPriorityColor(todo.priority)}>
                          <div className="flex items-center space-x-1">
                            {getPriorityIcon(todo.priority)}
                            <span>{todo.priority}</span>
                          </div>
                        </Badge>
                      </div>
                      {todo.description && (
                        <p className={cn(
                          "text-sm text-muted-foreground",
                          todo.completed && "line-through"
                        )}>
                          {todo.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        {todo.due_date && (
                          <div className="flex items-center space-x-1">
                            <CalendarIcon className="h-3 w-3" />
                            <span>Due: {format(new Date(todo.due_date), "MMM dd, yyyy")}</span>
                          </div>
                        )}
                        {getProjectName(todo.project_id) && (
                          <Badge variant="outline" className="text-xs">
                            {getProjectName(todo.project_id)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(todo)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the todo.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(todo.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default TodoList;
