'use client';
import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/store';
import styles from './Header.module.css';

export default function Header() {
  const { user, logout, boards, activeBoardId, setActiveBoard, createBoard, updateBoardTitle, updateUsername } = useStore();
  const [dropOpen, setDropOpen] = useState(false);
  const [newBoardModal, setNewBoardModal] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [editingUsername, setEditingUsername] = useState(false);
  const [draftUsername, setDraftUsername] = useState('');
  const dropRef = useRef<HTMLDivElement>(null);
  const newInputRef = useRef<HTMLInputElement>(null);
  const usernameInputRef = useRef<HTMLInputElement>(null);

  const userBoards = boards.filter(b => b.owner === user?.email);
  const activeBoard = userBoards.find(b => b.id === activeBoardId);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (newBoardModal) setTimeout(() => newInputRef.current?.focus(), 50);
  }, [newBoardModal]);

  useEffect(() => {
    if (editingUsername) setTimeout(() => usernameInputRef.current?.select(), 30);
  }, [editingUsername]);

  const handleCreateBoard = () => {
    if (!newBoardTitle.trim()) return;
    createBoard(newBoardTitle.trim());
    setNewBoardTitle('');
    setNewBoardModal(false);
  };

  const startEditUsername = () => {
    setDraftUsername(user?.username ?? '');
    setEditingUsername(true);
  };

  const commitUsername = () => {
    const val = draftUsername.trim();
    if (val && val !== user?.username) updateUsername(val);
    setEditingUsername(false);
  };

  return (
    <>
      <header className={styles.header}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoMark}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
          </div>
          <span className={styles.logoText}>TaskFlow</span>
        </div>

        <div className={styles.divider} />

        {/* Board picker */}
        <div className={styles.boardSelector} ref={dropRef}>
          <button className={styles.boardBtn} onClick={() => setDropOpen(!dropOpen)}>
            <span className={styles.boardName}>{activeBoard?.title ?? 'Select board'}</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`${styles.chevron} ${dropOpen ? styles.chevronOpen : ''}`}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {dropOpen && (
            <div className={styles.dropdown}>
              {userBoards.length > 0 && (
                <>
                  <p className={styles.dropSection}>Boards</p>
                  {userBoards.map(b => (
                    <button
                      key={b.id}
                      className={`${styles.dropItem} ${b.id === activeBoardId ? styles.dropActive : ''}`}
                      onClick={() => { setActiveBoard(b.id); setDropOpen(false); }}
                    >
                      <span className={styles.dropCheck}>{b.id === activeBoardId ? '✓' : ''}</span>
                      {b.title}
                    </button>
                  ))}
                  <div className={styles.dropDivider} />
                </>
              )}
              <button className={styles.dropItem} onClick={() => { setNewBoardModal(true); setDropOpen(false); }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                New board
              </button>
            </div>
          )}
        </div>

        {/* Inline board title edit */}
        {activeBoard && (
          <input
            className={styles.boardTitleInput}
            value={activeBoard.title}
            onChange={e => updateBoardTitle(activeBoard.id, e.target.value)}
            aria-label="Board title"
          />
        )}

        {/* Right actions */}
        <div className={styles.right}>
          <div className={styles.userPill} title="Click username to edit">
            <div className={styles.avatar}>{user?.username?.[0]?.toUpperCase()}</div>
            {editingUsername ? (
              <input
                ref={usernameInputRef}
                className={styles.usernameInput}
                value={draftUsername}
                onChange={e => setDraftUsername(e.target.value)}
                onBlur={commitUsername}
                onKeyDown={e => { if (e.key === 'Enter') commitUsername(); if (e.key === 'Escape') setEditingUsername(false); }}
              />
            ) : (
              <span className={styles.username} onClick={startEditUsername}>{user?.username}</span>
            )}
          </div>
          <button className={styles.logoutBtn} onClick={logout} title="Sign out">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </header>

      {/* New board modal */}
      {newBoardModal && (
        <div className={styles.overlay} onClick={e => e.target === e.currentTarget && setNewBoardModal(false)}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>New board</h2>
              <button className={styles.modalClose} onClick={() => setNewBoardModal(false)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <label className={styles.fieldLabel}>Board name</label>
              <input
                ref={newInputRef}
                className={styles.fieldInput}
                value={newBoardTitle}
                onChange={e => setNewBoardTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreateBoard()}
                placeholder="e.g. Product Roadmap"
              />
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnPrimary} onClick={handleCreateBoard}>Create board</button>
              <button className={styles.btnGhost} onClick={() => setNewBoardModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
