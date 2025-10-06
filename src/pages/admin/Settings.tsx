import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Settings as SettingsIcon, User, Shield, Upload, Plus, Trash2, Building, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";


interface AdminUser {
  id: string;
  username: string;
  role: "super_admin" | "admin";
  lastLogin?: string;
  isActive: boolean;
}

const Settings = () => {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([
    { id: "1", username: "admin", role: "super_admin", lastLogin: "2024-01-15 10:30 AM", isActive: true },
    { id: "2", username: "staff1", role: "admin", lastLogin: "2024-01-14 2:15 PM", isActive: true },
    { id: "3", username: "staff2", role: "admin", lastLogin: "2024-01-12 9:45 AM", isActive: false },
  ]);

  const [profileData, setProfileData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [businessInfo, setBusinessInfo] = useState({
    businessName: "CREST Glass & Aluminum Supply",
    contactEmail: "info@crestglass.com",
    phone: "+63 123 456 7890",
    address: "123 Main Street, Quezon City, Philippines",
  });

  const [newUserData, setNewUserData] = useState({
    username: "",
    password: "",
    role: "admin" as "admin" | "super_admin",
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    const { currentPassword, newPassword, confirmPassword } = profileData;

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error", 
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    try {
      // Step 1: Get the logged-in admin's ID
      const adminId = localStorage.getItem("adminToken");
      if (!adminId) {
        toast({
          title: "Error",
          description: "You are not logged in.",
          variant: "destructive",
        });
        return;
      }

      // Step 2: Fetch admin from your `admin_users` table
      const { data: admin, error } = await supabase
        .from("admin_users")
        .select("*")
        .eq("id", adminId)
        .single();

      if (error || !admin) {
        toast({
          title: "Error",
          description: "Admin account not found",
          variant: "destructive",
        });
        return;
      }

      // Step 3: Compare currentPassword (plain) to stored password_hash
      if (admin.password_hash !== currentPassword) {
        // NOTE: Replace with bcrypt.compare in production
        toast({
          title: "Error",
          description: "Current password is incorrect",
          variant: "destructive",
        });
        return;
      }

      // Step 4: Update password (should hash in production)
      const { error: updateError } = await supabase
        .from("admin_users")
        .update({ password_hash: newPassword })
        .eq("id", adminId);

      if (updateError) {
        toast({
          title: "Error",
          description: "Failed to update password",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully",
      });

      setProfileData({ currentPassword: "", newPassword: "", confirmPassword: "" });

    } catch (err) {
      toast({
        title: "Unexpected Error",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  const handleBusinessInfoUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Business Info Updated",
      description: "Business information has been updated successfully",
    });
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (adminUsers.find(user => user.username === newUserData.username)) {
      toast({
        title: "Error",
        description: "Username already exists",
        variant: "destructive",
      });
      return;
    }

    const newUser: AdminUser = {
      id: Date.now().toString(),
      username: newUserData.username,
      role: newUserData.role,
      isActive: true,
    };

    setAdminUsers([...adminUsers, newUser]);
    setNewUserData({ username: "", password: "", role: "admin" });
    setIsAddUserDialogOpen(false);
    
    toast({
      title: "User Added",
      description: `Admin user ${newUserData.username} has been created`,
    });
  };

  const handleDeleteUser = (id: string) => {
    const user = adminUsers.find(u => u.id === id);
    if (user?.role === "super_admin") {
      toast({
        title: "Error",
        description: "Cannot delete super admin account",
        variant: "destructive",
      });
      return;
    }

    setAdminUsers(adminUsers.filter(user => user.id !== id));
    toast({
      title: "User Deleted",
      description: "Admin user has been removed",
    });
  };

  const toggleUserStatus = (id: string) => {
    setAdminUsers(adminUsers.map(user =>
      user.id === id ? { ...user, isActive: !user.isActive } : user
    ));
    toast({
      title: "User Status Updated",
      description: "User status has been changed",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-glass-primary">Settings</h1>
        <p className="text-glass-muted-foreground">Manage your account and business settings</p>
      </div>

      {/* Profile Management */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Admin Profile Management
          </CardTitle>
          <CardDescription>
            Update your admin account credentials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPassword ? "text" : "password"}
                  value={profileData.currentPassword}
                  onChange={(e) => setProfileData({ ...profileData, currentPassword: e.target.value })}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={profileData.newPassword}
                  onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={profileData.confirmPassword}
                onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                required
              />
            </div>
            
            <Button type="submit">Change Password</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;