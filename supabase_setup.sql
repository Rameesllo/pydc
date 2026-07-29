-- Create books table
CREATE TABLE IF NOT EXISTS public.books (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT NOT NULL,
  image TEXT,
  rating FLOAT DEFAULT 5.0,
  reviews INT DEFAULT 0,
  status TEXT DEFAULT 'Available',
  location TEXT,
  isbn TEXT,
  year INT,
  language TEXT DEFAULT 'English',
  publisher TEXT,
  book_no TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Create Policy to allow select to anyone (anonymous)
CREATE POLICY "Allow public read access" ON public.books
  FOR SELECT USING (true);

-- Create Policy to allow inserts/updates/deletes
CREATE POLICY "Allow public insert access" ON public.books
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access" ON public.books
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access" ON public.books
  FOR DELETE USING (true);

-- Seed initial books
INSERT INTO public.books (title, author, category, image, rating, reviews, status, location, isbn, year, language, publisher, book_no)
VALUES 
('The Alchemist', 'Paulo Coelho', 'Fiction', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop', 4.8, 2350, 'Available', 'Fiction Section - Shelf F3', '978-0061122415', 1988, 'English', 'HarperOne', 'BK-9021'),
('Atomic Habits', 'James Clear', 'Self Help', 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600&auto=format&fit=crop', 4.9, 4500, 'Available', 'Self Help - Shelf S1', '978-0735211292', 2018, 'English', 'Avery', 'BK-9022'),
('The Power of Habit', 'Charles Duhigg', 'Self Help', 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600&auto=format&fit=crop', 4.6, 1200, 'Available', 'Self Help - Shelf S2', '978-0812981605', 2012, 'English', 'Random House', 'BK-9023'),
('Sapiens', 'Yuval Noah Harari', 'History', 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600&auto=format&fit=crop', 4.7, 3200, 'Available', 'History - Shelf H1', '978-0062316097', 2015, 'English', 'Harper', 'BK-9024'),
('Rich Dad Poor Dad', 'Robert T. Kiyosaki', 'Finance', 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600&auto=format&fit=crop', 4.5, 2100, 'Not Available', 'Finance - Shelf F1', '978-1612680194', 1997, 'English', 'Plata Publishing', 'BK-9025'),
('Deep Work', 'Cal Newport', 'Productivity', 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600&auto=format&fit=crop', 4.6, 1800, 'Available', 'Productivity - Shelf P2', '978-1455586691', 2016, 'English', 'Grand Central Publishing', 'BK-9026');

-- Create members table
CREATE TABLE IF NOT EXISTS public.members (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for members
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to members" ON public.members FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to members" ON public.members FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to members" ON public.members FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to members" ON public.members FOR DELETE USING (true);

-- Create checkouts table
CREATE TABLE IF NOT EXISTS public.checkouts (
  id SERIAL PRIMARY KEY,
  member_id INT REFERENCES public.members(id) ON DELETE CASCADE,
  book_id INT REFERENCES public.books(id) ON DELETE CASCADE,
  checkout_date DATE DEFAULT CURRENT_DATE NOT NULL,
  status TEXT DEFAULT 'Borrowed' NOT NULL, -- 'Borrowed' | 'Returned'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for checkouts
ALTER TABLE public.checkouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to checkouts" ON public.checkouts FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to checkouts" ON public.checkouts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to checkouts" ON public.checkouts FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to checkouts" ON public.checkouts FOR DELETE USING (true);

-- Seed initial members
INSERT INTO public.members (name, phone, email)
VALUES 
('Yasir Arafath', '+91 9876543210', 'yasir@pydc.org'),
('Fathima Riba', '+91 9876543211', 'riba@pydc.org'),
('Adil Nandan', '+91 9876543212', 'nandan@pydc.org')
ON CONFLICT (email) DO NOTHING;

