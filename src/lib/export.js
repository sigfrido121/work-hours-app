import { entryMinutes } from '@/lib/stats';

export const downloadCSV = (entries) => {
    const headers = ['Fecha', 'Mañana Inicio', 'Mañana Fin', 'Tarde Inicio', 'Tarde Fin', 'Nota', 'Total Horas'];
    const rows = entries.map(e => [
        new Date(e.date).toLocaleDateString('es-ES'),
        e.morning.enabled !== false ? e.morning.start : '-',
        e.morning.enabled !== false ? e.morning.end : '-',
        e.afternoon.enabled !== false ? e.afternoon.start : '-',
        e.afternoon.enabled !== false ? e.afternoon.end : '-',
        e.note || '',
        (entryMinutes(e) / 60).toFixed(2),
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `jornadas_${new Date().getMonth() + 1}_${new Date().getFullYear()}.csv`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
