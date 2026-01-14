-- Products table
create table products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text not null,
  price numeric(10,2) not null check (price >= 0),
  image_url text not null,
  stock integer not null default 0 check (stock >= 0),
  category text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table products enable row level security;

-- Allow public read access
create policy "Products are viewable by everyone"
  on products for select
  using (true);

-- Allow authenticated users to insert (for admin)
create policy "Authenticated users can insert products"
  on products for insert
  with check (auth.role() = 'authenticated');

-- Allow authenticated users to update (for admin)
create policy "Authenticated users can update products"
  on products for update
  using (auth.role() = 'authenticated');

-- Allow authenticated users to delete (for admin)
create policy "Authenticated users can delete products"
  on products for delete
  using (auth.role() = 'authenticated');

-- Insert sample data
insert into products (name, description, price, image_url, stock, category) values
  ('iPhone 15 Pro', 'Latest flagship with A17 Pro chip', 999.00, 'https://images.unsplash.com/photo-1696446702780-1fdbb930c672?w=400', 50, 'Electronics'),
  ('MacBook Pro 16"', 'M3 Max processor, 32GB RAM', 2499.00, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400', 30, 'Electronics'),
  ('AirPods Pro', 'Active noise cancellation', 249.00, 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400', 100, 'Electronics'),
  ('iPad Air', '10.9-inch Liquid Retina display', 599.00, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400', 75, 'Electronics'),
  ('Apple Watch Series 9', 'Advanced health monitoring', 399.00, 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=400', 60, 'Wearables'),
  ('Magic Keyboard', 'Wireless keyboard with numeric keypad', 129.00, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400', 120, 'Accessories');
