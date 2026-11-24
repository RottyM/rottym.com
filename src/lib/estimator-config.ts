// src/lib/estimator-config.ts

export type TrackId =
  | 'local-launchpad'
  | 'booking-intake'
  | 'wordpress-escape'
  | 'fullstack-ai';

export type TechAddonId =
  | 'firebase'
  | 'aws-gcp'
  | 'headless-cms'
  | 'llm-rag'
  | 'ai-workflows';

export type CapabilityAddonId =
  | 'online-booking'
  | 'structured-intake'
  | 'wp-migration'
  | 'member-roles'
  | 'ai-chat-widget'
  | 'email-crm'
  | 'nova-seo';

export type DeliveryPace = 'standard' | 'accelerated';

export interface ProjectTrack {
  id: TrackId;
  code: string;
  tag: string;
  name: string;
  minPrice: number;
  maxPrice: number;
  openEndedMax?: boolean;
  minWeeks: number;
  maxWeeks: number;
  summary: string;
  highlights: string[];
  /** Capability or stack add-ons whose baseline version is already part of this track */
  baselineIncludedIds?: (TechAddonId | CapabilityAddonId)[];
  contactServiceSlug: string;
  contactServiceLabel: string;
}

export interface TechStackAddon {
  id: TechAddonId;
  name: string;
  shortLabel: string;
  minPrice: number;
  maxPrice: number;
  weeksImpact: number;
  description: string;
  aiFocused?: boolean;
}

export interface CapabilityAddon {
  id: CapabilityAddonId;
  name: string;
  shortLabel: string;
  minPrice: number;
  maxPrice: number;
  weeksImpact: number;
  description: string;
  aiFocused?: boolean;
}

export interface RoadmapPhase {
  step: string;
  tag: string;
  title: string;
  durationLabel: string;
  description: string;
  deliverables: string[];
}

export interface TopologyNode {
  layer: string;
  title: string;
  detail: string;
}

export interface EstimatorSelection {
  trackId: TrackId;
  techAddons: TechAddonId[];
  capabilityAddons: CapabilityAddonId[];
  pace: DeliveryPace;
}

export interface CalculatedEstimate {
  track: ProjectTrack;
  selectedTech: TechStackAddon[];
  selectedCapabilities: CapabilityAddon[];
  pace: DeliveryPace;
  minPrice: number;
  maxPrice: number;
  openEndedMax: boolean;
  formattedPriceRange: string;
  minWeeks: number;
  maxWeeks: number;
  formattedTimeline: string;
  pacePremiumRange: { min: number; max: number } | null;
  roadmap: RoadmapPhase[];
  topology: TopologyNode[];
  jsonPayload: Record<string, unknown>;
  serializedSummary: string;
}

export const BASELINE_STACK = [
  'Next.js 16 (App Router)',
  'React 19',
  'TypeScript 5 Strict',
  'Tailwind CSS v4',
  'Vercel / Firebase Edge',
] as const;

export const ENTERPRISE_PEDIGREE = [
  'Disney',
  'FEMA',
  'BAE Systems',
  'FAA',
  'Leidos',
  'USA Today',
] as const;

