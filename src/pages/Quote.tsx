import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Calculator, User, Phone, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Quote = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    glassType: "",
    thickness: "",
    shape: "",
    customShape: "",
    serviceMode: "",
    customerName: "",
    contactNumber: "",
    notes: "",
  });

  const glassTypes = [
    { value: "clear", label: "Clear Glass", basePrice: 100 },
    { value: "frosted", label: "Frosted Glass", basePrice: 120 },
    { value: "tinted", label: "Tinted Glass", basePrice: 130 },
    { value: "tempered", label: "Tempered Glass", basePrice: 180 },
    { value: "laminated", label: "Laminated Glass", basePrice: 200 },
  ];

  const thicknesses = [
    { value: "3mm", label: "3mm", multiplier: 0.8 },
    { value: "5mm", label: "5mm", multiplier: 1.0 },
    { value: "6mm", label: "6mm", multiplier: 1.2 },
    { value: "10mm", label: "10mm", multiplier: 1.5 },
    { value: "12mm", label: "12mm", multiplier: 1.8 },
  ];

  const shapes = [
    { value: "circular", label: "Circular", multiplier: 1.3 },
    { value: "square", label: "Square", multiplier: 1.0 },
    { value: "rectangular", label: "Rectangular", multiplier: 1.1 },
    { value: "hexagon", label: "Hexagon", multiplier: 1.4 },
    { value: "custom", label: "Custom", multiplier: 1.5 },
  ];

  const serviceModes = [
    { value: "pickup", label: "Pick-Up", cost: 0 },
    { value: "delivery", label: "Delivery", cost: 500 },
  ];

  const calculatePrice = () => {
    const glassType = glassTypes.find(g => g.value === formData.glassType);
    const thickness = thicknesses.find(t => t.value === formData.thickness);
    const shape = shapes.find(s => s.value === formData.shape);
    const serviceMode = serviceModes.find(s => s.value === formData.serviceMode);

    if (!glassType || !thickness || !shape || !serviceMode) return 0;

    const basePrice = glassType.basePrice * thickness.multiplier * shape.multiplier;
    return Math.round(basePrice + serviceMode.cost);
  };

  const estimatedPrice = calculatePrice();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.contactNumber || !formData.glassType || !formData.thickness || !formData.shape || !formData.serviceMode) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const quotationData = {
        customer_name: formData.customerName,
        contact_number: formData.contactNumber,
        glass_type: formData.glassType,
        thickness: formData.thickness,
        shape: formData.shape,
        custom_shape: formData.customShape || null,
        service_mode: formData.serviceMode,
        notes: formData.notes || null,
        estimated_price: estimatedPrice,
        status: 'pending'
      };

      const { error } = await supabase
        .from('quotations')
        .insert([quotationData]);

      if (error) throw error;

      toast({
        title: "Request Submitted Successfully!",
        description: "We'll contact you shortly with a detailed quote.",
      });

      // Reset form
      setFormData({
        glassType: "",
        thickness: "",
        shape: "",
        customShape: "",
        serviceMode: "",
        customerName: "",
        contactNumber: "",
        notes: "",
      });
    } catch (error) {
      console.error('Error submitting quote:', error);
      toast({
        title: "Submission Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <Calculator className="w-12 h-12 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-foreground mb-2">Get Your Quote</h1>
        <p className="text-muted-foreground">
          Tell us about your project and get an instant estimate
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Glass Type */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Glass Type</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={formData.glassType} onValueChange={(value) => setFormData({...formData, glassType: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select glass type" />
              </SelectTrigger>
              <SelectContent>
                {glassTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label} - ₱{type.basePrice}/sq ft
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Thickness */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Glass Thickness</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={formData.thickness} onValueChange={(value) => setFormData({...formData, thickness: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select thickness" />
              </SelectTrigger>
              <SelectContent>
                {thicknesses.map((thickness) => (
                  <SelectItem key={thickness.value} value={thickness.value}>
                    {thickness.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Shape */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Glass Shape</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={formData.shape} 
              onValueChange={(value) => setFormData({...formData, shape: value})}
              className="grid grid-cols-2 gap-4"
            >
              {shapes.map((shape) => (
                <div key={shape.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={shape.value} id={shape.value} />
                  <Label htmlFor={shape.value} className="flex-1">
                    {shape.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            
            {formData.shape === "custom" && (
              <div className="mt-4">
                <Label htmlFor="customShape">Describe your custom shape</Label>
                <Input
                  id="customShape"
                  value={formData.customShape}
                  onChange={(e) => setFormData({...formData, customShape: e.target.value})}
                  placeholder="e.g., L-shaped, curved edge..."
                  className="mt-1"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Service Mode */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Service Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={formData.serviceMode} 
              onValueChange={(value) => setFormData({...formData, serviceMode: value})}
              className="space-y-3"
            >
              {serviceModes.map((mode) => (
                <div key={mode.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={mode.value} id={mode.value} />
                  <Label htmlFor={mode.value} className="flex-1">
                    {mode.label} {mode.cost > 0 && `(+₱${mode.cost})`}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Estimated Price */}
        {estimatedPrice > 0 && (
          <Card className="glass-card gradient-primary">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-bold text-white mb-2">Estimated Price</h3>
              <p className="text-3xl font-bold text-white">₱{estimatedPrice.toLocaleString()}</p>
              <p className="text-white/80 text-sm mt-2">*Final price may vary based on exact specifications</p>
            </CardContent>
          </Card>
        )}

        {/* Customer Details */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <User className="w-5 h-5 mr-2" />
              Your Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="customerName">Full Name *</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                placeholder="Enter your full name"
                required
              />
            </div>
            <div>
              <Label htmlFor="contactNumber">Contact Number *</Label>
              <Input
                id="contactNumber"
                type="tel"
                value={formData.contactNumber}
                onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                placeholder="+63 912 345 6789"
                required
              />
            </div>
            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Any special requirements or details..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button 
          type="submit" 
          size="lg" 
          className="w-full gradient-primary hover:scale-105 transition-transform"
          disabled={isSubmitting}
        >
          <Send className="w-5 h-5 mr-2" />
          {isSubmitting ? "Submitting..." : "Submit Quote Request"}
        </Button>
      </form>
    </div>
  );
};

export default Quote;