// src/app/about/page.tsx
'use client';
import { Briefcase, Code2, Award, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const experiences = [
  {
    role: "Full-Stack & AI Software Engineer (Independent Consultant)",
    company: "RottyM Designs",
    period: "11/2023 – Present",
    desc: "Architecting AI-augmented cloud platforms, RAG pipelines, Model Context Protocol (MCP) integrations, and high-performance headless Next.js applications (Vercel, GCP, Firebase). Partnering with healthcare providers, regional non-profits, and commercial clients to modernize legacy systems and automate workflows."
  },
  {
    role: "Full-Stack Software Engineer (Contract)",
    company: "Disney Streaming",
    period: "05/2022 – 11/2023",
    desc: "Scaled distributed microservices supporting 100M+ global streaming subscribers using Java, Scala, Spring Boot, TypeScript, and AWS (S3, Athena, Lambda) within Docker/Kubernetes environments. Led front-end JWT auth migration and real-time observability telemetry."
  },
  {
    role: "Full-Stack Software Engineer (Contract)",
    company: "BAE Systems",
    period: "09/2021 – 04/2022",
    desc: "Engineered mission-critical production expense-tracking systems for the Defense Intelligence Agency (DIA) within a secure, high-compliance distributed team using JavaScript, React/Redux on the front end, backed by Java and SQL, maintaining 99.9% system availability."
  },
  {
    role: "Senior Software Engineer",
    company: "One Globe LLC – FEMA",
    period: "07/2020 – 08/2021",
    desc: "Engineered full-stack microservices and UI workflows for the FEMA GO Grants Management Modernization platform, consolidating 40+ disparate federal grant programs processing $3B+ in annual funding using Java, React/Redux, OpenShift, AWS, PostgreSQL, and Camunda BPMN."
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
    <section className="py-20 md:py-24 px-6 max-w-5xl mx-auto space-y-20">
      {/* Intro Header */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl md:text-6xl font-black tracking-tight text-foreground">Rottman M. Mendez</h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium">
          I’m a Full-Stack &amp; AI Software Engineer based in Reston, Virginia. With extensive experience engineering scalable enterprise microservices (Disney Streaming, FEMA, BAE Systems) and delivering AI-augmented cloud platforms, I specialize in modern serverless web stacks (Next.js, React, TypeScript, Tailwind CSS, Sanity, Vercel) and enterprise backend systems (Java, Spring Boot, Scala, GCP, Firebase, AWS). I help organizations and technical teams replace fragile legacy systems with reliable, high-performance digital platforms.
        </p>
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
              <div key={idx} className="p-4 rounded-2xl bg-muted/30 border border-border transition-colors">
                <h4 className="font-bold text-xs mb-3 text-foreground/80 uppercase tracking-widest">{skillset.category}</h4>
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

          {/* Quantified Impact / Highlights (Replaces Education) */}
          <div className="pt-4">
            <div className="flex items-center gap-3 text-accent mb-6 transition-colors">
              <Award className="w-6 h-6" />
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Enterprise &amp; Mission Impact</h2>
            </div>
            <div className="p-6 glass rounded-2xl border border-border space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-muted/40 border border-border/50">
                  <p className="text-2xl font-black text-accent">100M+</p>
                  <p className="text-xs text-muted-foreground font-semibold mt-1">Subscribers Supported at Disney Streaming</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/40 border border-border/50">
                  <p className="text-2xl font-black text-accent">$3B+</p>
                  <p className="text-xs text-muted-foreground font-semibold mt-1">Annual Funding Processed on FEMA GO</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/40 border border-border/50">
                  <p className="text-2xl font-black text-accent">95–100</p>
                  <p className="text-xs text-muted-foreground font-semibold mt-1">Google Lighthouse Performance Scores</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/40 border border-border/50">
                  <p className="text-2xl font-black text-accent">45%+</p>
                  <p className="text-xs text-muted-foreground font-semibold mt-1">Faster Prototyping via Agentic Workflows</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      <div className="p-10 rounded-[2.5rem] glass border border-accent/20 text-center space-y-6">
        <h2 className="text-3xl font-black text-foreground">Interested in partnering or reviewing architecture?</h2>
        <p className="text-muted-foreground max-w-xl mx-auto font-medium">
          Whether you need a custom platform built from the ground up or experienced engineering leadership for an enterprise team, let&apos;s connect.
        </p>
        <Link href="/contact" className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-8 py-4 rounded-2xl font-black text-base hover:scale-105 transition-transform shadow-lg shadow-accent/20">
          Get in Touch <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </section>
  );
}
