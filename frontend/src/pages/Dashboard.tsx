import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuthStore } from '../../lib/store';
import { Portfolio, Asset, AssetType } from '../../types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import styles from './Dashboard.module.css';

const TYPE_COLORS: Record<string, string> = {
  stock: '#1D9E75', crypto: '#5DCAA5', real_estate: '#0F6E56',
  cash: '#85D4B8', bond: '#3AB891', mutual_fund: '#27A37E',
  pension: '#6DC9A8', other: '#B3E8D5',
};

const TYPE_LABELS: Record<string, string> = {
  stock: 'Stock', crypto: 'Crypto', real_estate: 'Real Estate',
  cash: 'Cash', bond: 'Bond', mutual_fund: 'Mutual Fund',
  pension: 'Pension', other: 'Other',
};

function fmt(n: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(n);
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPortfolio(); }, []);

  async function fetchPortfolio() {
    try {
      const res = await api.get('/assets/portfolio');
      setPortfolio(res.data);
    } catch { toast.error('Failed to load portfolio'); }
    finally { setLoading(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this asset?')) return;
    try {
      await api.delete(`/assets/${id}`);
      toast.success('Asset removed');
      fetchPortfolio();
    } catch { toast.error('Delete failed'); }
  }

  const chartData = portfolio
    ? Object.entries(portfolio.by_type).map(([type, value]) => ({ name: TYPE_LABELS[type] ?? type, value }))
    : [];

  const gainPositive = (portfolio?.total_gain_loss ?? 0) >= 0;

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>Vaulta</div>
        <nav className={styles.nav}>
          <span className={`${styles.navItem} ${styles.active}`}>Dashboard</span>
          <span className={styles.navItem} onClick={() => navigate('/profile')}>Profile</span>
        </nav>
        <button className={styles.signOutBtn} onClick={() => { clearAuth(); navigate('/login'); }}>Sign out</button>
      </aside>

      <main className={styles.main}>
        <div className={styles.topBar}>
          <div>
            <h1 className={styles.pageTitle}>Portfolio</h1>
            <p className={styles.pageGreeting}>Welcome back, {user?.full_name?.split(' ')[0]}</p>
          </div>
          <button className={styles.addBtn} onClick={() => navigate('/dashboard/add-asset')}>+ Add Asset</button>
        </div>

        {loading ? (
          <div className={styles.empty}>Loading…</div>
        ) : portfolio && portfolio.assets.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🌱</div>
            <h2>Your portfolio is empty</h2>
            <p>Add your first investment to get started.</p>
            <button className={styles.addBtn} onClick={() => navigate('/dashboard/add-asset')}>+ Add your first investment</button>
          </div>
        ) : (
          <>
            <div className={styles.statGrid}>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Total Value</span>
                <span className={styles.statValue}>{fmt(portfolio?.total_value ?? 0, user?.currency)}</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Total Cost</span>
                <span className={styles.statValue}>{fmt(portfolio?.total_cost ?? 0, user?.currency)}</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Gain / Loss</span>
                <span className={styles.statValue} style={{ color: gainPositive ? 'var(--brand)' : 'var(--red)' }}>
                  {gainPositive ? '+' : ''}{fmt(portfolio?.total_gain_loss ?? 0, user?.currency)}
                  <small style={{ fontSize: 13, marginLeft: 6 }}>({portfolio?.total_gain_loss_pct.toFixed(2)}%)</small>
                </span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Assets</span>
                <span className={styles.statValue}>{portfolio?.assets.length ?? 0}</span>
              </div>
            </div>

            <div className={styles.contentGrid}>
              <div className={styles.tableCard}>
                <h2 className={styles.cardTitle}>Holdings</h2>
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Name</th><th>Type</th><th>Qty</th>
                        <th>Purchase</th><th>Current</th><th>Value</th><th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolio?.assets.map((a: Asset) => (
                        <tr key={a.id}>
                          <td><strong>{a.name}</strong>{a.symbol && <span className={styles.symbol}> {a.symbol}</span>}</td>
                          <td><span className={styles.badge}>{TYPE_LABELS[a.type] ?? a.type}</span></td>
                          <td>{a.quantity}</td>
                          <td>{fmt(a.purchase_price, a.currency)}</td>
                          <td>{fmt(a.current_price, a.currency)}</td>
                          <td><strong>{fmt(a.current_price * a.quantity, a.currency)}</strong></td>
                          <td>
                            <button className={styles.deleteBtn} onClick={() => handleDelete(a.id)}>✕</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {chartData.length > 0 && (
                <div className={styles.chartCard}>
                  <h2 className={styles.cardTitle}>Allocation</h2>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={3}>
                        {chartData.map((entry, i) => (
                          <Cell key={i} fill={TYPE_COLORS[Object.keys(TYPE_LABELS).find(k => TYPE_LABELS[k] === entry.name) ?? ''] ?? '#ccc'} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => fmt(v, user?.currency)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className={styles.legend}>
                    {chartData.map((d, i) => (
                      <div key={i} className={styles.legendItem}>
                        <span className={styles.legendDot} style={{ background: Object.values(TYPE_COLORS)[i] }} />
                        {d.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
