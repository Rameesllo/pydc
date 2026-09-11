-- Create the public bucket used by browser image uploads.
INSERT INTO storage.buckets (id, name, public)
VALUES ('pydc-images', 'pydc-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Enable Anonymous sign-ins in Supabase Auth because the current app login
-- is localStorage-based. The upload helper creates an authenticated session.
DROP POLICY IF EXISTS "Public read pydc images" ON storage.objects;
CREATE POLICY "Public read pydc images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'pydc-images');

DROP POLICY IF EXISTS "Public upload pydc images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload pydc images" ON storage.objects;
CREATE POLICY "Authenticated upload pydc images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'pydc-images');

DROP POLICY IF EXISTS "Public update pydc images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update pydc images" ON storage.objects;
CREATE POLICY "Authenticated update pydc images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'pydc-images')
WITH CHECK (bucket_id = 'pydc-images');

DROP POLICY IF EXISTS "Public delete pydc images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete pydc images" ON storage.objects;
CREATE POLICY "Authenticated delete pydc images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'pydc-images');
