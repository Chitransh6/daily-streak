import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStreak, claimStreak, getHistory } from '../../services/streakApi.js';
import { Aurora, StreakLoader, Skeleton, CpaDemo, Header, HistoryModal, Reveal, Dock, Orbit, NextUp, Stats, DayCard, Why, Foot, fmt } from './components.jsx';
import s from './DailyStreak.module.css';

export default function DailyStreakPage() {
  const nav = useNavigate();
  const [data, setData] = useState(null), [boot, setBoot] = useState(true), [error, setError] = useState('');
  const [claiming, setClaiming] = useState(false), [msg, setMsg] = useState(''), [hist, setHist] = useState(undefined);
  const [reveal, setReveal] = useState(null), [theme, setTheme] = useState(document.documentElement.dataset.theme || 'dark');
  useEffect(() => { if (!msg) return; const t = setTimeout(() => setMsg(''), 4500); return () => clearTimeout(t); }, [msg]);
  const toggleTheme = () => { const t = theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = t; try { localStorage.setItem('theme', t); } catch { /* ignore */ } setTheme(t); };
  const [now, setNow] = useState(Date.now());
  const offset = useRef(0), lastRefetch = useRef(0);

  const load = useCallback(async () => {
    try {
      const d = await getStreak();
      offset.current = Date.parse(d.serverTime) - Date.now(); // server-relative clock, not the device clock
      setData(d); setError('');
    } catch (e) { setError(e.message); }
  }, []);
  useEffect(() => { const t = setTimeout(() => setBoot(false), 900); load(); return () => clearTimeout(t); }, [load]);
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(i); }, []);

  const next = data?.streak.nextClaimAt ? Date.parse(data.streak.nextClaimAt) : null;
  const remaining = next ? next - (now + offset.current) : null;
  // Timer ~ 0 => ask the backend; the UI only unlocks when the backend says so.
  useEffect(() => {
    if (remaining !== null && remaining <= 0 && !data.streak.canClaim && Date.now() - lastRefetch.current > 3000) { lastRefetch.current = Date.now(); load(); }
  }, [remaining, data, load]);

  const onClaim = async () => {
    setClaiming(true); setMsg('');
    try {
      const [res] = await Promise.all([claimStreak(), new Promise((r) => setTimeout(r, 2500))]); // CPA demo shown meanwhile
      setReveal(res.claimed);
    } catch (e) { setMsg(e.message); }
    await load(); setClaiming(false);
  };
  const openHist = async () => { setHist(null); try { setHist((await getHistory()).items); } catch { setHist([]); } };
  const logout = () => { localStorage.removeItem('token'); nav('/login'); };

  if (boot) return <StreakLoader />;
  if (error && !data) return <div className={s.loader}><p>{error}</p><button className={s.cta} onClick={load}>Retry</button></div>;
  if (!data) return <Skeleton />;
  const { streak, rewards, ultimateReward, wallet } = data;
  const cd = remaining !== null && remaining > 0 ? fmt(remaining) : null;
  return (
    <div className={s.page}><Aurora />
      {claiming && <CpaDemo />}
      {reveal && !claiming && <Reveal c={reveal} balance={wallet.VES} onClose={() => setReveal(null)} />}
      {hist !== undefined && <HistoryModal items={hist} onClose={() => setHist(undefined)} />}
      <Header onBack={() => nav(-1)} onLogout={logout} onHistory={openHist} onTheme={toggleTheme} theme={theme} streak={streak} wallet={wallet} />
      <main className={s.shell}>
        {streak.wasReset && <div className={`${s.notice} ${s.warn}`}>Your streak has been reset. Start again from Day 1.</div>}
        {msg && <div className={s.notice}>{msg}</div>}
        <section className={s.hero}>
          <Orbit streak={streak} />
          <div className={s.heroT}>
            <span className={s.eyebrow}><i /> LIVE · DAILY CHECK-IN</span>
            <h1>Keep the streak.<br /><em>Earn the reward.</em></h1>
            <p>Check in every day, build your streak and unlock bigger rewards. Miss a day and it starts over.</p>
            <NextUp streak={streak} countdown={cd} claiming={claiming} onClaim={onClaim} onToast={setMsg} />
          </div>
        </section>
        <Stats streak={streak} u={ultimateReward} />
        <div className={s.head}><h2>Your {rewards.length}-day journey</h2><button className={`${s.ghost} ${s.onlyS}`} onClick={openHist}>History</button><span className={s.mono}>{streak.canClaim ? 'REWARD READY' : cd ? `NEXT UNLOCK ${cd}` : 'COME BACK TOMORROW'}</span></div>
        <div className={s.grid}>{rewards.map((it) => <DayCard key={it.day} item={it} claiming={claiming} onClaim={onClaim} countdown={it.nextClaimAt ? cd : null} />)}</div>
        <div className={s.head}><h2>Why maintain your streak?</h2></div><Why /><Foot />
        {streak.canClaim && !claiming && <Dock streak={streak} onClaim={onClaim} />}
      </main>
    </div>
  );
}
