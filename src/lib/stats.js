const roundToHalf = (mins) => {
    const h = Math.floor(mins / 60), m = mins % 60;
    if (m === 0) return mins;
    return m <= 30 ? h * 60 + 30 : (h + 1) * 60;
};

const getMinutes = (time) => {
    if (!time) return 0;
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
};

export const entryMinutes = (entry) => {
    const mDiff = entry.morning?.enabled !== false
        ? getMinutes(entry.morning.end) - getMinutes(entry.morning.start) : 0;
    const aDiff = entry.afternoon?.enabled !== false
        ? getMinutes(entry.afternoon.end) - getMinutes(entry.afternoon.start) : 0;
    return roundToHalf(mDiff + aDiff);
};

export const formatMinutes = (totalMinutes) => {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}h${m > 0 ? ` ${m}m` : ''}`;
};

export const calculateStats = (entries) => {
    const totalMinutes = entries.reduce((acc, e) => acc + entryMinutes(e), 0);

    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const weekMinutes = entries
        .filter(e => new Date(e.date) >= startOfWeek)
        .reduce((acc, e) => acc + entryMinutes(e), 0);

    return {
        total: formatMinutes(totalMinutes),
        weekTotal: formatMinutes(weekMinutes),
        count: entries.length,
        avgMinutes: entries.length ? Math.round(totalMinutes / entries.length) : 0,
    };
};
