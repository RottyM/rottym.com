// src/lib/agent-knowledge.ts
import {
  PROJECT_TRACKS,
  TECH_STACK_ADDONS,
  CAPABILITY_ADDONS,
  ENTERPRISE_PEDIGREE,
  type CalculatedEstimate,
} from './estimator-config';
import { projects } from './projects';
import { clientTestimonials } from './testimonials';

export interface VerifiedCaseEvidence {
  slug: string;
  title: string;
  badge: string;
  stackLabel: string;
  summary: string;
  href: string;
}

export const VERIFIED_CASE_EVIDENCE: VerifiedCaseEvidence[] = [
  {
    slug: 'found-archives',
    title: 'Found Archives',
    badge: '99/100 LIGHTHOUSE',
    stackLabel: 'Next.js + Sanity Headless CMS + Vercel',
    summary:
      'Replaced a 28-plugin WordPress build (3.8s LCP) with a decoupled Next.js & Sanity studio hitting sub-350ms TTFB and integrating two sites cleanly.',
    href: '/portfolio/found-archives',
  },
  {
    slug: 'northern-virginia-writers',
    title: 'Northern Virginia Writers Club',
    badge: '~2X MEMBERSHIP',
    stackLabel: 'Collaboration Portal + Rolling Subscriptions + 3-Way Sync',
    summary:
      'Eliminated 12–15 hrs/wk of manual spreadsheet reconciliation with 12-month rolling renewals (90% auto-renewal opt-in), PayPal IPN telemetry, and MailChimp sync.',
    href: '/portfolio/northern-virginia-writers',
  },
  {
    slug: 'throttlelife',
    title: 'ThrottleLife',
    badge: '<200MS API',
    stackLabel: 'Next.js App Router + TypeScript + Real-Time Edge OS',
    summary:
      'Mobile-first operating system concept for motorcycle riders engineered for high-contrast touch UX, member accounts, and cloud-backed synchronization.',
    href: '/portfolio/throttlelife',
  },
];

export const AGENT_QUICK_PROMPTS = [
  'Analyze my configured scope & recommend architecture',
  'Compare WordPress Escape vs. keeping WordPress plugins',
  'How do grounded AI guardrails prevent hallucinations?',
  'How did Northern Virginia Writers Club automate renewals?',
] as const;

/**
 * Builds the grounded system instruction for the RottyM Solutions Architect AI Agent,
 * dynamically anchored to real portfolio projects, client testimonials, and fixed-scope tracks.
 */