export const PROJECT_TRACKS: ProjectTrack[] = [
  {
    id: 'local-launchpad',
    code: 'TRACK 01 // ENTRY',
    tag: 'Fast Local Presence',
    name: 'Local Launchpad',
    minPrice: 2500,
    maxPrice: 3500,
    minWeeks: 2,
    maxWeeks: 3,
    summary:
      '5–8 page high-performance site, mobile-first speed, quote forms, and local NoVA SEO setup.',
    highlights: [
      'Sub-second mobile load & Lighthouse 95+',
      'Conversion quote forms & Reston/NoVA SEO',
      '100% repository & domain ownership',
    ],
    baselineIncludedIds: ['structured-intake', 'nova-seo'],
    contactServiceSlug: 'local-launchpad',
    contactServiceLabel: 'Local Launchpad ($2,500 – $3,500)',
  },
  {
    id: 'booking-intake',
    code: 'TRACK 02 // AUTOMATION',
    tag: 'Most Popular',
    name: 'Booking & Intake',
    minPrice: 4200,
    maxPrice: 5800,
    minWeeks: 3,
    maxWeeks: 5,
    summary:
      'Full Local Launchpad build plus online calendar booking, multi-step client intake, and automated notifications.',
    highlights: [
      'Live calendar booking & staff routing',
      'Structured multi-step client intake',
      'Automated confirmation & team alerts',
    ],
    baselineIncludedIds: ['online-booking', 'structured-intake'],
    contactServiceSlug: 'booking-intake',
    contactServiceLabel: 'Booking & Intake ($4,200 – $5,800)',
  },
  {
    id: 'wordpress-escape',
    code: 'TRACK 03 // MIGRATION',
    tag: 'Performance Rebuild',
    name: 'WordPress Escape',
    minPrice: 3800,
    maxPrice: 6500,
    minWeeks: 3,
    maxWeeks: 5,
    summary:
      'Migrate off bloated WordPress to Next.js + Edge + Headless CMS with preserved SEO rankings and zero brittle plugins.',
    highlights: [
      'Full content, media & 301 SEO redirect map',
      'Headless CMS studio for easy editing',
      'Eliminates plugin updates & security alerts',
    ],
    baselineIncludedIds: ['headless-cms', 'wp-migration'],
    contactServiceSlug: 'performance-rebuild',
    contactServiceLabel: 'Performance Rebuild ($3,800 – $6,500)',
  },
  {
    id: 'fullstack-ai',
    code: 'TRACK 04 // PLATFORM & AI',
    tag: 'AI & Portals',
    name: 'Full-Stack & AI Platform',
    minPrice: 6500,
    maxPrice: 9500,
    openEndedMax: true,
    minWeeks: 5,
    maxWeeks: 8,
    summary:
      'Authenticated membership portals, real-time cloud apps, and grounded AI agents/workflows scoped to your operations.',
    highlights: [
      'Role-based portals & recurring billing',
      'Grounded LLM / RAG agents with guardrails',
      'Real-time webhooks & custom data pipelines',
    ],
    baselineIncludedIds: [],
    contactServiceSlug: 'fullstack-ai',
    contactServiceLabel: 'Full-Stack & AI Platform ($6,500 – $9,500+)',
  },
];

export const TECH_STACK_ADDONS: TechStackAddon[] = [
  {
    id: 'firebase',
    name: 'Firebase Integration',
    shortLabel: 'Firebase Cloud & Auth',
    minPrice: 400,
    maxPrice: 700,
    weeksImpact: 0.5,
    description:
      'Firebase Auth, hardened Firestore RBAC security rules, real-time state sync, and cloud media storage.',
  },
  {
    id: 'aws-gcp',
    name: 'AWS / GCP Cloud Infrastructure',
    shortLabel: 'AWS / GCP Pipeline',
    minPrice: 600,
    maxPrice: 1100,
    weeksImpact: 0.5,
    description:
      'Serverless containers, presigned S3/GCS document vaults, Secrets Manager, and isolated webhook workers.',
  },
  {
    id: 'headless-cms',
    name: 'Headless CMS Setup',
    shortLabel: 'Sanity / Headless CMS',
    minPrice: 500,
    maxPrice: 900,
    weeksImpact: 0.5,
    description:
      'Custom Sanity Studio visual editor, structured content schemas, live preview, and instant edge revalidation.',
  },
  {
    id: 'llm-rag',
    name: 'LLM / RAG Agent Deployment',
    shortLabel: 'LLM / Grounded RAG Agent',
    minPrice: 1200,
    maxPrice: 2000,
    weeksImpact: 1.0,
    description:
      'Server-side Gemini / LLM architecture grounded on your verified business data with strict prompt guardrails and rate limits.',
    aiFocused: true,
  },
  {
    id: 'ai-workflows',
    name: 'AI Workflow Automation',
    shortLabel: 'AI Workflow Automation',
    minPrice: 900,
    maxPrice: 1600,
    weeksImpact: 1.0,
    description:
      'Automated lead triage, document summarization, CRM sync, and multi-step operational triggers with human-in-the-loop controls.',
    aiFocused: true,
  },
];

