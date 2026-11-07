// src/app/about/page.tsx
'use client';

import { Briefcase, Code2, Award, ArrowRight, Download, Sparkles } from 'lucide-react';
import Link from 'next/link';

const experiences = [
  {
    role: "Full-Stack & AI Software Engineer (Independent Consultant)",
    company: "RottyM Designs",
    period: "11/2023 – Present",
    desc: "Architecting AI-augmented cloud platforms, RAG pipelines, MCP integrations, and high-performance headless Next.js applications (Vercel, GCP, Firebase). Partnering with healthcare providers, regional non-profits, and commercial clients to modernize legacy systems, automate intake/membership pipelines, and accelerate release cycles by 45%+ using agentic engineering workflows."
  },
  {
    role: "Full-Stack Software Engineer (Contract)",
    company: "Insight Global – Disney Streaming",
    period: "05/2022 – 11/2023",
    desc: "Scaled distributed microservices supporting 100M+ global streaming subscribers using Java, Scala, Spring Boot, TypeScript, and AWS (S3, Athena, Lambda) within Docker/Kubernetes environments. Led front-end JWT auth migration (reducing session token errors by 30%) and integrated real-time Adobe Analytics compliance telemetry."
  },
  {
    role: "Full-Stack Software Engineer (Contract)",
    company: "Insight Global – BAE Systems",
    period: "09/2021 – 04/2022",
    desc: "Engineered mission-critical production expense-tracking systems for the Defense Intelligence Agency (DIA) within a secure, high-compliance distributed engineering team using React/Redux on the front end, backed by Java and SQL, maintaining 99.9% system availability."
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
    <section className="relative pt-10 pb-24 px-4 md:px-6 min-h-screen overflow-hidden">
      {/* Background Dot-Grid Texture */}
      <div className="absolute inset-0 bg-dot-grid opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] pointer-events-none -z-10" />

      {/* Atmospheric Radial Ambient Lighting */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[480px] bg-gradient-to-tr from-accent/15 via-emerald-500/10 to-transparent blur-[130px] rounded-full -z-10" />
      <div className="pointer-events-none absolute top-1/2 -right-32 w-[420px] h-[420px] bg-accent/5 rounded-full blur-[110px] -z-10" />

      <div className="max-w-5xl mx-auto space-y-16 relative z-10">
        {/* Intro Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2.5 glass px-4 py-1.5 rounded-full shadow-md backdrop-blur-md border border-border">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-xs text-accent tracking-widest uppercase font-bold">FULL-STACK &amp; AI SOFTWARE ENGINEER</span>
            <span className="text-border">|</span>
            <span className="font-mono text-xs text-muted-foreground uppercase">RESTON, VA</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-[1.12]">
            Rottman M. <span className="tech-gradient-text">Mendez</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed font-medium max-w-3xl mx-auto">
            Full-Stack &amp; AI Software Engineer based in Reston, Virginia. With extensive experience engineering scalable enterprise microservices (Disney Streaming, FEMA, BAE Systems, FAA via Leidos) and delivering AI-augmented cloud platforms, I specialize in modern serverless web stacks (Next.js, React, TypeScript, Tailwind CSS, Sanity, Vercel) and enterprise backend systems (Java, Spring Boot, Scala, GCP, Firebase, AWS). I help organizations and technical teams replace fragile legacy systems with reliable, high-performance digital platforms.
          </p>

          {/* Action Buttons directly under the bio */}
          <div className="pt-2 flex flex-col items-center gap-4">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-7 py-3.5 rounded-2xl font-bold text-sm hover:scale-105 transition-all shadow-lg shadow-accent/20"
              >
                Hire Me / Get in Touch <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="/resume.pdf"
                download="Rottman_Mendez_Resume.pdf"
                className="inline-flex items-center gap-2 glass px-7 py-3.5 rounded-2xl font-bold text-sm hover:bg-muted transition-all text-foreground border border-border shadow-sm"
              >
                <Download className="w-4 h-4 text-accent" /> Download Resume (PDF)
              </a>
            </div>

            <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-muted/80 border border-border/80 rounded-xl text-xs sm:text-sm font-semibold text-foreground/90 shadow-sm font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Looking for Full Stack &amp; AI Software Engineer roles and technical partners</span>
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
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{exp.desc}</p>
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
        <div className="inline-flex items-center gap-2.5 glass px-4 py-1.5 rounded-full shadow-md backdrop-blur-md border border-border relative z-10">
          <span className="font-mono text-xs text-accent tracking-widest uppercase font-bold">CAREER OPPORTUNITIES</span>
          <span className="text-border">|</span>
          <span className="font-mono text-xs text-muted-foreground uppercase">TECHNICAL ROLES &amp; PARTNERSHIPS</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-foreground">
          Looking for a Full Stack &amp; AI Software Engineer or Technical Partner?
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto font-medium text-base">
          I&apos;m looking for Full Stack &amp; AI Software Engineer roles and technical partners. If you&apos;re a recruiter, hiring manager, or organization seeking a technical collaborator, let&apos;s connect.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-8 py-4 rounded-2xl font-black text-base hover:scale-105 transition-transform shadow-lg shadow-accent/20"
          >
            Hire Me / Get in Touch <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="/resume.pdf"
            download="Rottman_Mendez_Resume.pdf"
            className="inline-flex items-center gap-2 glass px-8 py-4 rounded-2xl font-bold text-base hover:bg-muted transition-all text-foreground border border-border"
          >
            <Download className="w-4 h-4 text-accent" /> Download Resume (PDF)
          </a>
        </div>
      </div>
    </div>
  </section>
  );
}
