import OpenAI from 'openai';

let client: OpenAI | null = null;

function getClient() {
  if (!client) {
    const apiKey = process.env.EMBEDDING_API_KEY || process.env.SILICONFLOW_API_KEY || 'dummy-key-for-build';
    const baseURL = process.env.EMBEDDING_BASE_URL || 'https://api.siliconflow.cn/v1';
    client = new OpenAI({
      apiKey,
      baseURL
    });
  }
  return client;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text) return Array(1024).fill(0); 

  const apiKey = process.env.EMBEDDING_API_KEY || process.env.SILICONFLOW_API_KEY;
  if (!apiKey) {
     console.warn('EMBEDDING_API_KEY is missing. Returning zero vector.');
     return Array(1024).fill(0);
  }

  try {
    const response = await getClient().embeddings.create({
      model: process.env.EMBEDDING_MODEL_NAME || 'BAAI/bge-m3',
      input: text.replace(/\n/g, ' '), 
      encoding_format: 'float'
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Failed to generate embedding:', error);
    // Return zero vector so downstream doesn't crash, but search won't work well
    return Array(1024).fill(0);
  }
}
