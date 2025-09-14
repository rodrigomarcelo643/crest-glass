import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ClipboardList, Users, DollarSign, TrendingUp, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const salesData = [
  { month: "Jan", revenue: 12000, orders: 45 },
  { month: "Feb", revenue: 15000, orders: 52 },
  { month: "Mar", revenue: 18000, orders: 61 },
  { month: "Apr", revenue: 22000, orders: 78 },
  { month: "May", revenue: 19000, orders: 69 },
  { month: "Jun", revenue: 25000, orders: 85 },
];

const stockData = [
  { type: "Clear Glass", stock: 120, threshold: 50, status: "good" },
  { type: "Tempered Glass", stock: 35, threshold: 50, status: "low" },
  { type: "Aluminum Frame", stock: 80, threshold: 30, status: "good" },
  { type: "Sliding Track", stock: 15, threshold: 25, status: "low" },
];

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 25000,
    pendingQuotes: 12,
    lowStock: 2,
    totalProducts: 45,
  });

  const lowStockItems = stockData.filter(item => item.status === "low");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-glass-primary">Dashboard</h1>
        <p className="text-glass-muted-foreground">Overview of your business performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-glass-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱{stats.totalSales.toLocaleString()}</div>
            <p className="text-xs text-glass-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Quotes</CardTitle>
            <ClipboardList className="h-4 w-4 text-glass-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingQuotes}</div>
            <p className="text-xs text-glass-muted-foreground">
              +3 new today
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStock}</div>
            <p className="text-xs text-glass-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-glass-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-glass-muted-foreground">
              Active inventory
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue over the past 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--glass-border))" />
                <XAxis dataKey="month" stroke="hsl(var(--glass-muted-foreground))" />
                <YAxis stroke="hsl(var(--glass-muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--glass-card))",
                    border: "1px solid hsl(var(--glass-border))",
                    borderRadius: "8px"
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--glass-primary))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--glass-primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Order Volume</CardTitle>
            <CardDescription>Number of orders per month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--glass-border))" />
                <XAxis dataKey="month" stroke="hsl(var(--glass-muted-foreground))" />
                <YAxis stroke="hsl(var(--glass-muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--glass-card))",
                    border: "1px solid hsl(var(--glass-border))",
                    borderRadius: "8px"
                  }}
                />
                <Bar dataKey="orders" fill="hsl(var(--glass-accent))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="glass-card border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Low Stock Alert
            </CardTitle>
            <CardDescription>These items need restocking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg">
                  <div>
                    <p className="font-medium">{item.type}</p>
                    <p className="text-sm text-glass-muted-foreground">
                      Current: {item.stock} | Minimum: {item.threshold}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-destructive">
                      {item.threshold - item.stock} units needed
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard;