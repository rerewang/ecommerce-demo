import { generateText } from 'ai';
import { openai } from './openai';

export async function translateQuery(query: string): Promise<string> {
  if (!query) return '';

  try {
    const { text } = await generateText({
      model: openai('gpt-4o'), // Or appropriate model
      system: `You are a search query optimizer for an e-commerce store.
Your goal is to convert the user's raw query into a concise, English, keyword-rich search term that will match product names and descriptions best.
- If the query is in Chinese (or other languages), translate it to English.
- If the query is vague, use more specific e-commerce keywords.
- Remove conversational filler words.
- Output ONLY the optimized query string, nothing else.`,
      prompt: query,
    });

    return text.trim();
  } catch (error) {
    console.error('Query translation failed:', error);
    return query; // Fallback to original query
  }
}
