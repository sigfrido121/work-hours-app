'use client';
import { useState, useEffect } from 'react';
import TimeSelect from '@/components/TimeSelect';
import { getMinutes } from '@/lib/stats';

const DEFAULT_MORNING   = { start: '08:00', end: '12:00', enabled: true };
const DEFAULT_AFTERNOON = { start: '14:00', end: '17:30', enabled: true };

export default function EntryModal({ isOpen, entry, date, onClose, onSaved, onDeleted }) {
    const [dateVal,    setDateVal]    = useState(date || '');
    const [morning,    setMorning]    = useState(DEFAULT_MORNING);
    const [afternoon,  setAfternoon]  = useState(DEFAULT_AFTERNOON);
    const [note,       setNote]       = useState('');
    const [saving,     setSaving]     = useState(false);
    const [deleting,   setDeleting]   = useState(false);
    const [error,      setError]      = useState(null);
    const [success,    setSuccess]    = useState(null);

    // Populate form whenever the modal opens with new data
    useEffect(() => {
        if (!isOpen) return;
        setError(null);
        setSuccess(null);
        if (entry) {
            const d = new Date(entry.date);
            setDateVal(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
            setMorning(entry.morning   || DEFAULT_MORNING);
            setAfternoon(entry.afternoon || DEFAULT_AFTERNOON);
            setNote(entry.note || '');
        } else {
            setDateVal(date || '');
            setMorning({ ...DEFAULT_MORNING });
            setAfternoon({ ...DEFAULT_AFTERNOON });
            setNote('');
        }
    }, [isOpen, entry, date]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (morning.enabled && getMinutes(morning.end) <= getMinutes(morning.start)) {
            setError('La salida de mañana debe ser posterior a la entrada.');
            return;
        }
        if (afternoon.enabled && getMinutes(afternoon.end) <= getMinutes(afternoon.start)) {
            setError('La salida de tarde debe ser posterior a la entrada.');
            return;
        }
        if (!morning.enabled && !afternoon.enabled) {
            setError('Debes habilitar al menos un turno.');
            return;
        }

        setSaving(true);
        try {
            const url    = entry ? `/api/entries/${entry._id}` : '/api/entries';
            const method = entry ? 'PUT' : 'POST';
            const res    = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: dateVal, morning, afternoon, note }),
            });
            const data = await res.json();
            if (data.success) {
                setSuccess(entry ? '¡Jornada actualizada!' : '¡Jornada guardada!');
                setTimeout(() => {
                    onSaved();
                    onClose();
                }, 800);
            } else {
                setError(data.error || 'Error al guardar.');
            }
        } catch {
            setError('Error de conexión. Inténtalo de nuevo.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!entry) return;
        if (!confirm('¿Eliminar este registro?')) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/entries/${entry._id}`, { method: 'DELETE' });
            if (res.ok) {
                onDeleted();
                onClose();
            }
        } finally {
            setDeleting(false);
        }
    };

    const isEditMode = !!entry;
    const displayDate = dateVal
        ? new Date(dateVal + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
        : '';

    return (
        <>
            <div className="bs-backdrop" onClick={onClose} />
            <div className="bs-sheet">
                <div className="bs-handle" />

                <div className="bs-header">
                    <span className="bs-title">
                        {isEditMode ? 'Editar jornada' : 'Nueva jornada'}
                    </span>
                    <button className="bs-close" onClick={onClose} aria-label="Cerrar">✕</button>
                </div>

                {displayDate && (
                    <div className="bs-date-chip">{displayDate}</div>
                )}

                {error   && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <form onSubmit={handleSubmit}>
                    {/* Date (hidden when tapped from calendar, visible for manual entry) */}
                    <div className="form-group">
                        <label className="form-label">Fecha</label>
                        <input
                            type="date"
                            className="form-input"
                            value={dateVal}
                            onChange={(e) => setDateVal(e.target.value)}
                            required
                        />
                    </div>

                    {/* Morning shift */}
                    <div className={`shift-block ${morning.enabled ? 'is-enabled' : 'is-disabled'}`}>
                        <div className="shift-header">
                            <span className="shift-name">☀️ Mañana</span>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={morning.enabled}
                                    onChange={(e) => setMorning({ ...morning, enabled: e.target.checked })}
                                />
                                <span className="toggle-slider" />
                            </label>
                        </div>
                        <div className="shift-times">
                            <TimeSelect
                                value={morning.start}
                                disabled={!morning.enabled}
                                onChange={(v) => setMorning({ ...morning, start: v })}
                            />
                            <TimeSelect
                                value={morning.end}
                                disabled={!morning.enabled}
                                onChange={(v) => setMorning({ ...morning, end: v })}
                            />
                        </div>
                    </div>

                    {/* Afternoon shift */}
                    <div className={`shift-block ${afternoon.enabled ? 'is-enabled' : 'is-disabled'}`}>
                        <div className="shift-header">
                            <span className="shift-name">🌆 Tarde</span>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={afternoon.enabled}
                                    onChange={(e) => setAfternoon({ ...afternoon, enabled: e.target.checked })}
                                />
                                <span className="toggle-slider" />
                            </label>
                        </div>
                        <div className="shift-times">
                            <TimeSelect
                                value={afternoon.start}
                                disabled={!afternoon.enabled}
                                onChange={(v) => setAfternoon({ ...afternoon, start: v })}
                            />
                            <TimeSelect
                                value={afternoon.end}
                                disabled={!afternoon.enabled}
                                onChange={(v) => setAfternoon({ ...afternoon, end: v })}
                            />
                        </div>
                    </div>

                    {/* Note */}
                    <div className="form-group" style={{ marginTop: '0.6rem' }}>
                        <label className="form-label">Nota (opcional)</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Ej: Reunión con cliente..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="btn-save" disabled={saving || !!success}>
                        {saving ? 'Guardando...' : isEditMode ? 'Actualizar' : 'Guardar jornada'}
                    </button>
                </form>

                {isEditMode && (
                    <button
                        className="btn-delete"
                        onClick={handleDelete}
                        disabled={deleting}
                    >
                        {deleting ? 'Eliminando...' : 'Eliminar registro'}
                    </button>
                )}
            </div>
        </>
    );
}
