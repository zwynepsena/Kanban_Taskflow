'use client';
import { useEffect, useState } from 'react';
import { useStore } from '@/store';
import AuthScreen from '@/components/Auth';
import BoardSetup from '@/components/BoardSetup';
import Header from '@/components/Header';
import Board from '@/components/Board';

export default function Home() {
  const user = useStore(s => s.user);
  const boards = useStore(s => s.boards);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0f13' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #2a2a38', borderTopColor: '#7c6fff', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) return <AuthScreen />;

  const userBoards = boards.filter(b => b.owner === user.email);
  if (userBoards.length === 0) return <BoardSetup />;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Board />
    </div>
  );
}
