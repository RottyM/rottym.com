// src/lib/projects.ts

export interface Project {
  slug: string;
  title: string;
  client?: string;
  role: string;
  category: string;
  tag: string;
  isLegacy?: boolean;
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
}

export const projects: Project[] = [
  {
    slug: "throttlelife",
    title: "ThrottleLife",
    role: "Concept & Architecture",
    category: "Platform Architecture",
    tag: "Modern Next.js Stack",
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
    tag: "Cloud-Native Platform",
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
    tag: "WordPress Escape Case Study",
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
    tag: "Modern Next.js Stack",
    featured: true,
    tech: ["Next.js", "Sanity CMS", "Vercel", "Tailwind CSS", "Semantic SEO"],
    img: "/images/portfolio/lori-eaton-writer-homepage.png",
    highlightMetric: "100% SEO & Accessibility Score · Instant content updates",
    summary: "Clean, elegant author platform designed for literary showcases, reader engagement, and automated mailing list acquisition.",
    challenge: "Replacing generic website builders with an ultra-fast, branded portfolio that the author could independently manage without touching code.",
    solution: "Engineered with Next.js on Vercel, structured schema markup, OpenGraph previews, and custom Sanity CMS editorial workflows.",
    details: "Combines typography-first responsive design with WCAG 2.1 AA accessibility and rapid editorial publishing."
  },
  {
    slug: "northern-virginia-writers",
    title: "Northern Virginia Writers Club",
    role: "Web Manager & Platform Architect",
    category: "Community & Membership",
    tag: "Deep WordPress & BuddyBoss Internals",
    featured: true,
    tech: ["WordPress", "BuddyBoss", "Custom PHP", "MySQL", "Stripe Subscriptions"],
    img: "/images/portfolio/northernvirginiawriters-home.png",
    highlightMetric: "Active regional community · Subscriptions & Member Portal",
    summary: "Hands-on proof of deep WordPress & BuddyBoss internals: managing custom user roles, membership databases, and recurring payment workflows.",
    challenge: "Running a multi-tiered literary membership portal with discussion forums, gated resources, and annual dues without breakage.",
    solution: "Architected custom BuddyBoss workflows, streamlined plugin footprint, and optimized database queries for consistent community engagement.",
    details: "Deep WordPress expertise enables clean headless migrations: understanding legacy database structures, shortcodes, and plugin ecosystems is the exact prerequisite for successfully migrating complex WP sites to modern serverless Next.js.",
    beforeAfter: {
      before: "Fragmented community communications and manual dues collection across third-party tools.",
      after: "Integrated WordPress & BuddyBoss community hub with automated Stripe membership tiers and event calendars.",
      result: "Unified regional membership base with zero downtime across key seasonal literary competitions."
    }
  },
  {
    slug: "usa-today-the-point",
    title: "USA Today – The Point",
    role: "Lead Front-End Engineer (Contract)",
    category: "Enterprise High Scale",
    tag: "Enterprise Media Contract",
    featured: true,
    tech: ["React", "Redux", "AWS (S3/CloudFront)", "RESTful APIs", "High-Traffic Optimization"],
    img: "/images/portfolio/usa-today-thepoint.jpg",
    highlightMetric: "Millions of monthly active readers · Real-time editorial streaming",
    summary: "High-traffic interactive digital news publication platform engineered for Gannett / USA Today.",
    challenge: "Delivering real-time editorial updates under massive national traffic spikes with zero UI degradation or layout shift.",
    solution: "Engineered resilient component architectures in React with normalized Redux state and CDN edge caching across AWS infrastructure.",
    details: "Demonstrates enterprise-grade front-end engineering capable of handling millions of concurrent users under strict SLA constraints."
  },
  {
    slug: "detroit-free-press",
    title: "Detroit Free Press",
    role: "UX Developer",
    category: "Digital Publishing",
    tag: "High-Traffic Front-End",
    tech: ["JavaScript", "HTML5", "CSS3", "Responsive Layouts", "Performance"],
    img: "/images/portfolio/detroit-freepress.jpg",
    highlightMetric: "Multi-device layout parity · Newsroom publishing pipeline",
    summary: "Editorial layouts and responsive digital presentation for one of Michigan’s largest daily newsrooms.",
    challenge: "Translating print and editorial designs into fluid responsive web layouts for fast-breaking news delivery.",
    solution: "Implemented modular CSS/JS component templates compatible with legacy publishing CMS pipelines.",
    details: "Focused on high accessibility, font performance, and reliable multi-device responsive design."
  },
  {
    slug: "custom-cms-platforms",
    title: "Custom CMS & Gov Platforms",
    role: "Full Stack Engineer",
    category: "Gov & Enterprise Infrastructure",
    tag: "Secure Compliance",
    tech: ["Java", "React", "Cloud-Native Architecture", "Section 508 / WCAG 2.1 AA"],
    img: "/images/portfolio/gov-sites.jpg",
    highlightMetric: "Section 508 accessibility compliance · Zero security vulnerabilities",
    summary: "Secure, highly available content and portal infrastructure designed for public-sector and institutional compliance.",
    challenge: "Meeting rigorous federal security guidelines and Section 508 accessibility requirements across complex multi-step user workflows.",
    solution: "Engineered accessible React interfaces paired with hardened microservices and comprehensive automated accessibility testing.",
    details: "Built to federal standards for accessibility, resilience, and scalable data processing."
  },
  {
    slug: "local-business-dev",
    title: "Local Business Development (Brevic)",
    role: "Strategic Tech Partner",
    category: "Commercial Platforms",
    tag: "Rapid Launchpad",
    tech: ["Next.js", "Tailwind CSS", "Vercel", "Lead Capture Workflows"],
    img: "/images/portfolio/brevic.jpg",
    highlightMetric: "3x lead conversion uplift · 98 Lighthouse performance score",
    summary: "High-performance web storefront engineered for modern local service business conversion and instant quote inquiries.",
    challenge: "Transforming a slow brochure site into a high-converting customer acquisition engine for commercial services.",
    solution: "Deployed a lightweight Next.js application with instant phone/quote actions, clear value framing, and local SEO metadata.",
    details: "Demonstrates how enterprise speed and design clarity directly drive local business inbound leads."
  },
  {
    slug: "enterprise-subscriptions",
    title: "Enterprise Subscriptions",
    role: "Cloud Architect",
    category: "Fintech & Subscriptions",
    tag: "Revenue & Billing",
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
    tag: "B2B UX & Product",
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
    tag: "Legacy / Early Career",
    isLegacy: true,
    tech: ["E-Commerce UX", "HTML5", "CSS3", "Conversion Optimization"],
    img: "/images/portfolio/wwf-giftcenter.jpg",
    highlightMetric: "High-volume non-profit donation checkout · Early career milestone",
    summary: "Donation and symbolic adoption gift catalog for World Wildlife Fund. Labeled as an early-career milestone demonstrating conversion-focused UX fundamentals.",
    challenge: "Simplifying a multi-step gift catalog checkout flow for international donors across varied giving tiers.",
    solution: "Streamlined basket steps and added clear visual donation badges to maximize end-of-year giving conversion.",
    details: "Early career work highlighting e-commerce fundamentals, donation UX, and non-profit conversion psychology."
  },
  {
    slug: "brand-identity-systems",
    title: "Brand Identity Systems",
    role: "Creative Lead",
    category: "Identity & Branding",
    tag: "Visual Systems",
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
