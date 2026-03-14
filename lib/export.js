export const downloadCSV = (entries) => {
    const headers = ['Fecha', 'Mañana Inicio', 'Mañana Fin', 'Tarde Inicio', 'Tarde Fin', 'Nota', 'Total Horas'];

    const calculateTotal = (morning, afternoon) => {
        const getMinutes = (time) => {
            const [h, m] = time.split(':').map(Number);
            return h * 60 + m;
        };
        const total = (getMinutes(morning.end) - getMinutes(morning.start)) + (getMinutes(afternoon.end) - getMinutes(afternoon.start));
        return (total / 60).toFixed(2);
    };

    const rows = entries.map(entry => [
        new Date(entry.date).toLocaleDateString('es-ES'),
        entry.morning.start,
        entry.morning.end,
        entry.afternoon.start,
        entry.afternoon.end,
        entry.note || '',
        calculateTotal(entry.morning, entry.afternoon)
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `jornadas_${new Date().getMonth() + 1}_${new Date().getFullYear()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
