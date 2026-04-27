'use client';
import { useState } from 'react';
import { useStore, getStoredUsers, saveStoredUsers } from '@/store';
import { hashPw } from '@/lib/utils';
import styles from './Auth.module.css';

const PW_MIN = 8;
const PW_MAX = 64;

function validatePassword(pw: string): string {
  if (pw.length < PW_MIN) return `Password must be at least ${PW_MIN} characters.`;
  if (pw.length > PW_MAX) return `Password must be at most ${PW_MAX} characters.`;
  if (!/[A-Z]/.test(pw)) return 'Password must contain at least one uppercase letter.';
  if (!/[0-9]/.test(pw)) return 'Password must contain at least one number.';
  return '';
}

export default function AuthScreen() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useStore();

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const submit = () => {
    setError('');
    const e = email.trim().toLowerCase();
    const u = username.trim();

    if (!isValidEmail(e)) { setError('Please enter a valid email address.'); return; }
    if (tab === 'register' && !u) { setError('Please choose a username.'); return; }

    if (tab === 'register') {
      const pwError = validatePassword(password);
      if (pwError) { setError(pwError); return; }
    } else {
      if (!password) { setError('Please enter your password.'); return; }
    }

    const stored = getStoredUsers();
    const hash = hashPw(password);

    if (tab === 'register') {
      if (stored[e]) { setError('An account with this email already exists.'); return; }
      stored[e] = { username: u, hash };
      saveStoredUsers(stored);
      login(e, u);
    } else {
      const record = stored[e];
      if (!record?.hash || record.hash !== hash) { setError('Incorrect email or password.'); return; }
      login(e, record.username);
    }
  };

  const pwStrength = tab === 'register' && password.length > 0 ? getPwStrength(password) : null;

  return (
    <div className={styles.bg}>
      <div className={styles.card}>
        <div className={styles.logoRow}>
          <div className={styles.logoMark}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
          </div>
          <span className={styles.logoText}>TaskFlow</span>
        </div>

        <h1 className={styles.heading}>
          {tab === 'login' ? 'Welcome back' : 'Create account'}
        </h1>
        <p className={styles.sub}>
          {tab === 'login' ? 'Sign in to your workspace' : 'Start managing your projects'}
        </p>

        <div className={styles.tabs}>
          <button className={`${styles.tab} ${tab === 'login' ? styles.active : ''}`} onClick={() => { setTab('login'); setError(''); setPassword(''); }}>Sign in</button>
          <button className={`${styles.tab} ${tab === 'register' ? styles.active : ''}`} onClick={() => { setTab('register'); setError(''); setPassword(''); }}>Sign up</button>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Email</label>
          <input
            className={styles.input}
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="you@example.com"
            autoFocus
            autoComplete="email"
          />
        </div>

        {tab === 'register' && (
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Username</label>
            <input
              className={styles.input}
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder="e.g. zeynep"
              autoComplete="username"
            />
          </div>
        )}

        <div className={styles.fieldGroup}>
          <div className={styles.labelRow}>
            <label className={styles.label}>Password</label>
            {tab === 'register' && (
              <span className={styles.pwCount} style={{ color: password.length > PW_MAX ? 'var(--red)' : 'var(--text3)' }}>
                {password.length}/{PW_MAX}
              </span>
            )}
          </div>
          <input
            className={styles.input}
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="••••••••"
            autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
            maxLength={PW_MAX}
          />
          {pwStrength && (
            <div className={styles.strengthBar}>
              <div className={styles.strengthTrack}>
                <div className={styles.strengthFill} style={{ width: `${pwStrength.pct}%`, background: pwStrength.color }} />
              </div>
              <span className={styles.strengthLabel} style={{ color: pwStrength.color }}>{pwStrength.label}</span>
            </div>
          )}
          {tab === 'register' && (
            <ul className={styles.pwRules}>
              <li className={password.length >= PW_MIN ? styles.ruleOk : styles.rulePending}>Min {PW_MIN} characters</li>
              <li className={/[A-Z]/.test(password) ? styles.ruleOk : styles.rulePending}>One uppercase letter</li>
              <li className={/[0-9]/.test(password) ? styles.ruleOk : styles.rulePending}>One number</li>
            </ul>
          )}
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button className={styles.btn} onClick={submit}>
          {tab === 'login' ? 'Sign in' : 'Create account'}
        </button>

      </div>
    </div>
  );
}

function getPwStrength(pw: string): { pct: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= PW_MIN) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { pct: 20, label: 'Weak', color: '#ff6b6b' };
  if (score === 2) return { pct: 40, label: 'Fair', color: '#ffb347' };
  if (score === 3) return { pct: 65, label: 'Good', color: '#4fc3f7' };
  return { pct: 100, label: 'Strong', color: '#48c78e' };
}
