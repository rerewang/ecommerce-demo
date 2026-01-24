import OpenAI from 'openai';

let client: OpenAI | null = null;

function getClient() {
  if (!client) {
    const apiKey = process.env.SILICONFLOW_API_KEY || 'dummy-key-for-build';
    client = new OpenAI({
      apiKey,
      baseURL: 'https://api.siliconflow.cn/v1' 
    });
  }
  return client;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text) return Array(1024).fill(0); 

  if (!process.env.SILICONFLOW_API_KEY) {
     console.warn('SILICONFLOW_API_KEY is missing. Returning zero vector.');
     return Array(1024).fill(0);
  }

  const response = await getClient().embeddings.create({
    model: 'BAAI/bge-m3',
    input: text.replace(/\n/g, ' '), 
    encoding_format: 'float'
  });
  return response.data[0].embedding;
}
