import { GoogleAuth } from 'google-auth-library';
import {
  SEED_ACTIVITY,
  SEED_CLIENTS,
  SEED_CREW,
  SEED_GATES,
  SEED_METRICS,
  SEED_PIPELINE,
} from './seed';
import type {
  ActivityEntry,
  ClientWorkspace,
  CrewMember,
  GateItem,
  MetricsSnapshot,
  PipelineCard,
} from './types';

const PROJECT_ID =
  process.env.FIREBASE_PROJECT_ID ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  process.env.GOOGLE_CLOUD_PROJECT ||
  'rottym-com-vibe';

const DB_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/datastore'],
});

type FirestoreFieldValue =
  | { nullValue: null }
  | { booleanValue: boolean }
  | { integerValue: string }
  | { doubleValue: number }
  | { timestampValue: string }
  | { stringValue: string }
  | { arrayValue: { values?: FirestoreFieldValue[] } }
  | { mapValue: { fields?: Record<string, FirestoreFieldValue> } };

async function getAccessToken(): Promise<string> {
  const client = await auth.getClient();
  const tokenResp = await client.getAccessToken();
  const token = typeof tokenResp === 'string' ? tokenResp : tokenResp?.token;
  if (!token) {
    throw new Error('Unable to acquire Google Cloud access token for Firestore.');
  }
  return token;
}

function toFirestoreValue(val: unknown): FirestoreFieldValue {
  if (val === null || val === undefined) return { nullValue: null };
  if (val instanceof Date) return { timestampValue: val.toISOString() };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') {
    return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
  }
  if (typeof val === 'string') return { stringValue: val };
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map((v) => toFirestoreValue(v)) } };
  }
  if (typeof val === 'object') {
    const fields: Record<string, FirestoreFieldValue> = {};
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      if (v !== undefined) fields[k] = toFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

function fromFirestoreValue(val: FirestoreFieldValue | undefined): unknown {
  if (!val) return null;
  if ('nullValue' in val) return null;
  if ('booleanValue' in val) return val.booleanValue;
  if ('integerValue' in val) return Number(val.integerValue);
  if ('doubleValue' in val) return val.doubleValue;
  if ('timestampValue' in val) return val.timestampValue;
  if ('stringValue' in val) return val.stringValue;
  if ('arrayValue' in val) {
    return (val.arrayValue.values || []).map((v) => fromFirestoreValue(v));
  }
  if ('mapValue' in val) {
    return fromFirestoreFields(val.mapValue.fields || {});
  }
  return null;
}

function fromFirestoreFields(
  fields: Record<string, FirestoreFieldValue> | undefined
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (!fields) return out;
  for (const [k, v] of Object.entries(fields)) {
    out[k] = fromFirestoreValue(v);
  }
  return out;
}

function toFirestoreFields(obj: Record<string, unknown>): Record<string, FirestoreFieldValue> {
  const out: Record<string, FirestoreFieldValue> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = toFirestoreValue(v);
  }
  return out;
}

export async function opsGetDoc<T>(collection: string, id: string): Promise<T | null> {
  const token = await getAccessToken();
  const res = await fetch(`${DB_BASE}/${collection}/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Firestore GET ${collection}/${id} failed (${res.status}): ${await res.text()}`);
  }
  const data = (await res.json()) as { fields?: Record<string, FirestoreFieldValue> };
  return fromFirestoreFields(data.fields) as T;
}

export async function opsSetDoc(
  collection: string,
  id: string,
  data: Record<string, unknown>
): Promise<void> {
  const token = await getAccessToken();
  const res = await fetch(`${DB_BASE}/${collection}/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields: toFirestoreFields(data) }),
  });
  if (!res.ok) {
    throw new Error(`Firestore SET ${collection}/${id} failed (${res.status}): ${await res.text()}`);
  }
}

export async function opsDeleteDoc(collection: string, id: string): Promise<void> {
  const token = await getAccessToken();
  const res = await fetch(`${DB_BASE}/${collection}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(`Firestore DELETE ${collection}/${id} failed (${res.status}): ${await res.text()}`);
  }
}

