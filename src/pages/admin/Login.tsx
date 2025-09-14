import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield, Eye, EyeOff } from "lucide-react";
import crest_logo from "@/assets/crest-logo.png";
import { supabase } from "@/integrations/supabase/client";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Query admin_users table to validate credentials
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', username)
        .single();

      if (error || !data) {
        throw new Error('Invalid credentials');
      }

      // In a real app, you'd hash and compare passwords
      // For demo purposes, we'll check plain text (NOT SECURE for production)
      if (data.password_hash === password) {
        localStorage.setItem("adminToken", data.id);
        localStorage.setItem("adminUser", JSON.stringify(data));
        toast({
          title: "Login Successful",
          description: "Welcome to CREST Admin Panel",
        });
        navigate("/admin/dashboard");
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200/30 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-200/30 rounded-full translate-x-1/3 translate-y-1/3"></div>
      <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-blue-300/20 rounded-full"></div>
      
      <Card className="w-full max-w-md bg-white py-8 shadow-xl relative z-10">
        {/* Blue accent elements */}
        <div className="absolute -top-4 -left-4 w-16 h-16 bg-blue-500/10 rounded-full blur-md"></div>
        <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-indigo-500/10 rounded-full blur-md"></div>
        
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-20 h-20 flex items-center justify-center ">
            <img src={crest_logo} className="w-15 h-15 text-white " />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-blue-500">
              CREST Admin
            </CardTitle>
            <CardDescription className="text-blue-600/70">Glass & Aluminum Supply Management</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-blue-800/80">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                className="bg-white/50 border-blue-200/70 focus:ring-blue-400/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-blue-800/80">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="bg-white/50 border-blue-200/70 focus:ring-blue-400/50 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-blue-500/70 hover:text-blue-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r py-5 from-blue-600 to-blue-600 hover:from-blue-700 hover:toblue-700 text-white shadow-md shadow-blue-500/30"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing In...
                </span>
              ) : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;