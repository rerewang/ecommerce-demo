-- Add locale preference to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'en';
