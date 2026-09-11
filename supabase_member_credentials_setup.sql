-- Create the table used by member login and profile image URLs.
CREATE TABLE IF NOT EXISTS public.member_credentials (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'Club Member' NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.member_credentials ENABLE ROW LEVEL SECURITY;

-- The current app uses its own localStorage credential flow, so the table
-- must remain readable and writable by the public client until that flow is
-- migrated to Supabase Auth users.
DROP POLICY IF EXISTS "Allow public read member credentials" ON public.member_credentials;
CREATE POLICY "Allow public read member credentials"
ON public.member_credentials FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow public insert member credentials" ON public.member_credentials;
CREATE POLICY "Allow public insert member credentials"
ON public.member_credentials FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update member credentials" ON public.member_credentials;
CREATE POLICY "Allow public update member credentials"
ON public.member_credentials FOR UPDATE TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete member credentials" ON public.member_credentials;
CREATE POLICY "Allow public delete member credentials"
ON public.member_credentials FOR DELETE TO public USING (true);

INSERT INTO public.member_credentials (email, password, name, role)
VALUES ('member@pydc.org', '123456', 'PYDC Club Member', 'Active Member')
ON CONFLICT (email) DO NOTHING;