export async function opsListCollection<T>(collection: string, pageSize = 250): Promise<T[]> {
  const token = await getAccessToken();
  const res = await fetch(`${DB_BASE}/${collection}?pageSize=${pageSize}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (res.status === 404) return [];
  if (!res.ok) {
    throw new Error(`Firestore LIST ${collection} failed (${res.status}): ${await res.text()}`);
  }
  const data = (await res.json()) as {
    documents?: Array<{ fields?: Record<string, FirestoreFieldValue> }>;
  };
  return (data.documents || []).map((doc) => fromFirestoreFields(doc.fields) as T);
}

export async function opsQueryByClient<T>(collection: string, clientId: string): Promise<T[]> {
  const token = await getAccessToken();
  const res = await fetch(`${DB_BASE}:runQuery`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: collection }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'clientId' },
            op: 'EQUAL',
            value: { stringValue: clientId },
          },
        },
        limit: 300,
      },
    }),
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Firestore QUERY ${collection} failed (${res.status}): ${await res.text()}`);
  }
  const rows = (await res.json()) as Array<{
    document?: { fields?: Record<string, FirestoreFieldValue> };
  }>;
  return rows
    .filter((r) => Boolean(r.document?.fields))
    .map((r) => fromFirestoreFields(r.document?.fields) as T);
}

export async function appendOpsActivity(
  clientId: string,
  actor: string,
  action: string,
  target: string,
  text?: string
): Promise<ActivityEntry> {
  const entry: ActivityEntry = {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    clientId,
    timestamp: new Date().toISOString(),
    actor: actor.slice(0, 48),
    action: action.slice(0, 80),
    target: target.slice(0, 140),
    text: (text || `${actor} ${action} — ${target}`).slice(0, 280),
  };
  await opsSetDoc('ops_activity', entry.id, entry as unknown as Record<string, unknown>);
  return entry;
}

let seedCheckPromise: Promise<void> | null = null;

export async function ensureOpsSeeded(): Promise<void> {
  if (seedCheckPromise) return seedCheckPromise;
  seedCheckPromise = (async () => {
    const existing = await opsGetDoc<ClientWorkspace>('ops_clients', 'rottym');
    if (existing) return;

    await Promise.all([
      ...SEED_CLIENTS.map((c) => opsSetDoc('ops_clients', c.id, c as unknown as Record<string, unknown>)),
      ...SEED_CREW.map((m) => opsSetDoc('ops_crew', m.id, m as unknown as Record<string, unknown>)),
      ...SEED_PIPELINE.map((p) => opsSetDoc('ops_pipeline', p.id, p as unknown as Record<string, unknown>)),
      ...SEED_GATES.map((g) => opsSetDoc('ops_gates', g.id, g as unknown as Record<string, unknown>)),
      ...SEED_METRICS.map((m) => opsSetDoc('ops_metrics', m.id, m as unknown as Record<string, unknown>)),
      ...SEED_ACTIVITY.map((a) => opsSetDoc('ops_activity', a.id, a as unknown as Record<string, unknown>)),
    ]);
  })();

  try {
    await seedCheckPromise;
  } catch (err) {
    seedCheckPromise = null;
    throw err;
  }
}

export async function loadClientBoardSnapshot(clientId: string): Promise<{
  crew: CrewMember[];
  pipeline: PipelineCard[];
  gates: GateItem[];
  metrics: MetricsSnapshot | null;
  activity: ActivityEntry[];
}> {
  await ensureOpsSeeded();
  const [crew, pipeline, gates, metrics, activity] = await Promise.all([
    opsQueryByClient<CrewMember>('ops_crew', clientId),
    opsQueryByClient<PipelineCard>('ops_pipeline', clientId),
    opsQueryByClient<GateItem>('ops_gates', clientId),
    opsGetDoc<MetricsSnapshot>('ops_metrics', clientId),
    opsQueryByClient<ActivityEntry>('ops_activity', clientId),
  ]);

  pipeline.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  activity.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));

  return {
    crew,
    pipeline,
    gates,
    metrics,
    activity: activity.slice(0, 30),
  };
}
