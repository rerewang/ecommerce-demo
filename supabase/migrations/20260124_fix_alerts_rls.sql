-- Enable Admins to view all product alerts (to trigger notifications)
create policy "Admins can view all alerts"
  on product_alerts for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Enable Admins to update all product alerts (to mark as triggered)
create policy "Admins can update all alerts"
  on product_alerts for update
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );
