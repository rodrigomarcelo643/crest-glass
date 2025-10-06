import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  // 1. Create state with initial zeros and empty arrays for fetched data
  const [stats, setStats] = useState({
    totalSales: 0,
    pendingQuotes: 0,
    lowStock: 0,
    totalProducts: 0,
    newPendingToday: 0, // ✅ Added for tracking today's pending
  });

  const [lowStockItems, setLowStockItems] = useState([]);
  const [chartData, setChartData] = useState([]); // 🔹 For chart

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // ✅ 1. Fetch quotations to calculate total sales (only completed)
        const { data: completedQuotes, error: completedQuotesError } = await supabase
          .from("quotations")
          .select("estimated_price, created_at")
          .eq("status", "completed");

        if (completedQuotesError) throw completedQuotesError;

        const totalSales = completedQuotes?.reduce(
          (sum, item) => sum + (item.estimated_price || 0),
          0
        ) || 0;

        // ✅ 2. Fetch total product count
        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("id");

        if (productsError) throw productsError;

        const totalProductsCount = productsData?.length || 0;

        // ✅ 3. Fetch all pending quotations with created_at
        const { data: pendingQuotesData, error: pendingQuotesError } = await supabase
          .from("quotations")
          .select("id, created_at")
          .eq("status", "pending");

        if (pendingQuotesError) throw pendingQuotesError;

        const pendingQuotesCount = pendingQuotesData?.length || 0;

        // ✅ 3.1 Count how many were created today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const newPendingTodayCount =
          pendingQuotesData?.filter((q) => {
            const createdAt = new Date(q.created_at);
            return createdAt >= today;
          }).length || 0;

        // ✅ 4. Fetch all stock items
        const { data: allStockItems, error: stockError } = await supabase
          .from("stock_items")
          .select("*");

        if (stockError) throw stockError;

        // ✅ 5. Filter low stock
        const lowStockData = allStockItems.filter(
          (item) => item.quantity < item.min_threshold
        );

        // ✅ 6. Group completed quotes by month for chart
        const grouped = {};
        completedQuotes.forEach((q) => {
          const date = new Date(q.created_at);
          const year = date.getFullYear();
          const month = date.getMonth();
          const key = `${year}-${String(month + 1).padStart(2, "0")}`;

          if (!grouped[key]) {
            grouped[key] = { revenue: 0, orders: 0 };
          }

          grouped[key].revenue += q.estimated_price || 0;
          grouped[key].orders += 1;
        });

        // ✅ 7. Convert grouped data to array for chart
        const chartArray = Object.entries(grouped)
          .map(([key, val]) => {
            const [yr, mo] = key.split("-");
            const monthName = new Date(yr, Number(mo) - 1).toLocaleString("default", {
              month: "short",
            });
            return {
              month: `${monthName} ${yr}`,
              revenue: val.revenue,
              orders: val.orders,
            };
          })
          .sort((a, b) => new Date(a.month) - new Date(b.month));

        // ✅ 8. Set state
        setStats({
          totalSales,
          pendingQuotes: pendingQuotesCount,
          lowStock: lowStockData.length,
          totalProducts: totalProductsCount,
          newPendingToday: newPendingTodayCount, // ✅ Set today's pending count
        });

        setLowStockItems(lowStockData);
        setChartData(chartArray);
      } catch (error) {
        console.error("Error fetching dashboard data:", error.message || error);
      }
    }

    fetchDashboardData();
  }, []);


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
            {stats.newPendingToday > 0
              ? `+${stats.newPendingToday} new today`
              : "No new pending today"}
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
              <LineChart data={chartData}>
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
              <BarChart data={chartData}>
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