export const CAPABILITY_ADDONS: CapabilityAddon[] = [
  {
    id: 'online-booking',
    name: 'Online Booking & Calendar Sync',
    shortLabel: 'Online Booking Sync',
    minPrice: 600,
    maxPrice: 900,
    weeksImpact: 0.5,
    description:
      'Two-way Google / Outlook calendar sync, buffer rules, service routing, and automated reschedule flows.',
  },
  {
    id: 'structured-intake',
    name: 'Structured Intake & Quote Forms',
    shortLabel: 'Multi-Step Intake Forms',
    minPrice: 350,
    maxPrice: 550,
    weeksImpact: 0.5,
    description:
      'Conditional multi-step qualification forms, file uploads, schema validation, and formatted quote routing.',
  },
  {
    id: 'wp-migration',
    name: 'WordPress Migration & SEO Redirects',
    shortLabel: 'WP Migration & 301 Map',
    minPrice: 700,
    maxPrice: 1200,
    weeksImpact: 1.0,
    description:
      'Zero-downtime content & media extraction, exact 301 URL redirect matrix, and search equity preservation.',
  },
  {
    id: 'member-roles',
    name: 'Member Roles & Recurring Billing',
    shortLabel: 'Member Portal & Billing',
    minPrice: 1400,
    maxPrice: 2200,
    weeksImpact: 1.5,
    description:
      'Authenticated member hub, tiered permissions, rolling subscriptions, and webhook-backed Stripe / PayPal billing.',
  },
  {
    id: 'ai-chat-widget',
    name: 'Interactive AI Scope / Chat Widget',
    shortLabel: 'AI Scope & Chat Concierge',
    minPrice: 1100,
    maxPrice: 1800,
    weeksImpact: 1.0,
    description:
      'Custom-branded client-facing AI assistant for 24/7 qualification, FAQ answers, and structured handoff to your team.',
    aiFocused: true,
  },
  {
    id: 'email-crm',
    name: 'Automated Email & CRM Workflows',
    shortLabel: 'Email & CRM Sync',
    minPrice: 550,
    maxPrice: 900,
    weeksImpact: 0.5,
    description:
      'Transactional notifications, MailChimp / HubSpot / Resend tagging, and UTM campaign attribution pipelines.',
  },
  {
    id: 'nova-seo',
    name: 'Local NoVA SEO & Lighthouse 95+',
    shortLabel: 'NoVA SEO & CWV 95+',
    minPrice: 300,
    maxPrice: 500,
    weeksImpact: 0.5,
    description:
      'JSON-LD local business schema, service-area landing architecture, OpenGraph social cards, and Core Web Vitals verification.',
  },
];

export const DEFAULT_ESTIMATOR_SELECTION: EstimatorSelection = {
  trackId: 'fullstack-ai',
  techAddons: ['llm-rag', 'ai-workflows'],
  capabilityAddons: ['member-roles', 'ai-chat-widget'],
  pace: 'standard',
};

const roundToNearest50 = (n: number) => Math.round(n / 50) * 50;
const roundToHalfWeek = (n: number) => Math.max(1.5, Math.round(n * 2) / 2);

