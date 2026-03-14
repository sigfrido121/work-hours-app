'use client';
import { useState, useEffect } from 'react';

export default function TimeTracker({ onEntryCreated }) {
    const [title, setTitle] = useState('');
    const [activeEntry, setActiveEntry] = useState(null);
    const [elapsed, setElapsed] = useState(0);

    // Sync active entry on mount
    useEffect(() => {
        fetch('/api/entries')
            .then(res => res.json())
            .then(data => {
                const active = data.data.find(e => !e.endTime);
                if (active) {
                    setActiveEntry(active);
                }
            });
    }, []);

    // Timer effect
    useEffect(() => {
        let interval;
        if (activeEntry) {
            interval = setInterval(() => {
                const start = new Date(activeEntry.startTime).getTime();
                const now = new Date().getTime();
                setElapsed(Math.floor((now - start) / 1000));
            }, 1000);
        } else {
            setElapsed(0);
        }
        return () => clearInterval(interval);
    }, [activeEntry]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleStart = async (e) => {
        e.preventDefault();
        if (!title) return;

        const res = await fetch('/api/entries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title }),
        });
        const data = await res.json();
        if (data.success) {
            setActiveEntry(data.data);
            setTitle('');
            onEntryCreated();
        }
    };

    const handleStop = async () => {
        const res = await fetch(`/api/entries/${activeEntry._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endTime: new Date() }),
        });
        const data = await res.json();
        if (data.success) {
            setActiveEntry(null);
            onEntryCreated();
        }
    };

    return (
        <div className="card mb-4">
            {!activeEntry ? (
                <form onSubmit={handleStart} className="flex flex-col gap-4">
                    <h2>¿En qué estás trabajando?</h2>
                    <input
                        className="input"
                        type="text"
                        placeholder="Ej: Desarrollo de Backend"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                    <button type="submit" className="btn btn-primary">
                        Empezar Cronómetro
                    </button>
                </form>
            ) : (
                <div className="flex flex-col items-center gap-4">
                    <div className="text-muted">Actualmente trabajando en:</div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{activeEntry.title}</h2>
                    <div style={{ fontSize: '3rem', fontWeight: '800', fontFamily: 'monospace' }}>
                        {formatTime(elapsed)}
                    </div>
                    <button onClick={handleStop} className="btn btn-danger" style={{ width: '100%' }}>
                        Detener Trabajo
                    </button>
                </div>
            )}
        </div>
    );
}
