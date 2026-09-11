-- Separate committee records from library member accounts.
CREATE TABLE IF NOT EXISTS public.committee_members (
  id SERIAL PRIMARY KEY,
  section TEXT NOT NULL DEFAULT 'main',
  role TEXT NOT NULL DEFAULT 'Member',
  name TEXT NOT NULL DEFAULT 'Name Here',
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.committee_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read committee members" ON public.committee_members;
CREATE POLICY "Allow public read committee members"
ON public.committee_members FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow public insert committee members" ON public.committee_members;
CREATE POLICY "Allow public insert committee members"
ON public.committee_members FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update committee members" ON public.committee_members;
CREATE POLICY "Allow public update committee members"
ON public.committee_members FOR UPDATE TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete committee members" ON public.committee_members;
CREATE POLICY "Allow public delete committee members"
ON public.committee_members FOR DELETE TO public USING (true);
