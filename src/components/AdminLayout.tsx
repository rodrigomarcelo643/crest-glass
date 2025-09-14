import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  LayoutDashboard, 
  Package, 
  ClipboardList, 
  Settings, 
  LogOut, 
  Menu,
  Wrench,
  Archive
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import CrestLogo from "@/assets/crest-logo.png";

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Stock Management", href: "/admin/stock", icon: Archive },
  { name: "Pending Orders", href: "/admin/orders", icon: ClipboardList },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Services", href: "/admin/services", icon: Wrench },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    setShowLogoutConfirm(false);
    navigate("/admin/login");
  };

  const NavItems = ({ mobile = false }) => (
    <>
      {navigation.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Button
            key={item.name}
            variant={isActive ? "secondary" : "ghost"}
            className={`w-full justify-start ${mobile ? "text-base" : ""} ${
              isActive 
                ? "bg-primary/10 text-primary font-medium" 
                : "text-muted-foreground hover:text-primary hover:bg-secondary"
            } transition-all duration-200`}
            onClick={() => {
              navigate(item.href);
              if (mobile) setSidebarOpen(false);
            }}
          >
            <item.icon className="w-4 h-4 mr-3" />
            {item.name}
          </Button>
        );
      })}
      <div className={`${mobile ? "mt-3" : "mt-3"}`}>
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
          onClick={() => setShowLogoutConfirm(true)}
        >
          <LogOut className="w-4 h-4 mr-3" />
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
            <AlertDialogDescription>
              You will need to log in again to access the admin dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-background/95 backdrop-blur-sm px-4 shadow-sm">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <div className="flex h-full flex-col">
                {/* Centered Logo & Text */}
                <div className="flex h-16 shrink-0 items-center justify-start ml-5 border-b border-border">
                  <div className="flex items-center gap-2">
                    <img src={CrestLogo} alt="CREST" className="h-8 w-8" />
                    <h1 className="text-xl font-bold">CREST ADMIN</h1>
                  </div>
                </div>
                <nav className="flex flex-1 flex-col gap-y-2 p-4">
                  <NavItems mobile />
                </nav>
              </div>
            </SheetContent>
          </Sheet>
          {/* Centered in mobile top bar */}
          <div className="flex flex-1 justify-start">
            <div className="flex items-center gap-2">
              <img src={CrestLogo} alt="CREST" className="h-8 w-8" />
              <h1 className="text-lg font-semibold">CREST ADMIN</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
          <div className="flex grow flex-col overflow-y-auto border-r border-border bg-background px-6 pb-4 shadow-sm">
            {/* Centered Logo & Text */}
            <div className="flex h-16 shrink-0 mt-5 border-b-2 border-gray-200 items-center justify-center">
              <div className="flex items-center gap-3">
                <img src={CrestLogo} alt="CREST" className="h-9 w-9" />
                <h1 className="text-xl font-bold">CREST ADMIN</h1>
              </div>
            </div>
            <nav className="flex flex-1 flex-col gap-2 mt-4">
              <NavItems />
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:pl-64">
          <main className="p-4 lg:p-6">
            <div className="rounded-lg border border-border bg-card p-4 lg:p-6 shadow-sm">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;