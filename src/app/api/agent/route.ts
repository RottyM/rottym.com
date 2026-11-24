// src/app/api/agent/route.ts
import { NextResponse } from 'next/server';
import {
  PROJECT_TRACKS,
  TECH_STACK_ADDONS,
  CAPABILITY_ADDONS,
  DEFAULT_ESTIMATOR_SELECTION,
  calculateEstimate,
  type EstimatorSelection,
  type TrackId,
  type TechAddonId,
  type CapabilityAddonId,
  type DeliveryPace,
} from '@/lib/estimator-config';
import {
  buildAgentSystemPrompt,
  buildDeterministicScopeAnalysis,
} from '@/lib/agent-knowledge';

interface IncomingMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Sliding-window in-memory rate limiter (15 requests per 10 minutes per client IP)
const RATE_WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 15;
const ipBuckets = new Map<string, number[]>();

function checkRateLimit(ip: string): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const cutoff = now - RATE_WINDOW_MS;

  // Periodic cleanup to keep memory bounded
  if (ipBuckets.size > 500) {
    for (const [key, timestamps] of ipBuckets.entries()) {
      const fresh = timestamps.filter((t) => t > cutoff);
      if (fresh.length === 0) ipBuckets.delete(key);
      else ipBuckets.set(key, fresh);
    }
  }

  const recent = (ipBuckets.get(ip) ?? []).filter((t) => t > cutoff);
  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    const oldest = recent[0] ?? now;
    const retryAfterSec = Math.max(1, Math.ceil((oldest + RATE_WINDOW_MS - now) / 1000));
    return { allowed: false, retryAfterSec };
  }

  recent.push(now);
  ipBuckets.set(ip, recent);
  return { allowed: true, retryAfterSec: 0 };
}

const VALID_TRACK_IDS = new Set<string>(PROJECT_TRACKS.map((t) => t.id));
const VALID_TECH_IDS = new Set<string>(TECH_STACK_ADDONS.map((t) => t.id));
const VALID_CAP_IDS = new Set<string>(CAPABILITY_ADDONS.map((c) => c.id));

function sanitizeSelection(raw: unknown): EstimatorSelection {
  if (!raw || typeof raw !== 'object') {
    return DEFAULT_ESTIMATOR_SELECTION;
  }
  const obj = raw as Record<string, unknown>;

  const trackId: TrackId =
    typeof obj.trackId === 'string' && VALID_TRACK_IDS.has(obj.trackId)
      ? (obj.trackId as TrackId)
      : DEFAULT_ESTIMATOR_SELECTION.trackId;

  const techAddons: TechAddonId[] = Array.isArray(obj.techAddons)
    ? obj.techAddons
        .filter((id): id is TechAddonId => typeof id === 'string' && VALID_TECH_IDS.has(id))
        .slice(0, TECH_STACK_ADDONS.length)
    : DEFAULT_ESTIMATOR_SELECTION.techAddons;

  const capabilityAddons: CapabilityAddonId[] = Array.isArray(obj.capabilityAddons)
    ? obj.capabilityAddons
        .filter((id): id is CapabilityAddonId => typeof id === 'string' && VALID_CAP_IDS.has(id))
        .slice(0, CAPABILITY_ADDONS.length)
    : DEFAULT_ESTIMATOR_SELECTION.capabilityAddons;

  const pace: DeliveryPace =
    obj.pace === 'accelerated' || obj.pace === 'standard'
      ? obj.pace
      : 'standard';

  return { trackId, techAddons, capabilityAddons, pace };
}

function sanitizeMessages(raw: unknown): IncomingMessage[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;

  const cleaned: IncomingMessage[] = [];
  for (const item of raw.slice(-12)) {
    if (!item || typeof item !== 'object') continue;
    const { role, content } = item as Record<string, unknown>;
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') {
      continue;
    }
    const trimmed = content.trim().slice(0, 2000);
    if (trimmed.length > 0) {
      cleaned.push({ role, content: trimmed });
    }
  }

  return cleaned.length > 0 ? cleaned : null;
}

export async function POST(req: Request) {
  try {
    const forwardedFor = req.headers.get('x-forwarded-for');
    const clientIp =
      forwardedFor?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'local-client';

    const rate = checkRateLimit(clientIp);
    if (!rate.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Rate limit reached to protect studio telemetry. Please wait ~${Math.ceil(rate.retryAfterSec / 60)} min, or submit a Discovery Request directly to Rottman.`,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(rate.retryAfterSec) },
        }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Invalid request payload.' },
        { status: 400 }
      );
    }

    const messages = sanitizeMessages((body as Record<string, unknown>).messages);
    if (!messages) {
      return NextResponse.json(
        { success: false, message: 'Please enter a question or scope prompt.' },
        { status: 400 }
      );
    }

    const selection = sanitizeSelection((body as Record<string, unknown>).selection);
    const estimate = calculateEstimate(selection);
    const latestUserPrompt =
      [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';

    const apiKey =
      process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    if (!apiKey) {
      return NextResponse.json({
        success: true,
        mode: 'deterministic-blueprint',
        reply: buildDeterministicScopeAnalysis(estimate, latestUserPrompt),
      });
    }

    const systemInstruction = buildAgentSystemPrompt(estimate.serializedSummary);

    // Ensure conversation begins with a user turn for Gemini generateContent API compliance
    const normalizedContents = messages.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));
    while (normalizedContents.length > 0 && normalizedContents[0].role !== 'user') {
      normalizedContents.shift();
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
          contents: normalizedContents,
          generationConfig: {
            temperature: 0.35,
            maxOutputTokens: 900,
          },
        }),
        signal: AbortSignal.timeout(18000),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text().catch(() => '');
      console.error('Gemini API upstream error:', geminiRes.status, errText);
      return NextResponse.json({
        success: true,
        mode: 'deterministic-blueprint',
        reply: buildDeterministicScopeAnalysis(estimate, latestUserPrompt),
      });
    }

    const geminiJson = (await geminiRes.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };

    const replyText = geminiJson.candidates?.[0]?.content?.parts
      ?.map((p) => p.text ?? '')
      .join('')
      .trim();

    if (!replyText) {
      return NextResponse.json({
        success: true,
        mode: 'deterministic-blueprint',
        reply: buildDeterministicScopeAnalysis(estimate, latestUserPrompt),
      });
    }

    return NextResponse.json({
      success: true,
      mode: 'gemini-grounded',
      model,
      reply: replyText,
    });
  } catch (error) {
    console.error('/api/agent error:', error);
    return NextResponse.json(
      {
        success: false,
        message:
          'Unable to reach the AI Architect right now. You can still stage your scope breakdown directly below or email rmendez@rottym.com.',
      },
      { status: 500 }
    );
  }
}
