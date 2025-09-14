import { Menu, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link, useLocation } from "react-router-dom";
import crestLogo from "@/assets/crest-logo.png";

const MobileHeader = () => {
  const location = useLocation();
  
  const navigation = [
    { name: "Home", href: "/" },
    {name : "About" , href: "/about"},
    { name: "Products", href: "/products" },
    { name: "Services", href: "/services" },
    {name: "Contact" , href: "/contact"},
    { name: "Quote", href: "/quote" },
  ];

  return (
    <header className="glass-card sticky top-0 z-50 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img 
            src={crestLogo} 
            alt="CREST Logo" 
            className="w-10 h-10 rounded-lg object-cover"
          />
          <div>
            <h1 className="text-lg font-bold text-primary">CREST</h1>
            <p className="text-xs text-muted-foreground">Glass & Aluminum</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Link to="/contact">
          <Button variant="ghost" size="sm" className="glass-button">
              <Phone className="w-4 h-4" />
          </Button>
          </Link>        
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="glass-button">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] glass-card">
              <div className="flex flex-col space-y-4 mt-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`block px-4 py-3 rounded-lg transition-colors ${
                      location.pathname === item.href
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-glass"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                
                <div className="border-t border-glass-border pt-4 mt-6">
                  <div className="flex items-center space-x-2 px-4 py-2">
                    <Phone className="w-4 h-4 text-primary" />
                    <span className="text-sm">+63 912 345 6789</span>
                  </div>
                  <div className="flex items-center space-x-2 px-4 py-2">
                    <Mail className="w-4 h-4 text-primary" />
                    <span className="text-sm">info@crestglass.com</span>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;