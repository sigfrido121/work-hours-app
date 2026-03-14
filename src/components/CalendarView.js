'use client';

export default function CalendarView({ entries, onEdit, onDelete, currentDate, onDateChange }) {
    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => {
        const day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1; // Adjust to Monday start
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const days = [];
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);

    // Empty spaces for previous month
    for (let i = 0; i < startDay; i++) {
        days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    const roundToHalfHour = (totalMinutes) => {
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        if (mins === 0) return totalMinutes;
        if (mins <= 30) return hours * 60 + 30;
        return (hours + 1) * 60;
    };

    const getMinutes = (time) => {
        if (!time) return 0;
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
    };

    // Days of current month
    for (let d = 1; d <= totalDays; d++) {
        const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const dayEntries = entries.filter(e => {
            const entryDate = new Date(e.date);
            const entryStr = `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(2, '0')}-${String(entryDate.getDate()).padStart(2, '0')}`;
            return entryStr === dayStr;
        });
        const entry = dayEntries[0]; // Assuming one entry per day

        let dayTotalText = '';
        if (entry) {
            const mDiff = entry.morning && entry.morning.enabled !== false ? getMinutes(entry.morning.end) - getMinutes(entry.morning.start) : 0;
            const aDiff = entry.afternoon && entry.afternoon.enabled !== false ? getMinutes(entry.afternoon.end) - getMinutes(entry.afternoon.start) : 0;
            const totalMins = roundToHalfHour(mDiff + aDiff);
            const h = Math.floor(totalMins / 60);
            const m = totalMins % 60;
            dayTotalText = `${h}h${m > 0 ? '30' : ''}`;
        }

        days.push(
            <div key={d} className={`calendar-day ${entry ? 'has-entry' : ''} ${new Date().toISOString().split('T')[0] === dayStr ? 'today' : ''}`}>
                <span className="day-number">{d}</span>
                {entry && (
                    <div className="day-content" onClick={() => onEdit(entry)}>
                        <div className="day-total">{dayTotalText}</div>
                        <div className="day-actions">
                            <button onClick={(e) => { e.stopPropagation(); onDelete(entry._id); }} className="btn-mini-delete" title="Eliminar">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="calendar-container card">
            <div className="calendar-header">
                <button onClick={() => onDateChange(new Date(year, month - 1))} className="btn-icon">←</button>
                <h3>{monthNames[month]} {year}</h3>
                <button onClick={() => onDateChange(new Date(year, month + 1))} className="btn-icon">→</button>
            </div>
            <div className="calendar-grid">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
                    <div key={d} className="calendar-weekday">{d}</div>
                ))}
                {days}
            </div>
            <style jsx>{`
                .calendar-container { padding: 1.5rem; }
                .calendar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
                .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; }
                .calendar-weekday { text-align: center; font-size: 0.75rem; font-weight: 800; color: var(--muted); padding-bottom: 0.5rem; text-transform: uppercase; }
                .calendar-day { min-height: 80px; background: rgba(0,0,0,0.02); border-radius: 12px; padding: 8px; position: relative; border: 1px solid transparent; transition: all 0.2s; }
                .calendar-day.empty { background: transparent; }
                .calendar-day.has-entry { background: var(--primary-soft); border-color: var(--primary); cursor: pointer; }
                .calendar-day.has-entry:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                .calendar-day.today { border-color: var(--accent); background: rgba(var(--accent-rgb), 0.1); }
                .day-number { font-size: 0.75rem; font-weight: 700; opacity: 0.6; }
                .day-content { height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 4px; }
                .day-total { font-weight: 900; color: var(--primary); font-size: 1.1rem; }
                .btn-mini-delete { position: absolute; top: 4px; right: 4px; width: 18px; height: 18px; border-radius: 50%; border: none; background: var(--danger); color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; cursor: pointer; opacity: 0; transition: opacity 0.2s; }
                .has-entry:hover .btn-mini-delete { opacity: 1; }
                .btn-icon { background: var(--primary-soft); border: none; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; font-weight: bold; }
                .btn-icon:hover { background: var(--primary); color: white; }
            `}</style>
        </div>
    );
}
