import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import styles from './Auth.module.css';

const ASSET_TYPES = [
  { value: 'stock', label: 'Stock' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'cash', label: 'Cash' },
  { value: 'bond', label: 'Bond' },
  { value: 'mutual_fund', label: 'Mutual Fund' },
  { value: 'pension', label: 'Pension' },
  { value: 'other', label: 'Other' },
];

const CURRENCIES = ['USD', 'NGN', 'GHS', 'KES', 'ZAR', 'GBP', 'EUR', 'CAD'];

export default function AddAsset() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', type: 'stock', symbol: '', quantity: '',
    purchase_price: '', current_price: '', currency: 'USD', notes: '',
  });

  function set(key: string, val: string) { setForm(f => ({ ...f, [key]: val })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/assets', {
        ...form,
        quantity: Number(form.quantity),
        purchase_price: Number(form.purchase_price),
        current_price: form.current_price ? Number(form.current_price) : Number(form.purchase_price),
      });
      toast.success('Asset added!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Failed to add asset');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card} style={{ maxWidth: 520 }}>
        <button onClick={() => navigate('/dashboard')} className={styles.ghostBtn} style={{ textAlign: 'left', marginBottom: '1rem' }}>← Back to dashboard</button>
        <h1 className={styles.heading}>Add Investment</h1>
        <p className={styles.sub}>Track a new asset in your portfolio.</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Asset name</label>
            <input className={styles.input} placeholder="e.g. Apple Inc." value={form.name} onChange={e => set('name', e.target.value)} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className={styles.field}>
              <label className={styles.label}>Type</label>
              <select className={styles.input} value={form.type} onChange={e => set('type', e.target.value)}>
                {ASSET_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Ticker/Symbol <span className={styles.optional}>optional</span></label>
              <input className={styles.input} placeholder="e.g. AAPL" value={form.symbol} onChange={e => set('symbol', e.target.value.toUpperCase())} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className={styles.field}>
              <label className={styles.label}>Quantity</label>
              <input className={styles.input} type="number" step="any" min="0" placeholder="0" value={form.quantity} onChange={e => set('quantity', e.target.value)} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Currency</label>
              <select className={styles.input} value={form.currency} onChange={e => set('currency', e.target.value)}>
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className={styles.field}>
              <label className={styles.label}>Purchase price</label>
              <input className={styles.input} type="number" step="any" min="0" placeholder="0.00" value={form.purchase_price} onChange={e => set('purchase_price', e.target.value)} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Current price <span className={styles.optional}>optional</span></label>
              <input className={styles.input} type="number" step="any" min="0" placeholder="Same as purchase" value={form.current_price} onChange={e => set('current_price', e.target.value)} />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Notes <span className={styles.optional}>optional</span></label>
            <textarea className={styles.input} placeholder="Any notes about this investment…" value={form.notes}
              onChange={e => set('notes', e.target.value)} style={{ height: 80, padding: '10px 12px', resize: 'vertical' }} />
          </div>

          <button className={styles.btnPrimary} type="submit" disabled={loading}>
            {loading ? 'Adding…' : 'Add to portfolio'}
          </button>
        </form>
      </div>
    </div>
  );
}
