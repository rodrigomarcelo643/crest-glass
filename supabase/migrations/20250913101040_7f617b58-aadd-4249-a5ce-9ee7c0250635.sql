-- Create admin_users table for authentication
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT,
  price DECIMAL(10,2),
  quantity INTEGER NOT NULL DEFAULT 0,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2),
  delivery_available BOOLEAN NOT NULL DEFAULT false,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stock_items table
CREATE TABLE public.stock_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  category TEXT NOT NULL, -- 'glass' or 'aluminum'
  thickness_length TEXT, -- For glass thickness or aluminum length
  quantity INTEGER NOT NULL DEFAULT 0,
  min_threshold INTEGER NOT NULL DEFAULT 10,
  unit TEXT NOT NULL DEFAULT 'pieces',
  price DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quotations table
CREATE TABLE public.quotations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  glass_type TEXT NOT NULL,
  thickness TEXT NOT NULL,
  shape TEXT NOT NULL,
  custom_shape TEXT,
  service_mode TEXT NOT NULL, -- 'pickup' or 'delivery'
  estimated_price DECIMAL(10,2),
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'contacted', 'completed'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is admin-only for now)
CREATE POLICY "Allow all access to admin_users" ON public.admin_users FOR ALL USING (true);
CREATE POLICY "Allow all access to products" ON public.products FOR ALL USING (true);
CREATE POLICY "Allow all access to services" ON public.services FOR ALL USING (true);
CREATE POLICY "Allow all access to stock_items" ON public.stock_items FOR ALL USING (true);
CREATE POLICY "Allow all access to quotations" ON public.quotations FOR ALL USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stock_items_updated_at
  BEFORE UPDATE ON public.stock_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quotations_updated_at
  BEFORE UPDATE ON public.quotations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.admin_users (username, password_hash) VALUES 
('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'); -- password: admin123

INSERT INTO public.products (name, description, image, price, quantity, category) VALUES
('Tempered Glass Panel', 'High-quality tempered glass panel for doors and windows', '/assets/glass-window.jpg', 2500.00, 50, 'Glass'),
('Sliding Door Kit', 'Complete sliding door kit with aluminum frame', '/assets/sliding-door.jpg', 15000.00, 20, 'Door'),
('Aluminum Frame Bars', 'Precision aluminum frame bars for custom installations', '/assets/glass-partition.jpg', 800.00, 100, 'Aluminum'),
('Clear Glass Window Panel', 'Crystal clear glass panels for residential windows', '/assets/glass-window.jpg', 1800.00, 30, 'Glass');

INSERT INTO public.services (name, description, price, delivery_available, category) VALUES
('Sliding Door Installation', 'Professional installation of sliding glass doors with aluminum frames', 5000.00, true, 'Installation'),
('Glass Panel Partition Setup', 'Custom glass partition installation for offices and homes', 8000.00, true, 'Installation'),
('Aluminum Framing Services', 'Custom aluminum frame fabrication and installation', 3500.00, false, 'Fabrication'),
('Custom Glass Cutting', 'Precision glass cutting to your specifications', 1200.00, false, 'Fabrication'),
('Window & Door Replacement', 'Complete replacement service for windows and doors', 12000.00, true, 'Replacement');

INSERT INTO public.stock_items (type, category, thickness_length, quantity, min_threshold, unit, price) VALUES
('Clear Glass', 'glass', '3mm', 45, 20, 'sq ft', 150.00),
('Clear Glass', 'glass', '5mm', 38, 20, 'sq ft', 200.00),
('Frosted Glass', 'glass', '6mm', 25, 15, 'sq ft', 280.00),
('Tempered Glass', 'glass', '10mm', 12, 10, 'sq ft', 450.00),
('Standard Frame', 'aluminum', '2m', 85, 30, 'pieces', 850.00),
('Heavy Duty Frame', 'aluminum', '3m', 42, 20, 'pieces', 1200.00),
('Corner Bracket', 'aluminum', 'Standard', 120, 50, 'pieces', 125.00);

INSERT INTO public.quotations (customer_name, contact_number, glass_type, thickness, shape, service_mode, estimated_price, status) VALUES
('John Doe', '+63 912 345 6789', 'Clear Glass', '5mm', 'Rectangular', 'delivery', 3500.00, 'pending'),
('Maria Santos', '+63 917 234 5678', 'Tempered Glass', '10mm', 'Square', 'pickup', 5200.00, 'contacted'),
('Robert Chen', '+63 923 456 7890', 'Frosted Glass', '6mm', 'Custom', 'delivery', 4800.00, 'pending');