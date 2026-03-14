'use client';
import { useState, useEffect } from 'react';

export default function ShiftForm({ onEntrySaved, editingEntry, onCancel }) {
    const today = new Date().toISOString().split('T')[0];
    const [date, setDate] = useState(today);
    const [morning, setMorning] = useState({ start: '08:00', end: '12:00' });
    const [afternoon, setAfternoon] = useState({ start: '14:00', end: '17:30' });
    const [note, setNote] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (editingEntry) {
            setDate(new Date(editingEntry.date).toISOString().split('T')[0]);
            setMorning(editingEntry.morning || { start: '08:00', end: '12:00', enabled: true });
            setAfternoon(editingEntry.afternoon || { start: '14:00', end: '17:30', enabled: true });
            setNote(editingEntry.note || '');
        } else {
            setDate(today);
            setMorning({ start: '08:00', end: '12:00', enabled: true });
            setAfternoon({ start: '14:00', end: '17:30', enabled: true });
            setNote('');
        }
    }, [editingEntry, today]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        const getMinutes = (time) => {
            if (!time) return 0;
            const [h, m] = time.split(':').map(Number);
            return h * 60 + m;
        };

        if (morning.enabled && getMinutes(morning.end) <= getMinutes(morning.start)) {
            alert('La salida de la mañana debe ser posterior a la entrada.');
            return;
        }
        if (afternoon.enabled && getMinutes(afternoon.end) <= getMinutes(afternoon.start)) {
            alert('La salida de la tarde debe ser posterior a la entrada.');
            return;
        }
        if (!morning.enabled && !afternoon.enabled) {
            alert('Debes habilitar al menos un turno.');
            return;
        }

        setSaving(true);

        try {
            const url = editingEntry ? `/api/entries/${editingEntry._id}` : '/api/entries';
            const method = editingEntry ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date,
                    morning,
                    afternoon,
                    note
                }),
            });
            const data = await res.json();
            if (data.success) {
                onEntrySaved();
                // Reset form
                if (!editingEntry) {
                    setMorning({ start: '08:00', end: '12:00', enabled: true });
                    setAfternoon({ start: '14:00', end: '17:30', enabled: true });
                    setNote('');
                }
            } else {
                alert('Error al guardar: ' + data.error);
            }
        } catch (err) {
            alert('Error de conexión');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="card mb-4" style={editingEntry ? { borderColor: 'var(--primary)', borderWidth: '2px' } : {}}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                        {editingEntry ? 'Editar Jornada' : 'Registrar Jornada'}
                    </h2>
                    {editingEntry && <span className="text-sm badge badge-primary">Modo Edición</span>}
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-muted">Fecha de la jornada</label>
                    <input
                        type="date"
                        className="input"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />
                </div>

                <div className="grid-2 gap-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                    {/* Morning Shift */}
                    <div className={`flex flex-col gap-2 p-3 rounded-xl transition-all ${morning.enabled ? 'bg-primary-soft' : 'bg-muted-soft opacity-60'}`}>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-sm font-bold">☀️ Mañana</label>
                            <input
                                type="checkbox"
                                checked={morning.enabled}
                                onChange={(e) => setMorning({ ...morning, enabled: e.target.checked })}
                            />
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="time"
                                className="input"
                                value={morning.start}
                                disabled={!morning.enabled}
                                onChange={(e) => setMorning({ ...morning, start: e.target.value })}
                            />
                            <input
                                type="time"
                                className="input"
                                value={morning.end}
                                disabled={!morning.enabled}
                                onChange={(e) => setMorning({ ...morning, end: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Afternoon Shift */}
                    <div className={`flex flex-col gap-2 p-3 rounded-xl transition-all ${afternoon.enabled ? 'bg-primary-soft' : 'bg-muted-soft opacity-60'}`}>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-sm font-bold">🌆 Tarde</label>
                            <input
                                type="checkbox"
                                checked={afternoon.enabled}
                                onChange={(e) => setAfternoon({ ...afternoon, enabled: e.target.checked })}
                            />
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="time"
                                className="input"
                                value={afternoon.start}
                                disabled={!afternoon.enabled}
                                onChange={(e) => setAfternoon({ ...afternoon, start: e.target.value })}
                            />
                            <input
                                type="time"
                                className="input"
                                value={afternoon.end}
                                disabled={!afternoon.enabled}
                                onChange={(e) => setAfternoon({ ...afternoon, end: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-muted">Notas (Opcional)</label>
                    <input
                        type="text"
                        className="input"
                        placeholder="Ej: Reunión con cliente..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                </div>

                <div className="flex gap-2">
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                        {saving ? 'Guardando...' : editingEntry ? 'Actualizar Registro' : 'Guardar Jornada'}
                    </button>
                    {editingEntry && (
                        <button type="button" onClick={onCancel} className="btn btn-outline" style={{ flex: 1 }}>
                            Cancelar
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
