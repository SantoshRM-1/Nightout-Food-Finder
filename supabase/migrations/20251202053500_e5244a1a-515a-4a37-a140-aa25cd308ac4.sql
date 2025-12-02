-- Create storage bucket for hotel images
INSERT INTO storage.buckets (id, name, public)
VALUES ('hotel-images', 'hotel-images', true);

-- Allow authenticated users to upload their own images
CREATE POLICY "Users can upload hotel images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'hotel-images' 
  AND auth.uid() IS NOT NULL
);

-- Allow public access to view images
CREATE POLICY "Public can view hotel images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'hotel-images');

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own hotel images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'hotel-images' 
  AND auth.uid() IS NOT NULL
);