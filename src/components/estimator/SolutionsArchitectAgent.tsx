// src/components/estimator/SolutionsArchitectAgent.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Bot,
  Send,
  Sparkles,
  ArrowUp,
  ArrowUpRight,
  ShieldCheck,
  Check,
  Copy,
  Terminal,
  Phone,
  Network,
  ChevronDown,
  ChevronUp,
  Paperclip,
  Zap,
} from 'lucide-react';
import LeadFormStatus from '@/components/LeadFormStatus';
import { useLeadForm } from '@/hooks/useLeadForm';
import {
  VERIFIED_CASE_EVIDENCE,
  AGENT_QUICK_PROMPTS,
} from '@/lib/agent-knowledge';
import type { CalculatedEstimate } from '@/lib/estimator-config';

export interface AgentChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface SolutionsArchitectAgentProps {
  estimate: CalculatedEstimate;
  messages: AgentChatMessage[];
  isAnalyzing: boolean;
  agentMode: 'ready' | 'gemini-grounded' | 'deterministic-blueprint';
  errorBanner: string;
  onSendMessage: (promptText: string) => Promise<void>;
  onScrollToConfigurator: () => void;
  discoveryNameInputId: string;
}

/**
 * Lightweight, safe renderer for structured AI Architect Markdown
 * (supports ###/#### headings, bullet lists, **bold**, and `inline code`).
 */
function renderFormattedInline(text: string): React.ReactNode[] {
  const tokens = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return tokens.map((token, idx) => {
    if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
      return (
        <strong key={idx} className="font-bold text-foreground">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith('`') && token.endsWith('`') && token.length > 2) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-[11px] text-accent"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    return <span key={idx}>{token}</span>;
  });
}

function FormattedArchitectMarkdown({ content }: { content: string }) {
  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = (keyPrefix: string) => {
    if (listItems.length === 0) return;
    blocks.push(
      <ul key={keyPrefix} className="space-y-1.5 pl-4 list-disc marker:text-accent">
        {listItems.map((item, idx) => (
          <li key={idx} className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
            {renderFormattedInline(item)}
          </li>
        ))}
      </ul>
    );
    listItems = [];
  };

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();
    if (!line) {
      flushList(`list-${idx}`);
      return;
    }

    if (line.startsWith('### ')) {
      flushList(`list-${idx}`);
      blocks.push(
        <h4
          key={`h3-${idx}`}
          className="text-sm sm:text-base font-black text-foreground tracking-tight pt-1"
        >
          {renderFormattedInline(line.slice(4))}
        </h4>
      );
      return;
    }

    if (line.startsWith('#### ')) {
      flushList(`list-${idx}`);
      blocks.push(
        <h5
          key={`h4-${idx}`}
          className="font-mono text-xs uppercase tracking-wider font-bold text-accent pt-2"
        >
          {renderFormattedInline(line.slice(5))}
        </h5>
      );
      return;
    }

    if (line.startsWith('- ') || line.startsWith('* ')) {
      listItems.push(line.slice(2));
      return;
    }

    flushList(`list-${idx}`);
    blocks.push(
      <p key={`p-${idx}`} className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
        {renderFormattedInline(line)}
      </p>
    );
  });

  flushList('list-final');

  return <div className="space-y-2.5">{blocks}</div>;
}

const ENGINEERING_SAFEGUARDS = [
  {
    title: '100% Client Git Ownership',
    detail:
      'Zero vendor lock-in or proprietary licensing. Full repository and domain control transferred at launch.',
  },
  {
    title: 'Deterministic Schema Contracts',
    detail:
      'Strict server-side payload validation and sliding-window rate limits across every API & AI route.',
  },
  {
    title: 'Prompt & Context Fencing',
    detail:
      'Grounded exclusively on verified business SOPs, pricing rules, and real operational workflows.',
  },
  {
    title: '95+ Core Web Vitals Budget',
    detail:
      'Edge-rendered Next.js 16 architecture targeting sub-350ms TTFB and WCAG 2.1 AA accessibility.',
  },
];

