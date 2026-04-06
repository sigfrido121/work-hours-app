'use client';
import { useEffect } from 'react';

const HOURS   = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];

const snapMinute = (m) => MINUTES.includes(m)
    ? m
    : MINUTES.reduce((prev, curr) =>
        Math.abs(Number(curr) - Number(m)) < Math.abs(Number(prev) - Number(m)) ? curr : prev
    );

export default function TimeSelect({ value, onChange, disabled }) {
    const [h, m] = value ? value.split(':') : ['08', '00'];
    const snapped = snapMinute(m);

    // Si la entrada existente tiene un minuto que no es múltiplo de 15, lo corrige silenciosamente
    useEffect(() => {
        if (snapped !== m) onChange(`${h}:${snapped}`);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="time-select">
            <select
                className="form-input time-select-part"
                value={h}
                disabled={disabled}
                onChange={(e) => onChange(`${e.target.value}:${snapped}`)}
            >
                {HOURS.map(hh => <option key={hh} value={hh}>{hh}</option>)}
            </select>
            <span className="time-sep">:</span>
            <select
                className="form-input time-select-part"
                value={snapped}
                disabled={disabled}
                onChange={(e) => onChange(`${h}:${e.target.value}`)}
            >
                {MINUTES.map(mm => <option key={mm} value={mm}>{mm}</option>)}
            </select>
        </div>
    );
}
