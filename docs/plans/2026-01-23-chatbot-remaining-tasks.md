# Chatbot Remaining Work & Best Practices

**Date:** 2026-01-23  
**Status:** V1 Complete (Optimization Phase)

## 1. Remaining Tasks (Prioritized)
###  Deferred to V2 (Feature Extensions)
These items require significant architectural changes or new backend services.

1.  **流式响应 UI 闪烁 (Streaming Flicker)**
    *   **Reason**: Current regex-based hiding is a "patch".
    *   **V2 Plan**: Migrate to Vercel AI SDK's `Data Stream Protocol` to separate text stream from data payload entirely.
2.  **真正的 RAG / 向量检索**
    *   **Reason**: Current SQL `ilike` is sufficient for small catalogs.
    *   **V2 Plan**: Integrate `pgvector` in Supabase for semantic search (e.g., "sad dog" -> matches "melancholy pug").
3.  **多模型切换 (Multi-model Switching)**
    *   **Reason**: Requires UI dropdown + backend logic routing.
    *   **V2 Plan**: Add settings panel in Widget for user to select model (Fast vs Smart).
4.  **自动化 E2E 异常测试**
    *   **Reason**: Simulating network failure in Playwright requires complex request interception setup.
5.  **SearchProducts 增强 (Advanced Filtering)**
    *   **Reason**: Need to upgrade `searchProducts` tool to support pagination, sort, and specific filters (style/medium).
    *   **V2 Plan**: Expand tool schema definition and Supabase query logic.
6.  **多轮澄清 (Multi-turn Clarification)**
    *   **Reason**: Current prompt encourages it, but no logic enforces "ask before search" flow.
    *   **V2 Plan**: Implement "Agentic" loop where AI can choose to ask a question instead of calling search immediately if parameters are vague.

---

## 2. Issues & Best Practices

### Issue: Streaming Content Flicker (JSON/Data Leak)
**Problem**: When AI streams structured data (JSON) alongside text, the raw JSON temporarily appears to the user before being parsed/hidden.
**Solution (Best Practice)**:
- **Data Stream Protocol**: Do not mix data in the text stream. Use a side-channel (e.g., specific protocol headers or event stream chunks) to send data objects. The client hook (`useChat`) handles these separately from `messages`.
- **Code Reference**:
  ```typescript
  // Server
  return streamText({
    ...
    onFinish: () => {
       dataStream.writeData({ type: 'product', payload: [...] })
    }
  })
  ```

### Issue: Prompt Injection
**Problem**: Users trying to trick the AI into revealing system prompts or acting maliciously.
**Solution (Implemented)**:
- **Instruction Defense**: Explicit refusal instructions in System Prompt.
- **Sandwich Defense**: Repeating core constraints at the end of the prompt context.
- **Identity Locking**: Hardcoded identity responses.

---

## 3. Test Cases for New Features

### Test Case 1: Image Fallback
**Scenario**: Product has an invalid image URL.
1. **Setup**: Mock API to return a product with `image_url: "invalid.jpg"`.
2. **Action**: Open Chat, trigger search.
3. **Expectation**: Card renders, but instead of a broken icon, it shows the default placeholder image.
4. **Code**:
   ```typescript
   // Component Logic
   <img src={src} onError={(e) => e.currentTarget.src = '/placeholder.png'} />
   ```

### Test Case 2: Disabled Button State
**Scenario**: User typing status.
1. **State**: Input is empty.
   - **Expectation**: Send button is greyed out (opacity-50), cursor not allowed.
2. **State**: Input has text, AI is generating.
   - **Expectation**: Send button shows Spinner (Loader2), clickable is disabled.
