'use client';
import { useState, useEffect, useRef } from 'react';
import { Card } from '@/types';
import { LABELS } from '@/lib/utils';
import styles from './CardModal.module.css';

interface Props {
  card?: Card;
  colTitle?: string;
  onSave: (data: { title: string; description: string; label: string; dueDate: string }) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export default function CardModal({ card, colTitle, onSave, onDelete, onClose }: Props) {
  const [title, setTitle] = useState(card?.title ?? '');
  const [description, setDescription] = useState(card?.description ?? '');
  const [label, setLabel] = useState(card?.label ?? '');
  const [dueDate, setDueDate] = useState(card?.dueDate ?? '');
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => { titleRef.current?.focus(); }, []);

  const handleSave = () => {
    if (!title.trim()) { titleRef.current?.focus(); return; }
    onSave({ title: title.trim(), description, label, dueDate });
  };

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()} onKeyDown={e => e.key === 'Escape' && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>{card ? 'Edit card' : 'New card'}</h2>
            {colTitle && <span className={styles.colHint}>in {colTitle}</span>}
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className={styles.body}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Title *</label>
            <input
              ref={titleRef}
              className={styles.input}
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              placeholder="Card title"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Description</label>
            <textarea
              className={styles.textarea}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add details, acceptance criteria, notes..."
              rows={3}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Label</label>
            <div className={styles.labelPicker}>
              {LABELS.map(l => (
                <button
                  key={l.id}
                  className={`${styles.labelChip} ${label === l.id ? styles.labelSelected : ''}`}
                  style={{ '--lc': l.color, '--lb': l.bg } as React.CSSProperties}
                  onClick={() => setLabel(label === l.id ? '' : l.id)}
                >
                  {l.text}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Due date</label>
            <input
              type="date"
              className={styles.input}
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              style={{ colorScheme: 'dark' }}
            />
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.btnPrimary} onClick={handleSave}>
            {card ? 'Save changes' : 'Create card'}
          </button>
          <button className={styles.btnGhost} onClick={onClose}>Cancel</button>
          {card && onDelete && (
            <button className={styles.btnDanger} onClick={onDelete}>Delete</button>
          )}
        </div>
      </div>
    </div>
  );
}
