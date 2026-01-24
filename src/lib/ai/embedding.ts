import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.SILICONFLOW_API_KEY,
  baseURL: 'https://api.siliconflow.cn/v1' 
});

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text) return Array(1024).fill(0); // Handle empty input safely

  const response = await client.embeddings.create({
    model: 'BAAI/bge-m3',
    input: text.replace(/\n/g, ' '), // Normalize text
    encoding_format: 'float'
  });
  return response.data[0].embedding;
}
