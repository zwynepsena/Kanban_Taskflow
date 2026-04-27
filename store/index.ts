'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Board, Column, Card, User } from '@/types';
import { genId, makeDefaultBoard } from '@/lib/utils';

export interface StoredUser {
  username: string;
  hash?: string;       // undefined for Google-only accounts
  google?: boolean;
}

export function getStoredUsers(): Record<string, StoredUser> {
  if (typeof window === 'undefined') return {};
  const raw = JSON.parse(localStorage.getItem('tf_users') || '{}');
  // Migrate old format where value was a plain hash string
  const result: Record<string, StoredUser> = {};
  for (const [key, val] of Object.entries(raw)) {
    if (typeof val === 'string') {
      result[key] = { username: key.split('@')[0], hash: val };
    } else {
      result[key] = val as StoredUser;
    }
  }
  return result;
}

export function resetAllData() {
  localStorage.removeItem('tf_users');
  localStorage.removeItem('taskflow-v2');
  localStorage.removeItem('taskflow-v3');
  localStorage.removeItem('taskflow-v4');
}

export function saveStoredUsers(data: Record<string, StoredUser>) {
  localStorage.setItem('tf_users', JSON.stringify(data));
}

interface AppState {
  user: User | null;
  boards: Board[];
  columns: Column[];
  cards: Card[];
  activeBoardId: string | null;

  login: (email: string, username: string) => void;
  logout: () => void;
  updateUsername: (username: string) => void;

  createBoard: (title: string) => string;
  setActiveBoard: (id: string) => void;
  updateBoardTitle: (id: string, title: string) => void;
  deleteBoard: (id: string) => void;

  addColumn: (boardId: string) => void;
  updateColumn: (id: string, patch: Partial<Column>) => void;
  deleteColumn: (id: string) => void;
  reorderColumns: (boardId: string, orderedIds: string[]) => void;

  addCard: (colId: string, data: { title: string; description: string; label: string; dueDate: string }) => void;
  updateCard: (id: string, patch: Partial<Card>) => void;
  deleteCard: (id: string) => void;
  moveCard: (cardId: string, destColId: string, destIndex: number) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      boards: [],
      columns: [],
      cards: [],
      activeBoardId: null,

      login: (email, username) => {
        const state = get();
        const userBoards = state.boards.filter(b => b.owner === email);
        set({
          user: { email, username },
          activeBoardId: userBoards[0]?.id ?? null,
        });
      },

      logout: () => set({ user: null, activeBoardId: null }),

      updateUsername: (username) => {
        const { user } = get();
        if (!user) return;
        const stored = getStoredUsers();
        if (stored[user.email]) {
          stored[user.email].username = username;
          saveStoredUsers(stored);
        }
        set(s => ({ user: s.user ? { ...s.user, username } : null }));
      },

      createBoard: (title) => {
        const { user } = get();
        const id = genId();
        const { columns } = makeDefaultBoard(id);
        const board: Board = {
          id, title,
          owner: user?.email ?? '',
          createdAt: new Date().toISOString(),
        };
        set(s => ({
          boards: [...s.boards, board],
          columns: [...s.columns, ...columns],
          activeBoardId: id,
        }));
        return id;
      },

      setActiveBoard: (id) => set({ activeBoardId: id }),

      updateBoardTitle: (id, title) =>
        set(s => ({ boards: s.boards.map(b => b.id === id ? { ...b, title } : b) })),

      deleteBoard: (id) => {
        const { boards, columns, cards, activeBoardId, user } = get();
        const colIds = columns.filter(c => c.boardId === id).map(c => c.id);
        const newBoards = boards.filter(b => b.id !== id);
        const userBoards = newBoards.filter(b => b.owner === user?.email);
        set({
          boards: newBoards,
          columns: columns.filter(c => c.boardId !== id),
          cards: cards.filter(c => !colIds.includes(c.colId)),
          activeBoardId: activeBoardId === id ? (userBoards[0]?.id ?? null) : activeBoardId,
        });
      },

      addColumn: (boardId) => {
        const existing = get().columns.filter(c => c.boardId === boardId);
        const maxOrder = existing.length ? Math.max(...existing.map(c => c.order)) : 0;
        const colors = ['#7c6fff', '#48c78e', '#ffb347', '#ff6b6b', '#4fc3f7', '#f06292'];
        const col: Column = {
          id: genId(), boardId, title: 'New Column',
          color: colors[existing.length % colors.length],
          order: maxOrder + 1,
        };
        set(s => ({ columns: [...s.columns, col] }));
      },

      updateColumn: (id, patch) =>
        set(s => ({ columns: s.columns.map(c => c.id === id ? { ...c, ...patch } : c) })),

      deleteColumn: (id) =>
        set(s => ({
          columns: s.columns.filter(c => c.id !== id),
          cards: s.cards.filter(c => c.colId !== id),
        })),

      reorderColumns: (boardId, orderedIds) =>
        set(s => ({
          columns: s.columns.map(c => {
            const idx = orderedIds.indexOf(c.id);
            return c.boardId === boardId && idx !== -1 ? { ...c, order: idx + 1 } : c;
          }),
        })),

      addCard: (colId, data) => {
        const colCards = get().cards.filter(c => c.colId === colId);
        const maxOrder = colCards.length ? Math.max(...colCards.map(c => c.order)) : 0;
        const card: Card = {
          id: genId(), colId, order: maxOrder + 1,
          createdAt: new Date().toISOString(),
          title: data.title, description: data.description,
          label: data.label as Card['label'], dueDate: data.dueDate,
        };
        set(s => ({ cards: [...s.cards, card] }));
      },

      updateCard: (id, patch) =>
        set(s => ({ cards: s.cards.map(c => c.id === id ? { ...c, ...patch } : c) })),

      deleteCard: (id) =>
        set(s => ({ cards: s.cards.filter(c => c.id !== id) })),

      moveCard: (cardId, destColId, destIndex) => {
        const { cards } = get();
        const card = cards.find(c => c.id === cardId);
        if (!card) return;

        const withoutCard = cards.filter(c => c.id !== cardId);
        const destCards = withoutCard
          .filter(c => c.colId === destColId)
          .sort((a, b) => a.order - b.order);

        destCards.splice(destIndex, 0, { ...card, colId: destColId });

        const reorderedDest = destCards.map((c, i) => ({ ...c, order: i + 1 }));
        const updated = withoutCard
          .filter(c => c.colId !== destColId)
          .concat(reorderedDest);

        set({ cards: updated });
      },
    }),
    {
      name: 'taskflow-v4',
      partialize: (s) => ({
        user: s.user,
        boards: s.boards,
        columns: s.columns,
        cards: s.cards,
        activeBoardId: s.activeBoardId,
      }),
    }
  )
);
