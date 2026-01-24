# Price Alert Notification System Design

## Overview
This document outlines the architecture for "real" user notifications when product prices drop or stock status changes. The system will detect changes and deliver notifications via **In-App Notifications** (Phase 1) and **Email** (Phase 2).

## 1. Change Detection Architecture
How do we know when to send a notification?

### Option A: Event-Driven (Recommended for MVP)
Trigger checks immediately when an Admin updates a product.
*   **Flow**: Admin API updates product -> `afterUpdate` hook -> Check `product_alerts` table -> Create notification.
*   **Pros**: Real-time, simple.
*   **Cons**: Adds latency to admin operations.

### Option B: Polling / Cron Job
A scheduled job runs every hour to check all active alerts against current prices.
*   **Pros**: Decoupled, robust against burst updates.
*   **Cons**: Not real-time (up to 1 hour delay), requires Cron infrastructure (Vercel Cron / Supabase pg_cron).

### Option C: Database Triggers (Supabase Specific)
Use PostgreSQL triggers + Supabase Edge Functions.
*   **Flow**: DB Row Updated -> Trigger -> Edge Function -> Send Email.
*   **Pros**: Highly scalable, zero impact on app server.
*   **Cons**: Logic lives outside the main codebase (in SQL/Edge Functions), harder to debug.

**Recommendation**: **Option A (Event-Driven)** via a Service Layer wrapper. Since we already have a `src/services` layer, we can wrap the product update logic to trigger alerts asynchronously.

## 2. Notification Delivery (Phase 1: In-App)

### Data Model
New table: `notifications`
*   `id`: uuid
*   `user_id`: uuid (recipient)
*   `type`: 'price_alert' | 'system'
*   `title`: string
*   `message`: string
*   `read`: boolean (default false)
*   `created_at`: timestamp
*   `metadata`: jsonb (e.g., `{ product_id: "...", old_price: 100, new_price: 80 }`)

### UX
*   **Navbar**: Bell icon with unread badge count.
*   **Dropdown**: List of recent notifications.
*   **Click**: Marks as read and redirects to product page.

## 3. Implementation Plan

1.  **Database**: Create `notifications` table with RLS.
2.  **Service**:
    *   `createNotification(userId, ...)`
    *   `checkAlertsForProduct(productId, newPrice)`: Finds matching alerts and creates notifications.
3.  **Integration**:
    *   Modify `updateProduct` (admin function) to call `checkAlertsForProduct`.
4.  **UI**:
    *   Add `NotificationBell` component to Navbar.
    *   Add API route `/api/notifications` for polling/fetching.

## 4. Future Expansion (Email)
Once the `checkAlertsForProduct` logic is in place, adding Email is trivial: just add a `sendEmail(...)` call alongside `createNotification`.

---

**Next Step**: Should I proceed with creating the `notifications` table and the service logic?
