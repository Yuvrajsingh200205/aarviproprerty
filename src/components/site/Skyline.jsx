// Decorative animated city skyline: buildings grow up, windows twinkle. Deterministic (no Math.random) so SSR matches.
function lcg(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function Layer({ seed, count, minH, maxH, fill, windows = false, opacity = 1, delayBase = 0 }) {
  const rnd = lcg(seed);
  const W = 1200;
  const bw = W / count;
  const items = [];
  for (let i = 0; i < count; i += 1) {
    const h = minH + rnd() * (maxH - minH);
    const w = bw * (0.7 + rnd() * 0.25);
    const x = i * bw + (bw - w) / 2;
    const wins = [];
    if (windows) {
      const cols = Math.max(2, Math.floor(w / 14));
      const rows = Math.floor((h - 12) / 18);
      for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          if (rnd() > 0.45) {
            wins.push(
              <rect
                key={`${r}-${c}`}
                x={x + 6 + c * ((w - 12) / cols) + 1}
                y={200 - h + 8 + r * 18}
                width={Math.max(3, (w - 12) / cols - 4)}
                height={7}
                rx={1}
                fill="#e0b95a"
                style={{ animation: `twinkle ${(2 + rnd() * 5).toFixed(1)}s ease-in-out ${(rnd() * 4).toFixed(1)}s infinite`, opacity: 0.15 }}
              />
            );
          }
        }
      }
    }
    items.push(
      <g
        key={i}
        style={{ transformBox: 'fill-box', transformOrigin: 'bottom', animation: `rise 1.1s cubic-bezier(.2,.7,.2,1) ${delayBase + i * 35}ms backwards` }}
      >
        <rect x={x} y={200 - h} width={w} height={h} fill={fill} opacity={opacity} />
        {wins}
      </g>
    );
  }
  return <>{items}</>;
}

export default function Skyline({ className = '' }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 1200 200"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Layer seed={7} count={26} minH={50} maxH={120} fill="#ffffff" opacity={0.05} />
      <Layer seed={21} count={20} minH={70} maxH={175} fill="#0b2f29" opacity={0.85} windows delayBase={250} />
      <Layer seed={99} count={14} minH={40} maxH={110} fill="#082320" opacity={1} windows delayBase={500} />
    </svg>
  );
}
