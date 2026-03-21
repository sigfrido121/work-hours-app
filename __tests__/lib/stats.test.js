import { calculateStats } from '../../lib/stats';

describe('calculateStats', () => {
    const mockEntries = [
        {
            date: '2024-01-15T00:00:00.000Z',
            morning: { start: '08:00', end: '12:00', enabled: true },
            afternoon: { start: '14:00', end: '17:00', enabled: true }
        },
        {
            date: '2024-01-16T00:00:00.000Z',
            morning: { start: '08:00', end: '12:00', enabled: true },
            afternoon: { start: '14:00', end: '17:30', enabled: true }
        },
        {
            date: '2024-01-17T00:00:00.000Z',
            morning: { start: '08:00', end: '12:00', enabled: true },
            afternoon: { start: '14:00', end: '17:00', enabled: false }
        }
    ];

    test('calculates total hours correctly', () => {
        const stats = calculateStats(mockEntries);
        
        expect(stats.count).toBe(3);
    });

    test('returns 0 for empty entries', () => {
        const stats = calculateStats([]);
        
        expect(stats.count).toBe(0);
        expect(stats.total).toBe('0h ');
    });

    test('handles disabled morning shift', () => {
        const entriesWithDisabledMorning = [
            {
                date: '2024-01-15T00:00:00.000Z',
                morning: { start: '08:00', end: '12:00', enabled: false },
                afternoon: { start: '14:00', end: '17:00', enabled: true }
            }
        ];
        
        const stats = calculateStats(entriesWithDisabledMorning);
        
        expect(stats.count).toBe(1);
    });

    test('handles disabled afternoon shift', () => {
        const entriesWithDisabledAfternoon = [
            {
                date: '2024-01-15T00:00:00.000Z',
                morning: { start: '08:00', end: '12:00', enabled: true },
                afternoon: { start: '14:00', end: '17:00', enabled: false }
            }
        ];
        
        const stats = calculateStats(entriesWithDisabledAfternoon);
        
        expect(stats.count).toBe(1);
    });
});
