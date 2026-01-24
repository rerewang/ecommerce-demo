-- Create returns table
create table returns (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  status text default 'requested' check (status in ('requested', 'approved', 'rejected', 'completed')),
  reason text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create product_alerts table
create table product_alerts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  product_id uuid references products on delete cascade not null,
  type text not null check (type in ('price_drop', 'restock')),
  target_price numeric(10,2),
  status text default 'active' check (status in ('active', 'triggered', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table returns enable row level security;
alter table product_alerts enable row level security;

-- RLS Policies for returns

-- Users can view their own returns
create policy "Users can view own returns"
  on returns for select
  using (auth.uid() = user_id);

-- Users can create their own returns
create policy "Users can create own returns"
  on returns for insert
  with check (auth.uid() = user_id);

-- Admins can view all returns
create policy "Admins can view all returns"
  on returns for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Admins can update returns
create policy "Admins can update returns"
  on returns for update
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- RLS Policies for product_alerts

-- Users can view/manage their own alerts
create policy "Users can view own alerts"
  on product_alerts for select
  using (auth.uid() = user_id);

create policy "Users can create own alerts"
  on product_alerts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own alerts"
  on product_alerts for update
  using (auth.uid() = user_id);

create policy "Users can delete own alerts"
  on product_alerts for delete
  using (auth.uid() = user_id);

-- Indexes
create index returns_user_id_idx on returns(user_id);
create index returns_order_id_idx on returns(order_id);
create index product_alerts_user_id_idx on product_alerts(user_id);
create index product_alerts_product_id_idx on product_alerts(product_id);

-- Trigger for updated_at on returns
create trigger update_returns_updated_at
    before update on returns
    for each row
    execute procedure update_updated_at_column();
