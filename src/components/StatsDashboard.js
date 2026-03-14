'use client';
import { calculateStats } from '@/lib/stats';

export default function StatsDashboard({ entries }) {
    const stats = calculateStats(entries);

    return (
        <div className="grid-3 gap-4 mb-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
            <div className="card stat-card">
                <div className="text-xs text-muted uppercase font-bold mb-1">Total Acumulado</div>
                <div className="text-2xl font-black color-primary">{stats.total}</div>
            </div>
            <div className="card stat-card">
                <div className="text-xs text-muted uppercase font-bold mb-1">Esta Semana</div>
                <div className="text-2xl font-black color-accent">{stats.weekTotal}</div>
            </div>
            <div className="card stat-card">
                <div className="text-xs text-muted uppercase font-bold mb-1">Días Registrados</div>
                <div className="text-2xl font-black">{stats.count}</div>
            </div>
        </div>
    );
}
