const stages = [
  { label: "Collection", sub: "Customer" },
  { label: "Payout", sub: "Beneficiary" },
  { label: "Settlement", sub: "Agent" },
  { label: "Settlement", sub: "Partner" },
  { label: "Head Office", sub: "Reconciled" },
];

export default function SettlementFlowGraphic() {
  return (
    <div className="relative">
      <svg
        viewBox="0 0 360 420"
        className="h-auto w-full max-w-xs"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line x1="40" y1="40" x2="40" y2="380" stroke="rgba(255,255,255,0.18)" strokeWidth="2" strokeDasharray="2 8" strokeLinecap="round" />
        {stages.map((_, index) => {
          const y = 40 + index * 85;
          const nextY = 40 + (index + 1) * 85;
          if (index === stages.length - 1) return null;
          return (
            <line
              key={`connector-${index}`}
              x1="40"
              y1={y}
              x2="40"
              y2={nextY}
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="2"
            />
          );
        })}
        {stages.map((stage, index) => {
          const y = 40 + index * 85;
          return (
            <g key={stage.label + stage.sub}>
              <circle cx="40" cy={y} r="7" fill="#FFFFFF" fillOpacity={index === stages.length - 1 ? 1 : 0.9} />
              <circle cx="40" cy={y} r="12" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
              <text x="66" y={y - 4} fill="#FFFFFF" fontSize="14" fontWeight="600">
                {stage.label}
              </text>
              <text x="66" y={y + 14} fill="rgba(255,255,255,0.65)" fontSize="12">
                {stage.sub}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
