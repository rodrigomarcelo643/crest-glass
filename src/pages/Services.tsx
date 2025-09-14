import { Wrench, Clock, CheckCircle, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Service {
  id: string;
  name: string;
  description: string;
  price: number | null;
  delivery_available: boolean;
  category: string | null;
}

const Services = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const getServiceIcon = (category: string) => {
    switch (category) {
      case 'Installation': return '🚪';
      case 'Fabrication': return '🔧';
      case 'Replacement': return '🪟';
      default: return '⚙️';
    }
  };

  const getServiceFeatures = (category: string) => {
    switch (category) {
      case 'Installation':
        return ["Site measurement", "Custom fitting", "Hardware installation", "Quality testing"];
      case 'Fabrication':
        return ["Frame design", "Precision cutting", "Weather sealing", "Finish coating"];
      case 'Replacement':
        return ["Old unit removal", "New installation", "Weatherproofing", "Cleanup service"];
      default:
        return ["Professional service", "Quality materials", "Expert installation", "Customer satisfaction"];
    }
  };

  const handleGetQuote = () => {
    navigate("/quote");
  };

  if (loading) {
    return (
      <div className="px-4 py-6">
        <div className="text-center">
          <Wrench className="w-12 h-12 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="text-center mb-8">
        <Wrench className="w-12 h-12 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-foreground mb-2">Our Services</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Professional glass and aluminum services with expert craftsmanship
        </p>
      </div>

      {/* Service Process */}
      <div className="glass-card p-6 rounded-2xl mb-8">
        <h2 className="text-xl font-semibold mb-4 text-center">Our Service Process</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-medium mb-1">1. Consultation</h3>
            <p className="text-sm text-muted-foreground">Free consultation and site assessment</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-medium mb-1">2. Planning</h3>
            <p className="text-sm text-muted-foreground">Detailed project planning and scheduling</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-medium mb-1">3. Completion</h3>
            <p className="text-sm text-muted-foreground">Expert installation and quality assurance</p>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Card key={service.id} className="glass-card hover:scale-105 transition-transform">
            <CardHeader>
              <div className="text-4xl mb-2">{getServiceIcon(service.category || '')}</div>
              <CardTitle className="text-lg">{service.name}</CardTitle>
              {service.price && (
                <div className="text-lg font-bold text-primary">₱{service.price.toLocaleString()}</div>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4">{service.description}</p>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Includes:</h4>
                <ul className="space-y-1">
                  {getServiceFeatures(service.category || '').map((feature, i) => (
                    <li key={i} className="flex items-center text-sm text-muted-foreground">
                      <CheckCircle className="w-3 h-3 text-primary mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Delivery:</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  service.delivery_available 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {service.delivery_available ? 'Available' : 'On-site only'}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-12 glass-card p-8 text-center rounded-2xl gradient-primary">
        <h3 className="text-2xl font-bold mb-4 text-white">
          Ready to Get Started?
        </h3>
        <p className="text-white/90 mb-6">
          Contact us today for a free consultation and personalized quote
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={handleGetQuote}
            size="lg"
            variant="secondary"
            className="bg-white text-primary hover:bg-white/90"
          >
            Get Service Quote
          </Button>
          <Button 
            size="lg"
            variant="outline"
            className="border-white text-white hover:bg-white/10"
          >
            Call Now: +63 912 345 6789
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Services;