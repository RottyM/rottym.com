// src/components/estimator/ScopeEstimatorStudio.tsx
'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowDown } from 'lucide-react';
import {
  DEFAULT_ESTIMATOR_SELECTION,
  calculateEstimate,
  type EstimatorSelection,
  type TrackId,
  type TechAddonId,
  type CapabilityAddonId,
  type DeliveryPace,
} from '@/lib/estimator-config';
import { buildDeterministicScopeAnalysis } from '@/lib/agent-knowledge';
import { trackEvent } from '@/lib/analytics';
import TrackSelector from './TrackSelector';
import StackAndModulesSelector from './StackAndModulesSelector';
import DynamicRoadmap from './DynamicRoadmap';
import ScopeSummaryLedger from './ScopeSummaryLedger';
import SolutionsArchitectAgent, {
  type AgentChatMessage,
} from './SolutionsArchitectAgent';

const DISCOVERY_NAME_INPUT_ID = 'estimator-discovery-name';

function formatShortTime(): string {
  return new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ScopeEstimatorStudio() {
  const router = useRouter();
  const configuratorRef = useRef<HTMLDivElement>(null);
  const aiConsoleRef = useRef<HTMLDivElement>(null);

  const [selection, setSelection] = useState<EstimatorSelection>(
    DEFAULT_ESTIMATOR_SELECTION
  );
  const estimate = calculateEstimate(selection);

  const [messages, setMessages] = useState<AgentChatMessage[]>(() => [
    {
      id: 'initial-architect-brief',
      role: 'assistant',
      content: buildDeterministicScopeAnalysis(
        calculateEstimate(DEFAULT_ESTIMATOR_SELECTION)
      ),
      timestamp: 'LIVE STUDIO',
    },
  ]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [agentMode, setAgentMode] = useState<
    'ready' | 'gemini-grounded' | 'deterministic-blueprint'
  >('ready');
  const [errorBanner, setErrorBanner] = useState('');

  const handleSelectTrack = (trackId: TrackId) => {
    setSelection((prev) => ({ ...prev, trackId }));
    trackEvent({
      action: 'select_content',
      category: 'scope_estimator_studio',
      label: `track:${trackId}`,
    });
  };

  const handleToggleTech = (id: TechAddonId) => {
    setSelection((prev) => ({
      ...prev,
      techAddons: prev.techAddons.includes(id)
        ? prev.techAddons.filter((item) => item !== id)
        : [...prev.techAddons, id],
    }));
  };

  const handleToggleCapability = (id: CapabilityAddonId) => {
    setSelection((prev) => ({
      ...prev,
      capabilityAddons: prev.capabilityAddons.includes(id)
        ? prev.capabilityAddons.filter((item) => item !== id)
        : [...prev.capabilityAddons, id],
    }));
  };

  const handleChangePace = (pace: DeliveryPace) => {
    setSelection((prev) => ({ ...prev, pace }));
  };

  const handleReset = () => {
    setSelection(DEFAULT_ESTIMATOR_SELECTION);
  };

  const sendMessageToArchitect = async (promptText: string) => {
    const userMsg: AgentChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: promptText,
      timestamp: formatShortTime(),
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setIsAnalyzing(true);
    setErrorBanner('');

    trackEvent({
      action: 'ai_scope_analysis',
      category: 'scope_estimator_studio',
      label: estimate.track.id,
      value: estimate.minPrice,
    });

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selection,
          messages: updatedHistory.slice(-10).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = (await res.json()) as {
        success?: boolean;
        mode?: 'gemini-grounded' | 'deterministic-blueprint';
        reply?: string;
        message?: string;
      };

      if (!res.ok || !data.success || !data.reply) {
        setErrorBanner(
          data.message ||
            'Unable to reach the AI Architect right now. You can still submit your scope directly in the Discovery panel.'
        );
        return;
      }

      if (data.mode) {
        setAgentMode(data.mode);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.reply!,
          timestamp: formatShortTime(),
        },
      ]);
    } catch {
      setErrorBanner(
        'Network connection interrupted. Your configured scope is still ready to submit below.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeScopeHandoff = async () => {
    aiConsoleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const handoffPrompt = `Analyze my configured ${estimate.track.name} scope (${estimate.formattedPriceRange}, ${estimate.formattedTimeline}) and recommend the sharpest architecture, migration/AI safeguards, and relevant RottyM case studies.`;
    await sendMessageToArchitect(handoffPrompt);
  };

  const handleStageDiscoveryScroll = () => {
    const inputEl = document.getElementById(DISCOVERY_NAME_INPUT_ID);
    if (inputEl) {
      inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => inputEl.focus(), 350);
    } else {
      aiConsoleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleBookCallPrefill = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('rottym_estimator_scope', estimate.serializedSummary);
      sessionStorage.setItem(
        'rottym_estimator_service',
        estimate.track.contactServiceLabel
      );
    }
    trackEvent({
      action: 'select_content',
      category: 'scope_estimator_studio',
      label: 'book_call_handoff',
      value: estimate.minPrice,
    });
    router.push(
      `/contact?service=${encodeURIComponent(estimate.track.contactServiceSlug)}&from=estimator`
    );
  };

  const handleScrollToConfigurator = () => {
    configuratorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="space-y-16 pb-16 lg:pb-0">
      {/* Upper Split Console: Left 8 Cols Configurator | Right 4 Cols Sticky Ledger */}
      <div
        ref={configuratorRef}
        className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-start scroll-mt-24"
      >
        <div className="lg:col-span-8 space-y-10">
          <TrackSelector
            selectedTrackId={selection.trackId}
            onSelectTrack={handleSelectTrack}
          />

          <StackAndModulesSelector
            selectedTrackId={selection.trackId}
            selectedTech={selection.techAddons}
            selectedCapabilities={selection.capabilityAddons}
            pace={selection.pace}
            onToggleTech={handleToggleTech}
            onToggleCapability={handleToggleCapability}
            onChangePace={handleChangePace}
          />

          <DynamicRoadmap phases={estimate.roadmap} />
        </div>

        <div className="lg:col-span-4">
          <ScopeSummaryLedger
            estimate={estimate}
            isAnalyzing={isAnalyzing}
            onAnalyzeWithAI={handleAnalyzeScopeHandoff}
            onStageDiscovery={handleStageDiscoveryScroll}
            onBookCall={handleBookCallPrefill}
            onReset={handleReset}
          />
        </div>
      </div>

      <div className="laser-divider opacity-80" />

      {/* Lower Split Console: AI Solutions Architect + Discovery Handoff */}
      <div ref={aiConsoleRef} className="scroll-mt-24">
        <SolutionsArchitectAgent
          estimate={estimate}
          messages={messages}
          isAnalyzing={isAnalyzing}
          agentMode={agentMode}
          errorBanner={errorBanner}
          onSendMessage={sendMessageToArchitect}
          onScrollToConfigurator={handleScrollToConfigurator}
          discoveryNameInputId={DISCOVERY_NAME_INPUT_ID}
        />
      </div>

      {/* Mobile Sticky Estimate Bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden glass border-t border-border px-4 py-3 shadow-2xl">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate">
              {estimate.track.name} · {estimate.formattedTimeline}
            </p>
            <p className="font-mono text-sm font-black text-foreground tabular-nums">
              {estimate.formattedPriceRange}
            </p>
          </div>

          <button
            type="button"
            onClick={handleAnalyzeScopeHandoff}
            disabled={isAnalyzing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-[#090D16] text-white dark:bg-accent dark:text-accent-foreground font-mono text-xs font-bold uppercase tracking-wider shadow-md shrink-0 cursor-pointer disabled:opacity-60"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#00D8F6] dark:text-current" aria-hidden="true" />
            <span>Analyze AI</span>
            <ArrowDown className="w-3.5 h-3.5 text-[#00D8F6] dark:text-current" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
