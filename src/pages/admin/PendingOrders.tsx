import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Eye, Phone, CheckCircle, Trash2, Clock, User, Package, MapPin, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface Order {
  id: string;
  customer_name: string;
  contact_number: string;
  glass_type: string;
  thickness: string;
  shape: string;
  custom_shape?: string | null;
  service_mode: string;
  estimated_price: number | null;
  created_at: string;
  updated_at: string;
  notes?: string | null;
  status: string;
}

interface StockItem {
  id: string;
  type: string;
  category: string;
  thickness_length?: string | null;
  quantity: number;
  min_threshold: number;
  unit: string;
  price: number | null;
}

const PendingOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [orderToComplete, setOrderToComplete] = useState<Order | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      // Build the query
      let query = supabase
        .from('quotations')
        .select('*', { count: 'exact' });
      
      // Apply search filter
      if (searchTerm) {
        query = query.or(`customer_name.ilike.%${searchTerm}%,contact_number.ilike.%${searchTerm}%,glass_type.ilike.%${searchTerm}%`);
      }
      
      // Apply status filter
      if (statusFilter !== "all") {
        query = query.eq('status', statusFilter);
      }
      
      // Apply sorting
      query = query.order('created_at', { ascending: false });
      
      // Apply pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      setOrders(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, statusFilter, currentPage, itemsPerPage, toast]);

  const fetchStockItems = async () => {
    try {
      const { data, error } = await supabase
        .from('stock_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStockItems(data || []);
    } catch (error) {
      console.error('Error fetching stock items:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchStockItems();
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('quotations')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;

      // Update the orders state to reflect the change immediately
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus, updated_at: new Date().toISOString() } : order
        )
      );
      
      // If the selected order is the one being updated, update it as well
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus, updated_at: new Date().toISOString() });
      }
      
      toast({
        title: "Order Updated",
        description: `Order has been marked as ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: "Error",
        description: "Failed to update order",
        variant: "destructive",
      });
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('quotations')
        .delete()
        .eq('id', orderId);

      if (error) throw error;

      setOrders(orders.filter(order => order.id !== orderId));
      toast({
        title: "Order Deleted",
        description: "Order has been removed",
      });
    } catch (error) {
      console.error('Error deleting order:', error);
      toast({
        title: "Error",
        description: "Failed to delete order",
        variant: "destructive",
      });
    }
  };

  const handleMarkComplete = async () => {
    if (!orderToComplete) return;
    
    try {
      // Check if we need to update stock
      const stockItem = stockItems.find(item => 
        item.type === orderToComplete.glass_type && 
        item.category === "glass"
      );
      
      if (stockItem) {
        // Calculate new quantity (reduce by 1)
        const newQuantity = stockItem.quantity - 1;
        
        // Update stock item
        const { error: stockError } = await supabase
          .from('stock_items')
          .update({ quantity: newQuantity })
          .eq('id', stockItem.id);
          
        if (stockError) throw stockError;
        
        // Refresh stock items
        fetchStockItems();
      }
      
      // Update order status
      await updateOrderStatus(orderToComplete.id, "completed");
      setOrderToComplete(null);
    } catch (error) {
      console.error('Error completing order:', error);
      toast({
        title: "Error",
        description: "Failed to complete order",
        variant: "destructive",
      });
    }
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    await deleteOrder(orderToDelete.id);
    setOrderToDelete(null);
  };

  const filteredOrders = orders; // Already filtered via query

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "contacted":
        return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30"><Phone className="w-3 h-3 mr-1" />Contacted</Badge>;
      case "completed":
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStockInfo = (glassType: string) => {
    return stockItems.find(item => 
      item.type === glassType && 
      item.category === "glass"
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  // Calculate pagination values
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalCount);

  const OrderDetailDialog = ({ order, onStatusChange }: { order: Order | null, onStatusChange: (orderId: string, newStatus: string) => void }) => {
    if (!order) return null;

    const stockInfo = getStockInfo(order.glass_type);

    const handleStatusChange = async (newStatus: string) => {
      await onStatusChange(order.id, newStatus);
    };

    return (
      <DialogContent className="glass-card max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Order Details - {order.id.substring(0, 8)}
          </DialogTitle>
          <DialogDescription>Complete order information and status</DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Customer Information
              </h4>
              <div className="space-y-2 pl-6">
                <p><span className="font-medium">Name:</span> {order.customer_name}</p>
                <p><span className="font-medium">Contact:</span> {order.contact_number}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Product Details
              </h4>
              <div className="space-y-2 pl-6">
                <p><span className="font-medium">Glass Type:</span> {order.glass_type}</p>
                <p><span className="font-medium">Thickness:</span> {order.thickness}</p>
                <p><span className="font-medium">Shape:</span> {order.shape}</p>
                {order.custom_shape && (
                  <p><span className="font-medium">Custom Shape:</span> {order.custom_shape}</p>
                )}
                {stockInfo && (
                  <p>
                    <span className="font-medium">Current Stock:</span> {stockInfo.quantity} {stockInfo.unit}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Service Details
              </h4>
              <div className="space-y-2 pl-6">
                <p><span className="font-medium">Service Mode:</span> {order.service_mode}</p>
                <p><span className="font-medium">Estimated Price:</span> ₱{order.estimated_price?.toLocaleString() || 'TBD'}</p>
                <p><span className="font-medium">Date Submitted:</span> {new Date(order.created_at).toLocaleDateString()}</p>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Status:</span> 
                  {getStatusBadge(order.status)}
                </div>
              </div>
            </div>
            
            {order.notes && (
              <div>
                <h4 className="font-semibold text-primary mb-2">Notes</h4>
                <p className="text-sm bg-muted p-3 rounded-md">{order.notes}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <h4 className="font-semibold text-primary">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={order.status}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Change Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open(`tel:${order.contact_number}`, '_self')}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </Button>
                <Button 
                  className="w-full col-span-2"
                  onClick={() => setOrderToComplete(order)}
                  disabled={order.status === "completed"}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Completed
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    );
  };

  // Skeleton Loader Component
  const OrderSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4 p-3 border-b">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Pending Orders</h1>
          <p className="text-muted-foreground">Manage customer quotation requests</p>
        </div>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Order Queue</CardTitle>
              <CardDescription>
                {isLoading ? "Loading..." : `${totalCount} ${statusFilter === "all" ? "total" : statusFilter} orders`}
              </CardDescription>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 w-full md:w-64"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              
              {(searchTerm || statusFilter !== "all") && (
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="gap-2"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <OrderSkeleton />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Order ID</th>
                      <th className="text-left p-3">Customer</th>
                      <th className="text-left p-3">Product</th>
                      <th className="text-left p-3">Service Mode</th>
                      <th className="text-left p-3">Price</th>
                      <th className="text-left p-3">Date</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => {
                      const stockInfo = getStockInfo(order.glass_type);
                      return (
                        <tr key={order.id} className="border-b hover:bg-muted/50">
                          <td className="p-3 font-medium">{order.id.substring(0, 8)}</td>
                          <td className="p-3">
                            <div>
                              <p className="font-medium">{order.customer_name}</p>
                              <p className="text-sm text-muted-foreground">{order.contact_number}</p>
                            </div>
                          </td>
                          <td className="p-3">
                            <div>
                              <p className="font-medium">{order.glass_type}</p>
                              <p className="text-sm text-muted-foreground">
                                {order.thickness} • {order.shape}
                                {order.custom_shape && ` (${order.custom_shape})`}
                              </p>
                              {stockInfo && (
                                <p className="text-xs text-blue-500 mt-1">
                                  Stock: {stockInfo.quantity} {stockInfo.unit}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="p-3">{order.service_mode}</td>
                          <td className="p-3 font-medium">₱{order.estimated_price?.toLocaleString() || 'TBD'}</td>
                          <td className="p-3">{new Date(order.created_at).toLocaleDateString()}</td>
                          <td className="p-3">{getStatusBadge(order.status)}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => setSelectedOrder(order)}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <OrderDetailDialog 
                                  order={selectedOrder} 
                                  onStatusChange={updateOrderStatus}
                                />
                              </Dialog>
                              
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => window.open(`tel:${order.contact_number}`, '_self')}
                              >
                                <Phone className="w-4 h-4" />
                              </Button>
                              
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setOrderToComplete(order)}
                                disabled={order.status === "completed"}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setOrderToDelete(order)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {filteredOrders.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm || statusFilter !== "all" 
                    ? "No orders found for the selected filter." 
                    : "No orders found."}
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    Showing {startItem} to {endItem} of {totalCount} orders
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-sm font-medium">
                      Page {currentPage} of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Complete Order Confirmation Dialog */}
      <AlertDialog open={!!orderToComplete} onOpenChange={(open) => {
        if (!open) setOrderToComplete(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark Order as Completed?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the order from {orderToComplete?.customer_name} as completed.
              {getStockInfo(orderToComplete?.glass_type || "") && (
                <span className="block mt-2 font-medium text-amber-600">
                  Note: This will reduce the stock count for {orderToComplete?.glass_type} by 1.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkComplete}>
              Mark as Completed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Order Confirmation Dialog */}
      <AlertDialog open={!!orderToDelete} onOpenChange={(open) => {
        if (!open) setOrderToDelete(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the order
              from {orderToDelete?.customer_name} and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteOrder}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PendingOrders;