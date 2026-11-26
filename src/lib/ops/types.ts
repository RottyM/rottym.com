export type CrewSet = 'original' | 'new';

export type AgentStatus = 'active' | 'stand_down' | 'on_hold' | 'out' | 'on_call';

export type ConnectorAlertStatus = 'ok' | 'disconnected' | 'wrong_account' | 'error';

export interface ConnectorAlert {
  status: ConnectorAlertStatus;
  platform?: string;
  account?: string;
  expectedAccount?: string;
  message: string;
  updatedAt: string;
}

export type EngineFamily = 'all' | 'grok' | 'llama' | 'gemini' | 'claude';

export type PipelineLane = 'linkedin' | 'fb-ig' | 'x' | 'article';

export type ChannelId = 'linkedin' | 'meta' | 'x';

export type PlatformKey = 'fb' | 'ig' | 'linkedin' | 'x';

export type PipelineStage = 'pulled' | 'clearance' | 'drafted' | 'approved' | 'posted' | 'archived';

export type MarleyVerdictTag = 'NEW' | 'FOLLOW-UP' | 'REPEAT' | 'SKIP' | 'HOLD' | 'REJECTED';

export type PhotoStatus = 'needed' | 'missing' | 'attached' | 'verified' | 'not_needed';

export type CardAssetState = 'attached' | 'missing' | 'not_needed';

export type JobAssetKind =
  | 'image'
  | 'video'
  | 'carousel_slide'
  | 'flyer'
  | 'video_frame'
  | 'meme';

export type JobAssetPlatform = PlatformKey | 'all';

export type JobAssetStatus =
  | 'needed'
  | 'in_progress'
  | 'delivered'
  | 'approved'
  | 'rejected';

export interface JobAsset {
  id: string;
  url?: string;
  file?: string;
  kind: JobAssetKind;
  platform: JobAssetPlatform;
  order: number;
  spec?: string;
  altText?: string;
  caption?: string;
  credit?: string;
  sourceUrl?: string;
  label?: string;
  status: JobAssetStatus;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  addedBy: string;
  createdAt: string;
  updatedAt: string;
}

export type ContentKind = 'post' | 'article' | 'image' | 'pull';

export type GateState = 'hold' | 'blocked' | 'awaiting' | 'resolved';

export type RequestStatus = 'pending' | 'decided' | 'done' | 'dismissed' | 'expired';

export type RequestUrgency = 'normal' | 'high' | 'urgent';

export interface RequestActionOption {
  id: string;
  label: string;
  tone?: 'primary' | 'secondary' | 'danger';
}

export interface OpsRequest {
  id: string;
  clientId: string;
  title: string;
  context: string;
  preparedText?: string;
  preparedUrl?: string;
  preparedFile?: string;
  jobId?: string;
  jobTitle?: string;
  raisedBy: string;
  raisedByName: string;
  raisedAt: string;
  relevantUntil?: string;
  urgency?: RequestUrgency;
  actions: RequestActionOption[];
  status: RequestStatus;
  decision?: string;
  decisionLabel?: string;
  decidedBy?: string;
  decidedAt?: string;
  outcomeNote?: string;
  outcomeUrl?: string;
  completedBy?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

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
  connectorAlert?: ConnectorAlert;
  usagePct?: number;
  resetNote?: string;
  lastChatReadAt?: string;
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
  noImageNeededBy?: string;
  noImageNeededAt?: string;
  eventDate?: string;
  readyForRotty: boolean;
  approvedBy?: string;
  assignedTo?: string;
  postIt?: boolean;
  postItAt?: string;
  postItBy?: string;
  claimedBy?: string;
  leaseExpiresAt?: string;
  jobDate?: string;
  sourceFile?: string;
  assetFile?: string;
  assetUrl?: string;
  assetSpec?: string;
  assets?: JobAsset[];
  postedAssets?: Partial<Record<PlatformKey, string[]>>;
  targetPlatforms?: PlatformKey[];
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
  kind?: 'job' | 'request';
  clientId: string;
  signal:
    | 'post-it'
    | 'marley-approved'
    | 'marley-rejected'
    | 'ready-for-rotty'
    | 'posted'
    | 'request-decided'
    | 'request-done';
  title: string;
  lane: PipelineLane;
  channel: ChannelId;
  stage: PipelineStage;
  sourceFile: string | null;
  sourceUrl: string | null;
  assetFile: string | null;
  assetUrl: string | null;
  readyForRotty: boolean;
  postIt: boolean;
  postItAt: string | null;
  postItBy: string | null;
  autoPostAllowed: false;
  marleyStatus: 'pending' | 'approved' | 'rejected';
  marleyNote: string | null;
  verdictTag: MarleyVerdictTag | null;
  photoStatus: PhotoStatus | null;
  assetState: CardAssetState;
  eventDate: string | null;
  unverifiedClaims: string[];
  approvedBy: string | null;
  assignedTo: string | null;
  targetPlatforms?: PlatformKey[];
  pendingPlatforms?: PlatformKey[];
  draftCopy: string;
  links: PipelineLinks | null;
  request?: OpsRequest;
  updatedAt: string;
}
