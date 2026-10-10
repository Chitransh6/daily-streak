// Asset loader: real files from src/assets win; otherwise built-in SVG artwork.
const files = import.meta.glob('../../assets/*.{png,webp,svg,gif,jpg}', { eager: true, query: '?url', import: 'default' });
export const asset = (n) => { const k = Object.keys(files).find((p) => p.split('/').pop().split('.')[0] === n); return k ? files[k] : null; };
const Defs = () => <defs><linearGradient id="vg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe27a" /><stop offset="1" stopColor="#e0920b" /></linearGradient></defs>;
const P = {
  coin: <>{[44, 32, 20].map((y) => <g key={y}><ellipse cx="32" cy={y + 6} rx="22" ry="8" fill="#a85f00" /><ellipse cx="32" cy={y} rx="22" ry="8" fill="url(#vg)" stroke="#fcd34d" /></g>)}</>,
  crown: <><path d="M8 48 L14 18 L26 32 L32 10 L38 32 L50 18 L56 48 Z" fill="url(#vg)" stroke="#fcd34d" /><rect x="8" y="48" width="48" height="8" rx="3" fill="#e0920b" /><circle cx="32" cy="38" r="3" fill="#10b981" /></>,
  gift: <><rect x="10" y="28" width="44" height="28" rx="4" fill="#059669" /><rect x="8" y="20" width="48" height="12" rx="3" fill="#10b981" /><rect x="29" y="20" width="6" height="36" fill="url(#vg)" /><circle cx="24" cy="15" r="7" fill="none" stroke="#fbbf24" strokeWidth="4" /><circle cx="40" cy="15" r="7" fill="none" stroke="#fbbf24" strokeWidth="4" /></>,
  'gift-card': <><rect x="6" y="14" width="52" height="36" rx="5" fill="#111" stroke="#444" /><text x="32" y="40" textAnchor="middle" fontSize="26" fontWeight="700" fill="#fff">a</text><path d="M20 45 Q32 51 44 45" stroke="#ff9900" strokeWidth="3" fill="none" /></>,
  calendar: <><rect x="8" y="12" width="48" height="44" rx="8" fill="#ecfdf5" /><rect x="8" y="12" width="48" height="14" rx="8" fill="#10b981" /><path d="M20 40 L29 48 L45 30" stroke="#fbbf24" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></>,
};
P['hero-gift'] = P.gift;
export default function Art({ name, size = 44 }) {
  return <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label={name}><Defs />{P[name] || P.coin}</svg>;
}
