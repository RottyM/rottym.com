// src/app/about/page.tsx
'use client';
import { motion } from 'framer-motion';
import { Briefcase, GraduationCap, Code2, Award } from 'lucide-react';

export default function About() {
  return (
    <section className="py-24 px-6 max-w-5xl mx-auto space-y-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-5xl md:text-6xl font-black tracking-tight">Rottman M. Mendez</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Over a decade of engineering high-scale platforms for global brands. Now leveraging AI to build the next generation of digital experiences.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <div className="flex items-center gap-3 text-accent transition-colors">
            <Briefcase className="w-6 h-6" />
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Core Experience</h2>
          </div>
          <div className="space-y-6">
            {[
              {
                role: "Senior Software Engineer",
                company: "Disney Streaming",
                period: "2022-2023",
                desc: "Architected high-scale Java/Spring Boot microservices on AWS for millions of subscribers."
              },
              {
                role: "Full Stack Developer",
                company: "BAE Systems / USA Today",
                period: "2021-2022",
                desc: "Led front-end initiatives with React and developed robust cloud logic for critical applications."
              },
              {
                role: "Senior Consultant",
                company: "Freelance",
                period: "2021-Present",
                desc: "Helping businesses escape WordPress legacy and launch high-performance modern sites."
              }
            ].map((exp, idx) => (
              <div key={idx} className="relative pl-6 border-l-2 border-border hover:border-accent transition-colors py-2">
                <div className="absolute -left-1.5 top-5 w-3 h-3 rounded-full bg-border group-hover:bg-accent" />
                <h3 className="font-bold text-lg text-foreground">{exp.role}</h3>
                <p className="text-sm text-accent font-semibold">{exp.company} · {exp.period}</p>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{exp.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <div className="flex items-center gap-3 text-accent transition-colors">
            <Code2 className="w-6 h-6" />
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Technical Arsenal</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { category: "Frontend", skills: ["React", "Next.js", "Tailwind", "Framer Motion"] },
              { category: "Backend", skills: ["Java", "Spring Boot", "Node.js", "TypeScript"] },
              { category: "Cloud", skills: ["AWS", "Firebase", "GCP", "Docker"] },
              { category: "Data", skills: ["PostgreSQL", "DynamoDB", "Athena", "GraphQL"] }
            ].map((skillset, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-muted/30 border border-border transition-colors">
                <h4 className="font-bold text-sm mb-3 text-foreground/80 uppercase tracking-widest">{skillset.category}</h4>
                <div className="flex flex-wrap gap-2">
                  {skillset.skills.map(skill => (
                    <span key={skill} className="px-2 py-1 text-[10px] font-black bg-accent/5 text-accent rounded-md border border-accent/10">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-8">
            <div className="flex items-center gap-3 text-accent mb-6 transition-colors transition-colors">
              <GraduationCap className="w-6 h-6" />
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Education & Certs</h2>
            </div>
            <div className="p-6 glass rounded-2xl border border-border transition-colors">
              <p className="text-sm text-foreground font-bold italic">Bachelor’s in Communications</p>
              <p className="text-xs text-muted-foreground font-medium">University of San Carlos, Guatemala</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-muted rounded-full text-[10px] font-bold text-muted-foreground">Udemy: React Expert</span>
                <span className="px-3 py-1 bg-muted rounded-full text-[10px] font-bold text-muted-foreground">AWS Practitioner</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}