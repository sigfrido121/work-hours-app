const roundToHalfHour = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (mins === 0) return totalMinutes;
    if (mins <= 30) return hours * 60 + 30;
    return (hours + 1) * 60;
};

export const calculateStats = (entries) => {
    const totalMinutes = entries.reduce((acc, entry) => {
        const getMinutes = (time) => {
            const [h, m] = time.split(':').map(Number);
            return h * 60 + m;
        };
        const mDiff = entry.morning.enabled !== false ? getMinutes(entry.morning.end) - getMinutes(entry.morning.start) : 0;
        const aDiff = entry.afternoon.enabled !== false ? getMinutes(entry.afternoon.end) - getMinutes(entry.afternoon.start) : 0;
        return acc + roundToHalfHour(mDiff + aDiff);
    }, 0);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    // Filter entries for this week (Monday start)
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    const startOfWeek = new Date(now.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);

    const weekMinutes = entries.filter(e => new Date(e.date) >= startOfWeek).reduce((acc, entry) => {
        const getMinutes = (time) => {
            const [h, m] = time.split(':').map(Number);
            return h * 60 + m;
        };
        const mDiff = entry.morning.enabled !== false ? getMinutes(entry.morning.end) - getMinutes(entry.morning.start) : 0;
        const aDiff = entry.afternoon.enabled !== false ? getMinutes(entry.afternoon.end) - getMinutes(entry.afternoon.start) : 0;
        return acc + roundToHalfHour(mDiff + aDiff);
    }, 0);

    const weekHours = Math.floor(weekMinutes / 60);

    return {
        total: `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`,
        weekTotal: `${weekHours}h`,
        count: entries.length
    };
};