export function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('en-US')}`;
}

export function calculateEstimate(
  selection: EstimatorSelection
): CalculatedEstimate {
  const track =
    PROJECT_TRACKS.find((t) => t.id === selection.trackId) ?? PROJECT_TRACKS[0];

  const selectedTech = TECH_STACK_ADDONS.filter((item) =>
    selection.techAddons.includes(item.id)
  );
  const selectedCapabilities = CAPABILITY_ADDONS.filter((item) =>
    selection.capabilityAddons.includes(item.id)
  );

  const addonsMin =
    selectedTech.reduce((sum, item) => sum + item.minPrice, 0) +
    selectedCapabilities.reduce((sum, item) => sum + item.minPrice, 0);
  const addonsMax =
    selectedTech.reduce((sum, item) => sum + item.maxPrice, 0) +
    selectedCapabilities.reduce((sum, item) => sum + item.maxPrice, 0);

  const subtotalMin = track.minPrice + addonsMin;
  const subtotalMax = track.maxPrice + addonsMax;

  const isAccelerated = selection.pace === 'accelerated';
  // Accelerated pace: ~16.5% expedited premium (within 15–18% spec) & ~28% faster timeline (within 25–30% spec)
  const paceMultiplier = isAccelerated ? 1.165 : 1.0;
  const timeMultiplier = isAccelerated ? 0.72 : 1.0;

  const minPrice = isAccelerated
    ? roundToNearest50(subtotalMin * paceMultiplier)
    : subtotalMin;
  const maxPrice = isAccelerated
    ? roundToNearest50(subtotalMax * paceMultiplier)
    : subtotalMax;

  const pacePremiumRange = isAccelerated
    ? { min: minPrice - subtotalMin, max: maxPrice - subtotalMax }
    : null;

  const extraWeeks =
    selectedTech.reduce((sum, item) => sum + item.weeksImpact, 0) +
    selectedCapabilities.reduce((sum, item) => sum + item.weeksImpact, 0);

  const rawMinWeeks = (track.minWeeks + extraWeeks * 0.8) * timeMultiplier;
  const rawMaxWeeks = (track.maxWeeks + extraWeeks) * timeMultiplier;

  const minWeeks = roundToHalfWeek(rawMinWeeks);
  const maxWeeks = Math.max(minWeeks + 0.5, roundToHalfWeek(rawMaxWeeks));

  const openEndedMax = Boolean(track.openEndedMax);
  const formattedPriceRange = `${formatCurrency(minPrice)} – ${formatCurrency(maxPrice)}${openEndedMax ? '+' : ''}`;
  const formatWk = (w: number) => (Number.isInteger(w) ? `${w}` : w.toFixed(1));
  const formattedTimeline = `${formatWk(minWeeks)}–${formatWk(maxWeeks)} weeks`;

  // Dynamic Phase 03 & Phase 04 deliverables
  const buildDeliverables: string[] = [
    `Next.js 16 + TypeScript core build (${track.name})`,
  ];
  if (
    selection.techAddons.includes('headless-cms') ||
    track.id === 'wordpress-escape'
  ) {
    buildDeliverables.push('Headless CMS editorial studio & live preview');
  }
  if (
    selection.capabilityAddons.includes('wp-migration') ||
    track.id === 'wordpress-escape'
  ) {
    buildDeliverables.push('Legacy content extraction & 301 SEO redirect map');
  }
  if (selection.capabilityAddons.includes('member-roles')) {
    buildDeliverables.push('Role-based member portal & recurring billing sync');
  }
  if (
    selection.techAddons.includes('llm-rag') ||
    selection.capabilityAddons.includes('ai-chat-widget')
  ) {
    buildDeliverables.push(
      'Grounded Gemini AI endpoint, context guardrails & rate limiting'
    );
  }
  if (
    selection.techAddons.includes('ai-workflows') ||
    selection.capabilityAddons.includes('email-crm') ||
    selection.capabilityAddons.includes('online-booking')
  ) {
    buildDeliverables.push('Automated intake, booking & CRM webhook pipelines');
  }
  if (buildDeliverables.length < 3) {
    buildDeliverables.push(
      'Weekly staging walkthroughs & mobile responsiveness QA'
    );
  }

  const buildMinWk = Math.max(1, roundToHalfWeek(minWeeks - 1));
  const buildMaxWk = Math.max(buildMinWk + 0.5, roundToHalfWeek(maxWeeks - 1));

  const roadmap: RoadmapPhase[] = [
    {
      step: '01',
      tag: 'DISCOVERY',
      title: 'Discovery Call',
      durationLabel: '30 Minutes',
      description:
        'Clarify core business goals, must-have operational workflows, and technical constraints directly with Rottman.',
      deliverables: [
        'Workflow & bottleneck audit',
        'Stack & hosting fit check',
        'Zero sales pressure',
      ],
    },
    {
      step: '02',
      tag: 'ARCHITECTURE',
      title: 'Fixed Proposal',
      durationLabel: 'Days 1–2',
      description:
        'Lock exact fixed project price, milestone schedule, and target system architecture before a single line of code is billed.',
      deliverables: [
        'Fixed-price statement of work',
        'Data & API topology blueprint',
        'Zero hourly billing surprises',
      ],
    },
    {
      step: '03',
      tag: isAccelerated ? 'ACCELERATED SPRINT' : 'MODERN STACK',
      title: 'Build & Review',
      durationLabel: `Weeks 1–${formatWk(buildMaxWk)}`,
      description:
        'Weekly staging check-ins on a live preview URL while engineering migrations, portals, workflows, and AI guardrails.',
      deliverables: buildDeliverables.slice(0, 4),
    },
    {
      step: '04',
      tag: 'LIVE HANDOFF',
      title: 'Launch & Handoff',
      durationLabel: `Week ${formatWk(maxWeeks)}`,
      description:
        'Final production cutover, Lighthouse 95+ validation, 100% Git repository transfer, and optional ongoing care ($99–$250/mo).',
      deliverables: [
        'Lighthouse 95+ & security verification',
        '100% code & domain ownership transfer',
        'Admin walkthrough + optional care plan',
      ],
    },
  ];

  // Dynamic System Topology for AI Studio visualization
  const topology: TopologyNode[] = [
    {
      layer: 'PRESENTATION',
      title: 'Next.js 16 App Router',
      detail: 'React 19 · Tailwind v4 · Edge CDN',
    },
    {
      layer:
        selection.techAddons.includes('llm-rag') ||
        selection.capabilityAddons.includes('ai-chat-widget')
          ? 'INTELLIGENCE'
          : 'SERVER ROUTES',
      title:
        selection.techAddons.includes('llm-rag') ||
        selection.capabilityAddons.includes('ai-chat-widget')
          ? 'Grounded Gemini Route'
          : 'Typed API Route Handlers',
      detail:
        selection.techAddons.includes('llm-rag') ||
        selection.capabilityAddons.includes('ai-chat-widget')
          ? 'Context Fencing · Schema Guardrails · Rate Limit'
          : 'Schema Validation · Zero-Plugin Attack Surface',
    },
    {
      layer: 'OPERATIONS',
      title: selection.capabilityAddons.includes('member-roles')
        ? 'Auth Portal & Billing Sync'
        : selection.techAddons.includes('ai-workflows')
          ? 'Autonomous Workflow Webhooks'
          : selection.techAddons.includes('headless-cms') ||
              track.id === 'wordpress-escape'
            ? 'Headless CMS Studio'
            : 'Lead & Booking Pipeline',
      detail: selection.capabilityAddons.includes('member-roles')
        ? 'RBAC Roles · Rolling Renewals · Webhook Ledger'
        : selection.techAddons.includes('ai-workflows')
          ? 'Event Triggers · Lead Triage · Instant Alerts'
          : 'Structured Content · Instant Edge Revalidation',
    },
    {
      layer: 'OWNERSHIP',
      title: selection.techAddons.includes('firebase')
        ? 'Firebase / Cloud Persistence'
        : selection.techAddons.includes('aws-gcp')
          ? 'AWS / GCP Dedicated Infra'
          : '100% Client Git & Edge Host',
      detail: 'Zero Vendor Lock-in · Full Repo Transfer',
    },
  ];

  const jsonPayload = {
    track: track.id,
    track_name: track.name,
    delivery_pace: selection.pace,
    estimated_investment: formattedPriceRange,
    estimated_timeline: formattedTimeline,
    cloud_ai_stack: selectedTech.map((t) => t.name),
    workflow_capabilities: selectedCapabilities.map((c) => c.name),
    ownership: '100% Client Git & Domain Ownership',
  };

  const summaryLines = [
    `--- Configured Scope Estimate (RottyM AI Studio) ---`,
    `Base Track: ${track.name} (${formatCurrency(track.minPrice)} – ${formatCurrency(track.maxPrice)}${track.openEndedMax ? '+' : ''})`,
    `Delivery Pace: ${isAccelerated ? 'Accelerated Sprint (+16.5% expedited · ~28% faster)' : 'Standard Pace (1.0x baseline)'}`,
    `Cloud & AI Stack Add-ons: ${selectedTech.length > 0 ? selectedTech.map((t) => `${t.name} (+${formatCurrency(t.minPrice)}–${formatCurrency(t.maxPrice)})`).join(', ') : 'Baseline Next.js + Edge Stack'}`,
    `Workflow & Capability Modules: ${selectedCapabilities.length > 0 ? selectedCapabilities.map((c) => `${c.name} (+${formatCurrency(c.minPrice)}–${formatCurrency(c.maxPrice)})`).join(', ') : 'Core Track Deliverables'}`,
    `Estimated Investment Range: ${formattedPriceRange} (Fixed after 30-min discovery call)`,
    `Estimated Delivery Timeline: ${formattedTimeline}`,
  ];

  return {
    track,
    selectedTech,
    selectedCapabilities,
    pace: selection.pace,
    minPrice,
    maxPrice,
    openEndedMax,
    formattedPriceRange,
    minWeeks,
    maxWeeks,
    formattedTimeline,
    pacePremiumRange,
    roadmap,
    topology,
    jsonPayload,
    serializedSummary: summaryLines.join('\n'),
  };
}
