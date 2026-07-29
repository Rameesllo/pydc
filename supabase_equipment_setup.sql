-- Create equipment table
CREATE TABLE IF NOT EXISTS public.equipment (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  image TEXT,
  rating FLOAT DEFAULT 5.0,
  reviews INT DEFAULT 0,
  status TEXT DEFAULT 'Available',
  location TEXT,
  serial_no TEXT NOT NULL UNIQUE,
  year INT,
  publisher TEXT,
  language TEXT DEFAULT 'N/A',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;

-- Create Policies to allow public read/write access
CREATE POLICY "Allow public read access to equipment" ON public.equipment FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to equipment" ON public.equipment FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to equipment" ON public.equipment FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to equipment" ON public.equipment FOR DELETE USING (true);

-- Seed initial equipment
INSERT INTO public.equipment (name, type, image, rating, reviews, status, location, serial_no, year, publisher, language)
VALUES 
('Catan Board Game (Settlers of Catan)', 'Board Game', 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?q=80&w=600&auto=format&fit=crop', 4.9, 142, 'Available', 'Games Cupboard - Shelf G1', 'EQ-CAT-01', 2020, 'KOSMOS', 'English'),
('Professional Ping Pong Paddle Set', 'Sports Equipment', 'https://images.unsplash.com/photo-1534158914592-062992fbe900?q=80&w=600&auto=format&fit=crop', 4.7, 89, 'Available', 'Sports Locker - Room 102', 'EQ-PP-02', 2023, 'STIGA', 'N/A'),
('Epson Full HD Projector', 'AV / Electronics', 'https://images.unsplash.com/photo-1535016120720-40c646be5580?q=80&w=600&auto=format&fit=crop', 4.8, 34, 'Borrowed', 'AV Room - Cabinet A3', 'EQ-PROJ-03', 2022, 'Epson', 'English'),
('Carrom Board Champion Edition', 'Board Game', 'https://images.unsplash.com/photo-1621243804936-775306a8f2e3?q=80&w=600&auto=format&fit=crop', 4.6, 75, 'Available', 'Games Cupboard - Shelf G2', 'EQ-CAR-04', 2021, 'Synco', 'N/A'),
('Wilson Championship Tennis Rackets (Pair)', 'Sports Equipment', 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?q=80&w=600&auto=format&fit=crop', 4.7, 51, 'Available', 'Sports Locker - Room 102', 'EQ-TEN-05', 2022, 'Wilson', 'N/A'),
('Monopoly Ultimate Banking Edition', 'Board Game', 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?q=80&w=600&auto=format&fit=crop', 4.5, 110, 'Borrowed', 'Games Cupboard - Shelf G1', 'EQ-MON-06', 2021, 'Hasbro Gaming', 'English')
ON CONFLICT (serial_no) DO NOTHING;

-- Create equipment checkouts table
CREATE TABLE IF NOT EXISTS public.equipment_checkouts (
  id SERIAL PRIMARY KEY,
  member_id INT REFERENCES public.members(id) ON DELETE CASCADE,
  equipment_id INT REFERENCES public.equipment(id) ON DELETE CASCADE,
  checkout_date DATE DEFAULT CURRENT_DATE NOT NULL,
  status TEXT DEFAULT 'Borrowed' NOT NULL, -- 'Borrowed' | 'Returned'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for equipment checkouts
ALTER TABLE public.equipment_checkouts ENABLE ROW LEVEL SECURITY;

-- Create Policies to allow public read/write access to checkouts
CREATE POLICY "Allow public read access to equipment_checkouts" ON public.equipment_checkouts FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to equipment_checkouts" ON public.equipment_checkouts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to equipment_checkouts" ON public.equipment_checkouts FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to equipment_checkouts" ON public.equipment_checkouts FOR DELETE USING (true);
