import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
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
import { Plus, Search, MoreHorizontal, Edit, Trash2, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useToast } from "@/hooks/use-toast";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Sale {
  id: string;
  client_id?: string;
  amount: number;
  description?: string;
  sale_date: string;
  status: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
  clients?: {
    name: string;
  };
}

interface Client {
  id: string;
  name: string;
}

const SalesPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();
  const [sales, setSales] = useState<Sale[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [formData, setFormData] = useState({
    client_id: "",
    amount: "",
    description: "",
    sale_date: new Date().toISOString().split('T')[0],
    status: "completed",
    payment_method: ""
  });
  
  // State for sales graphs
  const [monthlySalesData, setMonthlySalesData] = useState({
    labels: [] as string[],
    data: [] as number[]
  });
  const [salesByTypeData, setSalesByTypeData] = useState({
    labels: [] as string[],
    data: [] as number[]
  });
  const [isGraphsLoading, setIsGraphsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSales();
      fetchClients();
      fetchSalesGraphData();
    }
  }, [user]);
  
  // Fetch sales data for graphs
  const fetchSalesGraphData = async () => {
    setIsGraphsLoading(true);
    try {
      // Get the last 6 months for monthly sales
      const monthlyLabels = [];
      const monthlyData = [];
      
      for (let i = 5; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const monthName = format(date, 'MMM yyyy');
        const startDate = startOfMonth(date);
        const endDate = endOfMonth(date);
        
        // Query supabase for sales data in this month range
        const { data, error } = await supabase
          .from("sales")
          .select("amount")
          .eq("user_id", user?.id)
          .gte("sale_date", startDate.toISOString().split('T')[0])
          .lte("sale_date", endDate.toISOString().split('T')[0]);
          
        if (error) throw error;
        
        // Calculate total sales for this month
        const monthTotal = data.reduce((sum, sale) => sum + sale.amount, 0);
        monthlyLabels.push(monthName);
        monthlyData.push(monthTotal);
      }
      
      setMonthlySalesData({
        labels: monthlyLabels,
        data: monthlyData
      });
      
      // Get sales by payment method breakdown
      const { data: typeData, error: typeError } = await supabase
        .from("sales")
        .select("payment_method, amount")
        .eq("user_id", user?.id);
        
      if (typeError) throw typeError;
      
      // Group by payment method and calculate totals
      const typeMap = new Map();
      typeData.forEach(item => {
        const method = item.payment_method || 'Other';
        const currentTotal = typeMap.get(method) || 0;
        typeMap.set(method, currentTotal + item.amount);
      });
      
      const typeLabels = [...typeMap.keys()].map(key => 
        key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')
      );
      const typeValues = [...typeMap.values()];
      
      setSalesByTypeData({
        labels: typeLabels,
        data: typeValues
      });
      
      setIsGraphsLoading(false);
    } catch (error) {
      console.error("Error fetching sales graph data:", error);
      toast({
        title: "Error",
        description: "Failed to load sales graph data",
        variant: "destructive"
      });
      setIsGraphsLoading(false);
    }
  };

  const fetchSales = async () => {
    try {
      const { data, error } = await supabase
        .from("sales")
        .select(`
          *,
          clients (
            name
          )
        `)
        .eq("user_id", user?.id)
        .order("sale_date", { ascending: false });

      if (error) throw error;
      setSales(data || []);
    } catch (error) {
      console.error("Error fetching sales:", error);
      toast({
        title: "Error",
        description: "Failed to fetch sales",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("id, name")
        .eq("user_id", user?.id)
        .eq("status", "active");

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast({
        title: "Error",
        description: "Amount must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingSale) {
        const { error } = await supabase
          .from("sales")
          .update({
            client_id: formData.client_id || null,
            amount: parseFloat(formData.amount),
            description: formData.description,
            sale_date: formData.sale_date,
            status: formData.status,
            payment_method: formData.payment_method,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingSale.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Sale updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("sales")
          .insert([{
            user_id: user?.id,
            client_id: formData.client_id || null,
            amount: parseFloat(formData.amount),
            description: formData.description,
            sale_date: formData.sale_date,
            status: formData.status,
            payment_method: formData.payment_method,
          }]);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Sale created successfully",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchSales();
    } catch (error) {
      console.error("Error saving sale:", error);
      toast({
        title: "Error",
        description: "Failed to save sale",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (sale: Sale) => {
    setEditingSale(sale);
    setFormData({
      client_id: sale.client_id || "",
      amount: sale.amount.toString(),
      description: sale.description || "",
      sale_date: sale.sale_date,
      status: sale.status,
      payment_method: sale.payment_method || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (saleId: string) => {
    if (!confirm("Are you sure you want to delete this sale?")) return;

    try {
      const { error } = await supabase
        .from("sales")
        .delete()
        .eq("id", saleId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Sale deleted successfully",
      });
      
      fetchSales();
    } catch (error) {
      console.error("Error deleting sale:", error);
      toast({
        title: "Error",
        description: "Failed to delete sale",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      client_id: "",
      amount: "",
      description: "",
      sale_date: new Date().toISOString().split('T')[0],
      status: "completed",
      payment_method: ""
    });
    setEditingSale(null);
  };

  const filteredSales = sales.filter(sale => {
    if (!searchTerm) return true;
    
    const query = searchTerm.toLowerCase();
    
    // Search across multiple sale fields
    return (
      sale.description.toLowerCase().includes(query) ||
      (sale.clients?.name.toLowerCase().includes(query)) ||
      sale.status.toLowerCase().includes(query) ||
      // Search by amount (if query is a number)
      ((!isNaN(parseFloat(query)) && sale.amount.toString().includes(query))) ||
      // Search by date (if date is in the format contained in the query)
      (sale.sale_date && sale.sale_date.toLowerCase().includes(query))
    );
  });

  const totalSales = sales.reduce((sum, sale) => sum + sale.amount, 0);
  const monthlyTarget = 50000; // This could come from settings
  const monthlyProgress = (totalSales / monthlyTarget) * 100;

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sales</h1>
          <p className="text-muted-foreground">Track your sales performance</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Sale
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingSale ? "Edit Sale" : "Add New Sale"}
              </DialogTitle>
              <DialogDescription>
                {editingSale ? "Update sale information" : "Record a new sale"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="client_id">Client</Label>
                <Select value={formData.client_id} onValueChange={(value) => setFormData({ ...formData, client_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
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
                <Label htmlFor="sale_date">Sale Date</Label>
                <Input
                  id="sale_date"
                  type="date"
                  value={formData.sale_date}
                  onChange={(e) => setFormData({ ...formData, sale_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="payment_method">Payment Method</Label>
                <Select value={formData.payment_method} onValueChange={(value) => setFormData({ ...formData, payment_method: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingSale ? "Update" : "Create"} Sale
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
            placeholder="Search sales..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSales)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sales.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Sale</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sales.length > 0 ? formatCurrency(totalSales / sales.length) : formatCurrency(0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Target</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyProgress.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Production Graphs */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Production Graph */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Sales</CardTitle>
            <p className="text-sm text-muted-foreground">Revenue trends over the last 6 months</p>
          </CardHeader>
          <CardContent className="h-80">
            {isGraphsLoading ? (
              <div className="flex items-center justify-center h-full">
                <p>Loading production data...</p>
              </div>
            ) : (
              <Line
                data={{
                  labels: monthlySalesData.labels,
                  datasets: [
                    {
                      label: 'Sales Value',
                      data: monthlySalesData.data,
                      borderColor: 'rgb(53, 162, 235)',
                      backgroundColor: 'rgba(53, 162, 235, 0.5)',
                      tension: 0.3,
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
                        callback: (value) => formatCurrency(Number(value))
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`
                      }
                    }
                  },
                }}
              />
            )}
          </CardContent>
        </Card>
        
        {/* Production by Type Graph */}
        <Card>
          <CardHeader>
            <CardTitle>Sales by Payment Method</CardTitle>
            <p className="text-sm text-muted-foreground">Breakdown of sales by payment type</p>
          </CardHeader>
          <CardContent className="h-80">
            {isGraphsLoading ? (
              <div className="flex items-center justify-center h-full">
                <p>Loading production data...</p>
              </div>
            ) : (
              <Bar
                data={{
                  labels: salesByTypeData.labels,
                  datasets: [
                    {
                      label: 'Sales Value',
                      data: salesByTypeData.data,
                      backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)',
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
                        callback: (value) => formatCurrency(Number(value))
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => `${context.label}: ${formatCurrency(context.parsed.y)}`
                      }
                    }
                  },
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>{format(new Date(sale.sale_date), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{sale.clients?.name || 'Unknown'}</TableCell>
                  <TableCell>{sale.description}</TableCell>
                  <TableCell>{formatCurrency(sale.amount)}</TableCell>
                  <TableCell>{sale.payment_method || "-"}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        sale.status === "completed" ? "default" :
                        sale.status === "pending" ? "secondary" : "destructive"
                      }
                    >
                      {sale.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(sale)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(sale.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredSales.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No sales found. Record your first sale to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesPage;
