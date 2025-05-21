
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  CheckCircle2,
  Clock,
  ListTodo,
  PlusCircle,
  X,
  AlertCircle,
  Calendar as CalendarIcon,
  Timer,
} from "lucide-react";

// Define todo item type
type Todo = {
  id: string;
  text: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  dueDate?: string;
  category: string;
  createdAt: Date;
};

// Sample todo data
const initialTodos: Todo[] = [
  {
    id: "1",
    text: "Prepare client presentation slides",
    completed: false,
    priority: "high",
    dueDate: "2025-05-25",
    category: "Work",
    createdAt: new Date("2025-05-20T08:30:00"),
  },
  {
    id: "2",
    text: "Review website mockups",
    completed: true,
    priority: "medium",
    dueDate: "2025-05-19",
    category: "Work",
    createdAt: new Date("2025-05-19T10:15:00"),
  },
  {
    id: "3",
    text: "Schedule team meeting for project kickoff",
    completed: false,
    priority: "high",
    dueDate: "2025-05-23",
    category: "Work",
    createdAt: new Date("2025-05-20T12:00:00"),
  },
  {
    id: "4",
    text: "Research new technologies for upcoming project",
    completed: false,
    priority: "medium",
    category: "Research",
    createdAt: new Date("2025-05-18T16:45:00"),
  },
  {
    id: "5",
    text: "Finalize project proposal for TechCorp",
    completed: false,
    priority: "high",
    dueDate: "2025-05-24",
    category: "Work",
    createdAt: new Date("2025-05-19T14:30:00"),
  },
];

const TodoList = () => {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [newTodoText, setNewTodoText] = useState("");
  const [newTodoPriority, setNewTodoPriority] = useState<"low" | "medium" | "high">("medium");
  const [newTodoCategory, setNewTodoCategory] = useState("Work");
  const [newTodoDueDate, setNewTodoDueDate] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  // Get unique categories from todos
  const categories = ["all", ...Array.from(new Set(todos.map(todo => todo.category)))];
  
  // Add new todo
  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodoText.trim() !== "") {
      const newTodo: Todo = {
        id: Date.now().toString(),
        text: newTodoText,
        completed: false,
        priority: newTodoPriority,
        category: newTodoCategory,
        createdAt: new Date(),
      };
      
      if (newTodoDueDate) {
        newTodo.dueDate = newTodoDueDate;
      }
      
      setTodos([newTodo, ...todos]);
      setNewTodoText("");
      setNewTodoPriority("medium");
      setNewTodoCategory("Work");
      setNewTodoDueDate("");
    }
  };
  
  // Toggle todo completion
  const toggleTodo = (id: string) => {
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };
  
  // Delete todo
  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };
  
  // Filter todos based on tab and category
  const filteredTodos = todos.filter(todo => {
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "completed" && todo.completed) ||
      (activeTab === "active" && !todo.completed);
    
    const matchesCategory =
      categoryFilter === "all" || todo.category === categoryFilter;
    
    return matchesTab && matchesCategory;
  });
  
  // Get priority style
  const getPriorityStyles = (priority: "low" | "medium" | "high") => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">To-Do List</h1>
        <p className="text-muted-foreground">Manage your tasks and stay organized</p>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Tasks</CardTitle>
              <div className="flex items-center gap-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category === "all" ? "All Categories" : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            
            <CardContent>
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All Tasks</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
                
                <TabsContent value={activeTab}>
                  {filteredTodos.length > 0 ? (
                    <div className="space-y-4">
                      {filteredTodos.map(todo => (
                        <div
                          key={todo.id}
                          className={`p-4 border rounded-lg flex items-start justify-between ${
                            todo.completed ? "bg-muted/30" : ""
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <Checkbox
                              checked={todo.completed}
                              onCheckedChange={() => toggleTodo(todo.id)}
                              id={`todo-${todo.id}`}
                              className="mt-1"
                            />
                            <div>
                              <Label
                                htmlFor={`todo-${todo.id}`}
                                className={`text-base font-medium ${
                                  todo.completed ? "line-through text-muted-foreground" : ""
                                }`}
                              >
                                {todo.text}
                              </Label>
                              
                              <div className="flex flex-wrap gap-2 mt-2">
                                <Badge className={getPriorityStyles(todo.priority)}>
                                  {todo.priority === "high" ? "High Priority" : 
                                   todo.priority === "medium" ? "Medium Priority" : "Low Priority"}
                                </Badge>
                                
                                <Badge variant="outline">{todo.category}</Badge>
                                
                                {todo.dueDate && (
                                  <Badge variant="outline" className="flex items-center gap-1">
                                    <CalendarIcon size={12} />
                                    {new Date(todo.dueDate).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteTodo(todo.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10">
                      <ListTodo className="h-10 w-10 text-muted-foreground mb-2" />
                      <h3 className="text-lg font-medium">No tasks found</h3>
                      <p className="text-muted-foreground text-center mt-1">
                        {activeTab === "all"
                          ? "You haven't created any tasks yet."
                          : activeTab === "active"
                          ? "You don't have any active tasks."
                          : "You don't have any completed tasks."}
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add New Task</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={addTodo} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-todo">Task Description</Label>
                  <Input
                    id="new-todo"
                    placeholder="What needs to be done?"
                    value={newTodoText}
                    onChange={(e) => setNewTodoText(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="todo-category">Category</Label>
                  <Select
                    value={newTodoCategory}
                    onValueChange={setNewTodoCategory}
                  >
                    <SelectTrigger id="todo-category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Work">Work</SelectItem>
                      <SelectItem value="Research">Research</SelectItem>
                      <SelectItem value="Meeting">Meeting</SelectItem>
                      <SelectItem value="Personal">Personal</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="todo-priority">Priority</Label>
                  <Select
                    value={newTodoPriority}
                    onValueChange={(value: "low" | "medium" | "high") => setNewTodoPriority(value)}
                  >
                    <SelectTrigger id="todo-priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="due-date">Due Date (optional)</Label>
                  <Input
                    id="due-date"
                    type="date"
                    value={newTodoDueDate}
                    onChange={(e) => setNewTodoDueDate(e.target.value)}
                  />
                </div>
                
                <Button type="submit" className="w-full btn-gradient">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Task
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Task Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                    <span>Completed</span>
                  </div>
                  <Badge variant="outline">
                    {todos.filter(todo => todo.completed).length}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                    <span>Pending</span>
                  </div>
                  <Badge variant="outline">
                    {todos.filter(todo => !todo.completed).length}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    <span>High Priority</span>
                  </div>
                  <Badge variant="outline">
                    {todos.filter(todo => todo.priority === "high" && !todo.completed).length}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Timer className="h-5 w-5 text-orange-500 mr-2" />
                    <span>Due Soon</span>
                  </div>
                  <Badge variant="outline">
                    {todos.filter(todo => {
                      if (!todo.dueDate || todo.completed) return false;
                      const dueDate = new Date(todo.dueDate);
                      const today = new Date();
                      const diffTime = dueDate.getTime() - today.getTime();
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      return diffDays <= 2 && diffDays >= 0;
                    }).length}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TodoList;
