-- Create storage bucket for article images
INSERT INTO storage.buckets (id, name, public)
VALUES ('articles', 'articles', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the articles bucket
CREATE POLICY IF NOT EXISTS "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'articles');

CREATE POLICY IF NOT EXISTS "Admin can upload images" ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'articles' AND 
  auth.uid() IN (
    SELECT id FROM profiles WHERE is_admin = true
  )
);

CREATE POLICY IF NOT EXISTS "Admin can update images" ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'articles' AND 
  auth.uid() IN (
    SELECT id FROM profiles WHERE is_admin = true
  )
);

CREATE POLICY IF NOT EXISTS "Admin can delete images" ON storage.objects FOR DELETE 
USING (
  bucket_id = 'articles' AND 
  auth.uid() IN (
    SELECT id FROM profiles WHERE is_admin = true
  )
);