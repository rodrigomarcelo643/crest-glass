import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Package, Upload, Image as ImageIcon, X, Search, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Link, Unlink } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  image_url?: string;
  created_at: string;
  stock_item_id?: string;
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

// Separate ProductForm component to prevent re-renders
const ProductForm = ({ 
  formData, 
  onInputChange, 
  onSubmit, 
  onImageUpload, 
  onRemoveImage, 
  imagePreview, 
  isSubmitting, 
  isUploading,
  isEdit = false,
  editingProduct,
  stockItems,
  onStockItemChange,
  onStockLinkToggle
}: { 
  formData: any;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  imagePreview: string | null;
  isSubmitting: boolean;
  isUploading: boolean;
  isEdit?: boolean;
  editingProduct?: Product | null;
  stockItems: StockItem[];
  onStockItemChange: (value: string) => void;
  onStockLinkToggle: () => void;
}) => {
  const selectedStockItem = stockItems.find(item => item.id === formData.stock_item_id);
  const isLinkedToStock = !!formData.stock_item_id;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="form-name">Product Name</Label>
        <Input
          id="form-name"
          name="name"
          value={formData.name}
          onChange={onInputChange}
          required
          disabled={isSubmitting}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="form-description">Description</Label>
        <Textarea
          id="form-description"
          name="description"
          value={formData.description}
          onChange={onInputChange}
          required
          disabled={isSubmitting}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="form-price">Price (₱)</Label>
          <Input
            id="form-price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={onInputChange}
            required
            disabled={isSubmitting || isLinkedToStock}
          />
          {isLinkedToStock && (
            <p className="text-xs text-muted-foreground">
              Price is linked to stock item: ₱{selectedStockItem?.price}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="form-quantity">Quantity</Label>
          <Input
            id="form-quantity"
            name="quantity"
            type="number"
            min="0"
            value={formData.quantity}
            onChange={onInputChange}
            required
            disabled={isSubmitting || isLinkedToStock}
          />
          {isLinkedToStock && (
            <p className="text-xs text-muted-foreground">
              Quantity is linked to stock item: {selectedStockItem?.quantity} {selectedStockItem?.unit}
            </p>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="form-category">Category</Label>
        <Select
          name="category"
          value={formData.category}
          onValueChange={(value) => onInputChange({ target: { name: 'category', value } } as any)}
          disabled={isSubmitting}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="glass">Glass</SelectItem>
            <SelectItem value="aluminum">Aluminum</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stock Item Linking */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Link to Stock Item</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onStockLinkToggle}
            disabled={isSubmitting}
          >
            {isLinkedToStock ? (
              <>
                <Unlink className="w-4 h-4 mr-2" />
                Unlink Stock
              </>
            ) : (
              <>
                <Link className="w-4 h-4 mr-2" />
                Link to Stock
              </>
            )}
          </Button>
        </div>

        {isLinkedToStock && (
          <Select
            value={formData.stock_item_id}
            onValueChange={onStockItemChange}
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select stock item" />
            </SelectTrigger>
            <SelectContent>
              {stockItems
                .filter(item => item.category === formData.category)
                .map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.type} {item.thickness_length ? `(${item.thickness_length})` : ''} - {item.quantity} {item.unit}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="form-image-upload">Product Image</Label>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="form-image-upload" className="cursor-pointer">
              <div className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium">
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </div>
              <Input
                id="form-image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onImageUpload}
                disabled={isSubmitting || isUploading}
              />
            </Label>
            <span className="text-sm text-muted-foreground">Optional (max 5MB)</span>
          </div>
          
          {(imagePreview || (isEdit && editingProduct?.image_url)) && (
            <div className="mt-2">
              <div className="relative w-32 h-32 border rounded-md overflow-hidden group">
                <img 
                  src={imagePreview || editingProduct?.image_url || ''} 
                  alt="Product preview" 
                  className="w-full h-full object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={onRemoveImage}
                  disabled={isSubmitting}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full"
        disabled={isSubmitting || isUploading}
      >
        {isUploading ? "Uploading..." : 
         isSubmitting ? "Processing..." : 
         (isEdit ? "Update Product" : "Add Product")}
      </Button>
    </form>
  );
};

const ProductManagement = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [categories, setCategories] = useState<string[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchProducts();
    fetchStockItems();
    fetchCategories();
  }, [currentPage, itemsPerPage, searchTerm, selectedCategory, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // Build the query
      let query = supabase
        .from('products')
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
      } else if (sortBy === "price-low") {
        query = query.order('price', { ascending: true });
      } else if (sortBy === "price-high") {
        query = query.order('price', { ascending: false });
      } else if (sortBy === "name") {
        query = query.order('name', { ascending: true });
      } else if (sortBy === "stock") {
        query = query.order('quantity', { ascending: false });
      }
      
      // Apply pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      setProducts(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({ title: "Error", description: "Failed to fetch products", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

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

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .not('category', 'is', null);
      
      if (error) throw error;
      
      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(data?.map(product => product.category).filter(Boolean) as string[])
      );
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSortBy("newest");
    setCurrentPage(1);
  };

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    category: "glass",
    stock_item_id: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = useCallback(() => {
    setFormData({
      name: "",
      description: "",
      price: "",
      quantity: "",
      category: "glass",
      stock_item_id: "",
    });
    setImageFile(null);
    setImagePreview(null);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStockItemChange = (value: string) => {
    setFormData(prev => ({ ...prev, stock_item_id: value }));
    
    // Auto-fill price and quantity from stock item
    const selectedStock = stockItems.find(item => item.id === value);
    if (selectedStock) {
      setFormData(prev => ({
        ...prev,
        price: selectedStock.price?.toString() || "",
        quantity: selectedStock.quantity.toString()
      }));
    }
  };

  const handleStockLinkToggle = () => {
    if (formData.stock_item_id) {
      // Unlink from stock
      setFormData(prev => ({
        ...prev,
        stock_item_id: "",
        price: "",
        quantity: ""
      }));
    } else {
      // Link to stock - set to first available item of current category
      const firstStockItem = stockItems.find(item => item.category === formData.category);
      if (firstStockItem) {
        setFormData(prev => ({
          ...prev,
          stock_item_id: firstStockItem.id,
          price: firstStockItem.price?.toString() || "",
          quantity: firstStockItem.quantity.toString()
        }));
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({ title: "Invalid file", description: "Please upload an image file", variant: "destructive" });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "File too large", description: "Please upload an image smaller than 5MB", variant: "destructive" });
        return;
      }
      
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const uploadImage = async (productId: string): Promise<string | null> => {
    if (!imageFile) return null;

    try {
      setIsUploading(true);
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${productId}-${Date.now()}.${fileExt}`;
      const filePath = `product-images/${fileName}`;

      // Upload the image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get the public URL for the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      console.log('Image uploaded successfully:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({ title: "Error", description: "Failed to upload image", variant: "destructive" });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let imageUrl = null;
      
      if (editingProduct) {
        // If there's a new image, upload it
        if (imageFile) {
          imageUrl = await uploadImage(editingProduct.id);
          if (!imageUrl && imageFile) {
            // Don't proceed if image upload failed but a file was selected
            toast({ title: "Error", description: "Image upload failed. Please try again.", variant: "destructive" });
            setIsSubmitting(false);
            return;
          }
        }
        
        const { error } = await supabase
          .from('products')
          .update({
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
            quantity: parseInt(formData.quantity),
            category: formData.category,
            stock_item_id: formData.stock_item_id || null,
            ...(imageUrl && { image_url: imageUrl }),
          })
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast({ title: "Product Updated", description: "Product has been updated successfully" });
        setEditingProduct(null);
      } else {
        // First insert the product without image
        const { data, error } = await supabase
          .from('products')
          .insert({
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
            quantity: parseInt(formData.quantity),
            category: formData.category,
            stock_item_id: formData.stock_item_id || null,
          })
          .select()
          .single();

        if (error) throw error;
        
        // If there's an image, upload it and update the product
        if (imageFile && data) {
          imageUrl = await uploadImage(data.id);
          
          if (imageUrl) {
            const { error: updateError } = await supabase
              .from('products')
              .update({ image_url: imageUrl })
              .eq('id', data.id);
              
            if (updateError) throw updateError;
          } else if (imageFile) {
            // If image upload failed, delete the product
            await supabase.from('products').delete().eq('id', data.id);
            toast({ title: "Error", description: "Product creation failed due to image upload error", variant: "destructive" });
            setIsSubmitting(false);
            return;
          }
        }
        
        toast({ title: "Product Added", description: "New product has been added successfully" });
        setIsAddDialogOpen(false);
      }
      
      // Reset form and fetch updated products
      resetForm();
      fetchProducts();
      fetchStockItems();
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to save product", 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      quantity: product.quantity.toString(),
      category: product.category,
      stock_item_id: product.stock_item_id || "",
    });
    setImagePreview(product.image_url || null);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Product Deleted", description: "Product has been removed successfully" });
      setDeleteProductId(null);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({ title: "Error", description: "Failed to delete product", variant: "destructive" });
    }
  };

  // Calculate pagination values
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalCount);

  // Get stock information for products
  const getStockInfo = (product: Product) => {
    if (!product.stock_item_id) return null;
    return stockItems.find(item => item.id === product.stock_item_id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Product Management</h1>
          <p className="text-muted-foreground">Manage your glass and aluminum products</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Fill in the product details below
              </DialogDescription>
            </DialogHeader>
            <ProductForm 
              formData={formData}
              onInputChange={handleInputChange}
              onSubmit={handleSubmit}
              onImageUpload={handleImageUpload}
              onRemoveImage={removeImage}
              imagePreview={imagePreview}
              isSubmitting={isSubmitting}
              isUploading={isUploading}
              stockItems={stockItems}
              onStockItemChange={handleStockItemChange}
              onStockLinkToggle={handleStockLinkToggle}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Products Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₱{products.reduce((sum, product) => sum + (product.price * product.quantity), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <Package className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter(product => product.quantity < 30).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Linked to Stock</CardTitle>
            <Link className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter(product => product.stock_item_id).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Products</CardTitle>
          <CardDescription>
            Search and filter products by name, description, or category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search products by name, description or category..."
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
                  <SelectItem value="complete_kit">Complete Kit</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="name">Name: A to Z</SelectItem>
                  <SelectItem value="stock">Stock: High to Low</SelectItem>
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

      {/* Products Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Products</CardTitle>
            <CardDescription>
              Manage your product inventory and pricing
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
                      <TableHead>Product</TableHead>
                      <TableHead className="hidden md:table-cell">Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Stock Link</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => {
                      const stockInfo = getStockInfo(product);
                      return (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {product.image_url ? (
                                <img 
                                  src={product.image_url} 
                                  alt={product.name}
                                  className="w-10 h-10 rounded-md object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                                  <ImageIcon className="w-5 h-5 text-muted-foreground" />
                                </div>
                              )}
                              <span className="font-medium">{product.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell max-w-xs truncate">
                            {product.description}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {product.category.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>₱{product.price.toLocaleString()}</TableCell>
                          <TableCell>
                            <span className={product.quantity < 30 ? "text-destructive font-medium" : ""}>
                              {product.quantity}
                              {stockInfo && (
                                <span className="text-xs text-muted-foreground block">
                                  ({stockInfo.quantity} {stockInfo.unit} in stock)
                                </span>
                              )}
                            </span>
                          </TableCell>
                          <TableCell>
                            {stockInfo ? (
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <Link className="w-3 h-3" />
                                Linked: {stockInfo.type}
                              </Badge>
                            ) : (
                              <Badge variant="outline">Not Linked</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(product)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteProductId(product.id)}
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

              {products.length === 0 && (
                <div className="text-center py-8">
                  <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No products found</h3>
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
                    Showing {startItem} to {endItem} of {totalCount} products
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

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={(open) => {
        if (!open) {
          setEditingProduct(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the product details below
            </DialogDescription>
          </DialogHeader>
          <ProductForm 
            formData={formData}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            onImageUpload={handleImageUpload}
            onRemoveImage={removeImage}
            imagePreview={imagePreview}
            isSubmitting={isSubmitting}
            isUploading={isUploading}
            isEdit={true}
            editingProduct={editingProduct}
            stockItems={stockItems}
            onStockItemChange={handleStockItemChange}
            onStockLinkToggle={handleStockLinkToggle}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteProductId} onOpenChange={(open) => {
        if (!open) setDeleteProductId(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
              and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProductId && handleDelete(deleteProductId)}
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

export default ProductManagement;