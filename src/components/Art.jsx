// Hand-drawn Karnataka art: skyline (Gol Gumbaz, Mysuru palace, Hampi stone chariot), Gini the parrot.

export function Skyline({ color = "#8a0d1f", sun = "#c8102e", window: win = "#ffc72c", className = "" }) {
  const palm = (x, h, flip = 1) => (
    <g transform={`translate(${x} 240) scale(${flip} 1)`} fill="none" stroke={color} strokeLinecap="round">
      <path d={`M0 0 C4 -${h * 0.4} -6 -${h * 0.75} 6 -${h}`} strokeWidth="7" />
      <g strokeWidth="5">
        <path d={`M6 -${h} C-16 -${h + 16} -34 -${h + 6} -44 -${h - 12}`} />
        <path d={`M6 -${h} C-8 -${h + 26} -22 -${h + 30} -30 -${h + 26}`} />
        <path d={`M6 -${h} C24 -${h + 20} 40 -${h + 10} 50 -${h - 8}`} />
        <path d={`M6 -${h} C18 -${h + 28} 30 -${h + 32} 40 -${h + 28}`} />
        <path d={`M6 -${h} C4 -${h + 22} 6 -${h + 34} 10 -${h + 38}`} />
      </g>
    </g>
  );
  const arches = (x0, y, n, w, h) =>
    Array.from({ length: n }, (_, i) => {
      const x = x0 + i * w;
      return <path key={i} d={`M${x + 4} ${y + h} V${y + h * 0.45} A${w / 2 - 4} ${w / 2 - 4} 0 0 1 ${x + w - 4} ${y + h * 0.45} V${y + h} Z`} fill={win} opacity=".55" />;
    });
  const onion = (cx, base, w, h) => (
    <path d={`M${cx - w / 2} ${base} C${cx - w / 2} ${base - h * 0.45} ${cx - w * 0.12} ${base - h * 0.55} ${cx} ${base - h} C${cx + w * 0.12} ${base - h * 0.55} ${cx + w / 2} ${base - h * 0.45} ${cx + w / 2} ${base} Z`} fill={color} />
  );
  return (
    <svg className={className} viewBox="0 0 1200 240" role="img" aria-label="Karnataka skyline: Gol Gumbaz, Mysuru palace and the Hampi stone chariot" preserveAspectRatio="xMidYMax slice">
      <circle cx="815" cy="92" r="46" fill={sun} opacity=".9" />
      <g fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" opacity=".8">
        <path d="M330 60 q8 -8 16 0 q8 -8 16 0" /><path d="M372 42 q6 -6 12 0 q6 -6 12 0" /><path d="M1110 70 q7 -7 14 0 q7 -7 14 0" />
      </g>
      <path d="M0 205 Q150 168 300 196 T600 190 T900 192 T1200 178 V240 H0 Z" fill={color} opacity=".35" />
      {/* Gol Gumbaz */}
      <g>
        <rect x="112" y="152" width="146" height="88" fill={color} />
        <path d="M118 154 A67 67 0 0 1 252 154 Z" fill={color} />
        <rect x="181" y="76" width="8" height="14" fill={color} />
        <rect x="98" y="112" width="20" height="128" fill={color} />
        <rect x="252" y="112" width="20" height="128" fill={color} />
        <circle cx="108" cy="110" r="13" fill={color} /><circle cx="262" cy="110" r="13" fill={color} />
        <rect x="106" y="88" width="4" height="12" fill={color} /><rect x="260" y="88" width="4" height="12" fill={color} />
        {arches(128, 196, 5, 23, 40)}
      </g>
      {palm(318, 118)}
      {/* Mysuru palace */}
      <g>
        <rect x="392" y="160" width="360" height="80" fill={color} />
        <rect x="532" y="96" width="80" height="66" fill={color} />
        {onion(572, 98, 86, 74)}
        <rect x="570" y="12" width="4" height="14" fill={color} />
        <path d="M574 12 l14 5 l-14 5 z" fill={sun} />
        <rect x="398" y="122" width="44" height="40" fill={color} />{onion(420, 124, 46, 38)}
        <rect x="702" y="122" width="44" height="40" fill={color} />{onion(724, 124, 46, 38)}
        {onion(482, 162, 30, 26)}{onion(662, 162, 30, 26)}
        {arches(400, 190, 6, 22, 50)}{arches(612, 190, 6, 22, 50)}
        {arches(540, 118, 3, 22, 40)}
      </g>
      {palm(800, 96, -1)}
      {/* Hampi stone chariot */}
      <g>
        <path d="M858 240 L874 198 L1046 198 L1062 240 Z" fill={color} />
        <rect x="906" y="142" width="108" height="58" fill={color} />
        {[922, 946, 970, 994].map((x) => <rect key={x} x={x} y="150" width="6" height="44" fill={win} opacity=".55" />)}
        <rect x="914" y="122" width="92" height="22" fill={color} />
        <rect x="928" y="104" width="64" height="20" fill={color} />
        <rect x="941" y="88" width="38" height="18" fill={color} />
        <circle cx="960" cy="80" r="8" fill={color} /><rect x="958" y="62" width="4" height="12" fill={color} />
        {[900, 1020].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy="220" r="24" fill={color} />
            <circle cx={cx} cy="220" r="17" fill="none" stroke={win} strokeWidth="2" opacity=".7" />
            {[0, 45, 90, 135].map((a) => <line key={a} x1={cx - 17 * Math.cos((a * Math.PI) / 180)} y1={220 - 17 * Math.sin((a * Math.PI) / 180)} x2={cx + 17 * Math.cos((a * Math.PI) / 180)} y2={220 + 17 * Math.sin((a * Math.PI) / 180)} stroke={win} strokeWidth="2" opacity=".7" />)}
            <circle cx={cx} cy="220" r="4" fill={win} opacity=".8" />
          </g>
        ))}
      </g>
      {palm(1118, 130)}
      <rect x="0" y="236" width="1200" height="4" fill={color} />
    </svg>
  );
}

