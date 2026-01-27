import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

const apiKey = process.env.OPENAI_API_KEY || '';
const baseURL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

export const openai = createOpenAICompatible({
  apiKey,
  baseURL,
  name: 'openai-compatible',
});
