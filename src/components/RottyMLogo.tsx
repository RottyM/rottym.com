'use client';

import React, { useId, useEffect, useState } from 'react';
import { useTheme } from './ThemeProvider';

export type LogoTheme = 'dark' | 'light' | 'auto';
export type LogoVariant = 'full' | 'monogram' | 'compact';
export type LogoSize = 'sm' | 'md' | 'lg' | 'xl' | number;

export interface RottyMLogoProps {
  /** Visual theme mode. 'auto' reacts to current theme */
  theme?: LogoTheme;
  /** Component display mode: full lockup, standalone monogram, or compact nav mark */
  variant?: LogoVariant;
  /** Presets ('sm' = 36px, 'md' = 48px, 'lg' = 56px, 'xl' = 72px) or custom pixel height */
  size?: LogoSize;
  /** Enable subtle hardware-accelerated CSS photon pulse, radar ping & laser streams */
  animated?: boolean;
  /** Custom title / subtitle tagline text */
  subtitle?: string;
  /** Hide subtitle even in full lockup */
  hideSubtitle?: boolean;
  /** Additional wrapper CSS class */
  className?: string;
}

const HEIGHT_MAP: Record<string, number> = {
  sm: 36,
  md: 48,
  lg: 56,
  xl: 72,
};

export const RottyMLogo: React.FC<RottyMLogoProps> = ({
  theme = 'auto',
  variant = 'full',
  size = 'md',
  animated = true,
  subtitle = 'FULL STACK & AI SOFTWARE ENGINEER',
  hideSubtitle = false,
  className = '',
}) => {
  const uniqueId = useId().replace(/:/g, '');
  const [mounted, setMounted] = useState(false);
  const [isBursting, setIsBursting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Safely resolve active theme
  let contextTheme: 'light' | 'dark' = 'dark';
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const themeContext = useTheme();
    if (themeContext?.resolvedTheme) {
      contextTheme = themeContext.resolvedTheme;
    }
  } catch {
    // Fallback if rendered outside ThemeProvider
  }

  const activeTheme: 'light' | 'dark' =
    theme === 'auto' ? (mounted ? contextTheme : 'dark') : theme;

  const isDark = activeTheme === 'dark';

  // Calculate pixel height
  const baseHeight = typeof size === 'number' ? size : HEIGHT_MAP[size] || 48;
  const isMonogram = variant === 'monogram';
  const isCompact = variant === 'compact';

  // Dynamic SVG Gradient IDs to prevent SVG namespace collisions
  const gradRId = `rotty-r-${uniqueId}`;
  const gradMId = `rotty-m-${uniqueId}`;
  const glowId = `rotty-glow-${uniqueId}`;
  const neonFilterId = `rotty-neon-${uniqueId}`;
  const depthShadowId = `rotty-shadow-${uniqueId}`;
  const mShadowId = `rotty-m-shadow-${uniqueId}`;
  const wordmarkMGradId = `rotty-wordmark-m-${uniqueId}`;

  // Palette from Stitch Modern Motion Suite v2.4
  const palette = {
    dark: {
      rStops: [
        { offset: '0%', color: '#00F2FE' },
        { offset: '50%', color: '#4FACFE' },
        { offset: '100%', color: '#6B11FF' },
      ],
      mStops: [
        { offset: '0%', color: '#00F5A0' },
        { offset: '100%', color: '#00F5A0' },
      ],
      rGradientCss: 'linear-gradient(135deg, #00F2FE 0%, #4FACFE 50%, #6B11FF 100%)',
      mGradientCss: '#00F5A0',
      statusGreen: '#00F5A0',
      beaconRingPrimary: '#00F5A0',
      beaconRingSecondary: '#00F2FE',
      beaconCore: '#FFFFFF',
      diffuseAura: '#00F2FE',
      dividerBase: '#1E2A42',
    },
    light: {
      rStops: [
        { offset: '0%', color: '#0284C7' },
        { offset: '50%', color: '#2563EB' },
        { offset: '100%', color: '#4F46E5' },
      ],
      mStops: [
        { offset: '0%', color: '#059669' },
        { offset: '100%', color: '#10B981' },
      ],
      rGradientCss: 'linear-gradient(135deg, #0284C7 0%, #2563EB 50%, #4F46E5 100%)',
      mGradientCss: 'linear-gradient(90deg, #059669 0%, #10B981 100%)',
      statusGreen: '#10B981',
      beaconRingPrimary: '#059669',
      beaconRingSecondary: '#0284C7',
      beaconCore: '#047857',
      diffuseAura: '#38BDF8',
      dividerBase: '#E2E8F0',
    },
  };

  const active = isDark ? palette.dark : palette.light;

  // Quantum burst click handler
  const handleLogoClick = () => {
    setIsBursting(true);
    setTimeout(() => setIsBursting(false), 240);
  };

  // Render standalone SVG Monogram Mark
  const renderMonogramSvg = (h: number) => {
    // Exact glyph bounds: x: 20 to 168 (width 148), y: -6 to 157 (height 163)
    // Tightly cropped viewBox 16 -8 156 168 removes empty padding so glyph scales to true height and aligns with typography
    const glyphWidth = Math.round(h * (156 / 168));
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="16 -8 156 168"
        width={glyphWidth}
        height={h}
        fill="none"
        className="shrink-0 overflow-visible"
        style={{ display: 'inline-block', verticalAlign: 'middle' }}
        aria-hidden="true"
      >
        <defs>
          {/* 'R' Glyph Gradient */}
          <linearGradient id={gradRId} x1="0%" y1="0%" x2="100%" y2="100%">
            {active.rStops.map((stop, i) => (
              <stop key={i} offset={stop.offset} stopColor={stop.color} />
            ))}
          </linearGradient>

          {/* Neural Synapse 'M' Gradient */}
          <linearGradient id={gradMId} x1="0%" y1="100%" x2="100%" y2="0%">
            {active.mStops.map((stop, i) => (
              <stop key={i} offset={stop.offset} stopColor={stop.color} />
            ))}
          </linearGradient>

          {/* Ambient Dark-Mode Bloom Filter */}
          <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Dual-Stage High-Fidelity Neon Filter */}
          <filter id={neonFilterId} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" result="b1" />
            <feGaussianBlur stdDeviation="12" result="b2" />
            <feMerge>
              <feMergeNode in="b2" />
              <feMergeNode in="b1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Precision Depth & Drop Shadow Filter for 'R' */}
          <filter id={depthShadowId} x="-30%" y="-30%" width="160%" height="160%">
            {isDark ? (
              <>
                <feDropShadow dx="0" dy="1.5" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.90" />
                <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000000" floodOpacity="0.65" />
                <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#00F2FE" floodOpacity="0.20" />
              </>
            ) : (
              <>
                <feDropShadow dx="0" dy="1.5" stdDeviation="3" floodColor="#0284C7" floodOpacity="0.30" />
                <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#0F172A" floodOpacity="0.16" />
              </>
            )}
          </filter>

          {/* Dedicated Crisp Shadow Filter for 'M' Chevron */}
          <filter id={mShadowId} x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#000000" floodOpacity="0.95" />
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={isDark ? "#00F5A0" : "#10B981"} floodOpacity="0.45" />
          </filter>

          {/* Kinetic animations when animated={true} - Queued on hover */}
          {animated && (
            <style>{`
              @keyframes rottyLaserRunner {
                0% { stroke-dashoffset: 400; }
                100% { stroke-dashoffset: -400; }
              }
              @keyframes rottyRadarPulse {
                0% { transform: scale(0.8); opacity: 0.95; }
                100% { transform: scale(2.6); opacity: 0; }
              }
              @keyframes rottyApexGlow {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.25); }
              }

              /* Continuous smooth slow laser flow over R letterform */
              .rotty-laser-dash {
                stroke-dasharray: 45 280;
                opacity: 0.9;
                animation: rottyLaserRunner 5s linear infinite;
              }

              /* Radar pulse & apex node: dormant at rest, activates strictly on hover */
              .rotty-synapse-ping,
              .rotty-synapse-ping-delayed {
                opacity: 0;
                transform-origin: 154px 8px;
              }
              .rotty-apex-node {
                transform-origin: 154px 8px;
                transition: filter 0.3s ease;
              }

              /* Queued strictly on hover of logo or parent link group */
              .rotty-logo:hover .rotty-synapse-ping,
              .group:hover .rotty-synapse-ping {
                animation: rottyRadarPulse 1.8s cubic-bezier(0, 0.2, 0.8, 1) infinite;
              }
              .rotty-logo:hover .rotty-synapse-ping-delayed,
              .group:hover .rotty-synapse-ping-delayed {
                animation: rottyRadarPulse 1.8s cubic-bezier(0, 0.2, 0.8, 1) infinite 0.6s;
              }
              .rotty-logo:hover .rotty-apex-node,
              .group:hover .rotty-apex-node {
                animation: rottyApexGlow 1.8s ease-in-out infinite;
                filter: drop-shadow(0 0 6px #00F5A0);
              }

              /* Wordmark typography: Rotty stays clean white / foreground */
              .rotty-wordmark-m {
                transition: filter 0.3s ease, text-shadow 0.3s ease;
              }
              .rotty-logo:hover .rotty-wordmark-m,
              .group:hover .rotty-wordmark-m {
                text-shadow: 0 0 10px rgba(59, 130, 246, 0.6);
              }

              /* Chevron glow in mint on hover */
              .rotty-logo:hover .rotty-chevron,
              .group:hover .rotty-chevron {
                filter: drop-shadow(0 0 6px rgba(0, 245, 160, 0.85));
              }
            `}</style>
          )}
        </defs>

        {/* Monogram Glyph Group */}
        <g>
          {/* Diffuse Ambient Neon Aura (Toned down to prevent wash-out) */}
          <path
            d="M 28 148 L 28 22 C 28 10 37 0 49 0 L 88 0 C 114 0 134 18 134 44 C 134 68 116 85 92 88 L 138 148"
            fill="none"
            stroke={isDark ? active.diffuseAura : '#38BDF8'}
            strokeWidth={isDark ? "14" : "16"}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={isDark ? "0.16" : "0.12"}
            filter={`url(#${neonFilterId})`}
          />

          {/* Depth Shadow Layer on R Letterform */}
          <g filter={`url(#${depthShadowId})`}>
            {/* Stem of 'R' with Gradient */}
            <rect
              x="20"
              y="4"
              width="18"
              height="144"
              rx="9"
              fill={`url(#${gradRId})`}
            />

            {/* Upper loop of 'R' */}
            <path
              d="M 34 13 H 84 C 108 13 124 28 124 49 C 124 70 108 85 84 85 H 34"
              fill="none"
              stroke={`url(#${gradRId})`}
              strokeWidth="18"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Diagonal dynamic leg of 'R' */}
            <path
              d="M 72 82 L 128 148"
              fill="none"
              stroke={`url(#${gradRId})`}
              strokeWidth="18"
              strokeLinecap="round"
            />
          </g>

          {/* High-Velocity Laser Photons Streaming over R contour (Triggers on hover) */}
          {animated && (
            <path
              d="M 29 148 L 29 13 H 84 C 108 13 124 28 124 49 C 124 70 108 85 84 85 L 128 148"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="rotty-laser-dash"
            />
          )}

          {/* Monoglyphic 'M' / AI Chevron Knockout Underlay for Razor-Sharp Edge Separation */}
          <path
            d="M 106 20 L 124 42 L 154 8"
            fill="none"
            stroke={isDark ? "#080c18" : "#ffffff"}
            strokeWidth="19"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Crisp Monoglyphic 'M' Chevron in Mint Green */}
          <path
            d="M 106 20 L 124 42 L 154 8"
            fill="none"
            stroke={isDark ? "#00F5A0" : "#059669"}
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#${mShadowId})`}
            className="rotty-chevron transition-all duration-300"
          />

          {/* Dual-Phase Synapse Apex Radar Pulse Waves (Triggers on hover) */}
          {animated && (
            <>
              <circle
                cx="154"
                cy="8"
                r="14"
                fill="none"
                stroke={active.beaconRingPrimary}
                strokeWidth="2"
                className="rotty-synapse-ping"
              />
              <circle
                cx="154"
                cy="8"
                r="14"
                fill="none"
                stroke={active.beaconRingSecondary}
                strokeWidth="1.5"
                className="rotty-synapse-ping-delayed"
              />
            </>
          )}

          {/* Precision Neural Synapse Apex Node (Pulsing glow on hover) */}
          <circle
            cx="154"
            cy="8"
            r="6"
            fill={active.beaconCore}
            filter={isDark ? `url(#${glowId})` : undefined}
            className="rotty-apex-node"
          />
          <circle
            cx="154"
            cy="8"
            r="2.5"
            fill={active.statusGreen}
          />
        </g>
      </svg>
    );
  };

  // If monogram variant requested, return just the square mark (No zooming on hover)
  if (isMonogram) {
    return (
      <div
        onClick={handleLogoClick}
        className={`inline-flex items-center cursor-pointer ${className}`}
      >
        {renderMonogramSvg(baseHeight)}
      </div>
    );
  }

  // Full Brand Lockup with tight, cohesive spacing
  return (
    <div
      onClick={handleLogoClick}
      className={`inline-flex items-center gap-2 select-none rotty-logo rotty-theme-${activeTheme} cursor-pointer ${className}`}
    >
      {/* Monogram Graphic Icon */}
      {renderMonogramSvg(baseHeight)}

      {/* Typography Lockup Group (Optical center aligned with the 'R' monogram) */}
      <div className="flex flex-col justify-center translate-y-[1px] md:translate-y-[1.5px]">
        {/* Row 1: RottyM Wordmark with Solid Indigo 'M' & Interactive Hover */}
        <div className="flex items-center leading-none rotty-wordmark">
          <span className="font-extrabold text-[19px] sm:text-[24px] md:text-[25px] tracking-[-0.03em] select-none inline-flex items-center">
            <span className="rotty-wordmark-rotty text-foreground transition-colors duration-300">
              Rotty
            </span>
            <span className="rotty-wordmark-m text-[#2563EB] dark:text-[#3B82F6] font-black transition-all duration-300">
              M
            </span>
          </span>
        </div>

        {/* Row 2: Title Tagline (Harmonized in scale and weight with navigation menu) */}
        {!isCompact && !hideSubtitle && (
          <div className="text-[9px] xs:text-[10px] sm:text-[12px] md:text-[12.5px] font-bold tracking-[0.04em] sm:tracking-[0.07em] text-foreground/80 dark:text-foreground/80 uppercase leading-none whitespace-nowrap mt-[2px] sm:mt-[3px]">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};

export default RottyMLogo;