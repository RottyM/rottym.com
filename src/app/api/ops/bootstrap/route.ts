import { NextResponse } from 'next/server';
import {
  authorizeOpsUser,
  forbiddenResponse,
  getAuthorizedClientsForUser,
  unauthorizedResponse,
} from '@/lib/ops/auth';
import { appendOpsActivity, ensureOpsSeeded, opsGetDoc, opsSetDoc } from '@/lib/ops/firestore-rest';
import type { ClientWorkspace, CrewMember, MetricsSnapshot } from '@/lib/ops/types';

export async function GET(request: Request) {
  const user = await authorizeOpsUser(request);
  if (!user) return unauthorizedResponse();

  const clients = await getAuthorizedClientsForUser(user);
  if (clients.length === 0) {
    return forbiddenResponse('Your account is not assigned to any Command Center workspace.');
  }

  return NextResponse.json(
    {
      user: {
        uid: user.uid,
        email: user.email,
        name: user.name,
        isOwner: user.isOwner,
      },
      clients,
    },
    { status: 200, headers: { 'Cache-Control': 'no-store' } }
  );
}

export async function POST(request: Request) {
  const user = await authorizeOpsUser(request);
  if (!user) return unauthorizedResponse();
  if (!user.isOwner) return forbiddenResponse('Only the owner can create client workspaces.');

  await ensureOpsSeeded();

  let body: {
    id?: string;
    name?: string;
    domain?: string;
    subtitle?: string;
    memberEmails?: string[];
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const cleanId = (body.id || body.name || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 80) : '';
  if (!cleanId || !name) {
    return NextResponse.json({ error: 'Client id and name are required' }, { status: 400 });
  }

  const existing = await opsGetDoc<ClientWorkspace>('ops_clients', cleanId);
  if (existing) {
    return NextResponse.json({ error: 'Client id already exists' }, { status: 409 });
  }

  const now = new Date().toISOString();
  const members = Array.from(
    new Set(
      [
        user.email,
        ...(Array.isArray(body.memberEmails)
          ? body.memberEmails.map((e) => String(e).trim().toLowerCase()).filter(Boolean)
          : []),
      ]
    )
  );

  const workspace: ClientWorkspace = {
    id: cleanId,
    name,
    domain: (typeof body.domain === 'string' && body.domain.trim().slice(0, 80)) || `${cleanId}.rottym.com`,
    subtitle: (typeof body.subtitle === 'string' && body.subtitle.trim().slice(0, 120)) || 'Client Operations Board',
    memberEmails: members,
    lanes: [
      { id: 'linkedin', label: 'LinkedIn', scheduleNote: 'Scheduled' },
      { id: 'fb-ig', label: 'FB / IG', scheduleNote: 'Photo-first' },
      { id: 'x', label: 'X', scheduleNote: 'News & updates' },
      { id: 'article', label: 'Articles', scheduleNote: 'Long-form' },
    ],
    updatedAt: now,
  };

  const defaultCrew: CrewMember = {
    id: `${cleanId}__marley`,
    clientId: cleanId,
    agentId: 'marley',
    name: 'Marley',
    set: 'new',
    model: 'Meta Muse',
    engine: 'llama',
    role: 'Clearance & social review',
    status: 'active',
    updatedAt: now,
    updatedBy: user.name,
  };

  const defaultMetrics: MetricsSnapshot = {
    id: cleanId,
    clientId: cleanId,
    sessions: null,
    sessionsPeriod: 'Not entered',
    generateLead: null,
    xFollowers: null,
    asOf: now.slice(0, 10),
    showroomPhase: 'Onboarding',
    showroomNote: 'New client workspace initialized.',
    updatedAt: now,
    updatedBy: user.name,
  };

  await Promise.all([
    opsSetDoc('ops_clients', cleanId, workspace as unknown as Record<string, unknown>),
    opsSetDoc('ops_crew', defaultCrew.id, defaultCrew as unknown as Record<string, unknown>),
    opsSetDoc('ops_metrics', cleanId, defaultMetrics as unknown as Record<string, unknown>),
    appendOpsActivity(cleanId, user.name, 'created client workspace', name),
  ]);

  return NextResponse.json({ ok: true, client: workspace }, { status: 201, headers: { 'Cache-Control': 'no-store' } });
}
