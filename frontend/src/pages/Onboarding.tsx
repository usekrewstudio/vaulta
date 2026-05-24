import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../lib/store';
import styles from './Onboarding.module.css';

export default function Onboarding() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const firstName = user?.full_name?.split(' ')[0] ?? 'there';

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.icon}>🌱</div>
        <h1 className={styles.heading}>Let's build your portfolio, {firstName}!</h1>
        <p className={styles.sub}>Get started in under 2 minutes.</p>

        <div className={styles.options}>
          <button className={`${styles.optionBtn} ${styles.primary}`} onClick={() => navigate('/dashboard?action=add-asset')}>
            <div className={styles.optionIcon}>＋</div>
            <div className={styles.optionText}>
              <span className={styles.optionLabel}>Add your first investment</span>
              <span className={styles.optionDesc}>Stocks, real estate, crypto, cash & more</span>
            </div>
            <span className={styles.arrow}>→</span>
          </button>

          <button className={styles.optionBtn} onClick={() => navigate('/dashboard')}>
            <div className={styles.optionIcon}>⊞</div>
            <div className={styles.optionText}>
              <span className={styles.optionLabel}>Explore the dashboard</span>
              <span className={styles.optionDesc}>See what's possible first</span>
            </div>
            <span className={styles.arrow}>→</span>
          </button>

          <button className={styles.optionBtn} onClick={() => navigate('/dashboard')}>
            <div className={styles.optionIcon}>◷</div>
            <div className={styles.optionText}>
              <span className={styles.optionLabel}>Skip for now</span>
              <span className={styles.optionDesc}>I'll set up later</span>
            </div>
            <span className={styles.arrow}>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
