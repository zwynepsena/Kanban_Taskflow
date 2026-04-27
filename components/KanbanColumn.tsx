'use client';
import { useState, useRef, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Column, Card } from '@/types';
import KanbanCard from './KanbanCard';
import styles from './KanbanColumn.module.css';

interface Props {
  column: Column;
  cards: Card[];
  onAddCard: () => void;
  onEditCard: (card: Card) => void;
  onUpdateTitle: (title: string) => void;
  onDelete: () => void;
}

export default function KanbanColumn({ column, cards, onAddCard, onEditCard, onUpdateTitle, onDelete }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const {
    attributes, listeners, setNodeRef: setDragRef,
    transform, transition, isDragging,
  } = useSortable({ id: `col-${column.id}`, data: { type: 'column', column } });

  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: column.id });

  const colStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={setDragRef} style={colStyle} className={`${styles.wrapper} ${isDragging ? styles.colDragging : ''}`}>
      <div className={styles.column}>
        <div className={styles.header}>
          <div className={styles.dragHandle} {...attributes} {...listeners}>
            <svg width="8" height="13" viewBox="0 0 8 13" fill="currentColor">
              <circle cx="1.5" cy="1.5" r="1.5"/><circle cx="6.5" cy="1.5" r="1.5"/>
              <circle cx="1.5" cy="6.5" r="1.5"/><circle cx="6.5" cy="6.5" r="1.5"/>
              <circle cx="1.5" cy="11.5" r="1.5"/><circle cx="6.5" cy="11.5" r="1.5"/>
            </svg>
          </div>

          <div className={styles.colDot} style={{ background: column.color }} />

          <input
            className={styles.titleInput}
            value={column.title}
            onChange={e => onUpdateTitle(e.target.value)}
            onClick={e => e.stopPropagation()}
          />

          <span className={styles.count}>{cards.length}</span>

          <div className={styles.menuWrap} ref={menuRef}>
            <button className={styles.menuBtn} onClick={() => setMenuOpen(!menuOpen)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
              </svg>
            </button>
            {menuOpen && (
              <div className={styles.menu}>
                <button className={styles.menuItem} onClick={() => { onAddCard(); setMenuOpen(false); }}>
                  Add card
                </button>
                <div className={styles.menuDivider} />
                <button className={`${styles.menuItem} ${styles.menuDanger}`} onClick={() => { onDelete(); setMenuOpen(false); }}>
                  Delete column
                </button>
              </div>
            )}
          </div>
        </div>

        <div
          ref={setDropRef}
          className={`${styles.cards} ${isOver ? styles.cardsOver : ''}`}
        >
          <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
            {cards.map(card => (
              <KanbanCard key={card.id} card={card} onClick={() => onEditCard(card)} />
            ))}
          </SortableContext>
          {cards.length === 0 && (
            <div className={styles.emptySlot}>
              <span>Drop cards here</span>
            </div>
          )}
        </div>

        <button className={styles.addBtn} onClick={onAddCard}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add card
        </button>
      </div>
    </div>
  );
}
