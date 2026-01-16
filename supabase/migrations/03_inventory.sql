-- Function to decrement stock atomically
create or replace function decrement_stock(product_id uuid, quantity int)
returns void
language plpgsql
security definer
as $$
declare
  current_stock int;
begin
  -- Check current stock
  select stock into current_stock
  from products
  where id = product_id
  for update;

  if not found then
    raise exception 'Product not found';
  end if;

  if current_stock < quantity then
    raise exception 'Insufficient stock';
  end if;

  -- Update stock
  update products
  set stock = stock - quantity
  where id = product_id;
end;
$$;
