'use client';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/types';
import { getLabel, isOverdue, isDueToday } from '@/lib/utils';
import styles from './KanbanCard.module.css';

interface Props {
  card: Card;
  onClick: () => void;
  overlay?: boolean;
}

export default function KanbanCard({ card, onClick, overlay = false }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: 'card', card },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const label = card.label ? getLabel(card.label) : null;
  const overdue = isOverdue(card.dueDate);
  const today = isDueToday(card.dueDate);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.card} ${overlay ? styles.cardOverlay : ''}`}
      onClick={onClick}
      {...attributes}
      {...listeners}
    >
      {label && (
        <div
          className={styles.labelBar}
          style={{ background: label.color + '22', borderLeft: `2.5px solid ${label.color}` }}
        >
          <span style={{ color: label.color }}>{label.text}</span>
        </div>
      )}

      <p className={styles.title}>{card.title}</p>

      {card.description && (
        <p className={styles.desc}>{card.description}</p>
      )}

      {card.dueDate && (
        <div className={`${styles.due} ${overdue ? styles.dueOverdue : today ? styles.dueToday : ''}`}>
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span>{overdue ? 'Overdue · ' : today ? 'Due today · ' : ''}{card.dueDate}</span>
        </div>
      )}
    </div>
  );
}
