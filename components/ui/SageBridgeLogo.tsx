'use client';

interface SageBridgeLogoProps {
  size?: number;
  className?: string;
}

/**
 * SageBridge logo — a stylized bridge arch with a dollar flow line,
 * representing money moving seamlessly across the bridge (connecting
 * consumers and SMBs on Sage's network).
 */
export default function SageBridgeLogo({ size = 24, className = '' }: SageBridgeLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Bridge arch */}
      <path
        d="M4 24C4 24 8 8 16 8C24 8 28 24 28 24"
        stroke="url(#bridge-gradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Left pillar */}
      <line x1="7" y1="18" x2="7" y2="26" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" />
      {/* Right pillar */}
      <line x1="25" y1="18" x2="25" y2="26" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" />
      {/* Flow line — money moving across */}
      <path
        d="M6 20C10 16 14 14 16 14C18 14 22 16 26 20"
        stroke="url(#flow-gradient)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="2 3"
        fill="none"
      />
      {/* Center node — the dollar/value point */}
      <circle cx="16" cy="12" r="3" fill="url(#node-gradient)" />
      {/* Dollar sign in center */}
      <text
        x="16"
        y="14.5"
        textAnchor="middle"
        fontSize="5"
        fontWeight="bold"
        fill="#0f172a"
        fontFamily="system-ui"
      >
        $
      </text>
      {/* Base line */}
      <line x1="3" y1="26" x2="29" y2="26" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />

      <defs>
        <linearGradient id="bridge-gradient" x1="4" y1="16" x2="28" y2="16" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1" />
          <stop offset="0.5" stopColor="#818cf8" />
          <stop offset="1" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="flow-gradient" x1="6" y1="17" x2="26" y2="17" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10b981" />
          <stop offset="1" stopColor="#34d399" />
        </linearGradient>
        <linearGradient id="node-gradient" x1="13" y1="9" x2="19" y2="15" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34d399" />
          <stop offset="1" stopColor="#10b981" />
        </linearGradient>
      </defs>
    </svg>
  );
}