export function buildAgentSystemPrompt(activeScopeSummary?: string): string {
  const tracksReference = PROJECT_TRACKS.map(
    (t) =>
      `- ${t.name}: $${t.minPrice.toLocaleString()}–$${t.maxPrice.toLocaleString()}${t.openEndedMax ? '+' : ''} (${t.minWeeks}–${t.maxWeeks} weeks) — ${t.summary}`
  ).join('\n');

  const techReference = TECH_STACK_ADDONS.map(
    (t) =>
      `- ${t.name}: +$${t.minPrice.toLocaleString()}–$${t.maxPrice.toLocaleString()} (+${t.weeksImpact} wk) — ${t.description}`
  ).join('\n');

  const capReference = CAPABILITY_ADDONS.map(
    (c) =>
      `- ${c.name}: +$${c.minPrice.toLocaleString()}–$${c.maxPrice.toLocaleString()} (+${c.weeksImpact} wk) — ${c.description}`
  ).join('\n');

  const portfolioReference = projects
    .filter((p) => p.section === 'modern')
    .slice(0, 7)
    .map(
      (p) =>
        `- ${p.title} (/portfolio/${p.slug}): [${p.highlightMetric}] Stack: ${p.tech.join(', ')}. ${p.summary}`
    )
    .join('\n');

  const testimonialsReference = clientTestimonials
    .map((t) => `- ${t.author} (${t.role}): "${t.heroQuote}"`)
    .join('\n');

  return `You are the **RottyM AI Solutions Architect**, an embedded technical strategy advisor on rottym.com representing **Rottman M. Mendez** (Reston, VA — serving Northern Virginia & remote clients nationwide).

## Brand Identity & Core Mantra
- Value Proposition: "Modern Websites & Real Workflows"
- Core Mantra: "AI can generate a website. It can't run your business."
- Differentiators:
  1. **100% Code & Domain Ownership** — clients own their Git repository, domain, and stack outright with zero agency hostage-taking or proprietary lock-in.
  2. **Fixed-Scope Transparency** — clear starting ranges; exact fixed price is locked in writing after a free 30-minute discovery call with Rottman (no runaway hourly billing).
  3. **Enterprise Engineering Pedigree** — architected directly by Rottman M. Mendez (no junior handoffs), backed by high-stakes systems experience across ${ENTERPRISE_PEDIGREE.join(', ')}.
- Direct Contact: rmendez@rottym.com | (202) 854-0954 | Reston, VA.
- Optional Post-Launch Ongoing Care: $99–$250/mo (never mandatory).

## Official Base Project Tracks
${tracksReference}

## Cloud & AI Stack Add-ons (Baseline includes Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, Edge Hosting)
${techReference}

## Workflow & Capability Add-on Modules
${capReference}

## Delivery Pace Options
- Standard Pace: 1.0x baseline investment and schedule.
- Accelerated Pace: +16.5% expedited sprint premium for ~28% faster delivery.

## Verified Case Studies & Client Outcomes (Cite ONLY these real details — never invent metrics)
${portfolioReference}

## Client Testimonials
${testimonialsReference}

## Hosting & Infrastructure Guidance (if asked)
- Static / Client-side builds can run at $0/mo on Firebase Hosting (Spark: 10 GB storage, 360 MB/day transfer, custom SSL).
- Live server-side LLM routes (/api/agent), webhooks, and SSR run on Firebase App Hosting / Frameworks Backend (Blaze pay-as-you-go) or Vercel Pro ($20/mo commercial seat).
- Clients keep domain registrars in their own name (Porkbun, Cloudflare, Dynadot, or existing providers) and simply point DNS A/TXT records.

${
  activeScopeSummary
    ? `## Visitor's Currently Configured Estimator Scope\n${activeScopeSummary}\n`
    : ''
}

