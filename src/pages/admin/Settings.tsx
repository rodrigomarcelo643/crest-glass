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

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (profileData.newPassword !== profileData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (profileData.newPassword.length < 6) {
      toast({
        title: "Error", 
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Password Updated",
      description: "Your password has been changed successfully",
    });
    
    setProfileData({ currentPassword: "", newPassword: "", confirmPassword: "" });
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

      {/* Business Information */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Business Information
          </CardTitle>
          <CardDescription>
            Update your business details and branding
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleBusinessInfoUpdate} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  value={businessInfo.businessName}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, businessName: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={businessInfo.contactEmail}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, contactEmail: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={businessInfo.phone}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, phone: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Business Logo</Label>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Logo
                  </Button>
                  <span className="text-sm text-glass-muted-foreground">PNG, JPG up to 2MB</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Business Address</Label>
              <Input
                id="address"
                value={businessInfo.address}
                onChange={(e) => setBusinessInfo({ ...businessInfo, address: e.target.value })}
                required
              />
            </div>
            
            <Button type="submit">Update Business Info</Button>
          </form>
        </CardContent>
      </Card>

      {/* User Account Management */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                User Account Management
              </CardTitle>
              <CardDescription>
                Manage admin user accounts and permissions
              </CardDescription>
            </div>
            
            <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Admin
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Admin User</DialogTitle>
                  <DialogDescription>
                    Create a new admin account
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddUser} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={newUserData.username}
                      onChange={(e) => setNewUserData({ ...newUserData, username: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUserData.password}
                      onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <select
                      id="role"
                      value={newUserData.role}
                      onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value as "admin" | "super_admin" })}
                      className="w-full p-2 border border-glass-border rounded-md bg-glass-card"
                    >
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>
                  
                  <Button type="submit" className="w-full">Create Admin User</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === "super_admin" ? "default" : "secondary"}>
                        {user.role === "super_admin" ? "Super Admin" : "Admin"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? "default" : "outline"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {user.lastLogin || "Never"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleUserStatus(user.id)}
                          disabled={user.role === "super_admin"}
                        >
                          {user.isActive ? "Deactivate" : "Activate"}
                        </Button>
                        {user.role !== "super_admin" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;