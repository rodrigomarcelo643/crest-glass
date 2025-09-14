import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Quote, ArrowRight, Star, Shield } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import hero_bg from "@/assets/hero_bg.png"

const Home = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchServices();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .limit(3);
      
      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleGetQuote = () => {
    navigate("/quote");
  };

  return (
    <div className="min-h-screen">
      {/* Admin Access Button */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/admin/login")}
          className="glass-button bg-background/80 backdrop-blur-sm"
        >
          <Shield className="w-4 h-4 mr-2" />
          Admin
        </Button>
      </div>

      {/* Hero Section */}
      <section 
        className="relative min-h-[95vh] flex items-center justify-center px-4 py-12 text-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${hero_bg})`,
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
       
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">
            Strength In Glass
          </h1>
          <h2 className="text-2xl md:text-4xl font-semibold mb-8 text-primary">
            Precision in Aluminum
          </h2>
          <p className="text-lg text-white/90 mb-10 max-w-2xl mx-auto">
            Premium glass and aluminum solutions crafted for modern construction needs
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={handleGetQuote}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg hover:scale-105 transition-transform"
            >
              <Quote className="w-5 h-5 mr-2" />
              Get Quote Now
            </Button>
            <Button 
              variant="secondary"
              size="lg"
              className="bg-white text-foreground hover:bg-white/90 px-8 py-6 text-lg"
              onClick={() => navigate("/products")}
            >
              View Products
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Quick Links */}
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Button 
              variant="outline" 
              className="bg-white/10 text-white hover:bg-white/20 border-white/20"
              onClick={() => navigate("/products")}
            >
              Glass Solutions
            </Button>
            <Button 
              variant="outline" 
              className="bg-white/10 text-white hover:bg-white/20 border-white/20"
              onClick={() => navigate("/products")}
            >
              Aluminum Frames
            </Button>
            <Button 
              variant="outline" 
              className="bg-white/10 text-white hover:bg-white/20 border-white/20"
              onClick={() => navigate("/services")}
            >
              Custom Designs
            </Button>
            <Button 
              variant="outline" 
              className="bg-white/10 text-white hover:bg-white/20 border-white/20"
              onClick={() => navigate("/quote")}
            >
              Free Consultation
            </Button>
          </div>
        </div>
      </section>

      {/* Inspiring Quote */}
      <section className="px-4 py-12 bg-muted/30">
        <div className="max-w-4xl mx-auto bg-background p-8 text-center rounded-2xl shadow-lg">
          <blockquote className="text-xl font-medium text-foreground italic">
            "Excellence in every pane, precision in every frame"
          </blockquote>
          <cite className="text-sm text-muted-foreground mt-4 block">- CREST Glass & Aluminum</cite>
        </div>
      </section>

      {/* Top Products Showcase */}
      <section className="px-4 py-12 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-foreground">
            Featured Products
          </h2>
          <p className="text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
            Discover our premium selection of glass and aluminum products
          </p>
          
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-muted/30 rounded-2xl p-4 animate-pulse">
                  <div className="h-48 bg-muted rounded-xl mb-4"></div>
                  <div className="h-6 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                  <div className="h-10 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  title={product.name}
                  description={product.description}
                  price={product.price}
                  image={product.image_url || "/placeholder.svg"}
                  category={product.category}
                  onGetQuote={handleGetQuote}
                />
              ))}
            </div>
          )}

          {products.length > 0 && (
            <div className="text-center mt-10">
              <Button 
                onClick={() => navigate("/products")}
                variant="outline"
                size="lg"
                className="px-8"
              >
                View All Products
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Services Section */}
      <section className="px-4 py-12 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-foreground">
            Our Services
          </h2>
          <p className="text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
            Comprehensive solutions for residential and commercial projects
          </p>
          
          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-background p-6 rounded-2xl shadow-sm text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-6 0H5m4 0H3m2-4h10M9 7h6m-6 4h6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Custom Glass Solutions</h3>
              <p className="text-muted-foreground">
                Custom-designed glass panels, windows, and doors tailored to your specific requirements
              </p>
            </div>
            
            <div className="bg-background p-6 rounded-2xl shadow-sm text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Aluminum Framing Systems</h3>
              <p className="text-muted-foreground">
                High-quality aluminum frames and structures for durability and modern aesthetics
              </p>
            </div>
            
            <div className="bg-background p-6 rounded-2xl shadow-sm text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Professional Installation</h3>
              <p className="text-muted-foreground">
                Expert installation services ensuring perfect fit and long-lasting performance
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-4 text-white">
            Ready to Transform Your Space?
          </h3>
          <p className="text-white/90 mb-8 text-lg">
            Get a personalized quote for your glass and aluminum needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleGetQuote}
              size="lg"
              className="bg-white text-primary hover:bg-white/90 px-8 py-6 text-lg"
            >
              Start Your Project
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="bg-transparent text-white border-white hover:bg-white/10 px-8 py-6 text-lg"
              onClick={() => navigate("/contact")}
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;