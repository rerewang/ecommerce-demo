-- Ensure RLS is enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
DROP POLICY IF EXISTS "Enable write access for admins" ON products;

-- Re-create policies
CREATE POLICY "Enable read access for all users" ON products FOR SELECT USING (true);

CREATE POLICY "Enable write access for admins" ON products FOR ALL USING (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);
