-- Create article_images table for tracking uploaded images with deduplication
CREATE TABLE IF NOT EXISTS article_images (
  id BIGSERIAL PRIMARY KEY,
  hash TEXT UNIQUE NOT NULL, -- SHA-256 hash of file content for deduplication
  original_name TEXT NOT NULL,
  file_path TEXT UNIQUE NOT NULL, -- Path in storage bucket
  public_url TEXT UNIQUE NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  reference_count INTEGER DEFAULT 1 NOT NULL CHECK (reference_count >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create article_image_usage table for tracking which images are used in which articles
CREATE TABLE IF NOT EXISTS article_image_usage (
  id BIGSERIAL PRIMARY KEY,
  article_id BIGINT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  image_id BIGINT NOT NULL REFERENCES article_images(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(article_id, image_id) -- Prevent duplicate usage records
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_article_images_hash ON article_images(hash);
CREATE INDEX IF NOT EXISTS idx_article_images_reference_count ON article_images(reference_count);
CREATE INDEX IF NOT EXISTS idx_article_images_created_at ON article_images(created_at);
CREATE INDEX IF NOT EXISTS idx_article_image_usage_article_id ON article_image_usage(article_id);
CREATE INDEX IF NOT EXISTS idx_article_image_usage_image_id ON article_image_usage(image_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_article_images_updated_at 
    BEFORE UPDATE ON article_images 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to clean up orphaned images (reference_count = 0)
CREATE OR REPLACE FUNCTION cleanup_orphaned_images()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- This function should be called periodically via a cron job or API
    -- It will remove images that are no longer referenced by any articles
    
    DELETE FROM article_images 
    WHERE reference_count = 0 
    AND updated_at < NOW() - INTERVAL '1 hour'; -- Grace period
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ language 'plpgsql';

-- Create RLS policies (if RLS is enabled)
ALTER TABLE article_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_image_usage ENABLE ROW LEVEL SECURITY;

-- Policy for article_images: Users can read all images, but only authenticated users can insert/update
CREATE POLICY "Public images are viewable by everyone" ON article_images
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert images" ON article_images
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update images" ON article_images
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy for article_image_usage: Only authenticated users can manage usage
CREATE POLICY "Authenticated users can manage image usage" ON article_image_usage
    FOR ALL USING (auth.role() = 'authenticated');

-- Grant necessary permissions
GRANT SELECT ON article_images TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON article_images TO authenticated;
GRANT USAGE ON SEQUENCE article_images_id_seq TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON article_image_usage TO authenticated;
GRANT USAGE ON SEQUENCE article_image_usage_id_seq TO authenticated; 