// The brand mark: three gold pillars — a bank colonnade that also reads
// as a rising bar chart — standing on the ledger rule (thin over thick,
// the accounting "total" mark). The gold stays constant, since it always
// sits on navy. The tile lifts to a lighter navy in dark mode, where the
// deep navy would otherwise vanish into the dark header, and the gold
// keyline strengthens to hold the edge.

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={`logo-mark ${className ?? ""}`}
      aria-hidden="true"
    >
      <rect
        width="64"
        height="64"
        rx="14"
        className="fill-[#10223c] dark:fill-[#1c3a63]"
      />
      <rect
        x="0.5"
        y="0.5"
        width="63"
        height="63"
        rx="13.5"
        fill="none"
        stroke="#d3ac47"
        className="[stroke-opacity:0.35] dark:[stroke-opacity:0.6]"
      />
      <g fill="#d3ac47">
        <rect className="bar" x="17" y="29" width="6.5" height="10" rx="1" />
        <rect className="bar" x="28.75" y="22" width="6.5" height="17" rx="1" />
        <rect className="bar" x="40.5" y="15" width="6.5" height="24" rx="1" />
        <rect x="15" y="42" width="34" height="1.75" />
        <rect x="15" y="45.5" width="34" height="3.5" />
      </g>
    </svg>
  );
}
