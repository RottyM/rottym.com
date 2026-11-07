// src/lib/projects.ts

export interface CaseStudyData {
  eyebrow?: string;
  heroHeadline: string;
  heroSubtitle: string;
  verifiedBadge?: string;
  liveUrl?: string;
  liveUrlLabel?: string;
  proofBar?: {
    title: string;
    description: string;
    chips: string[];
  };
  metrics: {
    label: string;
    value: string;
    subtext: string;
  }[];
  specs: {
    label: string;
    value: string;
    subtext?: string;
    chips?: string[];
  }[];
  crisis: {
    eyebrow: string;
    heading: string;
    description: string[];
    threat: string;
    painPoints: {
      title: string;
      description: string;
    }[];
  };
  pillarsHeading: string;
  pillarsSubheading: string;
  pillars: {
    index: string;
    tag: string;
    title: string;
    description: string;
    bullets: string[];
  }[];
  topology: {
    eyebrow: string;
    heading: string;
    subtext: string;
    pulseBadge: string;
    steps: {
      step: string;
      title: string;
      description: string;
      code: string;
    }[];
  };
  comparison: {
    beforeTitle: string;
    beforeSubtitle: string;
    beforeItems: string[];
    afterTitle: string;
    afterSubtitle: string;
    afterItems: string[];
  };
  testimonial: {
    quote: string;
    author: string;
    role: string;
    avatarText: string;
  };
  guarantees: string[];
}

export interface Project {
  slug: string;
  title: string;
  client?: string;
  role: string;
  category: string;
  tag: string;
  section: 'modern' | 'enterprise';
  featured?: boolean;
  tech: string[];
  img: string;
  highlightMetric: string;
  summary: string;
  challenge?: string;
  solution?: string;
  beforeAfter?: {
    before: string;
    after: string;
    result: string;
  };
  details: string;
  caseStudy?: CaseStudyData;
}

