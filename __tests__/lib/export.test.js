describe('downloadCSV', () => {
    beforeEach(() => {
        jest.resetModules();
        delete global.URL;
        global.URL = {
            createObjectURL: jest.fn(() => 'blob:http://localhost/blob'),
            revokeObjectURL: jest.fn()
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('generates valid CSV content with mocked DOM', () => {
        const mockLink = {
            setAttribute: jest.fn(),
            style: {},
            click: jest.fn()
        };
        
        jest.spyOn(document, 'createElement').mockImplementation(() => mockLink);
        jest.spyOn(document.body, 'appendChild').mockImplementation(() => {});
        jest.spyOn(document.body, 'removeChild').mockImplementation(() => {});
        
        const { downloadCSV } = require('../../lib/export');
        
        const mockEntries = [
            {
                date: '2024-01-15T00:00:00.000Z',
                morning: { start: '08:00', end: '12:00', enabled: true },
                afternoon: { start: '14:00', end: '17:00', enabled: true },
                note: 'Test note'
            }
        ];

        expect(() => downloadCSV(mockEntries)).not.toThrow();
        expect(mockLink.setAttribute).toHaveBeenCalled();
    });

    test('handles empty entries without throwing', () => {
        const mockLink = {
            setAttribute: jest.fn(),
            style: {},
            click: jest.fn()
        };
        
        jest.spyOn(document, 'createElement').mockImplementation(() => mockLink);
        jest.spyOn(document.body, 'appendChild').mockImplementation(() => {});
        jest.spyOn(document.body, 'removeChild').mockImplementation(() => {});
        
        const { downloadCSV } = require('../../lib/export');

        expect(() => downloadCSV([])).not.toThrow();
    });
});
