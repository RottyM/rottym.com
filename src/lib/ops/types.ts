export type CrewSet = 'original' | 'new';

export type AgentStatus = 'active' | 'stand_down' | 'on_hold' | 'out' | 'on_call';

export type EngineFamily = 'all' | 'grok' | 'llama' | 'gemini' | 'claude';

export type PipelineLane = 'linkedin' | 'fb-ig' | 'x' | 'article';

export type ChannelId = 'linkedin' | 'meta' | 'x';

export type PipelineStage = 'pulled' | 'clearance' | 'drafted' | 'approved' | 'posted' | 'archived';

export type MarleyVerdictTag = 'NEW' | 'FOLLOW-UP' | 'REPEAT' | 'SKIP' | 'HOLD' | 'REJECTED';

export type PhotoStatus = 'needed' | 'missing' | 'attached' | 'verified' | 'not_needed';

export type ContentKind = 'post' | 'article' | 'image' | 'pull';

export type GateState = 'hold' | 'blocked' | 'awaiting' | 'resolved';

export interface ClientLaneConfig {
  id: PipelineLane;
  label: string;
  scheduleNote: string;
}

export interface ClientWorkspace {
  id: string;
  name: string;
  domain: string;
  subtitle: string;
  memberEmails: string[];
  lanes: ClientLaneConfig[];
  isTestClient?: boolean;
  updatedAt: string;
}

export interface CrewMember {
  id: string;
  clientId: string;
  agentId: string;
  name: string;
  set: CrewSet;
  model: string;
  engine: Exclude<EngineFamily, 'all'>;
  role: string;
  avatarUrl?: string;
  bio?: string;
  status: AgentStatus;
  statusNote?: string;
  usagePct?: number;
  resetNote?: string;
  updatedAt: string;
  updatedBy: string;
}

export interface PipelineLinks {
  fb?: string;
  ig?: string;
  linkedin?: string;
  x?: string;
}

export interface PipelineCard {
  id: string;
  clientId: string;
  title: string;
  lane: PipelineLane;
  channel: ChannelId;
  contentType: ContentKind;
  stage: PipelineStage;
  agentId: string;
  source: string;
  sourceUrl?: string;
  note?: string;
  draftCopy: string;
  flaggedNotes?: string[];
  marleyStatus: 'pending' | 'approved' | 'rejected';
  marleyNote?: string;
  marleyReviewedBy?: string;
  verdictTag?: MarleyVerdictTag;
  discrepancies?: string[];
  unverifiedClaims?: string[];
  artifactsNeeded?: string[];
  photoStatus?: PhotoStatus;
  eventDate?: string;
  readyForRotty: boolean;
  approvedBy?: string;
  claimedBy?: string;
  leaseExpiresAt?: string;
  jobDate?: string;
  sourceFile?: string;
  assetFile?: string;
  assetUrl?: string;
  assetSpec?: string;
  links?: PipelineLinks;
  createdAt: string;
  updatedAt: string;
}

export interface GateItem {
  id: string;
  clientId: string;
  label: string;
  state: GateState;
  detail: string;
  since: string;
  updatedAt: string;
}

export interface MetricsSnapshot {
  id: string;
  clientId: string;
  sessions: number | null;
  sessionsPeriod: string;
  generateLead: number | null;
  xFollowers: number | null;
  asOf: string;
  showroomPhase: string;
  showroomNote: string;
  updatedAt: string;
  updatedBy: string;
}

export interface ActivityEntry {
  id: string;
  clientId: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  text: string;
}

export interface ChatMessage {
  id: string;
  clientId: string;
  senderId: string;
  senderName: string;
  senderKind: 'bot' | 'operator';
  text: string;
  mentions?: string[];
  jobId?: string;
  jobTitle?: string;
  replyToId?: string;
  createdAt: string;
}

export interface OpsSignalPayload {
  id: string;
  clientId: string;
  signal: 'marley-approved' | 'marley-rejected' | 'ready-for-rotty' | 'posted';
  title: string;
  lane: PipelineLane;
  channel: ChannelId;
  stage: PipelineStage;
  sourceFile: string | null;
  sourceUrl: string | null;
  assetFile: string | null;
  assetUrl: string | null;
  readyForRotty: boolean;
  autoPostAllowed: false;
  marleyStatus: 'pending' | 'approved' | 'rejected';
  marleyNote: string | null;
  verdictTag: MarleyVerdictTag | null;
  photoStatus: PhotoStatus | null;
  eventDate: string | null;
  unverifiedClaims: string[];
  approvedBy: string | null;
  draftCopy: string;
  links: PipelineLinks | null;
  updatedAt: string;
}
