import { Label } from '@/types';

export const LABELS: Label[] = [
  { id: 'bug',     text: 'Bug',     color: '#ff6b6b', bg: 'rgba(255,107,107,0.12)' },
  { id: 'feature', text: 'Feature', color: '#9d8fff', bg: 'rgba(157,143,255,0.12)' },
  { id: 'task',    text: 'Task',    color: '#48c78e', bg: 'rgba(72,199,142,0.12)'  },
  { id: 'review',  text: 'Review',  color: '#ffb347', bg: 'rgba(255,179,71,0.12)'  },
  { id: 'blocked', text: 'Blocked', color: '#ff8fab', bg: 'rgba(255,143,171,0.12)' },
];

export const COL_COLORS = [
  '#7c6fff', '#48c78e', '#ffb347', '#ff6b6b', '#4fc3f7', '#f06292',
];

export function genId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function emailToName(email: string): string {
  return email.split('@')[0];
}

export function hashPw(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h.toString(36);
}

export function getLabel(id: string) {
  return LABELS.find(l => l.id === id);
}

export function isOverdue(dueDate: string): boolean {
  if (!dueDate) return false;
  return dueDate < new Date().toISOString().slice(0, 10);
}

export function isDueToday(dueDate: string): boolean {
  if (!dueDate) return false;
  return dueDate === new Date().toISOString().slice(0, 10);
}

// Yeni kayıt için: boş sütunlar, sıfır kart
export function makeDefaultBoard(id: string) {
  const columns = [
    { id: genId(), boardId: id, title: 'To Do',  color: '#7c6fff', order: 1 },
    { id: genId(), boardId: id, title: 'In Progress', color: '#ffb347', order: 2 },
    { id: genId(), boardId: id, title: 'Done', color: '#48c78e', order: 3 },
  ];
  return { columns, cards: [] as never[] };
}
