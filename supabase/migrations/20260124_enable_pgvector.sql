-- 1. Enable pgvector extension
create extension if not exists vector;

-- 2. Add embedding column to products table
-- Using 1024 dimensions for BAAI/bge-m3 model
alter table products 
add column if not exists embedding vector(1024);

-- 3. Create HNSW index for fast similarity search
create index if not exists products_embedding_idx 
on products 
using hnsw (embedding vector_cosine_ops);

-- 4. Create hybrid search RPC function
create or replace function match_products (
  query_embedding vector(1024),
  match_threshold float,
  match_count int,
  filter_category text default null
)
returns setof products
language plpgsql
as $$
begin
  return query
  select *
  from products
  where 1 - (products.embedding <=> query_embedding) > match_threshold
  and (filter_category is null or products.category = filter_category)
  order by products.embedding <=> query_embedding
  limit match_count;
end;
$$;
