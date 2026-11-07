// src/app/about/page.tsx
'use client';

import { Briefcase, Code2, Award, ArrowRight, Download, Sparkles, Fingerprint, Compass } from 'lucide-react';
import Link from 'next/link';

interface Placement {
  client: string;
  period: string;
  desc: string;
}

interface Experience {
  role: string;
  company: string;
  period: string;
  desc?: string;
  placements?: Placement[];
}

const experiences: Experience[] = [
  {
    role: "Full-Stack & AI Software Engineer (Independent Consultant)",
    company: "RottyM Designs",
    period: "11/2023 – Present",
    desc: "Architecting AI-augmented cloud platforms, RAG pipelines, MCP integrations, and high-performance headless Next.js applications (Vercel, GCP, Firebase). Partnering with healthcare providers, regional non-profits, and commercial clients to modernize legacy systems, automate intake/membership pipelines, and accelerate release cycles by 45%+ using agentic engineering workflows."
  },
  {
    role: "Full-Stack Software Engineer (Contract)",
    company: "Insight Global",
    period: "09/2021 – 11/2023",
    placements: [
      {
        client: "Disney Streaming",
        period: "05/2022 – 11/2023",
        desc: "Scaled distributed microservices supporting 100M+ global streaming subscribers using Java, Scala, Spring Boot, TypeScript, and AWS (S3, Athena, Lambda) within Docker/Kubernetes environments. Led front-end JWT auth migration (reducing session token errors by 30%) and integrated real-time Adobe Analytics compliance telemetry."
      },
      {
        client: "BAE Systems",
        period: "09/2021 – 04/2022",
        desc: "Engineered mission-critical production expense-tracking systems for the Defense Intelligence Agency (DIA) within a secure, high-compliance distributed engineering team using React/Redux on the front end, backed by Java and SQL, maintaining 99.9% system availability."
      }
    ]
  },
  {
    role: "Senior Software Engineer",
    company: "One Globe LLC – FEMA",
    period: "07/2020 – 08/2021",
    desc: "Engineered full-stack microservices and UI workflows for the FEMA GO Grants Management Modernization (GMM) platform, consolidating 40+ disparate federal grant programs processing $3B+ in annual funding using Java, React/Redux, OpenShift, AWS (DynamoDB, S3, Athena), PostgreSQL, and Camunda BPMN."
  },
  {
    role: "Front End Developer (Contract)",
    company: "Leidos – Federal Aviation Administration (FAA)",
    period: "12/2017 – 03/2020",
    desc: "Modernized internal federal web application suites serving 10,000+ agency personnel in an enterprise .NET environment. Optimized JS/jQuery/CSS execution pipelines—improving UI rendering speeds by 30%—while enforcing 100% federal Section 508 Accessibility compliance across all interfaces."
  }
];

const skillsets = [
  {
    category: "AI Systems & Engineering",
    skills: ["Multi-Model LLM Orchestration", "Google Gemini & Claude", "OpenAI / Codex", "RAG Pipelines", "Model Context Protocol (MCP)", "Structured Outputs & Tool Calling", "Local Inference (Ollama)", "Agentic SDLC Workflows"]
  },
  {
    category: "Frontend & Modern Web",
    skills: ["React", "Next.js (App Router)", "TypeScript", "Tailwind CSS", "Redux", "Sanity Headless CMS", "HTML5 / CSS3", "WCAG 2.1 AA / Section 508"]
  },
  {
    category: "Backend & Microservices",
    skills: ["Java", "Spring Boot", "Scala", "Node.js", "Microservices Architecture", "RESTful APIs", "GraphQL", "Vert.x", "Camunda BPMN"]
  },
  {
    category: "Cloud, DevOps & Data",
    skills: ["Google Cloud (GCP)", "Firebase", "Vercel", "AWS (Lambda, S3, DynamoDB, Athena)", "Docker", "Kubernetes", "PostgreSQL", "Firestore", "Datadog / Grafana"]
  }
];