## Response Formatting & Guardrails
1. Keep responses sharp, architectural, plain-English, and scannable (150–260 words max unless asked for deep detail). Use short markdown headings or bullet points.
2. When analyzing a configured scope:
   - Validate whether the chosen Base Track + Add-ons fit well together (point out if any add-on is already included in the base track's core scope so they don't overpay!).
   - Highlight the **Recommended Architecture**, **Key Operational Safeguards** (security, SEO 301s, or AI guardrails), and **1–2 relevant RottyM case studies** (e.g., Found Archives, Northern Virginia Writers Club, ThrottleLife, Men Talking LLC, or Rebecca's Cleaning).
3. NEVER invent discounts, hourly rates, fake case studies, or legally binding quotes. Always note that the final fixed quote is locked after a free 30-minute discovery call with Rottman.
4. End with a clear, low-pressure next step inviting them to **Stage a Discovery Request** right on this page or **Book a 30-Minute Call**.`;
}

/**
 * Deterministic architectural analysis fallback used if GEMINI_API_KEY is not yet configured
 * in local/staging environments or if upstream inference is temporarily unreachable.
 */
export function buildDeterministicScopeAnalysis(
  estimate: CalculatedEstimate,
  userPrompt?: string
): string {
  const { track, selectedTech, selectedCapabilities, pace } = estimate;
  const overlaps = [
    ...selectedTech.filter((t) => track.baselineIncludedIds?.includes(t.id)),
    ...selectedCapabilities.filter((c) =>
      track.baselineIncludedIds?.includes(c.id)
    ),
  ];

  const hasAI =
    selectedTech.some((t) => t.aiFocused) ||
    selectedCapabilities.some((c) => c.aiFocused) ||
    track.id === 'fullstack-ai';
  const hasPortal = selectedCapabilities.some((c) => c.id === 'member-roles');
  const hasWP =
    track.id === 'wordpress-escape' ||
    selectedCapabilities.some((c) => c.id === 'wp-migration');

  const matchedCases: string[] = [];
  if (hasWP) {
    matchedCases.push(
      '**Found Archives** — Replaced 28 fragile WordPress plugins with Next.js + Sanity CMS, achieving **99/100 Lighthouse** and **<350ms TTFB**.'
    );
  }
  if (hasPortal) {
    matchedCases.push(
      '**Northern Virginia Writers Club** — Automated 12-month rolling renewals (**90% auto-renewal opt-in**), saving officers **12+ hrs/week** and nearly doubling membership.'
    );
  }
  if (hasAI || matchedCases.length === 0) {
    matchedCases.push(
      '**ThrottleLife** — Sub-200ms Next.js App Router & TypeScript architecture built for real-time state sync and mobile resilience.'
    );
  }

  const promptQuestion = (userPrompt || '').toLowerCase();
  if (
    promptQuestion.includes('guardrail') ||
    promptQuestion.includes('hallucination') ||
    promptQuestion.includes('rag')
  ) {
    return `### Grounded AI Architecture & Guardrail Protocol

To ensure an AI agent actually supports your business without hallucinating prices or leaking data, RottyM isolates inference inside a server-side Next.js Route Handler (\`/api/agent\`):

- **Strict Context Fencing**: System prompts anchor exclusively to verified repository data (services, SOPs, and pricing ranges) rather than open-ended guessing.
- **Private Server-Side Keys & Rate Limiting**: API credentials never touch the browser; sliding-window IP rate limits and payload character caps prevent token abuse.
- **Deterministic Action Handoffs**: Instead of letting an LLM improvise bookings or quotes, the agent hands structured JSON payloads directly to validated lead/calendar pipelines.

**Next Step:** Use **Stage Discovery Request** alongside the console to attach your **${estimate.formattedPriceRange}** scope and lock exact architecture on a free 30-minute call with Rottman.`;
  }

  return `### Architectural Review: ${track.name} (${estimate.formattedPriceRange})

Your **${pace === 'accelerated' ? 'Accelerated Sprint' : 'Standard Pace'}** configuration targets **${estimate.formattedTimeline}** on a **Next.js 16 + React 19 + TypeScript** baseline with 100% Git repository ownership.

#### 1. Recommended System Topology
- **Core Runtime**: ${track.name} deployed on Edge infrastructure with sub-second Core Web Vitals${hasWP ? ' and a complete 301 SEO redirect matrix' : ''}.
- **Active Stack & Workflows**: ${
    selectedTech.length + selectedCapabilities.length > 0
      ? [...selectedTech.map((t) => t.shortLabel), ...selectedCapabilities.map((c) => c.shortLabel)].join(' · ')
      : 'Streamlined baseline Next.js architecture with conversion lead routing'
  }.${
    overlaps.length > 0
      ? `\n- **Scope Optimization Note**: *${overlaps.map((o) => o.name).join(', ')}* already has baseline coverage inside **${track.name}** — on our 30-minute call we'll verify if you only need the included baseline, trimming unnecessary add-on cost.`
      : ''
  }

#### 2. Proven RottyM Precedents
${matchedCases.map((c) => `- ${c}`).join('\n')}

#### 3. Recommended Next Step
Lock your exact fixed-scope number (no hourly billing surprises) by submitting **Stage Discovery Request** with this attached spec or booking a **30-Minute Discovery Call** directly with Rottman.`;
}
