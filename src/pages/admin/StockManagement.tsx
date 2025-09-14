import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, AlertTriangle, Package, Search, Filter, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface StockItem {
  id: string;
  type: string;
  category: string;
  thickness_length?: string | null;
  quantity: number;
  min_threshold: number;
  unit: string;
  price: number | null;
  created_at: string;
}

const StockManagement = () => {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchStockItems();
  }, [currentPage, itemsPerPage, searchTerm, selectedCategory, sortBy]);

  const fetchStockItems = async () => {
    try {
      setLoading(true);
      
      // Build the query
      let query = supabase
        .from('stock_items')
        .select('*', { count: 'exact' });
      
      // Apply search filter
      if (searchTerm) {
        query = query.or(`type.ilike.%${searchTerm}%,thickness_length.ilike.%${searchTerm}%`);
      }
      
      // Apply category filter
      if (selectedCategory !== "all") {
        query = query.eq('category', selectedCategory);
      }
      
      // Apply sorting
      if (sortBy === "newest") {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === "oldest") {
        query = query.order('created_at', { ascending: true });
      } else if (sortBy === "quantity-low") {
        query = query.order('quantity', { ascending: true });
      } else if (sortBy === "quantity-high") {
        query = query.order('quantity', { ascending: false });
      } else if (sortBy === "name") {
        query = query.order('type', { ascending: true });
      } else if (sortBy === "price") {
        query = query.order('price', { ascending: false });
      }
      
      // Apply pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      setStockItems(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching stock items:', error);
      toast({ title: "Error", description: "Failed to fetch stock items", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSortBy("newest");
    setCurrentPage(1);
  };

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const { toast } = useToast();

  const [newItem, setNewItem] = useState({
    type: "",
    category: "glass",
    thickness_length: "",
    quantity: 0,
    min_threshold: 0,
    unit: "sq ft",
    price: 0,
  });

  const [editItem, setEditItem] = useState({
    type: "",
    category: "glass",
    thickness_length: "",
    quantity: 0,
    min_threshold: 0,
    unit: "sq ft",
    price: 0,
  });

  const glassStock = stockItems.filter(item => item.category === 'glass');
  const aluminumStock = stockItems.filter(item => item.category === 'aluminum');

  const handleAddStock = async () => {
    try {
      const { data, error } = await supabase
        .from('stock_items')
        .insert([newItem])
        .select()
        .single();

      if (error) throw error;

      setStockItems(prev => [data, ...prev]);
      
      toast({
        title: "Stock Added",
        description: `${newItem.type} has been added to inventory`,
      });

      setNewItem({
        type: "",
        category: "glass",
        thickness_length: "",
        quantity: 0,
        min_threshold: 0,
        unit: "sq ft",
        price: 0,
      });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error adding stock item:', error);
      toast({ 
        title: "Error", 
        description: "Failed to add stock item", 
        variant: "destructive" 
      });
    }
  };

  const handleEditStock = async () => {
    if (!editingItem) return;
    
    try {
      const { error } = await supabase
        .from('stock_items')
        .update(editItem)
        .eq('id', editingItem.id);

      if (error) throw error;

      setStockItems(prev => prev.map(item => 
        item.id === editingItem.id ? { ...item, ...editItem } : item
      ));

      toast({
        title: "Stock Updated",
        description: `${editItem.type} has been updated successfully`,
      });

      setEditingItem(null);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating stock item:', error);
      toast({ 
        title: "Error", 
        description: "Failed to update stock item", 
        variant: "destructive" 
      });
    }
  };

  const handleDeleteStock = async () => {
    if (!deleteItemId) return;
    
    try {
      const { error } = await supabase
        .from('stock_items')
        .delete()
        .eq('id', deleteItemId);

      if (error) throw error;

      setStockItems(prev => prev.filter(item => item.id !== deleteItemId));
      
      toast({
        title: "Stock Deleted",
        description: "Stock item has been removed successfully",
      });

      setDeleteItemId(null);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting stock item:', error);
      toast({ 
        title: "Error", 
        description: "Failed to delete stock item", 
        variant: "destructive" 
      });
    }
  };

  const updateQuantity = async (id: string, newQuantity: number) => {
    try {
      const { error } = await supabase
        .from('stock_items')
        .update({ quantity: newQuantity })
        .eq('id', id);

      if (error) throw error;

      setStockItems(stockItems.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));

      toast({
        title: "Stock Updated",
        description: "Quantity has been updated successfully",
      });
    } catch (error) {
      console.error('Error updating stock item:', error);
      toast({ 
        title: "Error", 
        description: "Failed to update stock item", 
        variant: "destructive" 
      });
    }
  };

  const openEditDialog = (item: StockItem) => {
    setEditingItem(item);
    setEditItem({
      type: item.type,
      category: item.category,
      thickness_length: item.thickness_length || "",
      quantity: item.quantity,
      min_threshold: item.min_threshold,
      unit: item.unit,
      price: item.price || 0,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (id: string) => {
    setDeleteItemId(id);
    setIsDeleteDialogOpen(true);
  };

  // Calculate pagination values
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalCount);

  const StockTable = ({ items, category }: { items: StockItem[], category: string }) => {
    if (loading) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              {category} Stock
            </CardTitle>
            <CardDescription>Manage your {category.toLowerCase()} inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-md animate-pulse">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            {category} Stock ({items.length} items)
          </CardTitle>
          <CardDescription>Manage your {category.toLowerCase()} inventory</CardDescription>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No {category.toLowerCase()} stock items found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    {category === "Glass" && <TableHead>Thickness</TableHead>}
                    {category === "Aluminum" && <TableHead>Length</TableHead>}
                    <TableHead>Quantity</TableHead>
                    <TableHead>Min. Threshold</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Price/Unit</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => {
                    const isLowStock = item.quantity <= item.min_threshold;
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.type}</TableCell>
                        {category === "Glass" && <TableCell>{item.thickness_length}</TableCell>}
                        {category === "Aluminum" && <TableCell>{item.thickness_length || "-"}</TableCell>}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                              className="w-20"
                            />
                            <span className="text-sm text-muted-foreground">{item.unit}</span>
                          </div>
                        </TableCell>
                        <TableCell>{item.min_threshold} {item.unit}</TableCell>
                        <TableCell>
                          <Badge variant={isLowStock ? "destructive" : "secondary"}>
                            {isLowStock ? (
                              <>
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Low Stock
                              </>
                            ) : (
                              "In Stock"
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>₱{item.price?.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => openDeleteDialog(item.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Glass & Aluminum Stock Management</h1>
          <p className="text-muted-foreground">Monitor and manage your inventory levels</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Stock Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Stock Item</DialogTitle>
              <DialogDescription>Add a new item to your inventory</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={newItem.category} 
                    onValueChange={(value: "glass" | "aluminum") => setNewItem({...newItem, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="glass">Glass</SelectItem>
                      <SelectItem value="aluminum">Aluminum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Input
                    id="type"
                    value={newItem.type}
                    onChange={(e) => setNewItem({...newItem, type: e.target.value})}
                    placeholder="e.g., Clear Glass"
                  />
                </div>
              </div>
              
              {newItem.category === "glass" && (
                <div className="space-y-2">
                  <Label htmlFor="thickness_length">Thickness</Label>
                  <Input
                    id="thickness_length"
                    value={newItem.thickness_length}
                    onChange={(e) => setNewItem({...newItem, thickness_length: e.target.value})}
                    placeholder="e.g., 5mm"
                  />
                </div>
              )}
              
              {newItem.category === "aluminum" && (
                <div className="space-y-2">
                  <Label htmlFor="thickness_length">Length (optional)</Label>
                  <Input
                    id="thickness_length"
                    value={newItem.thickness_length}
                    onChange={(e) => setNewItem({...newItem, thickness_length: e.target.value})}
                    placeholder="e.g., 6ft"
                  />
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min_threshold">Minimum Threshold</Label>
                  <Input
                    id="min_threshold"
                    type="number"
                    value={newItem.min_threshold}
                    onChange={(e) => setNewItem({...newItem, min_threshold: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Select 
                    value={newItem.unit} 
                    onValueChange={(value) => setNewItem({...newItem, unit: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sq ft">sq ft</SelectItem>
                      <SelectItem value="pieces">pieces</SelectItem>
                      <SelectItem value="meters">meters</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price per Unit (₱)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newItem.price}
                    onChange={(e) => setNewItem({...newItem, price: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>
              
              <Button onClick={handleAddStock} className="w-full">
                Add to Stock
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Stock Items</CardTitle>
          <CardDescription>
            Search and filter stock items by type or specifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search stock items by type or specifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12"
              />
            </div>
            
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <div className="flex items-center">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="glass">Glass</SelectItem>
                  <SelectItem value="aluminum">Aluminum</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="quantity-low">Quantity: Low to High</SelectItem>
                  <SelectItem value="quantity-high">Quantity: High to Low</SelectItem>
                  <SelectItem value="name">Name: A to Z</SelectItem>
                  <SelectItem value="price">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
              
              {(searchTerm || selectedCategory !== "all" || sortBy !== "newest") && (
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock Items</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Glass Items</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{glassStock.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aluminum Items</CardTitle>
            <Package className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aluminumStock.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-8">
        <StockTable items={glassStock} category="Glass" />
        <StockTable items={aluminumStock} category="Aluminum" />
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {startItem} to {endItem} of {totalCount} stock items
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
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Stock Item</DialogTitle>
            <DialogDescription>Update the stock item details</DialogDescription>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select 
                    value={editItem.category} 
                    onValueChange={(value: "glass" | "aluminum") => setEditItem({...editItem, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="glass">Glass</SelectItem>
                      <SelectItem value="aluminum">Aluminum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-type">Type</Label>
                  <Input
                    id="edit-type"
                    value={editItem.type}
                    onChange={(e) => setEditItem({...editItem, type: e.target.value})}
                    placeholder="e.g., Clear Glass"
                  />
                </div>
              </div>
              
              {editItem.category === "glass" && (
                <div className="space-y-2">
                  <Label htmlFor="edit-thickness_length">Thickness</Label>
                  <Input
                    id="edit-thickness_length"
                    value={editItem.thickness_length}
                    onChange={(e) => setEditItem({...editItem, thickness_length: e.target.value})}
                    placeholder="e.g., 5mm"
                  />
                </div>
              )}
              
              {editItem.category === "aluminum" && (
                <div className="space-y-2">
                  <Label htmlFor="edit-thickness_length">Length (optional)</Label>
                  <Input
                    id="edit-thickness_length"
                    value={editItem.thickness_length}
                    onChange={(e) => setEditItem({...editItem, thickness_length: e.target.value})}
                    placeholder="e.g., 6ft"
                  />
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-quantity">Quantity</Label>
                  <Input
                    id="edit-quantity"
                    type="number"
                    value={editItem.quantity}
                    onChange={(e) => setEditItem({...editItem, quantity: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-min_threshold">Minimum Threshold</Label>
                  <Input
                    id="edit-min_threshold"
                    type="number"
                    value={editItem.min_threshold}
                    onChange={(e) => setEditItem({...editItem, min_threshold: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-unit">Unit</Label>
                  <Select 
                    value={editItem.unit} 
                    onValueChange={(value) => setEditItem({...editItem, unit: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sq ft">sq ft</SelectItem>
                      <SelectItem value="pieces">pieces</SelectItem>
                      <SelectItem value="meters">meters</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Price per Unit (₱)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={editItem.price}
                    onChange={(e) => setEditItem({...editItem, price: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>
              
              <Button onClick={handleEditStock} className="w-full">
                Update Stock Item
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the stock item
              and remove it from our servers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteStock}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockManagement;