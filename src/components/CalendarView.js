'use client';

const getMinutes = (time) => {
    if (!time) return 0;
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
};

const getEntryMinutes = (entry) => {
    const mDiff = entry.morning?.enabled !== false
        ? getMinutes(entry.morning?.end) - getMinutes(entry.morning?.start) : 0;
    const aDiff = entry.afternoon?.enabled !== false
        ? getMinutes(entry.afternoon?.end) - getMinutes(entry.afternoon?.start) : 0;
    return Math.max(0, mDiff) + Math.max(0, aDiff);
};

const getHeatClass = (totalMinutes) => {
    const h = totalMinutes / 60;
    if (h <= 0)  return '';
    if (h < 3.5) return 'heat-1';
    if (h < 5.5) return 'heat-2';
    if (h < 7.5) return 'heat-3';
    return 'heat-4';
};

const formatHours = (totalMinutes) => {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return m > 0 ? `${h}.5h` : `${h}h`;
};

const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function CalendarView({ entries, currentDate, onDateChange, onDayClick }) {
    const year  = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth   = new Date(year, month + 1, 0).getDate();
    const rawFirstDay   = new Date(year, month, 1).getDay();
    const firstWeekday  = rawFirstDay === 0 ? 6 : rawFirstDay - 1; // Mon=0

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // Build lookup: dayStr → entry
    const entryMap = {};
    for (const e of entries) {
        const d = new Date(e.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        entryMap[key] = e;
    }

    const cells = [];

    // Empty leading cells
    for (let i = 0; i < firstWeekday; i++) {
        cells.push(<div key={`e-${i}`} className="cal-cell empty" />);
    }

    // Day cells
    for (let d = 1; d <= daysInMonth; d++) {
        const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const entry  = entryMap[dayStr] || null;
        const mins   = entry ? getEntryMinutes(entry) : 0;
        const heat   = entry ? getHeatClass(mins) : '';
        const isToday = dayStr === todayStr;

        cells.push(
            <div
                key={d}
                className={`cal-cell${heat ? ` ${heat}` : ''}${isToday ? ' today' : ''}`}
                onClick={() => onDayClick(dayStr, entry)}
            >
                <span className="cal-day-num">{d}</span>
                {entry && <span className="cal-day-hrs">{formatHours(mins)}</span>}
            </div>
        );
    }

    return (
        <div className="calendar-wrap">
            <div className="cal-nav">
                <button
                    className="cal-nav-btn"
                    onClick={() => onDateChange(new Date(year, month - 1))}
                >
                    ‹
                </button>
                <span className="cal-month-label">{MONTH_NAMES[month]} {year}</span>
                <button
                    className="cal-nav-btn"
                    onClick={() => onDateChange(new Date(year, month + 1))}
                >
                    ›
                </button>
            </div>

            <div className="cal-grid">
                {WEEKDAYS.map(w => (
                    <div key={w} className="cal-weekday">{w}</div>
                ))}
                {cells}
            </div>
        </div>
    );
}
