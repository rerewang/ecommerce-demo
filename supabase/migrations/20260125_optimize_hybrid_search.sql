-- Update match_products_hybrid to include similarity threshold filtering
-- This prevents low-relevance vector results (like iPad for "oil painting") from polluting the RRF ranking

CREATE OR REPLACE FUNCTION match_products_hybrid (
  query_text text,
  query_embedding vector(1024),
  match_count int,
  rrf_k int DEFAULT 60
)
RETURNS SETOF products
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH fts_results AS (
    SELECT id, row_number() OVER (ORDER BY ts_rank_cd(fts, websearch_to_tsquery('english', query_text)) DESC) as rank_fts
    FROM products
    WHERE fts @@ websearch_to_tsquery('english', query_text)
    LIMIT match_count * 3
  ),
  vec_results AS (
    SELECT id, row_number() OVER (ORDER BY embedding <=> query_embedding) as rank_vec
    FROM products
    WHERE embedding IS NOT NULL
      -- [Quality Gate] Only allow results with similarity > 0.5
      -- (1 - distance) > 0.5  <=>  distance < 0.5
      AND (1 - (embedding <=> query_embedding)) > 0.5
    ORDER BY embedding <=> query_embedding
    LIMIT match_count * 3
  ),
  merged_scores AS (
    SELECT 
      COALESCE(f.id, v.id) as id,
      COALESCE(1.0 / ($4 + f.rank_fts), 0.0) + COALESCE(1.0 / ($4 + v.rank_vec), 0.0) as rrf_score
    FROM fts_results f
    FULL OUTER JOIN vec_results v ON f.id = v.id
  )
  SELECT p.*
  FROM products p
  JOIN merged_scores m ON p.id = m.id
  ORDER BY m.rrf_score DESC
  LIMIT match_count;
END;
$$;