export default function About() {
  return (
    <section className="relative pt-10 pb-24 min-h-screen overflow-hidden">
      {/* Background Dot-Grid Texture */}
      <div className="absolute inset-0 bg-dot-grid opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] pointer-events-none -z-10" />

      {/* Atmospheric Radial Ambient Lighting */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[480px] bg-gradient-to-tr from-accent/10 via-sky-500/5 to-transparent dark:from-accent/15 dark:via-emerald-500/10 dark:to-transparent blur-[130px] rounded-full -z-10" />
      <div className="pointer-events-none absolute top-1/2 -right-32 w-[420px] h-[420px] bg-accent/5 rounded-full blur-[110px] -z-10" />

      <div className="max-w-5xl mx-auto px-6 space-y-16 relative z-10">
        {/* Intro Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 glass px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-sm backdrop-blur-md border border-border max-w-full">
            <Fingerprint className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-accent shrink-0" />
            <span className="font-mono text-[9px] sm:text-xs text-accent tracking-wider sm:tracking-widest uppercase font-bold whitespace-nowrap">FULL-STACK &amp; AI SOFTWARE ENGINEER</span>
            <span className="text-border hidden sm:inline">|</span>
            <span className="font-mono text-[9px] sm:text-xs text-muted-foreground uppercase whitespace-nowrap hidden sm:inline">RESTON, VA</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-[1.12]">
            Rottman M. <span className="tech-gradient-text">Mendez</span>
          </h1>

          <p className="text-base sm:text-xl text-muted-foreground leading-relaxed font-medium max-w-3xl mx-auto">
            Full-Stack &amp; AI Software Engineer based in Reston, Virginia. With extensive experience engineering scalable enterprise microservices (Disney Streaming, FEMA, BAE Systems, FAA via Leidos) and delivering AI-augmented cloud platforms, I specialize in modern serverless web stacks (Next.js, React, TypeScript, Tailwind CSS, Sanity, Vercel) and enterprise backend systems (Java, Spring Boot, Scala, GCP, Firebase, AWS). I help organizations and technical teams replace fragile legacy systems with reliable, high-performance digital platforms.
          </p>

          {/* Action Buttons directly under the bio */}
          <div className="pt-2 flex flex-col items-center gap-3.5 w-full">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3.5 w-full sm:w-auto">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-[#090D16] hover:bg-[#151D2F] text-white dark:bg-accent dark:text-accent-foreground px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold font-mono text-xs sm:text-sm hover:scale-[1.02] transition-all shadow-md shadow-black/10 dark:shadow-accent/20 border border-[#090D16] dark:border-transparent w-full sm:w-auto"
              >
                <span>Hire Me / Get in Touch</span> <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00D8F6] dark:text-current" />
              </Link>
              <a
                href="/resume.pdf"
                download="Rottman_Mendez_Resume.pdf"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 shadow-sm dark:glass dark:text-foreground dark:border-border dark:hover:bg-muted px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold font-mono text-xs sm:text-sm transition-all w-full sm:w-auto"
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" /> Download Resume (PDF)
              </a>
            </div>

            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-muted/80 border border-border/80 rounded-xl text-[11px] sm:text-xs font-semibold text-foreground/90 shadow-sm font-mono max-w-full">
              <Briefcase className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-accent shrink-0" />
              <span className="truncate">Looking for Full-Stack &amp; AI Software Engineer roles &amp; partners</span>
            </div>
          </div>
        </div>

      <div className="grid md:grid-cols-2 gap-12 items-start">
        {/* Core Experience Column */}
        <div className="space-y-8">
          <div className="flex items-center gap-3 text-accent transition-colors">
            <Briefcase className="w-6 h-6" />
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Core Experience</h2>
          </div>
          <div className="space-y-6">
            {experiences.map((exp, idx) => (
              <div key={idx} className="relative pl-6 border-l-2 border-border hover:border-accent transition-colors py-2 group">
                <div className="absolute -left-1.5 top-5 w-3 h-3 rounded-full bg-border group-hover:bg-accent transition-colors" />
                <h3 className="font-bold text-lg text-foreground leading-snug">{exp.role}</h3>
                <p className="text-sm text-accent font-semibold mt-0.5">{exp.company} · {exp.period}</p>
                {exp.desc && (
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{exp.desc}</p>
                )}
                {exp.placements && (
                  <div className="mt-3.5 space-y-4">
                    {exp.placements.map((p, pIdx) => (
                      <div key={pIdx} className="space-y-1.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                            <span className="font-bold text-sm text-foreground">
                              Client: <span className="text-accent">{p.client}</span>
                            </span>
                          </div>
                          <span className="font-mono text-xs text-muted-foreground font-semibold shrink-0">
                            {p.period}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pl-3.5">
                          {p.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Technical Arsenal Column */}
        <div className="space-y-8">
          <div className="flex items-center gap-3 text-accent transition-colors">
            <Code2 className="w-6 h-6" />
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Technical Arsenal</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {skillsets.map((skillset, idx) => (
              <div key={idx} className="stitch-card p-4 rounded-2xl relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-accent/30 before:to-transparent">
                <h4 className="font-bold text-xs mb-3 text-foreground/80 uppercase tracking-widest font-mono">{skillset.category}</h4>
                <div className="flex flex-wrap gap-1.5">
                  {skillset.skills.map(skill => (
                    <span key={skill} className="px-2 py-0.5 text-[10px] font-bold bg-accent/5 text-accent rounded-md border border-accent/10">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Quantified Impact / Highlights */}
          <div className="pt-4">
            <div className="flex items-center gap-3 text-accent mb-6 transition-colors">
              <Award className="w-6 h-6" />
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Enterprise &amp; Mission Impact</h2>
            </div>
            <div className="stitch-card p-6 rounded-2xl space-y-4 relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-accent/40 before:to-transparent">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-muted/40 border border-border/50">
                  <p className="text-2xl font-black font-mono text-accent">100M+</p>
                  <p className="text-xs text-muted-foreground font-semibold mt-1">
                    Engineer on Disney Streaming platform serving 100M+ global subscribers
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-muted/40 border border-border/50">
                  <p className="text-2xl font-black font-mono text-accent">$3B+</p>
                  <p className="text-xs text-muted-foreground font-semibold mt-1">
                    Full-stack engineer on FEMA GO platform processing $3B+ in annual federal grant funding
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-muted/40 border border-border/50">
                  <p className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">95–100</p>
                  <p className="text-xs text-muted-foreground font-semibold mt-1">
                    Google Lighthouse performance &amp; production quality benchmarks
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-muted/40 border border-border/50">
                  <p className="text-2xl font-black font-mono text-accent">45%+</p>
                  <p className="text-xs text-muted-foreground font-semibold mt-1">
                    Faster prototyping &amp; delivery via agentic workflows vs. traditional manual scaffolding
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Laser Divider */}
      <div className="laser-divider my-8" />

      {/* Recruiter & Strategic Partnership CTA Banner */}
      <div className="p-10 rounded-[2.5rem] glass border border-accent/20 text-center space-y-6 relative overflow-hidden shadow-xl">
        <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-40 bg-accent/15 rounded-full blur-3xl" />
        <div className="inline-flex items-center gap-2 glass px-3 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-md backdrop-blur-md border border-border relative z-10 max-w-full">
          <Compass className="w-3.5 h-3.5 text-accent shrink-0" />
          <span className="font-mono text-[10px] sm:text-xs text-accent tracking-wider sm:tracking-widest uppercase font-bold whitespace-nowrap">CAREER OPPORTUNITIES</span>
          <span className="text-border">|</span>
          <span className="font-mono text-[10px] sm:text-xs text-muted-foreground uppercase whitespace-nowrap hidden sm:inline">TECHNICAL ROLES &amp; PARTNERSHIPS</span>
          <span className="font-mono text-[10px] text-muted-foreground uppercase whitespace-nowrap sm:hidden">ROLES &amp; COLLABS</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-foreground">
          Looking for a Full-Stack &amp; AI Software Engineer or Technical Partner?
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto font-medium text-base">
          I&apos;m looking for Full-Stack &amp; AI Software Engineer roles and technical partners. If you&apos;re a recruiter, hiring manager, or organization seeking a technical collaborator, let&apos;s connect.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 w-full sm:w-auto">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 bg-[#090D16] hover:bg-[#151D2F] text-white dark:bg-accent dark:text-accent-foreground px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-sm sm:text-base hover:scale-105 transition-transform shadow-lg shadow-black/10 dark:shadow-accent/20 border border-[#090D16] dark:border-transparent"
          >
            <span>Hire Me / Get in Touch</span> <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#00D8F6] dark:text-current" />
          </Link>
          <a
            href="/resume.pdf"
            download="Rottman_Mendez_Resume.pdf"
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-900 border border-slate-300/80 shadow-sm dark:glass dark:text-foreground dark:border-border dark:hover:bg-muted px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base transition-all"
          >
            <Download className="w-4 h-4 text-accent" /> Download Resume (PDF)
          </a>
        </div>
      </div>
    </div>
  </section>
  );
}