export default function SolutionsArchitectAgent({
  estimate,
  messages,
  isAnalyzing,
  agentMode,
  errorBanner,
  onSendMessage,
  onScrollToConfigurator,
  discoveryNameInputId,
}: SolutionsArchitectAgentProps) {
  const [promptInput, setPromptInput] = useState('');
  const [payloadExpanded, setPayloadExpanded] = useState(true);
  const [copiedPayload, setCopiedPayload] = useState(false);

  // Stage Discovery Request form state
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadWebsite, setLeadWebsite] = useState('');
  const [leadNotes, setLeadNotes] = useState('');

  const { status, isSubmitting, isSuccess, submitLead } = useLeadForm({
    formId: 'estimator_discovery_request',
    serviceLabel: `AI Studio Scope: ${estimate.track.name} (${estimate.formattedPriceRange})`,
    gaCategory: 'scope_estimator_studio',
    successMessage:
      'Scope transmitted! Rottman will review your architecture spec and reply within 1 business day.',
  });

  const handlePromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = promptInput.trim();
    if (!trimmed || isAnalyzing) return;
    setPromptInput('');
    await onSendMessage(trimmed);
  };

  const handleCopyPayload = async () => {
    try {
      await navigator.clipboard.writeText(estimate.serializedSummary);
      setCopiedPayload(true);
      setTimeout(() => setCopiedPayload(false), 2000);
    } catch {
      // Clipboard API unavailable in restricted contexts
    }
  };

  const handleDiscoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const latestAssistant = [...messages]
      .reverse()
      .find((m) => m.role === 'assistant');

    const extraBlocks = [
      leadNotes.trim() ? `Client Project Notes:\n${leadNotes.trim()}` : '',
      estimate.serializedSummary,
      latestAssistant
        ? `--- Latest AI Architect Summary ---\n${latestAssistant.content}`
        : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    const ok = await submitLead({
      name: leadName,
      email: leadEmail,
      websiteUrl: leadWebsite.trim() || 'Not provided (New Build / Concept)',
      extraMessage: extraBlocks,
    });

    if (ok) {
      setLeadName('');
      setLeadEmail('');
      setLeadWebsite('');
      setLeadNotes('');
    }
  };

  const activeItemCount =
    1 + estimate.selectedTech.length + estimate.selectedCapabilities.length;

  return (
    <section
      aria-labelledby="ai-architect-console-heading"
      className="space-y-6 pt-4"
    >
      {/* Top Active Payload Telemetry Ribbon */}
      <div className="stitch-card p-4 sm:p-5 rounded-lg space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              <span
                className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"
                aria-hidden="true"
              />
              {agentMode === 'gemini-grounded'
                ? 'GEMINI GROUNDED ARCHITECT · LIVE'
                : agentMode === 'deterministic-blueprint'
                  ? 'ARCHITECT ENGINE · DETERMINISTIC BLUEPRINT'
                  : 'ROTTYM AI ARCHITECT · ONLINE'}
            </span>
            <span className="font-mono text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">
              RESTON-VA // ZERO-LOCK-IN TOPOLOGY
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-muted border border-border font-mono text-[10px] sm:text-[11px] text-muted-foreground">
              TRACK:{' '}
              <strong className="text-foreground">{estimate.track.name}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-muted border border-border font-mono text-[10px] sm:text-[11px] text-muted-foreground">
              RANGE:{' '}
              <strong className="text-emerald-700 dark:text-emerald-400">
                {estimate.formattedPriceRange}
              </strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-muted border border-border font-mono text-[10px] sm:text-[11px] text-muted-foreground hidden sm:inline-block">
              CADENCE:{' '}
              <strong className="text-foreground">
                {estimate.formattedTimeline}
              </strong>
            </span>
            <button
              type="button"
              onClick={onScrollToConfigurator}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-card hover:bg-muted border border-border hover:border-accent font-mono text-[10px] sm:text-[11px] font-bold text-foreground transition-colors cursor-pointer"
            >
              <ArrowUp className="w-3 h-3 text-accent" aria-hidden="true" />
              Reconfigure Scope
            </button>
          </div>
        </div>
      </div>

      {/* Main 12-Column Split AI Console */}
      <div className="grid lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left 7 Columns: Live Architectural Stream + Chat */}
        <div className="lg:col-span-7 space-y-5">
          <div className="flex items-center justify-between gap-2 border-b border-border pb-2.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-accent/10 border border-accent/25 font-mono text-[11px] font-bold uppercase tracking-widest text-accent">
                05 // AI SOLUTIONS ARCHITECT
              </span>
              <h2
                id="ai-architect-console-heading"
                className="text-lg sm:text-xl font-black tracking-tight text-foreground"
              >
                Live Architectural Synthesis
              </h2>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
              PAYLOAD SYNCED
            </span>
          </div>

          {/* Serialized JSON Scope Payload Viewer */}
          <div className="rounded-lg bg-slate-950 dark:bg-[#0b101a] border border-slate-800 dark:border-[#1a2536] overflow-hidden text-slate-100">
            <div className="px-4 py-2.5 bg-slate-900/90 dark:bg-[#0e1420] border-b border-slate-800 dark:border-[#1a2536] flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setPayloadExpanded((prev) => !prev)}
                aria-expanded={payloadExpanded}
                className="inline-flex items-center gap-2 font-mono text-[11px] font-bold text-[#00f2fe] hover:opacity-90 cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5" aria-hidden="true" />
                <span>&gt;_ HANDOFF_SCOPE_PAYLOAD</span>
                {payloadExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                )}
              </button>

              <button
                type="button"
                onClick={handleCopyPayload}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-800 border border-slate-700 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-200 transition-colors cursor-pointer"
              >
                {copiedPayload ? (
                  <>
                    <Check className="w-3 h-3 text-[#00f5a0]" aria-hidden="true" />
                    <span className="text-[#00f5a0]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-[#00f2fe]" aria-hidden="true" />
                    <span>Copy Spec</span>
                  </>
                )}
              </button>
            </div>

            {payloadExpanded && (
              <pre className="p-4 font-mono text-[11px] sm:text-xs leading-relaxed text-emerald-300 overflow-x-auto">
                {JSON.stringify(estimate.jsonPayload, null, 2)}
              </pre>
            )}
          </div>

          {/* Grounded Recommended System Topology Card */}
          <div className="stitch-card p-5 sm:p-6 rounded-lg space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-accent" aria-hidden="true" />
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-foreground">
                  RECOMMENDED SYSTEM TOPOLOGY // ZERO-DRIFT
                </span>
              </div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                PRODUCTION BLUEPRINT
              </span>
            </div>

            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {estimate.topology.map((node, index) => (
                <div
                  key={node.layer}
                  className="p-3.5 rounded-lg bg-muted/60 dark:bg-background/80 border border-border space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-accent">
                      0{index + 1} · {node.layer}
                    </span>
                  </div>
                  <p className="font-bold text-xs sm:text-sm text-foreground leading-snug">
                    {node.title}
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">
                    {node.detail}
                  </p>
                </div>
              ))}
            </div>

            {/* 4 Engineering Safeguard Covenants */}
            <div className="pt-3 border-t border-border/70 space-y-2.5">
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                ENGINEERING SAFEGUARDS &amp; DELIVERABLE COVENANTS
              </p>
              <div className="grid sm:grid-cols-2 gap-2.5">
                {ENGINEERING_SAFEGUARDS.map((item) => (
                  <div
                    key={item.title}
                    className="p-3 rounded-lg bg-muted/35 border border-border/70 flex items-start gap-2.5"
                  >
                    <ShieldCheck
                      className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <div className="space-y-0.5">
                      <p className="font-bold text-xs text-foreground">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Grounded AI Solutions Architect Chat Stream */}
          <div className="stitch-card p-5 sm:p-6 rounded-lg space-y-4">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
                  <Bot className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm sm:text-base font-black text-foreground">
                      RottyM AI Solutions Architect
                    </h3>
                    <span className="px-2 py-0.5 rounded bg-accent/10 border border-accent/25 font-mono text-[9px] font-bold uppercase tracking-wider text-accent">
                      GROUNDED ADVISOR
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Ask about stack tradeoffs, WordPress escapes, AI guardrails, or your configured estimate.
                  </p>
                </div>
              </div>
            </div>

            {/* Conversation Stream */}
            <div
              aria-live="polite"
              className="space-y-4 max-h-[460px] overflow-y-auto pr-1"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-4 rounded-lg border ${
                    msg.role === 'user'
                      ? 'bg-accent/10 border-accent/30 ml-4 sm:ml-10'
                      : 'bg-muted/45 dark:bg-background/70 border-border mr-2 sm:mr-4'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-accent">
                      {msg.role === 'user'
                        ? 'YOU // SCOPE INQUIRY'
                        : 'ROTTYM AI ARCHITECT // RESPONSE'}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {msg.timestamp}
                    </span>
                  </div>

                  {msg.role === 'assistant' ? (
                    <FormattedArchitectMarkdown content={msg.content} />
                  ) : (
                    <p className="text-xs sm:text-sm text-foreground font-medium leading-relaxed">
                      {msg.content}
                    </p>
                  )}
                </div>
              ))}

              {isAnalyzing && (
                <div className="p-4 rounded-lg bg-muted/45 dark:bg-background/70 border border-accent/30 flex items-center gap-3">
                  <Sparkles
                    className="w-4 h-4 text-accent animate-spin shrink-0"
                    aria-hidden="true"
                  />
                  <span className="font-mono text-xs text-foreground">
                    Evaluating {estimate.track.name} topology &amp; case-study benchmarks...
                  </span>
                </div>
              )}

              {errorBanner && (
                <div
                  role="alert"
                  className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/25 text-xs text-red-700 dark:text-red-400 font-medium"
                >
                  {errorBanner}
                </div>
              )}
            </div>

            {/* Suggested Exploration Inquiries */}
            <div className="space-y-2 pt-2 border-t border-border/70">
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                SUGGESTED ARCHITECTURAL INQUIRIES
              </p>
              <div className="flex flex-wrap gap-2">
                {AGENT_QUICK_PROMPTS.map((chipPrompt) => (
                  <button
                    key={chipPrompt}
                    type="button"
                    disabled={isAnalyzing}
                    onClick={() => onSendMessage(chipPrompt)}
                    className="text-left px-3 py-1.5 rounded-lg bg-muted/60 hover:bg-accent/10 border border-border hover:border-accent text-xs font-medium text-foreground/90 hover:text-foreground transition-all cursor-pointer disabled:opacity-50"
                  >
                    &ldquo;{chipPrompt}&rdquo;
                  </button>
                ))}
              </div>
            </div>

            {/* Terminal-Grade Prompt Input Bar */}
            <form onSubmit={handlePromptSubmit} className="pt-1">
              <label htmlFor="ai-architect-input" className="sr-only">
                Ask the RottyM AI Solutions Architect a question
              </label>
              <div className="flex items-center gap-2 p-1.5 rounded-lg bg-muted/50 dark:bg-background border border-border focus-within:border-accent transition-colors">
                <span
                  aria-hidden="true"
                  className="pl-2.5 font-mono text-xs font-bold text-accent select-none"
                >
                  &gt;_
                </span>
                <input
                  id="ai-architect-input"
                  type="text"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder="Ask about stack tradeoffs, migration SEO, AI guardrails, or timeline..."
                  maxLength={1000}
                  disabled={isAnalyzing}
                  className="flex-1 bg-transparent py-2 px-1 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isAnalyzing || !promptInput.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#090D16] hover:bg-[#151D2F] text-white dark:bg-accent dark:text-accent-foreground dark:hover:bg-[#38bdf8] font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 shrink-0"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right 5 Columns: Verified Case Evidence + Stage Discovery Request */}
        <div className="lg:col-span-5 space-y-6">
          {/* Verified Case Study Proof Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                {'// VERIFIED CASE EVIDENCE'}
              </span>
              <Link
                href="/portfolio"
                className="font-mono text-[10px] font-bold uppercase tracking-wider text-accent hover:underline"
              >
                All Case Studies →
              </Link>
            </div>

            <div className="space-y-3">
              {VERIFIED_CASE_EVIDENCE.map((study) => (
                <Link
                  key={study.slug}
                  href={study.href}
                  className="block stitch-card p-4 rounded-lg space-y-2 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-foreground group-hover:text-accent transition-colors inline-flex items-center gap-1">
                        {study.title}
                        <ArrowUpRight
                          className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100"
                          aria-hidden="true"
                        />
                      </h3>
                      <p className="font-mono text-[10px] text-muted-foreground">
                        {study.stackLabel}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 font-mono text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                      {study.badge}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {study.summary}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* Stage Discovery Request / Lock 30-Min Call Form */}
          <div className="relative rounded-lg bg-card border border-accent/40 dark:border-accent/35 p-5 sm:p-6 shadow-xl space-y-5 overflow-hidden">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent via-sky-400 to-emerald-400"
            />

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent/10 border border-accent/30 font-mono text-[10px] font-bold uppercase tracking-wider text-accent">
                <Paperclip className="w-3 h-3" aria-hidden="true" />
                LIVE PAYLOAD ATTACHED // {activeItemCount}-ITEM TECH SPEC
              </span>
              <h3 className="text-xl font-black text-foreground tracking-tight">
                Lock 30-Min Architectural Discovery Call
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Conducted directly with Rottman M. Mendez. Your configured{' '}
                <strong className="text-foreground">{estimate.track.name}</strong>{' '}
                scope ({estimate.formattedPriceRange}) is automatically attached—no need to re-type anything.
              </p>
            </div>

            <form onSubmit={handleDiscoverySubmit} className="space-y-3.5">
              <div>
                <label
                  htmlFor={discoveryNameInputId}
                  className="block font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1"
                >
                  Your Name &amp; Role
                </label>
                <input
                  id={discoveryNameInputId}
                  type="text"
                  required
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  placeholder="e.g. Alex Vance, Founder"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-background border border-border focus:border-accent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="discovery-work-email"
                  className="block font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1"
                >
                  Work Email
                </label>
                <input
                  id="discovery-work-email"
                  type="email"
                  required
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  placeholder="alex@yourbusiness.com"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-background border border-border focus:border-accent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="discovery-target-url"
                  className="block font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1"
                >
                  Current Website URL (Optional)
                </label>
                <input
                  id="discovery-target-url"
                  type="text"
                  value={leadWebsite}
                  onChange={(e) => setLeadWebsite(e.target.value)}
                  placeholder="https://yourcompany.com (or New Build)"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-background border border-border focus:border-accent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="discovery-notes"
                  className="block font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1"
                >
                  Key Bottlenecks or Goals (Optional)
                </label>
                <textarea
                  id="discovery-notes"
                  rows={3}
                  value={leadNotes}
                  onChange={(e) => setLeadNotes(e.target.value)}
                  placeholder="e.g. Escaping a slow WordPress build, automating booking intake, or deploying a grounded AI assistant..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-background border border-border focus:border-accent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none resize-y"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#090D16] hover:bg-[#151D2F] text-white dark:bg-accent dark:text-accent-foreground dark:hover:bg-[#38bdf8] px-5 py-3.5 rounded-lg font-bold font-mono text-xs sm:text-sm uppercase tracking-wider hover:scale-[1.01] transition-all shadow-md shadow-black/10 dark:shadow-accent/25 cursor-pointer disabled:opacity-60"
              >
                <span>
                  {isSubmitting
                    ? 'Transmitting Scope...'
                    : 'Transmit Scope & Lock Discovery Call'}
                </span>
                <Zap className="w-4 h-4 text-[#00D8F6] dark:text-current" aria-hidden="true" />
              </button>

              <LeadFormStatus status={status} isSuccess={isSuccess} />
            </form>

            <div className="pt-3 border-t border-border/70 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-muted-foreground">
                  Response SLA:
                </span>
                <span className="font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                  Within 1 Business Day
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-muted-foreground">
                  Direct Studio Line:
                </span>
                <a
                  href="tel:2028540954"
                  className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-foreground hover:text-accent transition-colors"
                >
                  <Phone className="w-3 h-3 text-accent" aria-hidden="true" />
                  (202) 854-0954
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