// Gini the parrot, wearing a Karnataka-flag scarf.
export function Gini({ className = "gini", mood = "happy" }) {
  return (
    <svg className={className} viewBox="0 0 120 130" role="img" aria-label="Gini the parrot">
      <path d="M44 96 C30 112 22 124 16 128 C28 126 40 118 50 104 Z" fill="#1f7a3a" />
      <path d="M50 98 C44 114 42 124 40 130 C50 122 56 112 58 102 Z" fill="#2563a8" />
      <ellipse cx="62" cy="76" rx="30" ry="34" fill="#2fa84f" />
      <ellipse cx="67" cy="84" rx="17" ry="21" fill="#9ad97a" />
      <path d="M38 64 C28 82 34 100 50 104 C46 92 46 78 52 68 Z" fill="#1f7a3a" />
      {mood === "cheer" && <path d="M88 66 C104 52 110 40 108 30 C98 40 90 50 84 62 Z" fill="#1f7a3a" />}
      <circle cx="62" cy="36" r="24" fill="#2fa84f" />
      <path d="M50 14 C52 4 60 2 62 12 C64 2 72 4 70 14 Z" fill="#ffc72c" />
      <path d="M40 54 Q62 66 84 54 L84 60 Q62 72 40 60 Z" fill="#ffc72c" />
      <path d="M40 60 Q62 72 84 60 L84 66 Q62 78 40 66 Z" fill="#c8102e" />
      <path d="M78 64 L88 80 L80 78 L76 70 Z" fill="#c8102e" />
      <path d="M80 30 C96 28 100 44 90 52 C88 44 84 40 78 40 Z" fill="#c8102e" />
      <path d="M86 46 C88 48 88 51 86 53" stroke="#8a0d1f" strokeWidth="1.5" fill="none" />
      <circle cx="70" cy="31" r="7.5" fill="#fff" />
      <circle cx={mood === "think" ? 69 : 72} cy={mood === "think" ? 29 : 31} r="4" fill="#2a0f0c" />
      <circle cx="73.5" cy="29.5" r="1.3" fill="#fff" />
      <circle cx="58" cy="44" r="4.5" fill="#ffb3a7" opacity=".7" />
      <path d="M54 108 l-3 8 M60 109 l0 8 M70 108 l3 8" stroke="#e0610e" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ size = 38 }) {
  return (
    <svg className="logo" width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="23" fill="#ffc72c" />
      <circle cx="22" cy="24" r="12" fill="#2fa84f" />
      <path d="M30 20 C38 19 40 28 34 32 C33 27 31 25 28 25 Z" fill="#c8102e" />
      <circle cx="26" cy="21" r="3.6" fill="#fff" /><circle cx="27" cy="21" r="1.9" fill="#2a0f0c" />
      <path d="M12 33 Q22 38 32 33 L32 36 Q22 41 12 36 Z" fill="#c8102e" />
    </svg>
  );
}

export const STAGE_EMOJI = ["🥚", "🐣", "🐦", "🦜", "🐦‍⬛", "🦚", "🦅"];
