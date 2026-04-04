'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import AppHeader from '@/components/AppHeader';
import { entryMinutes, formatMinutes } from '@/lib/stats';

function filterByPeriod(entries, period, from, to) {
  const now = new Date();
  if (period === 'week') {
    const day  = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(now);
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    return entries.filter(e => new Date(e.date) >= start);
  }
  if (period === 'month') {
    return entries.filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });
  }
  if (period === 'custom' && from && to) {
    const f = new Date(from + 'T00:00:00');
    const t = new Date(to   + 'T23:59:59');
    return entries.filter(e => { const d = new Date(e.date); return d >= f && d <= t; });
  }
  return entries;
}

function buildUserStats(allEntries, users, period, from, to) {
  const filtered = filterByPeriod(allEntries, period, from, to);
  const byUser   = {};
  for (const e of filtered) {
    const uid = String(e.userId);
    if (!byUser[uid]) byUser[uid] = { mins: 0, days: 0 };
    byUser[uid].mins += entryMinutes(e);
    byUser[uid].days += 1;
  }
  return users
    .map(u => ({ ...u, mins: byUser[String(u._id)]?.mins || 0, days: byUser[String(u._id)]?.days || 0 }))
    .sort((a, b) => b.mins - a.mins);
}

export default function AdminPage() {
  const { data: session } = useSession();
  const [users,          setUsers]          = useState([]);
  const [selected,       setSelected]       = useState(null);
  const [entries,        setEntries]        = useState([]);
  const [loadingUsers,   setLoadingUsers]   = useState(true);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [view,           setView]           = useState('individual');
  const [allEntries,     setAllEntries]     = useState(null);
  const [loadingAll,     setLoadingAll]     = useState(false);
  const [period,         setPeriod]         = useState('month');
  const [customFrom,     setCustomFrom]     = useState('');
  const [customTo,       setCustomTo]       = useState('');

  useEffect(() => {
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(d => { setUsers(d.data || []); setLoadingUsers(false); });
  }, []);

  const selectUser = async (user) => {
    setSelected(user);
    setLoadingEntries(true);
    const res  = await fetch('/api/admin/entries?userId=' + user._id);
    const data = await res.json();
    setEntries(data.data || []);
    setLoadingEntries(false);
  };

  const switchToCollective = async () => {
    setView('collective');
    if (allEntries !== null) return;
    setLoadingAll(true);
    const res  = await fetch('/api/admin/entries?all=true');
    const data = await res.json();
    setAllEntries(data.data || []);
    setLoadingAll(false);
  };

  const toggleAdmin = async (user) => {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user._id, isAdmin: !user.isAdmin }),
    });
    setUsers(prev => prev.map(u => u._id === user._id ? { ...u, isAdmin: !u.isAdmin } : u));
  };

  if (loadingUsers) return <div className="loading-wrap">Cargando…</div>;

  const userStats     = allEntries ? buildUserStats(allEntries, users, period, customFrom, customTo) : [];
  const filteredAll   = allEntries ? filterByPeriod(allEntries, period, customFrom, customTo) : [];
  const totalMins     = userStats.reduce((acc, u) => acc + u.mins, 0);
  const activeUsers   = userStats.filter(u => u.days > 0).length;

  return (
    <div className="app-wrapper">
      <AppHeader title="Panel Admin" subtitle="Horas de todos los usuarios" backHref="/" />

      <div className="admin-tabs">
        <button
          className={'admin-tab' + (view === 'individual' ? ' active' : '')}
          onClick={() => setView('individual')}
        >
          Individual
        </button>
        <button
          className={'admin-tab' + (view === 'collective' ? ' active' : '')}
          onClick={switchToCollective}
        >
          Colectivo
        </button>
      </div>

      {view === 'collective' && (
        <div>
          <div className="admin-period-row">
            {['week', 'month', 'custom'].map(p => (
              <button
                key={p}
                className={'admin-tab' + (period === p ? ' active' : '')}
                onClick={() => setPeriod(p)}
              >
                {p === 'week' ? 'Esta semana' : p === 'month' ? 'Este mes' : 'Personalizado'}
              </button>
            ))}
          </div>

          {period === 'custom' && (
            <div className="admin-period-row">
              <input
                type="date"
                className="form-input"
                style={{ width: 'auto' }}
                value={customFrom}
                onChange={e => setCustomFrom(e.target.value)}
              />
              <span style={{ color: 'var(--text-dim)', alignSelf: 'center' }}>→</span>
              <input
                type="date"
                className="form-input"
                style={{ width: 'auto' }}
                value={customTo}
                onChange={e => setCustomTo(e.target.value)}
              />
            </div>
          )}

          {loadingAll ? (
            <div className="loading-wrap">Cargando…</div>
          ) : (
            <>
              <div className="admin-summary-bar">
                <div className="admin-summary-stat">
                  <span className="admin-summary-value">{formatMinutes(totalMins)}</span>
                  <span className="admin-summary-label">Total equipo</span>
                </div>
                <div className="admin-summary-stat">
                  <span className="admin-summary-value">{filteredAll.length}</span>
                  <span className="admin-summary-label">Entradas</span>
                </div>
                <div className="admin-summary-stat">
                  <span className="admin-summary-value">{activeUsers}</span>
                  <span className="admin-summary-label">Usuarios activos</span>
                </div>
              </div>

              <div style={{ padding: '0 1rem 2rem' }}>
                <table className="admin-rank-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Nombre</th>
                      <th>Horas</th>
                      <th>Días</th>
                      <th>Media/día</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userStats.map((u, i) => (
                      <tr key={u._id}>
                        <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                        <td>
                          {u.avatar && <img src={u.avatar} className="admin-avatar" style={{ marginRight: 6, verticalAlign: 'middle' }} alt="" />}
                          {u.firstName} {u.lastName}
                        </td>
                        <td style={{ color: 'var(--primary)', fontWeight: 700 }}>{formatMinutes(u.mins)}</td>
                        <td>{u.days}</td>
                        <td style={{ color: 'var(--text-dim)' }}>
                          {u.days > 0 ? formatMinutes(Math.round(u.mins / u.days)) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {view === 'individual' && (
        <div className="admin-grid">
          <div className="admin-users">
            {users.map(u => (
              <div
                key={u._id}
                className={'admin-user-row' + (selected?._id === u._id ? ' selected' : '')}
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
                {!loadingEntries && (
                  <span className="admin-total">
                    {' — '}{formatMinutes(entries.reduce((acc, e) => acc + entryMinutes(e), 0))} total
                  </span>
                )}
              </h2>
              {loadingEntries ? (
                <p className="admin-empty">Cargando…</p>
              ) : (
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
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
