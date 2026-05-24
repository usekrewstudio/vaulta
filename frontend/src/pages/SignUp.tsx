import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import styles from './Auth.module.css';

const COUNTRIES = ['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'United Kingdom', 'United States', 'Canada'];

export default function SignUp() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', password: '', country: '' });

  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', '#E24B4A', '#EF9F27', '#5DCAA5', '#1D9E75'][strength];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/signup', form);
      toast.success('Account created! Check your email.');
      navigate('/verify-email', { state: { user_id: res.data.user_id, email: form.email } });
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Sign up failed');
    } finally {
      setLoading(false);
    }
  }

  const valid = form.full_name.trim().length > 1 && form.email.includes('@') && form.password.length >= 8;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoMark}>Vaulta</span>
          <span className={styles.logoSub}>Wealth Tracker</span>
        </div>
        <h1 className={styles.heading}>Create your account</h1>
        <p className={styles.sub}>Track every asset, all in one place.</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Full name</label>
            <input className={styles.input} type="text" placeholder="Ada Okonkwo" value={form.full_name}
              onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} required />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Email address</label>
            <input className={styles.input} type="email" placeholder="ada@example.com" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <div className={styles.pwWrap}>
              <input className={styles.input} type={showPw ? 'text' : 'password'} placeholder="Min. 8 characters"
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(v => !v)}>
                {showPw ? '🙈' : '👁'}
              </button>
            </div>
            {form.password && (
              <div className={styles.strengthRow}>
                {[1,2,3,4].map(i => (
                  <div key={i} className={styles.strengthBar}
                    style={{ background: i <= strength ? strengthColor : 'var(--border)' }} />
                ))}
                <span className={styles.strengthLabel} style={{ color: strengthColor }}>{strengthLabel}</span>
              </div>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Country <span className={styles.optional}>optional</span></label>
            <select className={styles.input} value={form.country}
              onChange={e => setForm(f => ({ ...f, country: e.target.value }))}>
              <option value="">Select your country</option>
              {COUNTRIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <button className={styles.btnPrimary} type="submit" disabled={!valid || loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className={styles.switchLink}>Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
