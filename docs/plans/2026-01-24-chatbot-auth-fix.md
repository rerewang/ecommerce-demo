# Auth Fix Design for Chatbot

## Context
The chatbot API (`/api/chat`) runs on the server but makes HTTP calls to other internal APIs (`/api/orders/status`, etc.) to fetch data.
Currently, these internal calls fail with `401 Unauthorized` because the user's authentication cookies are not being forwarded from the chat request to the internal tool requests.

## Approaches

### Option 1: Header Forwarding (Recommended)
Pass the `Cookie` header from the incoming chat request down to the tool execution functions.
*   **Pros**: Simplest change, keeps existing Supabase Auth (Cookie) architecture, secure.
*   **Cons**: Requires threading headers through the tool execution context.

### Option 2: Server-Side Direct Call (Service Layer)
Instead of tools calling `fetch('http://localhost:3000/api/...')`, they should call the Service functions directly (e.g., `getOrderById(...)`).
*   **Pros**: Faster (no HTTP overhead), no auth/cookie issues (direct DB access via RLS client).
*   **Cons**: Tighter coupling, but actually cleaner for a monolith Next.js app.

### Option 3: Switch to Explicit JWT
Change the entire app to use Bearer tokens.
*   **Pros**: Standard for mobile/external consumers.
*   **Cons**: Massive refactor of frontend and backend, unnecessary for this stage.

## Recommendation: Option 2 (Service Layer Direct Call)
Since we are in a Next.js server environment (Route Handler), calling our own API endpoints via HTTP is actually an anti-pattern ("Serverless calling Serverless"). It introduces latency and auth complexity.

**We should modify `src/lib/ai/tools.ts` to call the `src/services/*.ts` functions directly.**
This automatically solves the Auth problem because we can pass the `supabase` client (initialized with the user's cookies) directly to the service functions.

## Plan
1.  Modify `src/app/api/chat/route.ts` to initialize a `supabase` client using `createServerClient()`.
2.  Pass this authenticated client to the `ToolLoopAgent` or context.
3.  Refactor `src/lib/ai/tools.ts` to accept a Supabase client and call Services instead of `fetch`.
