export function aiEnabled(): boolean { return Boolean(process.env.OPENAI_API_KEY); }

export async function llmEmbedding(texts: string[]): Promise<number[][] | null> {
  if (!aiEnabled()) return null;
  try {
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({ model: 'text-embedding-3-small', input: texts }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (json.data as { embedding: number[] }[]).map(d => d.embedding);
  } catch { return null; }
}

export async function llmJSON<T>(system: string, user: string): Promise<T | null> {
  if (!aiEnabled()) return null;
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini', temperature: 0.2, response_format: { type: 'json_object' },
        messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
      }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const content: string = json.choices?.[0]?.message?.content ?? '';
    const m = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    return JSON.parse((m ? m[1] : content).trim()) as T;
  } catch { return null; }
}
