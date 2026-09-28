-- Add viewability tracking fields to ad_impressions table
-- For IAB viewability standards: 50% visible + 1 second

ALTER TABLE ad_impressions
ADD COLUMN IF NOT EXISTS viewable BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS viewability_ratio DECIMAL(3, 2) DEFAULT 0.00;

-- Index for viewability analytics queries
CREATE INDEX IF NOT EXISTS idx_ad_impressions_viewable 
ON ad_impressions(ad_id, viewable, created_at DESC);

-- Comment
COMMENT ON COLUMN ad_impressions.viewable IS 'IAB viewability: 50%+ visible for 1+ second';
COMMENT ON COLUMN ad_impressions.viewability_ratio IS 'Intersection ratio when viewable (0.00-1.00)';
