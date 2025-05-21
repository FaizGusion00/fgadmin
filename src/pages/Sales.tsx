
import { useState, useEffect } from 'react';
import { 
  Card, CardContent, CardDescription, CardFooter, 
  CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Edit, Trash2, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

// Define sale schema
const saleSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  client_id: z.string().optional(),
  description: z.string().optional().or(z.literal("")),
  sale_date: z.date(),
  payment_method: z.string().optional().or(z.literal("")),
  status: z.string().default("completed"),
});

type SaleFormValues = z.infer<typeof saleSchema>;

interface Sale {
  id: string;
  amount: number;
  client_id: string | null;
  client_name?: string;
  description: string | null;
  sale_date: string;
  payment_method: string | null;
  status: string | null;
  created_at: string;
}

interface Client {
  id: string;
  name: string;
}

export default function SalesPage() {
  const { user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>(null);

  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      amount: 0,
      client_id: undefined,
      description: "",
      sale_date: new Date(),
      payment_method: "",
      status: "completed",
    },
  });

  // Fetch sales and clients
  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Fetch clients first for reference
        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select('id, name')
          .order('name');
          
        if (clientsError) throw clientsError;
        
        setClients(clientsData || []);
        
        // Fetch sales
        const { data: salesData, error: salesError } = await supabase
          .from('sales')
          .select('*')
          .order('sale_date', { ascending: false });
          
        if (salesError) throw salesError;
        
        // Enhance sales data with client names
        const enhancedSales = (salesData || []).map((sale: Sale) => {
          const client = clientsData?.find(c => c.id === sale.client_id);
          return {
            ...sale,
            client_name: client?.name || 'Unknown Client'
          };
        });
        
        setSales(enhancedSales);
      } catch (error: any) {
        toast.error(`Failed to load data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  // Reset form when closing dialog
  useEffect(() => {
    if (!openDialog) {
      form.reset();
      setEditingSale(null);
    }
  }, [openDialog, form]);

  // Set form values when editing a sale
  useEffect(() => {
    if (editingSale) {
      form.reset({
        amount: editingSale.amount,
        client_id: editingSale.client_id || undefined,
        description: editingSale.description || "",
        sale_date: new Date(editingSale.sale_date),
        payment_method: editingSale.payment_method || "",
        status: editingSale.status || "completed",
      });
      setOpenDialog(true);
    }
  }, [editingSale, form]);

  const handleSubmit = async (values: SaleFormValues) => {
    if (!user) return;
    
    try {
      if (editingSale) {
        // Update sale
        const { error } = await supabase
          .from('sales')
          .update({
            ...values,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingSale.id);
          
        if (error) throw error;
        
        toast.success("Sale updated successfully");
        
        // Update local state with client name
        const client = clients.find(c => c.id === values.client_id);
        const updatedSale = {
          ...editingSale,
          ...values,
          client_name: client?.name || 'Unknown Client',
          sale_date: values.sale_date.toISOString(),
        };
        setSales(sales.map(sale => 
          sale.id === editingSale.id ? updatedSale : sale
        ));
      } else {
        // Create sale
        const { data, error } = await supabase
          .from('sales')
          .insert([{
            ...values,
            user_id: user.id,
          }])
          .select();
          
        if (error) throw error;
        
        toast.success("Sale created successfully");
        
        // Update local state
        if (data) {
          const client = clients.find(c => c.id === values.client_id);
          const newSale = {
            ...data[0],
            client_name: client?.name || 'Unknown Client'
          };
          setSales([newSale, ...sales]);
        }
      }
      
      setOpenDialog(false);
    } catch (error: any) {
      toast.error(`Failed to ${editingSale ? "update" : "create"} sale: ${error.message}`);
    }
  };
  
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success("Sale deleted successfully");
      
      // Update local state
      setSales(sales.filter(sale => sale.id !== id));
      setConfirmDelete(null);
    } catch (error: any) {
      toast.error(`Failed to delete sale: ${error.message}`);
    }
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Get total sales amount
  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.amount, 0);
  
  // Filter sales based on search query and date range
  const filteredSales = sales.filter(sale => {
    const searchLower = searchQuery.toLowerCase();
    const meetsSearchCriteria = 
      (sale.client_name && sale.client_name.toLowerCase().includes(searchLower)) ||
      (sale.description && sale.description.toLowerCase().includes(searchLower)) ||
      (sale.payment_method && sale.payment_method.toLowerCase().includes(searchLower)) ||
      formatCurrency(sale.amount).includes(searchQuery);
      
    // Filter by date range if set
    const meetsDateCriteria = !dateRange || (
      new Date(sale.sale_date) >= dateRange.from && 
      new Date(sale.sale_date) <= dateRange.to
    );
    
    return meetsSearchCriteria && meetsDateCriteria;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sales</h2>
          <p className="text-muted-foreground">Manage your revenue and transactions</p>
        </div>
        <Button 
          onClick={() => { form.reset(); setOpenDialog(true); }}
          className="sm:self-end"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Sale
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSales)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredSales.length} transaction{filteredSales.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Sale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredSales.length ? formatCurrency(totalSales / filteredSales.length) : '$0.00'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Date Range
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>All Time</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange as any}
                  onSelect={(range) => {
                    if (range?.from && range.to) {
                      setDateRange(range as any);
                    } else if (range === undefined) {
                      setDateRange(null);
                    }
                  }}
                />
                <div className="p-3 border-t border-border">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setDateRange(null)}
                  >
                    Clear
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sales..." 
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select 
          defaultValue="all"
          onValueChange={(value) => setSearchQuery(value === "all" ? "" : value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="canceled">Canceled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    </div>
                    <div className="mt-2">Loading sales...</div>
                  </TableCell>
                </TableRow>
              ) : filteredSales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    {searchQuery || dateRange ? (
                      <div>No sales found matching your search</div>
                    ) : (
                      <div>
                        <p>You don't have any sales yet</p>
                        <Button 
                          variant="link" 
                          onClick={() => setOpenDialog(true)}
                          className="mt-2"
                        >
                          Add your first sale
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>
                      {format(new Date(sale.sale_date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>{sale.client_name}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {sale.description || "-"}
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(sale.amount)}</TableCell>
                    <TableCell>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        sale.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                        sale.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' : 
                        sale.status === 'canceled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 
                        'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                      }`}>
                        {sale.status || 'Unknown'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setEditingSale(sale)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Dialog open={confirmDelete === sale.id} onOpenChange={(open) => !open && setConfirmDelete(null)}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => setConfirmDelete(sale.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Confirm Deletion</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete this sale for {formatCurrency(sale.amount)}? 
                                This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button 
                                variant="outline" 
                                onClick={() => setConfirmDelete(null)}
                              >
                                Cancel
                              </Button>
                              <Button 
                                variant="destructive"
                                onClick={() => handleDelete(sale.id)}
                              >
                                Delete
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Add/Edit Sale Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingSale ? "Edit Sale" : "Add New Sale"}</DialogTitle>
            <DialogDescription>
              {editingSale 
                ? "Update the sale details below" 
                : "Fill in the sale details to add it to your system"
              }
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount*</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                          <Input 
                            type="number"
                            step="0.01" 
                            placeholder="0.00" 
                            className="pl-8"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="client_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select client" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients.map(client => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="sale_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date*</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full pl-3 text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="canceled">Canceled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="payment_method"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Payment Method</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="credit_card">Credit Card</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="paypal">PayPal</SelectItem>
                          <SelectItem value="check">Check</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief description of the sale" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && (
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                  )}
                  {editingSale ? "Update Sale" : "Add Sale"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
