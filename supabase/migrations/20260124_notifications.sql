-- Create notifications table
create table notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  type text not null check (type in ('price_drop', 'restock', 'system')),
  title text not null,
  message text not null,
  read boolean default false,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table notifications enable row level security;

-- RLS Policies

-- Users can view their own notifications
create policy "Users can view own notifications"
  on notifications for select
  using (auth.uid() = user_id);

-- Users can update (mark as read) their own notifications
create policy "Users can update own notifications"
  on notifications for update
  using (auth.uid() = user_id);

-- Admins can create notifications (system wide) or service role
-- We'll rely on service_role key for backend creation usually, 
-- but allow admins to insert for testing if needed.
create policy "Admins can insert notifications"
  on notifications for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Indexes
create index notifications_user_id_idx on notifications(user_id);
create index notifications_read_idx on notifications(read) where read = false;
