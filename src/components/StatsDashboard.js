'use client';
import { calculateStats } from '@/lib/stats';

export default function StatsDashboard({ entries }) {
    const stats = calculateStats(entries);

    return (
        <div className="stats-grid">
            <div className="stat-card">
                <div className="stat-label">Acumulado</div>
                <div className="stat-value c-primary">{stats.total}</div>
            </div>
            <div className="stat-card">
                <div className="stat-label">Esta semana</div>
                <div className="stat-value c-amber">{stats.weekTotal}</div>
            </div>
            <div className="stat-card">
                <div className="stat-label">Días</div>
                <div className="stat-value c-text">{stats.count}</div>
            </div>
        </div>
    );
}
