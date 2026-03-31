'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import CalendarView from '@/components/CalendarView';
import EntryModal from '@/components/EntryModal';
import StatsDashboard from '@/components/StatsDashboard';
import { downloadCSV } from '@/lib/export';

const getTodayStr = () => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
};

export default function Home() {
    const { data: session } = useSession();
    const [entries,     setEntries]     = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [modal,       setModal]       = useState({ open: false, entry: null, date: '' });

    const fetchEntries = useCallback(async () => {
        const res  = await fetch('/api/entries?page=1&limit=365');
        const data = await res.json();
        if (data.success) setEntries(data.data);
        setLoading(false);
    }, []);

    useEffect(() => { fetchEntries(); }, [fetchEntries]);

    const visibleEntries = entries.filter(e => {
        const d = new Date(e.date);
        return d.getFullYear() === currentDate.getFullYear() &&
               d.getMonth()    === currentDate.getMonth();
    });

    const openModal  = (date, entry) => setModal({ open: true, entry: entry || null, date });
    const closeModal = () => setModal({ open: false, entry: null, date: '' });

    return (
        <div className="app-wrapper">
            <header className="app-header">
                <div>
                    <h1 className="app-title">Horas</h1>
                    <p className="app-subtitle">
                        {session?.user?.firstName
                            ? `${session.user.firstName} ${session.user.lastName}`
                            : 'Registro de jornadas laborales'}
                    </p>
                </div>
                <div className="header-actions">
                    <button
                        className="export-btn"
                        onClick={() => downloadCSV(visibleEntries)}
                        disabled={visibleEntries.length === 0}
                    >
                        ↓ CSV
                    </button>
                    {session?.user?.isAdmin && (
                        <Link href="/admin" className="export-btn">Admin</Link>
                    )}
                    <button className="export-btn" onClick={() => signOut({ callbackUrl: '/login' })}>
                        Salir
                    </button>
                </div>
            </header>

            <StatsDashboard entries={visibleEntries} />

            {loading ? (
                <div className="loading-wrap">Cargando…</div>
            ) : (
                <CalendarView
                    entries={entries}
                    currentDate={currentDate}
                    onDateChange={setCurrentDate}
                    onDayClick={openModal}
                />
            )}

            <button
                className="fab"
                onClick={() => openModal(getTodayStr(), null)}
                aria-label="Nueva jornada"
            >
                +
            </button>

            <EntryModal
                isOpen={modal.open}
                entry={modal.entry}
                date={modal.date}
                onClose={closeModal}
                onSaved={fetchEntries}
                onDeleted={fetchEntries}
            />
        </div>
    );
}