export const projects: Project[] = [
  // --- Section 1: Modern Web Platforms & Client Systems ---
  {
    slug: "throttlelife",
    title: "ThrottleLife",
    role: "Concept & Architecture",
    category: "Platform Architecture",
    tag: "Next.js Stack",
    section: "modern",
    featured: true,
    tech: ["Next.js (App Router)", "TypeScript", "Tailwind CSS", "Real-Time APIs", "Vercel"],
    img: "/images/apps/throttlelife.png",
    highlightMetric: "Sub-200ms API responses · Mobile-first responsive OS",
    summary: "A high-performance digital ecosystem and operating system concept for motorcycle riders, featuring real-time data handling, member accounts, and cloud-backed synchronization.",
    challenge: "Creating an instantaneous, tactile mobile interface for active riders that requires high contrast, offline resilience, and fast telemetry handling without UI lag.",
    solution: "Engineered with Next.js App Router, edge caching, and lightweight state management for fluid mobile performance under unpredictable network conditions.",
    details: "Built to demonstrate modern application architecture, reactive state synchronization, and touch-optimized UI design patterns."
  },
  {
    slug: "family-os",
    title: "Family OS",
    role: "Full-Stack Engineer",
    category: "Full-Stack System",
    tag: "Cloud Platform",
    section: "modern",
    featured: true,
    tech: ["Next.js", "React", "Firebase", "Role-Based Auth", "Tailwind CSS"],
    img: "/images/apps/familyos.png",
    highlightMetric: "Multi-user role security · Automated household workflows",
    summary: "A centralized digital command center for household coordination, scheduling, chore automation, and secure family document vaults.",
    challenge: "Managing asynchronous multi-user permissions, real-time sync across family devices, and strict data privacy without complex server management.",
    solution: "Architected with secure Firestore security rules, granular role-based access control (RBAC), and optimistic UI updates for zero perceptible latency.",
    details: "Focuses on clean data architecture, end-to-end type safety with TypeScript, and seamless cross-device mobile responsiveness."
  },
  {
    slug: "found-archives",
    title: "Found Archives",
    role: "Full-Stack Web Developer",
    category: "Headless CMS & Migration",
    tag: "WordPress Escape",
    section: "modern",
    featured: true,
    tech: ["Next.js", "Sanity Headless CMS", "TypeScript", "Vercel", "Tailwind CSS"],
    img: "/images/portfolio/found-archives-homepage.png",
    highlightMetric: "99/100 Lighthouse Performance · <350ms TTFB · Zero plugin vulnerabilities",
    summary: "Digital archives and historical curation platform built with modern headless architecture for museum-grade visual storytelling.",
    challenge: "The client needed to replace a bloated, slow WordPress site that had frequent plugin conflicts and took over 3.8 seconds to load on mobile.",
    solution: "Migrated to a decoupled Next.js App Router architecture deployed on Vercel, paired with Sanity CMS for visual, real-time content modeling.",
    beforeAfter: {
      before: "Monolithic WordPress install with 28 active plugins, 3.8s LCP, slow database queries, and ongoing security update overhead.",
      after: "Decoupled Next.js static generation on Vercel backed by Sanity Headless CMS with automated edge revalidation.",
      result: "99/100 Lighthouse performance, sub-350ms TTFB, zero server maintenance, and an intuitive custom editorial studio for the curator."
    },
    details: "Demonstrates the tangible performance and reliability benefits of escaping bloated CMS platforms into serverless modern web tech."
  },
  {
    slug: "lori-eaton-writer",
    title: "Lori Eaton Author Platform",
    role: "Web Developer & Designer",
    category: "Author & Publishing",
    tag: "Next.js Stack",
    section: "modern",
    featured: true,
    tech: ["Next.js", "Sanity CMS", "Vercel", "Tailwind CSS", "Semantic SEO"],
    img: "/images/portfolio/lori-eaton-writer-homepage.png",
    highlightMetric: "100% SEO & Performance Score · Instant content updates",
    summary: "Clean, elegant author platform designed for literary showcases, reader engagement, and automated mailing list acquisition.",
    challenge: "Replacing generic website builders with an ultra-fast, branded portfolio that the author could independently manage without touching code.",
    solution: "Engineered with Next.js on Vercel, structured schema markup, OpenGraph previews, and custom Sanity CMS editorial workflows.",
    details: "Combines typography-first responsive design with accessible markup and rapid editorial publishing."
  },
  {
    slug: "northern-virginia-writers",
    title: "Northern Virginia Writers Club",
    role: "Lead Full Stack Engineer & System Architect",
    category: "Community & Membership Architecture",
    tag: "Member Platform",
    section: "modern",
    featured: true,
    tech: ["WordPress", "PMPro", "BuddyBoss", "MailChimp API", "PayPal IPN", "MySQL"],
    img: "/images/portfolio/northernvirginiawriters-home.png",
    highlightMetric: "12+ hrs weekly admin saved · 0.00% sync error rate · v4.0 SOP Playbook",
    summary: "Architecting a sovereign, automated community operating system for a prominent regional literary organization — eliminating 12+ hours of weekly spreadsheet triage, securing tiered author databases, and providing bulletproof documentation for volunteer sustainability.",
    challenge: "A volunteer board buried under manual spreadsheet forensics, risking unvetted intrusions into manuscript critique rooms and accidental member lockouts.",
    solution: "Engineered a sovereign, connected membership platform with staging queues, redundant IPN server logging, real-time 3-way webhook sync, and versioned SOP documentation.",
    details: "Deep WordPress & membership platform internals: managing custom user roles, staging verification queues, IPN webhook telemetry, and automated MailChimp synchronization.",
    beforeAfter: {
      before: "Volunteer board spent 12 to 15 hours every week manually checking PayPal notifications and re-entering names into Excel rosters.",
      after: "Autonomous member platform with one-click officer approvals, automated recurring billing sync, and real-time MailChimp list integration.",
      result: "Admin overhead collapsed by over 90% with 0.00% sync error rate across rosters, forums, and email broadcasts."
    },
    caseStudy: {
      eyebrow: "CASE STUDY · NORTHERN VIRGINIA WRITERS CLUB · FULL-STACK & MEMBERSHIP ARCHITECTURE",
      heroHeadline: "How a Writers Club Replaced Manual Membership Admin with a Connected Member Platform",
      heroSubtitle: "Architecting a sovereign, automated community operating system for a prominent regional literary organization — eliminating 12+ hours of weekly spreadsheet triage, securing tiered author databases, and providing bulletproof documentation for volunteer sustainability.",
      verifiedBadge: "PRODUCTION DEPLOYMENT · VERIFIED 2026",
      liveUrl: "https://northernvirginiawriters.org/",
      liveUrlLabel: "Live Site",
      proofBar: {
        title: "Active Production Infrastructure",
        description: "Multi-device community dashboard, authenticated author directory & live IPN ledger",
        chips: ["100% Code Ownership", "Zero Desync", "Playbook v4.0"]
      },
      metrics: [
        {
          label: "Weekly Admin Time",
          value: "12+ hrs",
          subtext: "Direct volunteer time saved / wk"
        },
        {
          label: "Renewal Pipeline",
          value: "100%",
          subtext: "Automated recurring billing sync"
        },
        {
          label: "Sync Error Rate",
          value: "0.00%",
          subtext: "Across rosters, forums & MailChimp"
        },
        {
          label: "Volunteer Handover",
          value: "v4.0",
          subtext: "Live SOP operational playbook"
        }
      ],
      specs: [
        {
          label: "Client Organization",
          value: "Northern Virginia Writers Club",
          subtext: "Est. 2007 · Reston & NoVA Region"
        },
        {
          label: "Role & Ownership",
          value: "Rottman M. Mendez (RottyM)",
          subtext: "Lead Full Stack Engineer & System Architect"
        },
        {
          label: "Timeline & Engagement",
          value: "Initial Deploy + Multi-Year Support",
          subtext: "Sustained platform maintenance through 2026"
        },
        {
          label: "Integrated Stack",
          value: "Connected Core Stack",
          chips: ["WordPress", "PMPro", "BuddyBoss", "MailChimp API", "PayPal IPN"]
        }
      ],
      crisis: {
        eyebrow: "THE ADMINISTRATIVE CRISIS",
        heading: "A volunteer board buried under manual spreadsheet forensics.",
        description: [
          "The Northern Virginia Writers Club (NVWC) brings together published authors, journalists, poets, and aspiring wordsmiths across the greater DC area. While community passion was thriving, behind the scenes volunteer board members were burning out under an overwhelming operational bottleneck.",
          "With zero automated integration between member billing, private community forums, and broadcast communication, every single club action required manual cross-examination across three disconnected tools."
        ],
        threat: "Unvetted internet users were entering members-only manuscript critique rooms, while long-time paying supporters were being inadvertently dropped from workshop newsletters due to human sync delay.",
        painPoints: [
          {
            title: "12–15 Hours of Weekly Manual Spreadsheet Re-typing",
            description: "Officers spent nights reconciling PayPal notification emails against static Excel roster sheets, manually exporting CSVs, and importing them into MailChimp lists. One typo severed a member's communications."
          },
          {
            title: "Unvetted Infiltration & Abrupt Member Lockouts",
            description: "Without structured membership lifecycle states, accidental cancellations occurred mid-billing term, triggering rude automated lockouts for senior authors while completely unverified signups slipped past unmonitored gates."
          },
          {
            title: "Silent Payment Webhook Failures & Missing Addresses",
            description: "Standard checkout plugins frequently dropped transaction payloads when users closed browser tabs prior to redirect, leading to untracked payments, missing tax records, and awkward manual payment audits."
          }
        ]
      },
      pillarsHeading: "The Connected Member Platform: 6 Strategic Solutions",
      pillarsSubheading: "Instead of stacking incompatible SaaS subscriptions, RottyM engineered a sovereign, fully orchestrated ecosystem giving the organization absolute ownership, zero vendor rent, and total operational automation.",
      pillars: [
        {
          index: "01 / QUEUE",
          tag: "Vetting Workflow",
          title: "Pending-Member Vetting Workflow",
          description: "New submissions do not grant instant community credentials. A dedicated administrative staging queue holds registrations until elected officers review literary eligibility and ethics agreements.",
          bullets: ["Eliminates email back-and-forth", "One-click officer approvals"]
        },
        {
          index: "02 / BILLING",
          tag: "Payment Flow & IPN",
          title: "Frictionless Payment & IPN Server Logging",
          description: "Integrated PayPal engine capturing thorough billing addresses for regional non-profit tax reporting, coupled with redundant server-side Instant Payment Notification (IPN) telemetry logging.",
          bullets: ["Zero silent webhook drops", "Automated receipt generation"]
        },
        {
          index: "03 / REAL-TIME",
          tag: "3-Way Sync",
          title: "Automatic Three-Way Sync",
          description: "Bidirectional webhook orchestration linking Paid Memberships Pro, BuddyBoss author directories, and MailChimp tags. Changes reflect universally and instantaneously across all systems.",
          bullets: ["Zero manual CSV roster exports", "Real-time audience segmentation"]
        },
        {
          index: "04 / LIFECYCLE",
          tag: "Grace Period",
          title: "Grace-Period & \"Cancel Renewal Only\"",
          description: "Human-centric member lifecycle logic allowing writers to turn off recurring subscription rebilling while fully maintaining portal access and community privileges until their paid annual expiration date.",
          bullets: ["Prevents jarring auto-lockouts", "Configurable renewal buffer intervals"]
        },
        {
          index: "05 / SHOWCASE",
          tag: "Public Directory",
          title: "Secure Public Directory Fed by Private Hub",
          description: "A high-visibility public-facing showcase celebrating published authors, recent releases, and book links. Content is powered straight from member profiles with granular opt-in privacy toggles.",
          bullets: ["Zero leakage of private email addresses", "Individual author bio controls"]
        },
        {
          index: "06 / HANDOFF",
          tag: "Playbook v4.0",
          title: "Documentation SOP: Playbook v4.0",
          description: "Engineered for true volunteer longevity. Rottman authored a 40-page, continuously maintained living operations manual complete with annotated walkthroughs for rotating non-technical board members.",
          bullets: ["Zero agency dependency or lock-in", "Seamless annual board transitions"]
        }
      ],
      topology: {
        eyebrow: "SYSTEM TOPOLOGY",
        heading: "Real-Time Event Orchestration",
        subtext: "How membership states execute without manual administrative touchpoints",
        pulseBadge: "HTTP 200 OK · Webhook Pulse",
        steps: [
          {
            step: "STEP 01",
            title: "User Checkout",
            description: "Applicant selects tier, enters verification data & completes PayPal auth.",
            code: "POST /checkout"
          },
          {
            step: "STEP 02",
            title: "IPN Verification",
            description: "PayPal IPN transmits token handshake back to PMPro listener with server logs.",
            code: "IPN Handshake"
          },
          {
            step: "STEP 03",
            title: "Vetting Ledger",
            description: "Officer approval triggers synchronized status unlock across user roles.",
            code: "Role: Author_Active"
          },
          {
            step: "STEP 04",
            title: "3-Way Sync Broadcast",
            description: "BuddyBoss directory listing activates; MailChimp tags update in 140ms.",
            code: "API Dispatch"
          }
        ]
      },
      comparison: {
        beforeTitle: "Manual Fragile State",
        beforeSubtitle: "PRIOR TO 2024",
        beforeItems: [
          "Volunteer board spent 12 to 15 hours every week manually checking PayPal notifications and re-entering names into Excel.",
          "Spam bots and non-paying users routinely registered into critique discussion channels due to missing staging queues.",
          "Member renewals expired silently; members received sudden lockouts instead of gentle notice grace periods.",
          "Officers had zero operational documentation, resulting in chaos whenever board seats turned over during elections."
        ],
        afterTitle: "Autonomous Modern Platform",
        afterSubtitle: "ROTTYM DEPLOYMENT",
        afterItems: [
          "Admin overhead collapsed by over 90% — from 15 hours down to routine periodic oversight.",
          "Bulletproof vetting workflow guarantees zero unverified accounts access confidential author manuscripts.",
          "Fully automated MailChimp sync and grace periods prevent accidental churn or abrupt member friction.",
          "Playbook v4.0 documentation empowers any elected volunteer to administer the entire portal with confidence."
        ]
      },
      testimonial: {
        quote: "Before Rottman redesigned our architecture, our volunteer officers were spending whole weekends drowning in spreadsheet checks, missing email notifications, and resolving accidental member drops. The connected system he built didn't just solve our tech headaches — it saved our volunteer team from burnout and gave our authors a professional home they are genuinely proud of.",
        author: "Executive Board Leadership",
        role: "Northern Virginia Writers Club · Established 2007",
        avatarText: "NV"
      },
      guarantees: [
        "100% Code & Database Ownership",
        "Zero Proprietary SaaS Lock-in",
        "Enterprise Standards Applied Locally",
        "Complete Versioned SOP Playbook"
      ]
    }
  },
  {
    slug: "local-business-dev",
    title: "Local Business Development (Brevic)",
    role: "Strategic Tech Partner",
    category: "Commercial Platforms",
    tag: "Rapid Launchpad",
    section: "modern",
    tech: ["Next.js", "Tailwind CSS", "Vercel", "Lead Capture Workflows"],
    img: "/images/portfolio/brevic.jpg",
    highlightMetric: "98 Lighthouse score · Streamlined customer inquiry flow",
    summary: "High-performance web storefront engineered for modern local service business conversion and direct quote requests.",
    challenge: "Transforming a slow brochure site into an ultra-fast inquiry generator for commercial services.",
    solution: "Deployed a lightweight Next.js application with instant click-to-call/quote triggers, clear service framing, and local SEO metadata.",
    details: "Demonstrates how performance optimization and clean layout architecture directly increase inbound customer inquiries."
  },

  // --- Section 2: Enterprise & Earlier Career Work ---
  {
    slug: "usa-today-the-point",
    title: "USA Today – The Point",
    role: "Lead Front-End Engineer (Contract)",
    category: "Enterprise High Scale",
    tag: "Enterprise Publishing",
    section: "enterprise",
    featured: true,
    tech: ["React", "Redux", "AWS (S3/CloudFront)", "RESTful APIs", "High-Traffic Optimization"],
    img: "/images/portfolio/usa-today-thepoint.jpg",
    highlightMetric: "Lead front-end engineer on a platform serving millions of monthly readers",
    summary: "High-traffic interactive digital news publication platform engineered for Gannett / USA Today.",
    challenge: "Delivering real-time editorial updates under massive national traffic spikes with zero UI degradation or layout shift.",
    solution: "Engineered resilient component architectures in React with normalized Redux state and CDN edge caching across AWS infrastructure.",
    details: "Demonstrates enterprise-grade front-end engineering capable of handling millions of concurrent users under strict SLA constraints."
  },
  {
    slug: "custom-cms-platforms",
    title: "Custom CMS & Gov Platforms",
    role: "Full Stack Engineer",
    category: "Gov & Enterprise Infrastructure",
    tag: "Gov Infrastructure",
    section: "enterprise",
    tech: ["Java", "React", "Cloud-Native Architecture", "Section 508 / WCAG 2.1 AA"],
    img: "/images/portfolio/gov-sites.jpg",
    highlightMetric: "Section 508 accessibility compliance · Zero security vulnerabilities",
    summary: "Secure, highly available content and portal infrastructure designed for public-sector and institutional compliance.",
    challenge: "Meeting rigorous federal security guidelines and Section 508 accessibility requirements across complex multi-step user workflows.",
    solution: "Engineered accessible React interfaces paired with hardened microservices and comprehensive automated accessibility testing.",
    details: "Built to federal standards for accessibility, resilience, and scalable data processing."
  },
  {
    slug: "enterprise-subscriptions",
    title: "Enterprise Subscriptions",
    role: "Cloud Architect",
    category: "Fintech & Subscriptions",
    tag: "Revenue & Billing",
    section: "enterprise",
    tech: ["Firebase", "Stripe Subscriptions", "Cloud Functions", "Node.js"],
    img: "/images/portfolio/club-sites.jpg",
    highlightMetric: "Automated recurring billing · Zero checkout friction",
    summary: "Scalable recurring billing and gated member entitlement platform for subscription clubs.",
    challenge: "Automating member access tiers and recurring billing cycles without manual administrative intervention.",
    solution: "Integrated Stripe webhooks with Firebase Cloud Functions and Firestore for instantaneous subscription state updates.",
    details: "Eliminates billing leaks and administrative overhead with bulletproof automated recurring revenue workflows."
  },
  {
    slug: "reverb-networks",
    title: "Reverb Networks",
    role: "UX Designer & Prototyper",
    category: "Enterprise Telecommunications",
    tag: "B2B Telecom UX",
    section: "enterprise",
    tech: ["Wireframing", "Figma", "Design Systems", "Usability Testing"],
    img: "/images/portfolio/reverb-performa.jpg",
    highlightMetric: "Enterprise antenna optimization interface · Complex telemetry data",
    summary: "Specialized UX interface for antenna automation and telecommunication performance telemetry.",
    challenge: "Making highly technical RF antenna analytics intuitive for telecommunications field engineers.",
    solution: "Designed high-density dashboards with visual antenna beam mapping and clear operational telemetry controls.",
    details: "User experience engineering for complex data visualization and mission-critical engineering tooling."
  },
  {
    slug: "wwf-gift-center",
    title: "WWF Gift Center",
    role: "UX Developer",
    category: "E-Commerce UX",
    tag: "E-Commerce Platform",
    section: "enterprise",
    tech: ["E-Commerce UX", "HTML5", "CSS3", "Conversion Optimization"],
    img: "/images/portfolio/wwf-giftcenter.jpg",
    highlightMetric: "High-volume international donation and symbolic adoption checkout",
    summary: "Donation and symbolic adoption gift catalog for World Wildlife Fund, focused on streamlined gift selection and friction-free donor checkout.",
    challenge: "Simplifying a multi-step gift catalog checkout flow for international donors across varied giving tiers.",
    solution: "Streamlined basket steps and added clear visual donation badges to maximize end-of-year giving conversion.",
    details: "Conversion-focused user experience engineering for high-volume non-profit donation processing."
  },
  {
    slug: "brand-identity-systems",
    title: "Brand Identity Systems",
    role: "Creative Lead",
    category: "Identity & Branding",
    tag: "Visual Systems",
    section: "enterprise",
    tech: ["Vector Design", "Design Systems", "Typography", "Style Guides"],
    img: "/images/portfolio/logos.jpg",
    highlightMetric: "Cohesive multi-platform brand design systems",
    summary: "Logomarks, design systems, and identity assets providing visual consistency across web platforms.",
    challenge: "Establishing visual consistency across digital products, print collateral, and web user interfaces.",
    solution: "Crafted enduring vector identity systems and comprehensive component style guides for emerging brands.",
    details: "Bridges the gap between technical engineering and clean visual design."
  }
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
