-- Add Chinese fields to Full Text Search
-- Drop the existing FTS column first
ALTER TABLE products DROP COLUMN IF EXISTS fts CASCADE;

-- Recreate FTS column including Chinese fields
ALTER TABLE products 
ADD COLUMN fts tsvector 
GENERATED ALWAYS AS (
  to_tsvector('english', 
    name || ' ' || 
    COALESCE(description, '') || ' ' ||
    COALESCE(name_zh, '') || ' ' ||
    COALESCE(description_zh, '')
  )
) STORED;

-- Recreate GIN Index
CREATE INDEX products_fts_idx ON products USING GIN (fts);
