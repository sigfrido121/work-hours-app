'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

function calcHours(entries) {
  let total = 0;
  for (const e of entries) {
    if (e.morning?.enabled && e.morning.start && e.morning.end) {
      const [hs, ms] = e.morning.start.split(':').map(Number);
      const [he, me] = e.morning.end.split(':').map(Number);
      total += (he * 60 + me - hs * 60 - ms) / 60;
    }
    if (e.afternoon?.enabled && e.afternoon.start && e.afternoon.end) {
      const [hs, ms] = e.afternoon.start.split(':').map(Number);
      const [he, me] = e.afternoon.end.split(':').map(Number);
      total += (he * 60 + me - hs * 60 - ms) / 60;
    }
  }
  return total.toFixed(1);
}

export default function AdminPage() {
  const { data: session } = useSession();
  const [users,    setUsers]    = useState([]);
  const [selected, setSelected] = useState(null);
  const [entries,  setEntries]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(d => { setUsers(d.data || []); setLoading(false); });
  }, []);

  const selectUser = async (user) => {
    setSelected(user);
    const res  = await fetch('/api/admin/entries?userId=' + user._id);
    const data = await res.json();
    setEntries(data.data || []);
  };

  const toggleAdmin = async (user) => {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user._id, isAdmin: !user.isAdmin }),
    });
    setUsers(prev => prev.map(u => u._id === user._id ? { ...u, isAdmin: !u.isAdmin } : u));
  };

  if (loading) return <div className="loading-wrap">Cargando…</div>;

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <div>
          <h1 className="app-title">Panel Admin</h1>
          <p className="app-subtitle">Horas de todos los usuarios</p>
        </div>
        <Link href="/" className="export-btn">← Volver</Link>
      </header>

      <div className="admin-grid">
        <div className="admin-users">
          {users.map(u => (
            <div
              key={u._id}
              className={"admin-user-row" + (selected?._id === u._id ? ' selected' : '')}
              onClick={() => selectUser(u)}
            >
              {u.avatar && <img src={u.avatar} className="admin-avatar" alt="" />}
              <div className="admin-user-info">
                <span className="admin-user-name">{u.firstName} {u.lastName}</span>
                <span className="admin-user-email">{u.email}</span>
              </div>
              {u.isAdmin && <span className="admin-badge">Admin</span>}
              {session?.user?.id !== u._id && (
                <button
                  className="admin-toggle-btn"
                  onClick={e => { e.stopPropagation(); toggleAdmin(u); }}
                >
                  {u.isAdmin ? 'Quitar admin' : 'Hacer admin'}
                </button>
              )}
            </div>
          ))}
        </div>

        {selected && (
          <div className="admin-detail">
            <h2 className="admin-detail-title">
              {selected.firstName} {selected.lastName}
              <span className="admin-total"> — {calcHours(entries)} h total</span>
            </h2>
            <div className="admin-entries">
              {entries.length === 0 && <p className="admin-empty">Sin entradas registradas</p>}
              {entries.map(e => (
                <div key={e._id} className="admin-entry-row">
                  <span className="admin-entry-date">
                    {new Date(e.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                  {e.morning?.enabled && (
                    <span className="admin-entry-shift">M {e.morning.start}–{e.morning.end}</span>
                  )}
                  {e.afternoon?.enabled && (
                    <span className="admin-entry-shift">T {e.afternoon.start}–{e.afternoon.end}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
