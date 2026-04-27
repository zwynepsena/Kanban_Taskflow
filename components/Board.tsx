'use client';
import { useState, useCallback } from 'react';
import {
  DndContext, DragEndEvent, DragOverEvent, DragStartEvent,
  DragOverlay, PointerSensor, TouchSensor, useSensor, useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useStore } from '@/store';
import { Card, Column } from '@/types';
import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';
import CardModal from './CardModal';
import styles from './Board.module.css';

export default function Board() {
  const {
    activeBoardId, boards, columns, cards,
    addColumn, updateColumn, deleteColumn, reorderColumns,
    addCard, updateCard, deleteCard, moveCard,
  } = useStore();

  const [cardModal, setCardModal] = useState<{ mode: 'new'; colId: string } | { mode: 'edit'; card: Card } | null>(null);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [activeColId, setActiveColId] = useState<string | null>(null);

  const board = boards.find(b => b.id === activeBoardId);

  const boardCols = columns
    .filter(c => c.boardId === activeBoardId)
    .sort((a, b) => a.order - b.order);

  const getColCards = useCallback((colId: string) =>
    cards.filter(c => c.colId === colId).sort((a, b) => a.order - b.order),
  [cards]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
  );

  const handleDragStart = ({ active }: DragStartEvent) => {
    if (active.data.current?.type === 'card') {
      setActiveCard(active.data.current.card);
    } else if (active.data.current?.type === 'column') {
      setActiveColId(active.data.current.column.id);
    }
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return;
    const activeData = active.data.current;
    if (activeData?.type !== 'card') return;

    const card = activeData.card as Card;
    const overId = over.id as string;

    // Determine dest column
    let destColId: string;
    if (over.data.current?.type === 'card') {
      destColId = over.data.current.card.colId;
    } else {
      // over is a column droppable
      destColId = overId;
    }

    if (destColId !== card.colId) {
      const destCards = getColCards(destColId);
      const overIndex = over.data.current?.type === 'card'
        ? destCards.findIndex(c => c.id === overId)
        : destCards.length;
      moveCard(card.id, destColId, Math.max(overIndex, 0));
    }
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveCard(null);
    setActiveColId(null);
    if (!over) return;

    const activeData = active.data.current;

    if (activeData?.type === 'column') {
      const oldIdx = boardCols.findIndex(c => `col-${c.id}` === active.id);
      const newIdx = boardCols.findIndex(c => `col-${c.id}` === over.id);
      if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
        const reordered = arrayMove(boardCols, oldIdx, newIdx);
        reorderColumns(activeBoardId!, reordered.map(c => c.id));
      }
      return;
    }

    if (activeData?.type === 'card') {
      const card = activeData.card as Card;
      const overId = over.id as string;

      let destColId = card.colId;
      if (over.data.current?.type === 'card') destColId = over.data.current.card.colId;
      else if (over.data.current?.type === 'column') destColId = over.data.current.column.id;
      else destColId = overId; // droppable col id

      const destCards = getColCards(destColId);
      const overIndex = over.data.current?.type === 'card'
        ? destCards.findIndex(c => c.id === overId)
        : destCards.length;

      moveCard(card.id, destColId, Math.max(overIndex, 0));
    }
  };

  const openAddCard = (colId: string) => setCardModal({ mode: 'new', colId });
  const openEditCard = (card: Card) => setCardModal({ mode: 'edit', card });

  const handleSave = (data: { title: string; description: string; label: string; dueDate: string }) => {
    if (!cardModal) return;
    if (cardModal.mode === 'new') {
      addCard(cardModal.colId, data);
    } else {
      updateCard(cardModal.card.id, { ...data, label: data.label as Card['label'] });
    }
    setCardModal(null);
  };

  if (!board) return null;

  return (
    <div className={styles.boardWrap}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={boardCols.map(c => `col-${c.id}`)}
          strategy={horizontalListSortingStrategy}
        >
          <div className={styles.board}>
            {boardCols.map(col => (
              <KanbanColumn
                key={col.id}
                column={col}
                cards={getColCards(col.id)}
                onAddCard={() => openAddCard(col.id)}
                onEditCard={openEditCard}
                onUpdateTitle={(title) => updateColumn(col.id, { title })}
                onDelete={() => deleteColumn(col.id)}
              />
            ))}

            <button className={styles.addColBtn} onClick={() => addColumn(activeBoardId!)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add column
            </button>
          </div>
        </SortableContext>

        <DragOverlay dropAnimation={{ duration: 160, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
          {activeCard && <KanbanCard card={activeCard} onClick={() => {}} overlay />}
        </DragOverlay>
      </DndContext>

      {cardModal && (
        <CardModal
          card={cardModal.mode === 'edit' ? cardModal.card : undefined}
          colTitle={
            cardModal.mode === 'new'
              ? boardCols.find(c => c.id === cardModal.colId)?.title
              : boardCols.find(c => c.id === cardModal.card.colId)?.title
          }
          onSave={handleSave}
          onDelete={cardModal.mode === 'edit' ? () => { deleteCard(cardModal.card.id); setCardModal(null); } : undefined}
          onClose={() => setCardModal(null)}
        />
      )}
    </div>
  );
}
