# RAG Search Implementation Plan

## Executive Summary
This document outlines the architecture for upgrading the current keyword-based search to a semantic search system using **Supabase pgvector** and **SiliconFlow embeddings (BAAI/bge-m3)**.

**Key Change**: We will move product write operations (`create`/`update`) and search operations from client-side services to **Next.js Server Actions**. This is critical to secure the SiliconFlow API key, which cannot be exposed to the browser.

---

## 1. Database Schema (`supabase/migrations`)

We will enable the vector extension and add vector support to the `products` table.

### 1.1 Extensions & Columns
```sql
-- Enable pgvector
create extension if not exists vector;

-- Add embedding column (1024 dimensions for BAAI/bge-m3)
alter table products 
add column if not exists embedding vector(1024);

-- Create HNSW index for performance
create index if not exists products_embedding_idx 
on products 
using hnsw (embedding vector_cosine_ops);
```

### 1.2 RPC Function for Hybrid Search
We will create a function that filters by similarity AND metadata (category, keywords).

```sql
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
```

---

## 2. Infrastructure (Server-Side)

### 2.1 Embedding Service (`src/lib/ai/embedding.ts`)
A dedicated service to handle communication with SiliconFlow.

```typescript
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.SILICONFLOW_API_KEY,
  baseURL: 'https://api.siliconflow.cn/v1' // or .com
});

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await client.embeddings.create({
    model: 'BAAI/bge-m3',
    input: text.replace(/\n/g, ' '), // Normalize text
    encoding_format: 'float'
  });
  return response.data[0].embedding;
}
```

### 2.2 Server Actions (`src/app/actions/products.ts`)
**New File**. Replaces direct client-side service calls for secure operations.

**Features**:
1.  **Search**: Accepts query string -> Generates embedding -> Calls RPC -> Returns products.
2.  **Create/Update**: Accepts product data -> Generates embedding (combining name/desc/features) -> Writes to DB.

```typescript
'use server'

import { generateEmbedding } from '@/lib/ai/embedding'
import { createServerActionClient } from '@supabase/auth-helpers-nextjs' // or equivalent
import { cookies } from 'next/headers'

// ... Action implementations
```

---

## 3. Data Synchronization

### 3.1 Real-time Sync (Admin Dashboard)
Refactor `src/components/admin/ProductForm.tsx` to use the new Server Actions instead of calling `src/services/products.ts` directly.

- **Old Flow**: Form -> `createProduct` (Client Service) -> Supabase (Direct)
- **New Flow**: Form -> `createProductAction` (Server Action) -> Generate Embedding + Insert DB

### 3.2 Backfill Script (`scripts/generate-embeddings.ts`)
A standalone script to process existing products.

**Logic**:
1. Fetch products where `embedding` is null.
2. Loop through them (batch size: 10).
3. Generate embedding: `text = "${product.name}: ${product.description} ${features}"`
4. Update row.
5. Sleep 100ms (Rate limit safety).

---

## 4. Implementation Steps

### Phase 1: Foundation
1.  Add `SILICONFLOW_API_KEY` to `.env.local`.
2.  Run SQL migrations (Extension, Column, Index, RPC).
3.  Implement `src/lib/ai/embedding.ts`.

### Phase 2: Server Actions & Search
1.  Create `src/app/actions/product-actions.ts`.
2.  Implement `searchProductsAction`.
3.  Update `src/services/products.ts` to expose a new `searchSemanticProducts` function that calls the Server Action (or call action directly from UI).
4.  Update generic Search UI to use semantic search.

### Phase 3: Admin Write Operations
1.  Implement `createProductAction` and `updateProductAction`.
2.  Refactor `ProductForm.tsx` to use these actions.
3.  Verify RLS policies allow the Server Action (which uses `cookies()` for auth) to write.

### Phase 4: Data Backfill
1.  Write and run `scripts/generate-embeddings.ts`.

---

## 5. Security & Performance
- **API Keys**: SiliconFlow key is never exposed to client (Server Actions only).
- **Latency**: Embedding generation adds ~200-500ms to "Save Product". Acceptable for Admin UI.
- **Rate Limits**: SiliconFlow has limits. Backfill script must handle 429 errors.
- **RLS**: The RPC function `match_products` bypasses RLS if marked `security definer`. We should keep it `security invoker` (default) so it respects user permissions (e.g., only showing active products).

## 6. Verification Plan
- **Unit**: Mock OpenAI client, test `generateEmbedding`.
- **Integration**: Insert product via Action -> Query via RPC -> Verify match.
- **Manual**: Search for "warm jacket" when product is "Red Parka" (semantic match).
