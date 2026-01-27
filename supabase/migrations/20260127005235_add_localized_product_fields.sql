-- Add localized fields for Chinese support
ALTER TABLE products ADD COLUMN IF NOT EXISTS name_zh TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS description_zh TEXT;
