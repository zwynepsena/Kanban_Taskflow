export type LabelId = 'bug' | 'feature' | 'task' | 'review' | 'blocked';

export interface Label {
  id: LabelId;
  text: string;
  color: string;
  bg: string;
}

export interface Card {
  id: string;
  colId: string;
  title: string;
  description: string;
  label: LabelId | '';
  dueDate: string;
  order: number;
  createdAt: string;
}

export interface Column {
  id: string;
  boardId: string;
  title: string;
  color: string;
  order: number;
}

export interface Board {
  id: string;
  title: string;
  owner: string;   // username — her kullanici sadece kendi boardlarini gorur
  createdAt: string;
}

export interface User {
  email: string;
  username: string;
}
