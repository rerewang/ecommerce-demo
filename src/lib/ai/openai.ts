import { createOpenAI } from '@ai-sdk/openai';

const apiKey = process.env.OPENAI_API_KEY || '';
const baseURL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

export const openai = createOpenAI({
  apiKey,
  baseURL,
});
