import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Wrench, Truck, MapPin, Search, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface Service {
  id: string;
  name: string;
  description: string;
  price?: number | null;
  delivery_available: boolean;
  category: string | null;
  created_at: string;
}

const ServiceForm = ({ 
  onSubmit, 
  initialData,
  isEditing = false,
  categories
}: { 
  onSubmit: (data: any) => void;
  initialData?: any;
  isEditing?: boolean;
  categories: string[];
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price || "",
    delivery_available: initialData?.delivery_available || false,
    category: initialData?.category || "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, delivery_available: checked }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Service Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price (₱) - Optional</Label>
          <Input
            id="price"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleInputChange}
            placeholder="Leave empty for quote-based pricing"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={handleSelectChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Installation">Installation</SelectItem>
              <SelectItem value="Fabrication">Fabrication</SelectItem>
              <SelectItem value="Replacement">Replacement</SelectItem>
              <SelectItem value="Repair">Repair</SelectItem>
              <SelectItem value="Maintenance">Maintenance</SelectItem>
              <SelectItem value="Custom">Custom</SelectItem>
              {categories
                .filter(cat => !["Installation", "Fabrication", "Replacement", "Repair", "Maintenance", "Custom"].includes(cat))
                .map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))
              }
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="delivery"
          checked={formData.delivery_available}
          onCheckedChange={handleSwitchChange}
        />
        <Label htmlFor="delivery">Delivery Available</Label>
      </div>
      
      <Button type="submit" className="w-full">
        {isEditing ? "Update Service" : "Add Service"}
      </Button>
    </form>
  );
};

const ServiceManagement = () => {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [categories, setCategories] = useState<string[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deleteServiceId, setDeleteServiceId] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      
      // Build the query
      let query = supabase
        .from('services')
        .select('*', { count: 'exact' });
      
      // Apply search filter
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`);
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
      } else if (sortBy === "name") {
        query = query.order('name', { ascending: true });
      } else if (sortBy === "price-low") {
        query = query.order('price', { ascending: true, nullsFirst: false });
      } else if (sortBy === "price-high") {
        query = query.order('price', { ascending: false, nullsFirst: false });
      }
      
      // Apply pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      setServices(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({ title: "Error", description: "Failed to fetch services", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, sortBy, currentPage, itemsPerPage, toast]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('category')
        .not('category', 'is', null);
      
      if (error) throw error;
      
      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(data?.map(service => service.category).filter(Boolean) as string[])
      );
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, [fetchServices]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSortBy("newest");
    setCurrentPage(1);
  };

  const handleSubmit = async (formData: {
    name: string;
    description: string;
    price: string;
    delivery_available: boolean;
    category: string;
  }) => {
    try {
      if (editingService) {
        const { error } = await supabase
          .from('services')
          .update({
            name: formData.name,
            description: formData.description,
            price: formData.price ? parseFloat(formData.price) : null,
            delivery_available: formData.delivery_available,
            category: formData.category,
          })
          .eq('id', editingService.id);

        if (error) throw error;
        toast({ title: "Service Updated", description: "Service has been updated successfully" });
        setEditingService(null);
      } else {
        const { error } = await supabase
          .from('services')
          .insert({
            name: formData.name,
            description: formData.description,
            price: formData.price ? parseFloat(formData.price) : null,
            delivery_available: formData.delivery_available,
            category: formData.category,
          });

        if (error) throw error;
        toast({ title: "Service Added", description: "New service has been added successfully" });
        setIsAddDialogOpen(false);
      }
      
      fetchServices();
      fetchCategories();
    } catch (error) {
      console.error('Error saving service:', error);
      toast({ title: "Error", description: "Failed to save service", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Service Deleted", description: "Service has been removed successfully" });
      setDeleteServiceId(null);
      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({ title: "Error", description: "Failed to delete service", variant: "destructive" });
    }
  };

  const serviceCategories = [...new Set(services.map(service => service.category).filter(Boolean))];

  // Calculate pagination values
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalCount);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-glass-primary">Service Management</h1>
          <p className="text-glass-muted-foreground">Manage your installation and fabrication services</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Service</DialogTitle>
              <DialogDescription>
                Fill in the service details below
              </DialogDescription>
            </DialogHeader>
            <ServiceForm 
              onSubmit={handleSubmit} 
              categories={categories}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Services Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
            <Wrench className="h-4 w-4 text-glass-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Delivery</CardTitle>
            <Truck className="h-4 w-4 text-glass-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {services.filter(service => service.delivery_available).length}
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Site Only</CardTitle>
            <MapPin className="h-4 w-4 text-glass-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {services.filter(service => !service.delivery_available).length}
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Wrench className="h-4 w-4 text-glass-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{serviceCategories.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Section */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Filter Services</CardTitle>
          <CardDescription>
            Search and filter services by name, description, or category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search services by name, description or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12"
              />
            </div>
            
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="name">Name: A to Z</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
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

      {/* Services Table */}
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Services</CardTitle>
            <CardDescription>
              Manage your installation and fabrication services
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="items-per-page" className="text-sm">Items per page</Label>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-20">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            // Skeleton loader
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-md animate-pulse">
                  <div className="w-10 h-10 bg-gray-200 rounded-md"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service Name</TableHead>
                      <TableHead className="hidden lg:table-cell">Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Delivery</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell className="font-medium">{service.name}</TableCell>
                        <TableCell className="hidden lg:table-cell max-w-xs truncate">
                          {service.description}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{service.category || 'General'}</Badge>
                        </TableCell>
                        <TableCell>
                          {service.price ? `₱${service.price.toLocaleString()}` : "Quote-based"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={service.delivery_available ? "default" : "secondary"}>
                            {service.delivery_available ? "Available" : "On-site"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingService(service)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteServiceId(service.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {services.length === 0 && (
                <div className="text-center py-8">
                  <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No services found</h3>
                  <p className="text-gray-600 max-w-md mx-auto mb-4">
                    Try adjusting your search or filter criteria to find what you're looking for.
                  </p>
                  <Button onClick={clearFilters}>
                    Clear All Filters
                  </Button>
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    Showing {startItem} to {endItem} of {totalCount} services
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

      {/* Edit Service Dialog */}
      <Dialog open={!!editingService} onOpenChange={(open) => {
        if (!open) {
          setEditingService(null);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>
              Update the service details below
            </DialogDescription>
          </DialogHeader>
          <ServiceForm 
            onSubmit={handleSubmit} 
            initialData={{
              name: editingService?.name || "",
              description: editingService?.description || "",
              price: editingService?.price?.toString() || "",
              delivery_available: editingService?.delivery_available || false,
              category: editingService?.category || "",
            }}
            isEditing={true}
            categories={categories}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteServiceId} onOpenChange={(open) => {
        if (!open) setDeleteServiceId(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the service
              and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteServiceId && handleDelete(deleteServiceId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ServiceManagement;