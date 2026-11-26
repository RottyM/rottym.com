import type { PipelineLane } from './types';

export type AiProviderId = 'gemini' | 'grok' | 'claude' | 'llama' | 'openai';

export interface AiModelOption {
  id: AiProviderId;
  label: string;
  defaultModel: string;
  envVar: string;
  configured: boolean;
}

export function getAvailableAiModels(): AiModelOption[] {
  return [
    {
      id: 'gemini',
      label: 'Gemini (Google)',
      defaultModel: process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash',
      envVar: 'GEMINI_API_KEY',
      configured: Boolean(process.env.GEMINI_API_KEY?.trim()),
    },
    {
      id: 'grok',
      label: 'Grok (xAI)',
      defaultModel: process.env.XAI_MODEL?.trim() || 'grok-3-mini',
      envVar: 'XAI_API_KEY',
      configured: Boolean(process.env.XAI_API_KEY?.trim()),
    },
    {
      id: 'claude',
      label: 'Claude (Anthropic)',
      defaultModel: process.env.ANTHROPIC_MODEL?.trim() || 'claude-3-5-haiku-latest',
      envVar: 'ANTHROPIC_API_KEY',
      configured: Boolean(process.env.ANTHROPIC_API_KEY?.trim()),
    },
    {
      id: 'llama',
      label: 'Llama (Groq)',
      defaultModel: process.env.GROQ_MODEL?.trim() || 'llama-3.3-70b-versatile',
      envVar: 'GROQ_API_KEY',
      configured: Boolean(process.env.GROQ_API_KEY?.trim()),
    },
    {
      id: 'openai',
      label: 'OpenAI',
      defaultModel: process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini',
      envVar: 'OPENAI_API_KEY',
      configured: Boolean(process.env.OPENAI_API_KEY?.trim()),
    },
  ];
}

export function buildBoundarySystemPrompt(params: {
  lane: PipelineLane;
  clientName: string;
}): string {
  const { lane, clientName } = params;

  const shared = [
    `You are operating inside the RottyM Command Center for workspace "${clientName}".`,
    'HARD BOUNDARIES (NON-NEGOTIABLE):',
    '1. TRUTH PREVAILS: Never invent statistics, dollar figures, quotes, dates, or URLs. Use only facts directly supported by the prompt or provided source URL.',
    '2. UNCERTAINTY: Flag any unverified claim explicitly with [UNVERIFIED].',
    '3. VOICE: Plain, direct, crisp engineering/operator tone. No fluff or engagement bait ("like, follow, repost").',
    '4. NO AUTONOMOUS ACTIONS: Never claim a post was published or auto-post. Output drafts only for Marley clearance + Rotty sign-off.',
  ];

  const laneGuidance: Record<PipelineLane, string> = {
    x: 'LANE: X (@CausingPanic1). Under 260 chars if single post. NO politics, NO entertainment. Defang any scam domains (e.g. example[.]com).',
    linkedin: 'LANE: LinkedIn. 2-4 crisp, informative sentences with a practical business/engineering takeaway.',
    'fb-ig': 'LANE: Facebook & Instagram (photo-first). Concise caption + note what real photo/official media is required.',
    article: 'LANE: Long-form Article. Include headline, verified key points, source list, and note any visual cover needed.',
  };

  return [...shared, laneGuidance[lane]].join('\n');
}

async function callOpenAiCompatible(params: {
  endpoint: string;
  apiKey: string;
  model: string;
  systemPrompt: string;
  userPrompt: string;
  providerLabel: string;
}): Promise<string> {
  const res = await fetch(params.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${params.apiKey}`,
    },
    body: JSON.stringify({
      model: params.model,
      messages: [
        { role: 'system', content: params.systemPrompt },
        { role: 'user', content: params.userPrompt },
      ],
      temperature: 0.4,
      max_tokens: 900,
    }),
    signal: AbortSignal.timeout(25000),
  });
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    error?: { message?: string };
  };
  if (!res.ok) {
    throw new Error(data.error?.message || `${params.providerLabel} HTTP ${res.status}`);
  }
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error(`${params.providerLabel} returned an empty response`);
  return text;
}

export async function runDeskModel(params: {
  provider: AiProviderId;
  systemPrompt: string;
  userPrompt: string;
}): Promise<{ output: string; modelUsed: string }> {
  const models = getAvailableAiModels();
  const chosen = models.find((m) => m.id === params.provider);
  if (!chosen) throw new Error(`Unsupported provider: ${params.provider}`);

  if (params.provider === 'gemini') {
    const key = process.env.GEMINI_API_KEY?.trim();
    if (!key) throw new Error('GEMINI_API_KEY is not configured in server environment.');
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(chosen.defaultModel)}:generateContent?key=${encodeURIComponent(key)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: params.systemPrompt }] },
          contents: [{ parts: [{ text: params.userPrompt }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 900 },
        }),
        signal: AbortSignal.timeout(25000),
      }
    );
    const data = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      error?: { message?: string };
    };
    if (!res.ok) throw new Error(data.error?.message || `Gemini HTTP ${res.status}`);
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) throw new Error('Gemini returned an empty response');
    return { output: text, modelUsed: `Gemini (${chosen.defaultModel})` };
  }

  if (params.provider === 'claude') {
    const key = process.env.ANTHROPIC_API_KEY?.trim();
    if (!key) throw new Error('ANTHROPIC_API_KEY is not configured in server environment.');
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: chosen.defaultModel,
        max_tokens: 900,
        system: params.systemPrompt,
        messages: [{ role: 'user', content: params.userPrompt }],
      }),
      signal: AbortSignal.timeout(25000),
    });
    const data = (await res.json()) as {
      content?: Array<{ text?: string }>;
      error?: { message?: string };
    };
    if (!res.ok) throw new Error(data.error?.message || `Anthropic HTTP ${res.status}`);
    const text = data.content?.[0]?.text?.trim();
    if (!text) throw new Error('Anthropic returned an empty response');
    return { output: text, modelUsed: `Claude (${chosen.defaultModel})` };
  }

  if (params.provider === 'grok') {
    const key = process.env.XAI_API_KEY?.trim();
    if (!key) throw new Error('XAI_API_KEY is not configured in server environment.');
    const output = await callOpenAiCompatible({
      endpoint: 'https://api.x.ai/v1/chat/completions',
      apiKey: key,
      model: chosen.defaultModel,
      systemPrompt: params.systemPrompt,
      userPrompt: params.userPrompt,
      providerLabel: 'Grok',
    });
    return { output, modelUsed: `Grok (${chosen.defaultModel})` };
  }

  if (params.provider === 'llama') {
    const key = process.env.GROQ_API_KEY?.trim();
    if (!key) throw new Error('GROQ_API_KEY is not configured in server environment.');
    const output = await callOpenAiCompatible({
      endpoint: 'https://api.groq.com/openai/v1/chat/completions',
      apiKey: key,
      model: chosen.defaultModel,
      systemPrompt: params.systemPrompt,
      userPrompt: params.userPrompt,
      providerLabel: 'Groq Llama',
    });
    return { output, modelUsed: `Llama (${chosen.defaultModel})` };
  }

  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  if (!openaiKey) throw new Error('OPENAI_API_KEY is not configured in server environment.');
  const output = await callOpenAiCompatible({
    endpoint: 'https://api.openai.com/v1/chat/completions',
    apiKey: openaiKey,
    model: chosen.defaultModel,
    systemPrompt: params.systemPrompt,
    userPrompt: params.userPrompt,
    providerLabel: 'OpenAI',
  });
  return { output, modelUsed: `OpenAI (${chosen.defaultModel})` };
}
