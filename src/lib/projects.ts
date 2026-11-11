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
    highlightMetric: "Membership nearly doubled · 90% auto-renewal opt-in · 12+ hrs/wk saved",
    summary: "Architecting a modern collaboration portal and 12-month rolling subscription system for the largest writers club in Virginia — nearly doubling membership in the first year, achieving 90% automated renewal opt-in, and freeing officers to focus on creative programming.",
    challenge: "Modernizing Virginia's largest writers club from manual spreadsheet tracking and rigid calendar-year billing to 12-month rolling subscriptions and a secure online collaboration portal.",
    solution: "Engineered a connected membership and Facebook-like collaboration portal with 12-month rolling subscriptions, manuscript critique and query groups, meeting recording archives, real-time 3-way webhook sync, and versioned SOP documentation.",
    details: "Deep WordPress & membership platform internals: managing 12-month rolling subscription lifecycles, BuddyBoss collaboration spaces, IPN webhook telemetry, and automated MailChimp synchronization.",
    beforeAfter: {
      before: "Volunteer board spent 12 to 15 hours every week reconciling spreadsheets under a calendar-year billing model, with no online member collaboration portal.",
      after: "Connected collaboration portal with 12-month rolling subscriptions, automated recurring renewals, meeting archives, and real-time MailChimp integration.",
      result: "Membership nearly doubled in the first year with 90% opting in for automated renewals, freeing officers to secure speakers, afford a dedicated meeting space, and publish an anthology."
    },
    caseStudy: {
      eyebrow: "CASE STUDY · NORTHERN VIRGINIA WRITERS CLUB · COLLABORATION PORTAL & MEMBERSHIP ARCHITECTURE",
      heroHeadline: "How Virginia's Largest Writers Club Modernized Membership & Launched a Collaboration Portal",
      heroSubtitle: "Architecting an automated 12-month rolling subscription platform and secure Facebook-like collaboration portal for the largest writers club in the state — nearly doubling membership in the first year and freeing volunteer officers to focus on creative programming.",
      verifiedBadge: "PRODUCTION DEPLOYMENT · VERIFIED 2026",
      liveUrl: "https://northernvirginiawriters.org/",
      liveUrlLabel: "Live Site",
      proofBar: {
        title: "Active Production Infrastructure",
        description: "Facebook-like member collaboration portal, meeting archive, authenticated author directory & live IPN ledger",
        chips: ["Nearly 2x Membership", "90% Auto-Renewal", "Playbook v4.0"]
      },
      metrics: [
        {
          label: "First-Year Growth",
          value: "~2x",
          subtext: "Membership nearly doubled in Year 1"
        },
        {
          label: "Auto-Renewal Opt-In",
          value: "90%",
          subtext: "On 12-month rolling subscriptions"
        },
        {
          label: "Weekly Admin Time",
          value: "12+ hrs",
          subtext: "Saved weekly for creative programming"
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
          subtext: "Est. 2007 · Largest Writers Club in Virginia"
        },
        {
          label: "Role & Ownership",
          value: "Rottman M. Mendez (RottyM)",
          subtext: "Lead Full Stack Engineer & System Architect"
        },
        {
          label: "Timeline & Engagement",
          value: "Initial Deploy + Multi-Year Support",
          subtext: "Approaching 20th Anniversary · Unchanged Dues"
        },
        {
          label: "Integrated Stack",
          value: "Connected Core Stack",
          chips: ["WordPress", "PMPro", "BuddyBoss", "MailChimp API", "PayPal IPN"]
        }
      ],
      crisis: {
        eyebrow: "THE MODERNIZATION CHALLENGE",
        heading: "Outgrowing manual spreadsheets and calendar-year billing.",
        description: [
          "The Northern Virginia Writers Club (NVWC) is the largest writers club in the state of Virginia, bringing together published authors, journalists, poets, and aspiring wordsmiths. While community passion was thriving, volunteer board members were burdened by manual administrative tasks and lacked a unified online collaboration portal for members.",
          "With zero automated integration between member billing, rosters, and broadcast email — combined with a legacy calendar-year subscription cutoff — routine administrative chores were taking valuable time away from creative club initiatives."
        ],
        threat: "Under the legacy calendar-year billing model, members who paid full subscription price near year-end did not receive a full 12 months of membership — resulting in irritated, non-renewing members — while human sync delays left paying supporters off workshop newsletters.",
        painPoints: [
          {
            title: "12–15 Hours of Weekly Manual Spreadsheet Re-typing",
            description: "Officers spent nights reconciling PayPal notification emails against static Excel roster sheets, manually exporting CSVs, and importing them into MailChimp lists. One typo severed a member's communications."
          },
          {
            title: "Calendar-Year Billing Friction & No Collaboration Portal",
            description: "Without 12-month rolling subscriptions, members joining late in the year paid full price without receiving a full 12 months, leading to frustrated, non-renewing members. At the same time, members had no central online portal to share manuscripts, collaborate on pitches, or access meeting recordings."
          },
          {
            title: "Silent Payment Webhook Failures & Missing Addresses",
            description: "Standard checkout plugins frequently dropped transaction payloads when users closed browser tabs prior to redirect, leading to untracked payments and awkward manual payment audits."
          }
        ]
      },
      pillarsHeading: "The Connected Member & Collaboration Platform: 6 Core Pillars",
      pillarsSubheading: "Instead of stacking incompatible SaaS tools, RottyM engineered a unified collaboration portal and automated subscription architecture that nearly doubled membership in its first year while keeping member dues unchanged.",
      pillars: [
        {
          index: "01 / PORTAL",
          tag: "Collaboration Hub",
          title: "Facebook-Like Secure Collaboration Portal",
          description: "In a secure, Facebook-like social interface, members now share book releases, collaborate on pitches and queries, exchange manuscripts in online critique groups, and access an archive of all club meetings and recordings.",
          bullets: ["Online pitch, query & manuscript collaboration", "Full archive of club meetings & recordings"]
        },
        {
          index: "02 / BILLING",
          tag: "Payment Flow & IPN",
          title: "Frictionless Payment & IPN Server Logging",
          description: "Integrated PayPal engine capturing complete member billing addresses for chapter administration, coupled with redundant server-side Instant Payment Notification (IPN) telemetry logging.",
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
          index: "04 / SUBSCRIPTIONS",
          tag: "Rolling 12-Month",
          title: "12-Month Rolling Subscriptions & Auto-Renewals",
          description: "Modernized the club from fixed year-end cutoffs to true 12-month rolling subscriptions so every member gets a full year of value, paired with 'Cancel Renewal Only' controls that maintain access through the paid term.",
          bullets: ["90% of members opt in for automated renewals", "Full 12-month value from any join date"]
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
          description: "Engineered for smooth officer transitions. Rottman authored a 40-page, continuously maintained living operations manual complete with annotated walkthroughs for rotating non-technical board members.",
          bullets: ["Zero agency dependency or lock-in", "Streamlined annual officer transitions"]
        }
      ],
      topology: {
        eyebrow: "SYSTEM TOPOLOGY",
        heading: "Real-Time Event Orchestration",
        subtext: "How rolling subscriptions and collaboration access execute without manual administrative touchpoints",
        pulseBadge: "HTTP 200 OK · Webhook Pulse",
        steps: [
          {
            step: "STEP 01",
            title: "Member Checkout",
            description: "Writer selects 12-month rolling membership & completes PayPal checkout.",
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
            title: "Rolling 12-Month Term",
            description: "Full 12-month subscription lifecycle & automated renewal preferences activate.",
            code: "Role: Member_Active"
          },
          {
            step: "STEP 04",
            title: "3-Way Sync & Portal",
            description: "BuddyBoss collaboration portal, critique groups & MailChimp tags sync in 140ms.",
            code: "API Dispatch"
          }
        ]
      },
      comparison: {
        beforeTitle: "Legacy Manual Workflow",
        beforeSubtitle: "PRIOR TO MODERNIZATION",
        beforeItems: [
          "Volunteer board spent 12 to 15 hours every week manually checking PayPal notifications and re-entering names into Excel.",
          "Members had no online collaboration portal to share book releases, workshop pitches and manuscripts, or access past meeting recordings.",
          "Fixed calendar-year billing disappointed members who paid full subscription price near year-end without getting a full 12 months, resulting in irritated, non-renewing members.",
          "Officers had limited operational documentation, resulting in time-consuming transitions whenever officer seats turned over during elections."
        ],
        afterTitle: "Connected Collaboration Portal",
        afterSubtitle: "ROTTYM DEPLOYMENT",
        afterItems: [
          "In the first year, membership nearly doubled using the seamless 12-month rolling subscription system, with 90% of members opting in for automated renewals.",
          "In a Facebook-like secure interface, members now share book releases, collaborate on pitches and queries, share manuscripts, and access an archive of all club meetings and recordings.",
          "Automation freed up officers' time to focus on the creative aspects of a writers club, including securing high-quality speakers and publishing an anthology.",
          "The club has kept dues the same in the second year since launch while offering much more functionality, affording a dedicated meeting space, and preparing to celebrate its 20th anniversary."
        ]
      },
      testimonial: {
        quote: "Before Rottman redesigned our architecture, our volunteer officers were spending whole weekends drowning in spreadsheet checks, missing email notifications, and resolving accidental member drops. The connected system he built didn't just solve our tech headaches — it saved our volunteer team from burnout and gave our authors a professional home they are genuinely proud of.",
        author: "Carolyn McBride, President",
        role: "Northern Virginia Writers Club · Largest Writers Club in Virginia",
        avatarText: "CM"
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
