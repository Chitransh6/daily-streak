import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Lock, LogOut, Gem, History, Zap, TrendingUp, Gift, ShieldCheck, X, Flame, Sun, Moon, CalendarPlus, Share2 } from 'lucide-react';
import { asset } from './art.jsx';
import s from './DailyStreak.module.css';

export const Img = ({ n, w, cls = '' }) => { const u = asset(n); return u ? <img src={u} width={w} alt="" draggable={false} className={cls} /> : null; };
const money = (r) => (r.type === 'VES' ? `+${r.amount}` : `₹${r.amount}`);
export const label = (r) => (r ? (r.type === 'VES' ? `${r.amount} VEs` : `₹${r.amount} ${r.subtitle}`) : '');
const pad = (n) => String(n).padStart(2, '0');
export const fmt = (ms) => { const t = Math.max(0, Math.floor(ms / 1000)); return `${pad(Math.floor(t / 3600))}:${pad(Math.floor((t % 3600) / 60))}:${pad(t % 60)}`; };

export const Aurora = () => <div className={s.aurora}><i className={s.b1} /><i className={s.b2} /><i className={s.b3} /></div>;
export const StreakLoader = () => <div className={s.loader}><Aurora /><Img n="crown" w={76} cls={s.float} /><b>VELoop</b><span className={s.mono}>LOADING YOUR STREAK</span></div>;
export const Skeleton = () => <div className={s.page}><Aurora /><div className={s.shell} style={{ paddingTop: 90 }}>{[300, 80, 260, 160].map((h, i) => <div key={i} className={s.skel} style={{ height: h }} />)}</div></div>;
export const CpaDemo = () => (
  <div className={s.overlay}><div className={`${s.modal} ${s.glass}`}><Img n="coin" w={70} cls={s.float} /><h5>Preparing your reward...</h5><span className={s.mono}>ADVERTISEMENT / REWARD VERIFICATION</span><small>Please wait...</small><div className={s.bar}><i /></div></div></div>
);
export const CountUp = ({ to }) => {
  const [v, setV] = useState(0);
  useEffect(() => { let r, st; const f = (t) => { st = st || t; const p = Math.min(1, (t - st) / 900); setV(Math.round(to * (1 - (1 - p) ** 3))); if (p < 1) r = requestAnimationFrame(f); }; r = requestAnimationFrame(f); return () => cancelAnimationFrame(r); }, [to]);
  return v;
};
const tierOf = (n) => (n >= 7 ? 'LEGEND' : n >= 5 ? 'BLAZING' : n >= 3 ? 'ON FIRE' : n >= 1 ? 'WARMING UP' : 'READY TO START');
const tilt = (e) => { const el = e.currentTarget, r = el.getBoundingClientRect(); el.style.setProperty('--rx', `${-((e.clientY - r.top) / r.height - 0.5) * 8}deg`); el.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 10}deg`); };
const untilt = (e) => { e.currentTarget.style.setProperty('--rx', '0deg'); e.currentTarget.style.setProperty('--ry', '0deg'); };
const addReminder = (iso) => {
  const d = new Date(iso), f = (x) => x.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const t = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:${f(d)}@veloop
DTSTAMP:${f(new Date())}
DTSTART:${f(d)}
DTEND:${f(new Date(+d + 9e5))}
SUMMARY:Claim your VELoop daily reward
END:VEVENT
END:VCALENDAR`;
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([t], { type: 'text/calendar' })); a.download = 'veloop-reward.ics'; a.click();
};
const shareStreak = async (n, toast) => {
  const text = `I'm on a ${n}-day streak on VELoop Rewards! 🔥`;
  try { if (navigator.share) await navigator.share({ text }); else { await navigator.clipboard.writeText(text); toast('Streak copied to clipboard'); } } catch { /* cancelled */ }
};
export const Header = ({ onBack, onLogout, onHistory, onTheme, theme, streak, wallet }) => (
  <header className={s.nav}><div className={s.navIn}>
    <div className={s.navL}><button className={s.ib} onClick={onBack} aria-label="Back"><ArrowLeft size={17} /></button><Img n="vr-logo" w={22} /><b>VELoop</b><span className={`${s.mono} ${s.hideS}`}>/ DAILY STREAK</span></div>
    <div className={s.navR}>
      <button className={s.hbtn} onClick={onHistory}><History size={15} /><span>History</span></button>
      <span className={s.flame} title="Current streak"><Flame size={14} />{streak.currentStreak}</span>
      <span className={s.bal}><Gem size={14} /><CountUp to={wallet.VES} /><small>VEs</small></span>
      <button className={s.ib} onClick={onTheme} aria-label="Toggle theme" title="Dark / light">{theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}</button>
      <button className={s.ib} onClick={onLogout} aria-label="Log out"><LogOut size={16} /></button>
    </div>
  </div></header>
);
export const Orbit = ({ streak }) => {
  const t = streak.totalRewards, p = t ? streak.checkedIn / t : 0, R = 104, C = 2 * Math.PI * R;
  return (
    <div className={s.orbit}>
      <svg viewBox="0 0 260 260" className={s.ring}>
        <defs><linearGradient id="og" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style={{ stopColor: 'var(--g1t)' }} /><stop offset="1" style={{ stopColor: 'var(--g2t)' }} /></linearGradient></defs>
        <circle cx="130" cy="130" r="124" className={s.dash} /><circle cx="130" cy="130" r={R} className={s.track} />
        <circle cx="130" cy="130" r={R} className={s.prog} stroke="url(#og)" style={{ strokeDasharray: C, strokeDashoffset: C * (1 - p) }} transform="rotate(-90 130 130)" />
        {Array.from({ length: t }, (_, i) => { const a = (i / t) * 2 * Math.PI - Math.PI / 2; return <circle key={i} cx={130 + R * Math.cos(a)} cy={130 + R * Math.sin(a)} r="5.5" className={i < streak.checkedIn ? s.dotOn : s.dotOff} />; })}
      </svg>
      <div className={s.orbitC}><span className={s.tier}>{tierOf(streak.currentStreak)}</span><span className={s.mono}>DAY STREAK</span><b><CountUp to={streak.currentStreak} /></b><small>{streak.checkedIn} / {t} collected</small></div>
    </div>
  );
};
export const NextUp = ({ streak, countdown, claiming, onClaim, onToast }) => {
  const nr = streak.nextReward;
  return (
    <div className={`${s.next} ${s.glass}`}>
      <Img n={nr?.assetType || 'coin'} w={78} cls={s.nextArt} />
      <div className={s.nextT}>
        <span className={s.mono}>{streak.canClaim ? 'READY TO CLAIM' : 'NEXT REWARD IN'}</span>
        {streak.canClaim ? <h3>Day {streak.currentDay} · {label(nr)}</h3> : <div className={s.timer}>{countdown || '--:--:--'}</div>}
        <small>{streak.canClaim ? 'Claim now to extend your streak' : `Day ${streak.currentDay} · ${label(nr)}`}</small>
      </div>
      {streak.canClaim && <button className={s.cta} disabled={claiming} onClick={onClaim}>Claim reward <ArrowRight size={16} /></button>}
      <div className={s.actions}>
        {!streak.canClaim && streak.nextClaimAt && <button className={s.ghost} onClick={() => addReminder(streak.nextClaimAt)}><CalendarPlus size={15} /> Add reminder</button>}
        <button className={s.ghost} onClick={() => shareStreak(streak.currentStreak, onToast)}><Share2 size={15} /> Share streak</button>
      </div>
    </div>
  );
};
export const Stats = ({ streak, u }) => {
  const nr = streak.nextReward;
  const it = [['TOTAL REWARDS', streak.totalRewards], ['CHECKED IN', streak.checkedIn], ['NEXT REWARD', nr ? (nr.type === 'VES' ? `+${nr.amount} VEs` : `₹${nr.amount}`) : '-'], ['ULTIMATE · DAY ' + u.day, label(u).replace(' Amazon Gift Card', '')]];
  return <div className={s.stats}>{it.map(([l, v], i) => <div key={l} className={`${s.stat} ${s.glass} ${i === 3 ? s.statGold : ''}`}><span className={s.mono}>{l}</span><b>{v}</b></div>)}</div>;
};
export const DayCard = ({ item, countdown, claiming, onClaim }) => {
  const { day, status, reward: r } = item, final = r.badge === 'VIP';
  return (
    <article className={`${s.day} ${s.glass} ${s['st_' + status]} ${final ? s.final : ''}`} style={{ '--i': day }} onMouseMove={tilt} onMouseLeave={untilt}>
      <span className={s.node}>{status === 'CLAIMED' ? <Check size={13} strokeWidth={3.5} /> : day}</span>
      <Img n={r.assetType} w={84} cls={s.dArt} />
      <div className={s.dBody}><span className={s.mono}>{final ? 'ULTIMATE REWARD' : `DAY ${pad(day)}`}</span><b>{money(r)}</b><small>{r.subtitle}</small></div>
      <div className={s.dAct}>
        {status === 'CLAIMED' ? <span className={`${s.chipx} ${s.ok}`}><Check size={13} /> Claimed</span>
          : status === 'TODAY' ? <button className={s.cta2} disabled={claiming} onClick={onClaim}>Claim <ArrowRight size={14} /></button>
          : status === 'MISSED' ? <span className={`${s.chipx} ${s.miss}`}>Missed</span>
          : <span className={s.chipx}><Lock size={12} /> {countdown || 'Locked'}</span>}
      </div>
    </article>
  );
};
const W = [[Zap, 'Stay consistent', 'Check in daily to keep the streak alive.'], [TrendingUp, 'Bigger streak', 'Longer streaks unlock bigger rewards.'], [Gift, 'Real rewards', 'Coins, gift cards and special bonuses.'], [ShieldCheck, "Don't miss out", 'Skip a day and the streak resets.']];
export const Why = () => <section className={s.why}>{W.map(([I, t, d]) => <div key={t} className={`${s.wi} ${s.glass}`}><span className={s.wic}><I size={18} /></span><b>{t}</b><small>{d}</small></div>)}</section>;
export const Foot = () => <footer className={s.foot}><Img n="vr-logo" w={18} /> Official rewards only on <b>VeloopRewards.in</b> · Stay active, stay rewarded!</footer>;
export const HistoryModal = ({ items, onClose }) => (
  <div className={s.overlay} onClick={onClose}><div className={`${s.modal} ${s.glass}`} style={{ maxHeight: '80vh', overflow: 'auto', justifyItems: 'stretch', textAlign: 'left' }} onClick={(e) => e.stopPropagation()}>
    <div className="d-flex justify-content-between align-items-center"><h5 className="m-0">Streak history</h5><button className={s.ib} onClick={onClose} aria-label="Close"><X size={16} /></button></div>
    {items === null ? <small>Loading...</small> : items.length === 0 ? <small>No claims yet.</small> : items.map((i) => (
      <div key={i._id} className={s.hrow}><span>Cycle {i.cycleNo} · Day {i.day}</span><span className={s.mono}>{new Date(i.claimedAt).toLocaleDateString()} · {i.referenceId}</span></div>))}
  </div></div>
);

export const Reveal = ({ c, balance, onClose }) => (
  <div className={s.overlay} onClick={onClose}><div className={`${s.modal} ${s.glass} ${s.reveal}`} onClick={(e) => e.stopPropagation()}>
    <div className={s.burst}>{Array.from({ length: 14 }, (_, i) => <i key={i} style={{ '--r': `${i * (360 / 14)}deg` }} />)}</div>
    <Img n={c.assetType} w={104} cls={s.float} /><span className={s.mono}>DAY {pad(c.day)} UNLOCKED</span><h4>{label(c)}</h4>
    <small>Wallet balance: {balance} VEs · Ref {c.referenceId}</small><button className={s.cta} style={{ width: '100%' }} onClick={onClose}>Awesome</button>
  </div></div>
);
export const Dock = ({ streak, onClaim }) => <div className={s.dock}><button className={s.cta} onClick={onClaim}>Claim Day {streak.currentDay} · {label(streak.nextReward)} <ArrowRight size={16} /></button></div>;
