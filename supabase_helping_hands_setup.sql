-- Drop existing tables if they conflict (optional, but keep it clean)
-- DROP TABLE IF EXISTS public.borrowers;
-- DROP TABLE IF EXISTS public.requests;
-- DROP TABLE IF EXISTS public.equipment;
-- DROP TABLE IF EXISTS public.admin_users;

-- Create equipment table
CREATE TABLE IF NOT EXISTS public.equipment (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  total_stock INT DEFAULT 1,
  available_stock INT DEFAULT 1,
  status TEXT DEFAULT 'Available', -- 'Available' | 'Out of Stock'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for equipment
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select equipment" ON public.equipment FOR SELECT USING (true);
CREATE POLICY "Allow public insert equipment" ON public.equipment FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update equipment" ON public.equipment FOR UPDATE USING (true);
CREATE POLICY "Allow public delete equipment" ON public.equipment FOR DELETE USING (true);

-- Create borrowers table
CREATE TABLE IF NOT EXISTS public.borrowers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  patient_name TEXT,
  equipment_id INT REFERENCES public.equipment(id) ON DELETE CASCADE,
  quantity INT DEFAULT 1,
  borrow_date DATE DEFAULT CURRENT_DATE NOT NULL,
  expected_return_date DATE NOT NULL,
  actual_return_date DATE,
  status TEXT DEFAULT 'Borrowed' NOT NULL, -- 'Borrowed' | 'Returned' | 'Overdue'
  notes TEXT,
  returned_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for borrowers
ALTER TABLE public.borrowers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select borrowers" ON public.borrowers FOR SELECT USING (true);
CREATE POLICY "Allow public insert borrowers" ON public.borrowers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update borrowers" ON public.borrowers FOR UPDATE USING (true);
CREATE POLICY "Allow public delete borrowers" ON public.borrowers FOR DELETE USING (true);

-- Create requests table
CREATE TABLE IF NOT EXISTS public.requests (
  id SERIAL PRIMARY KEY,
  user_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  patient_name TEXT,
  equipment_id INT REFERENCES public.equipment(id) ON DELETE CASCADE,
  duration INT DEFAULT 30, -- In days
  status TEXT DEFAULT 'Pending' NOT NULL, -- 'Pending' | 'Approved' | 'Returned'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for requests
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select requests" ON public.requests FOR SELECT USING (true);
CREATE POLICY "Allow public insert requests" ON public.requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update requests" ON public.requests FOR UPDATE USING (true);
CREATE POLICY "Allow public delete requests" ON public.requests FOR DELETE USING (true);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'Admin' NOT NULL, -- 'Admin' | 'SuperAdmin'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select admin_users" ON public.admin_users FOR SELECT USING (true);
CREATE POLICY "Allow public insert admin_users" ON public.admin_users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update admin_users" ON public.admin_users FOR UPDATE USING (true);
CREATE POLICY "Allow public delete admin_users" ON public.admin_users FOR DELETE USING (true);

-- Seed initial equipment
INSERT INTO public.equipment (name, category, description, image_url, total_stock, available_stock, status)
VALUES
('Standard Adult Wheelchair', 'Wheelchairs', 'Foldable wheelchair with comfortable armrests and footrests, ideal for patients who have trouble walking.', 'https://images.unsplash.com/photo-1579684389782-64d84b5e905d?q=80&w=600&auto=format&fit=crop', 10, 6, 'Available'),
('5L Oxygen Concentrator', 'Oxygen', 'High-purity oxygen concentrator, provides continuous oxygen flow of up to 5 Liters per minute.', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600&auto=format&fit=crop', 5, 2, 'Available'),
('Semi-Fowler Manual Hospital Bed', 'Hospital Beds', 'Adjustable backrest and height, standard hospital bed for home patient care.', 'https://images.unsplash.com/photo-1538108149393-fdfd81215362?q=80&w=600&auto=format&fit=crop', 4, 1, 'Available'),
('Compressor Nebulizer Machine', 'Nebulizers', 'Compact nebulizer for effective medication delivery to treat respiratory issues like asthma or bronchitis.', 'https://images.unsplash.com/photo-1581091170250-e34179e86c05?q=80&w=600&auto=format&fit=crop', 8, 4, 'Available'),
('Adjustable Folding Walker', 'Walkers', 'Lightweight aluminum folding walker with adjustable height controls and dual support rails.', 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=600&auto=format&fit=crop', 15, 10, 'Available'),
('Rebreather Oxygen Mask', 'Oxygen', 'Non-rebreather oxygen masks with reservoir bags, designed to deliver high concentrations of oxygen in emergency care.', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600&auto=format&fit=crop', 20, 15, 'Available')
ON CONFLICT DO NOTHING;

-- Seed admin users
INSERT INTO public.admin_users (name, email, role)
VALUES
('Helping Hands Admin', 'admin@pydc.org', 'Admin')
ON CONFLICT (email) DO NOTHING;
