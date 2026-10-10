import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../services/streakApi.js';
import s from './Login.module.css';

export default function Login() {
  const nav = useNavigate();
  const [mode, setMode] = useState('login'), [err, setErr] = useState(''), [busy, setBusy] = useState(false);
  const [f, setF] = useState({ name: '', email: '', password: '', confirm: '' });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const signup = mode === 'signup';

  const submit = async (e) => {
    e.preventDefault(); setErr('');
    if (signup && f.password !== f.confirm) return setErr('Passwords do not match.');
    setBusy(true);
    try {
      const d = signup ? await register(f.name, f.email, f.password) : await login(f.email, f.password);
      localStorage.setItem('token', d.token); nav('/daily-streak');
    } catch (x) { setErr(x.message); } finally { setBusy(false); }
  };
  return (
    <div className={s.wrap}>
      <form onSubmit={submit} className={s.box}>
        <h4 className="mb-1">VELoop <span style={{ color: 'var(--cta)' }}>Rewards</span></h4>
        <p className="small mb-3" style={{ color: 'var(--muted)' }}>{signup ? 'Create your account and start your streak.' : 'Log in to keep your streak alive.'}</p>
        {signup && <input className="form-control mb-2" placeholder="Full name" value={f.name} onChange={set('name')} required />}
        <input className="form-control mb-2" type="email" placeholder="Email" value={f.email} onChange={set('email')} required />
        <input className="form-control mb-2" type="password" placeholder="Password (min 6)" value={f.password} onChange={set('password')} required minLength={6} />
        {signup && <input className="form-control mb-2" type="password" placeholder="Confirm password" value={f.confirm} onChange={set('confirm')} required />}
        {err && <div className="text-danger small mb-2">{err}</div>}
        <button className={s.cta} disabled={busy}>{busy ? 'Please wait...' : signup ? 'Sign up' : 'Log in'}</button>
        <div className="text-center small mt-3" style={{ color: 'var(--muted)' }}>
          {signup ? 'Already have an account?' : 'New to VELoop?'}{' '}
          <a href="#" style={{ color: 'var(--muted)' }} onClick={(e) => { e.preventDefault(); setErr(''); setMode(signup ? 'login' : 'signup'); }}>{signup ? 'Log in' : 'Sign up'}</a>
        </div>
        {!signup && <div className="text-center small mt-2" style={{ color: 'var(--muted)' }}>Demo: demo@veloop.in / Demo@123</div>}
      </form>
    </div>
  );
};
