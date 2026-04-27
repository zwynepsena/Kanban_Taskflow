'use client';
import { useRef, useEffect, useState } from 'react';
import { useStore } from '@/store';
import styles from './BoardSetup.module.css';

const TEMPLATES = [
  { label: 'Personal Tasks' },
  { label: 'Product Roadmap' },
  { label: 'Sprint Planning' },
  { label: 'Bug Tracker' },
  { label: 'Marketing' },
];

export default function BoardSetup() {
  const { user, createBoard } = useStore();
  const [title, setTitle] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const pickTemplate = (label: string) => {
    setSelected(label);
    setTitle(label);
    inputRef.current?.focus();
  };

  const handleCreate = () => {
    const name = title.trim();
    if (!name) return;
    createBoard(name);
  };

  return (
    <div className={styles.bg}>
      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logoRow}>
          <div className={styles.logoMark}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
          </div>
          <span className={styles.logoText}>TaskFlow</span>
        </div>

        <p className={styles.greeting}>Welcome, {user?.username}</p>
        <h1 className={styles.heading}>Create your first board</h1>
        <p className={styles.sub}>
          Boards help you organise tasks into columns. Start with a template or name your own.
        </p>

        <p className={styles.templatesLabel}>Quick start</p>
        <div className={styles.templates}>
          {TEMPLATES.map(t => (
            <button
              key={t.label}
              className={`${styles.templateChip} ${selected === t.label ? styles.templateChipSelected : ''}`}
              onClick={() => pickTemplate(t.label)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="board-name">Board name</label>
          <input
            id="board-name"
            ref={inputRef}
            className={styles.input}
            value={title}
            onChange={e => { setTitle(e.target.value); setSelected(null); }}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            placeholder="e.g. My Project"
          />
        </div>

        <button className={styles.btn} onClick={handleCreate} disabled={!title.trim()}>
          Create board
        </button>
      </div>
    </div>
  );
}
