'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import CalendarView from '@/components/CalendarView';
import EntryModal from '@/components/EntryModal';
import StatsDashboard from '@/components/StatsDashboard';
import AppHeader from '@/components/AppHeader';
import AdminPanel from '@/components/AdminPanel';

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
    const [adminMode,   setAdminMode]   = useState(false);

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

    const navigateDay = useCallback((currentDateStr, direction) => {
        const d = new Date(currentDateStr + 'T12:00:00');
        d.setDate(d.getDate() + direction);
        const y   = d.getFullYear();
        const m   = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const newDateStr = `${y}-${m}-${day}`;

        const entry = entries.find(e => {
            const ed  = new Date(e.date);
            const eStr = `${ed.getFullYear()}-${String(ed.getMonth() + 1).padStart(2, '0')}-${String(ed.getDate()).padStart(2, '0')}`;
            return eStr === newDateStr;
        }) || null;

        // Si el día es de otro mes, actualizar la vista del calendario
        if (d.getMonth() !== currentDate.getMonth() || d.getFullYear() !== currentDate.getFullYear()) {
            setCurrentDate(new Date(y, d.getMonth(), 1));
        }

        setModal({ open: true, entry, date: newDateStr });
    }, [entries, currentDate]);

    return (
        <div className="app-wrapper">
            <AppHeader
                title="Horas"
                subtitle={adminMode
                    ? 'Panel de equipo'
                    : (session?.user?.firstName
                        ? `${session.user.firstName} ${session.user.lastName}`
                        : 'Registro de jornadas laborales')}
                entries={visibleEntries}
                adminMode={adminMode}
                onToggleAdmin={() => setAdminMode(m => !m)}
            />

            {adminMode ? (
                <AdminPanel />
            ) : (
                <>
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
                        onNavigate={navigateDay}
                    />
                </>
            )}
        </div>
    );
}
