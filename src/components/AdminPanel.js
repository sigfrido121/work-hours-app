'use client';
import { useState, useEffect } from 'react';
import { entryMinutes, formatMinutes } from '@/lib/stats';

/* ─── Exportación CSV del equipo ─────────────────────────── */
function ExportSection({ entries, users, period, customFrom, customTo }) {
    const [open, setOpen] = useState(false);

    const userMap = {};
    for (const u of users) userMap[String(u._id)] = `${u.firstName} ${u.lastName}`.trim();

    const rows = [...entries]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(e => ({
            usuario: userMap[String(e.userId)] || '—',
            fecha:   new Date(e.date).toLocaleDateString('es-ES'),
            mIni:    e.morning?.enabled  ? e.morning.start    : '—',
            mFin:    e.morning?.enabled  ? e.morning.end      : '—',
            tIni:    e.afternoon?.enabled ? e.afternoon.start : '—',
            tFin:    e.afternoon?.enabled ? e.afternoon.end   : '—',
            total:   (entryMinutes(e) / 60).toFixed(2) + 'h',
            nota:    e.note || '',
        }));

    const periodLabel = {
        week: 'semana-actual', month: 'mes-actual', custom: `${customFrom}_${customTo}`,
    }[period] || 'periodo';

    const download = () => {
        const headers = ['Usuario','Fecha','Mañana inicio','Mañana fin','Tarde inicio','Tarde fin','Total horas','Nota'];
        const csvRows = rows.map(r => [r.usuario, r.fecha, r.mIni, r.mFin, r.tIni, r.tFin, r.total, `"${r.nota}"`]);
        const csv = [headers.join(','), ...csvRows.map(r => r.join(','))].join('\n');
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `equipo_${periodLabel}.csv`;
        link.click();
    };

    const preview = rows.slice(0, 6);

    return (
        <div className="ap-export-section">
            <button className="ap-export-header" onClick={() => setOpen(o => !o)}>
                <div className="ap-export-title">
                    <span className="ap-export-icon">↓</span>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>Exportar CSV</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 1 }}>
                            {rows.length} jornadas · {users.length} usuarios
                        </div>
                    </div>
                </div>
                <span className="ap-export-chevron" style={{ transform: open ? 'rotate(180deg)' : 'none' }}>›</span>
            </button>

            {open && (
                <div className="ap-export-body">
                    {/* Previsualización */}
                    {rows.length === 0 ? (
                        <p className="ap-empty" style={{ padding: '1rem 0' }}>Sin datos en este período</p>
                    ) : (
                        <>
                            <div className="ap-csv-table-wrap">
                                <table className="ap-csv-table">
                                    <thead>
                                        <tr>
                                            {['Usuario','Fecha','☀ Inicio','☀ Fin','◑ Inicio','◑ Fin','Total','Nota'].map(h => (
                                                <th key={h}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {preview.map((r, i) => (
                                            <tr key={i}>
                                                <td className="ap-csv-name">{r.usuario}</td>
                                                <td>{r.fecha}</td>
                                                <td>{r.mIni}</td>
                                                <td>{r.mFin}</td>
                                                <td>{r.tIni}</td>
                                                <td>{r.tFin}</td>
                                                <td className="ap-csv-total">{r.total}</td>
                                                <td className="ap-csv-nota">{r.nota || <span style={{color:'var(--text-muted)'}}>—</span>}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {rows.length > 6 && (
                                <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0.4rem 0 0.75rem' }}>
                                    … y {rows.length - 6} filas más
                                </p>
                            )}
                            <button className="ap-download-btn" onClick={download}>
                                ↓ Descargar CSV completo ({rows.length} filas)
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

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

/* ─── Vista de detalle de un usuario ─────────────────────── */
function UserDetail({ user, onBack }) {
    const [entries,    setEntries]    = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [month,      setMonth]      = useState(new Date());

    useEffect(() => {
        fetch('/api/admin/entries?userId=' + user._id)
            .then(r => r.ok ? r.json() : Promise.reject(r.status))
            .then(d => setEntries(d.data || []))
            .catch(err => console.error('UserDetail fetch error:', err))
            .finally(() => setLoading(false));
    }, [user._id]);

    const monthEntries = entries
        .filter(e => {
            const d = new Date(e.date);
            return d.getFullYear() === month.getFullYear() && d.getMonth() === month.getMonth();
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const totalMins      = entries.reduce((s, e) => s + entryMinutes(e), 0);
    const monthMins      = monthEntries.reduce((s, e) => s + entryMinutes(e), 0);
    const monthLabel     = month.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

    return (
        <div style={{ padding: '0 1rem 5rem' }}>
            {/* Cabecera usuario */}
            <div className="ap-detail-header">
                <button className="cal-nav-btn" onClick={onBack}>←</button>
                {user.avatar && (
                    <img src={user.avatar} className="admin-avatar ap-detail-avatar" alt="" />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="ap-detail-name">
                        {user.firstName} {user.lastName}
                        {user.isAdmin && <span className="admin-badge" style={{ marginLeft: 6 }}>Admin</span>}
                    </div>
                    <div className="ap-detail-meta">
                        {formatMinutes(totalMins)} total · {entries.length} días registrados
                    </div>
                </div>
            </div>

            {/* Navegación de mes */}
            <div className="cal-nav" style={{ marginBottom: '0.75rem' }}>
                <button className="cal-nav-btn" onClick={() => {
                    const d = new Date(month); d.setMonth(d.getMonth() - 1); setMonth(d);
                }}>‹</button>
                <div style={{ textAlign: 'center' }}>
                    <div className="cal-month-label" style={{ textTransform: 'capitalize' }}>{monthLabel}</div>
                    {monthMins > 0 && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--amber)', fontWeight: 700, marginTop: 2 }}>
                            {formatMinutes(monthMins)} este mes
                        </div>
                    )}
                </div>
                <button className="cal-nav-btn" onClick={() => {
                    const d = new Date(month); d.setMonth(d.getMonth() + 1); setMonth(d);
                }}>›</button>
            </div>

            {/* Lista de jornadas */}
            {loading ? (
                <div className="loading-wrap">Cargando…</div>
            ) : monthEntries.length === 0 ? (
                <p className="ap-empty">Sin jornadas en {monthLabel}</p>
            ) : (
                <div className="admin-entries">
                    {monthEntries.map(e => {
                        const mins = entryMinutes(e);
                        return (
                            <div key={e._id} className="ap-entry-card">
                                <div className="ap-entry-top">
                                    <span className="ap-entry-date">
                                        {new Date(e.date).toLocaleDateString('es-ES', {
                                            weekday: 'short', day: '2-digit', month: 'short',
                                        })}
                                    </span>
                                    <span className="ap-entry-total">{formatMinutes(mins)}</span>
                                </div>
                                <div className="ap-entry-shifts">
                                    {e.morning?.enabled && (
                                        <span className="admin-entry-shift">☀ {e.morning.start}–{e.morning.end}</span>
                                    )}
                                    {e.afternoon?.enabled && (
                                        <span className="admin-entry-shift">◑ {e.afternoon.start}–{e.afternoon.end}</span>
                                    )}
                                </div>
                                {e.note && <div className="ap-entry-note">{e.note}</div>}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

/* ─── Panel principal de administración ──────────────────── */
export default function AdminPanel() {
    const [users,       setUsers]       = useState([]);
    const [allEntries,  setAllEntries]  = useState(null);
    const [loading,     setLoading]     = useState(true);
    const [error,       setError]       = useState(null);
    const [selected,    setSelected]    = useState(null);
    const [period,      setPeriod]      = useState('month');
    const [customFrom,  setCustomFrom]  = useState('');
    const [customTo,    setCustomTo]    = useState('');

    useEffect(() => {
        Promise.all([
            fetch('/api/admin/users').then(r => {
                if (!r.ok) throw new Error(`users ${r.status}`);
                return r.json();
            }),
            fetch('/api/admin/entries?all=true').then(r => {
                if (!r.ok) throw new Error(`entries ${r.status}`);
                return r.json();
            }),
        ])
            .then(([u, e]) => {
                setUsers(u.data || []);
                setAllEntries(e.data || []);
            })
            .catch(err => {
                console.error('AdminPanel fetch error:', err);
                setError(err.message || 'Error al cargar datos');
                setUsers([]);
                setAllEntries([]);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading-wrap">Cargando equipo…</div>;
    if (error)   return <div className="loading-wrap" style={{ color: 'var(--danger)', flexDirection: 'column', gap: '0.5rem' }}>
        <span>Error al cargar el panel</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{error}</span>
    </div>;

    if (selected) {
        return <UserDetail user={selected} onBack={() => setSelected(null)} />;
    }

    /* Stats */
    const filtered  = filterByPeriod(allEntries || [], period, customFrom, customTo);
    const byUser    = {};
    for (const e of filtered) {
        const uid = String(e.userId);
        if (!byUser[uid]) byUser[uid] = { mins: 0, days: 0 };
        byUser[uid].mins += entryMinutes(e);
        byUser[uid].days += 1;
    }
    const userStats  = users
        .map(u => ({ ...u, mins: byUser[String(u._id)]?.mins || 0, days: byUser[String(u._id)]?.days || 0 }))
        .sort((a, b) => b.mins - a.mins);

    const maxMins     = Math.max(...userStats.map(u => u.mins), 1);
    const totalMins   = userStats.reduce((s, u) => s + u.mins, 0);
    const activeUsers = userStats.filter(u => u.days > 0).length;

    return (
        <div style={{ padding: '0 1rem 5rem' }}>
            {/* Selector de período */}
            <div className="admin-tabs" style={{ padding: '0 0 1rem', flexWrap: 'wrap' }}>
                {[
                    { key: 'week',   label: 'Esta semana' },
                    { key: 'month',  label: 'Este mes'    },
                    { key: 'custom', label: 'Fechas'      },
                ].map(({ key, label }) => (
                    <button
                        key={key}
                        className={`admin-tab${period === key ? ' active' : ''}`}
                        onClick={() => setPeriod(key)}
                    >{label}</button>
                ))}
            </div>

            {period === 'custom' && (
                <div className="admin-period-row" style={{ padding: '0 0 1rem' }}>
                    <input
                        type="date" className="form-input" style={{ width: 'auto' }}
                        value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                    />
                    <span style={{ color: 'var(--text-dim)', alignSelf: 'center' }}>→</span>
                    <input
                        type="date" className="form-input" style={{ width: 'auto' }}
                        value={customTo} onChange={e => setCustomTo(e.target.value)}
                    />
                </div>
            )}

            {/* Resumen del equipo */}
            <div className="admin-summary-bar" style={{ margin: '0 0 1.25rem' }}>
                <div className="admin-summary-stat">
                    <span className="admin-summary-value">{formatMinutes(totalMins)}</span>
                    <span className="admin-summary-label">Total equipo</span>
                </div>
                <div className="admin-summary-stat">
                    <span className="admin-summary-value">{activeUsers}<span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-muted)' }}>/{users.length}</span></span>
                    <span className="admin-summary-label">Activos</span>
                </div>
                <div className="admin-summary-stat">
                    <span className="admin-summary-value">{filtered.length}</span>
                    <span className="admin-summary-label">Jornadas</span>
                </div>
            </div>

            {/* Lista de usuarios */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {userStats.map((u, i) => {
                    const pct = (u.mins / maxMins) * 100;
                    const avg = u.days > 0 ? Math.round(u.mins / u.days) : 0;
                    return (
                        <div
                            key={u._id}
                            className="ap-user-card"
                            onClick={() => setSelected(u)}
                        >
                            <div className="ap-user-card-top">
                                <span className="ap-rank">#{i + 1}</span>
                                {u.avatar
                                    ? <img src={u.avatar} className="admin-avatar" alt="" />
                                    : <div className="ap-avatar-placeholder">{u.firstName?.[0]}{u.lastName?.[0]}</div>
                                }
                                <div className="admin-user-info">
                                    <span className="admin-user-name">
                                        {u.firstName} {u.lastName}
                                        {u.isAdmin && <span className="admin-badge" style={{ marginLeft: 5 }}>Admin</span>}
                                    </span>
                                    <span className="admin-user-email">{u.email}</span>
                                </div>
                                <div className="ap-user-stats">
                                    <span className="ap-user-hours">{u.mins > 0 ? formatMinutes(u.mins) : '—'}</span>
                                    <span className="ap-user-days">{u.days} {u.days === 1 ? 'día' : 'días'}{avg > 0 ? ` · ${formatMinutes(avg)}/día` : ''}</span>
                                </div>
                            </div>
                            {/* Barra de progreso */}
                            <div className="ap-progress-track">
                                <div
                                    className="ap-progress-fill"
                                    style={{ width: u.mins > 0 ? `${pct}%` : '0%' }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Exportación CSV */}
            <div style={{ marginTop: '1.25rem' }}>
                <ExportSection
                    entries={filtered}
                    users={users}
                    period={period}
                    customFrom={customFrom}
                    customTo={customTo}
                />
            </div>
        </div>
    );
}
