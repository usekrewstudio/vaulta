import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuthStore } from '../../lib/store';
import toast from 'react-hot-toast';
import styles from './Auth.module.css';

export default function VerifyEmail() {
  const { state } = useLocation() as { state: { user_id: string; email: string } };
  const navigate = useNavigate();
  const setAuth = useAuthStore(s => s.setAuth);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(59);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!state?.user_id) navigate('/signup');
    const t = setInterval(() => setTimer(v => Math.max(0, v - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  function handleChange(i: number, val: string) {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[i] = digit;
    setOtp(next);
    if (digit && i < 5) inputRefs.current[i + 1]?.focus();
  }

  function handleKey(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputRefs.current[i - 1]?.focus();
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { toast.error('Enter the full 6-digit code'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { user_id: state.user_id, code });
      setAuth(res.data.user, res.data.token);
      toast.success('Email verified!');
      navigate('/onboarding');
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Verification failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    try {
      await api.post('/auth/resend-otp', { user_id: state.user_id });
      setTimer(59);
      toast.success('New code sent!');
    } catch {
      toast.error('Failed to resend');
    }
  }

  const filled = otp.every(d => d !== '');

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoMark}>Vaulta</span>
          <span className={styles.logoSub}>Wealth Tracker</span>
        </div>
        <h1 className={styles.heading}>Check your inbox</h1>
        <p className={styles.sub}>We sent a 6-digit code to<br /><strong>{state?.email}</strong></p>

        <form onSubmit={handleVerify} className={styles.form}>
          <div className={styles.otpRow}>
            {otp.map((digit, i) => (
              <input key={i} ref={el => { inputRefs.current[i] = el; }} className={`${styles.otpBox} ${digit ? styles.otpFilled : ''}`}
                type="text" inputMode="numeric" maxLength={1} value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKey(i, e)} />
            ))}
          </div>

          <button className={styles.btnPrimary} type="submit" disabled={!filled || loading}>
            {loading ? 'Verifying…' : 'Verify email'}
          </button>
        </form>

        <p className={styles.timerText}>
          {timer > 0 ? <>Resend code in <strong>0:{String(timer).padStart(2, '0')}</strong></> :
            <button className={styles.ghostBtn} onClick={handleResend}>Resend code</button>}
        </p>
        <button className={styles.ghostBtn} onClick={() => navigate('/signup')}>← Use a different email</button>
      </div>
    </div>
  );
}
