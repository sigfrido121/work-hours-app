export default function EntryList({ entries, onDelete, onEdit, deletingId }) {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC'
        });
    };

    const calculateTotal = (morning, afternoon) => {
        const roundToHalfHour = (totalMinutes) => {
            const hours = Math.floor(totalMinutes / 60);
            const mins = totalMinutes % 60;
            if (mins === 0) return totalMinutes;
            if (mins <= 30) return hours * 60 + 30;
            return (hours + 1) * 60;
        };

        const getMinutes = (time) => {
            const [h, m] = time.split(':').map(Number);
            return h * 60 + m;
        };

        const mDiff = morning.enabled !== false ? getMinutes(morning.end) - getMinutes(morning.start) : 0;
        const aDiff = afternoon.enabled !== false ? getMinutes(afternoon.end) - getMinutes(afternoon.start) : 0;
        const totalMinutes = roundToHalfHour(mDiff + aDiff);

        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        return `${h}h ${m > 0 ? `${m}m` : ''}`;
    };

    return (
        <div className="flex flex-col gap-4">
            <h3 style={{ marginTop: '1rem' }}>Historial de Jornadas</h3>
            {entries.length === 0 && <p className="text-muted">No hay registros todavía.</p>}
            {entries.map((entry) => (
                <div key={entry._id} className="card border-highlight">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div style={{ fontWeight: '800', textTransform: 'capitalize' }}>
                                {formatDate(entry.date)}
                            </div>
                            <div className="text-sm text-success" style={{ fontWeight: '600' }}>
                                Total: {calculateTotal(entry.morning, entry.afternoon)}
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => onEdit(entry)}
                                className="text-sm font-bold"
                                style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                Editar
                            </button>
                            {deletingId === entry._id ? (
                                <span className="text-sm opacity-50">Eliminando...</span>
                            ) : (
                                <button
                                    onClick={() => onDelete(entry._id)}
                                    className="text-sm opacity-70"
                                    style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    Eliminar
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid-2 gap-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'rgba(0,0,0,0.03)', padding: '1rem', borderRadius: '12px' }}>
                        <div style={{ opacity: entry.morning.enabled === false ? 0.3 : 1 }}>
                            <div className="text-xs text-muted uppercase font-bold">☀️ Mañana</div>
                            <div className="text-sm font-semibold">
                                {entry.morning.enabled === false ? 'No laborado' : `${entry.morning.start} - ${entry.morning.end}`}
                            </div>
                        </div>
                        <div style={{ opacity: entry.afternoon.enabled === false ? 0.3 : 1 }}>
                            <div className="text-xs text-muted uppercase font-bold">🌆 Tarde</div>
                            <div className="text-sm font-semibold">
                                {entry.afternoon.enabled === false ? 'No laborado' : `${entry.afternoon.start} - ${entry.afternoon.end}`}
                            </div>
                        </div>
                    </div>

                    {entry.note && (
                        <div className="mt-4 text-sm italic text-muted">
                            Note: {entry.note}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
