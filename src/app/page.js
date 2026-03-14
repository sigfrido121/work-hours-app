'use client';
import { useState, useEffect } from 'react';
import ShiftForm from '@/components/ShiftForm';
import EntryList from '@/components/EntryList';
import StatsDashboard from '@/components/StatsDashboard';
import { downloadCSV } from '@/lib/export';
import CalendarView from '@/components/CalendarView';

export default function Home() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingEntry, setEditingEntry] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewType, setViewType] = useState('calendar'); // Default to calendar
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchEntries = async () => {
    const res = await fetch('/api/entries');
    const data = await res.json();
    if (data.success) {
      setEntries(data.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('¿Seguro que quieres eliminar este registro?')) return;
    const res = await fetch(`/api/entries/${id}`, { method: 'DELETE' });
    if (res.ok) fetchEntries();
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredEntries = entries.filter(entry => {
    const searchLower = searchTerm.toLowerCase();
    const entryDate = new Date(entry.date);
    const dateStr = entryDate.toLocaleDateString('es-ES').toLowerCase();
    const noteStr = (entry.note || '').toLowerCase();
    
    const matchesSearch = dateStr.includes(searchLower) || noteStr.includes(searchLower);
    
    // Filter by visualized month
    const matchesMonth = entryDate.getFullYear() === currentDate.getFullYear() && 
                        entryDate.getMonth() === currentDate.getMonth();
                        
    return matchesSearch && matchesMonth;
  });

  return (
    <main className="container">
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: '900',
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.05em',
            lineHeight: '1'
          }}>
            Horas Alex
          </h1>
          <p className="text-muted">Gestión profesional de jornadas laborales</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => downloadCSV(filteredEntries)}
            className="btn btn-outline"
            disabled={filteredEntries.length === 0}
          >
            Exportar CSV
          </button>
        </div>
      </header>

      <StatsDashboard entries={filteredEntries} />

      <ShiftForm
        onEntrySaved={() => {
          fetchEntries();
          setEditingEntry(null);
        }}
        editingEntry={editingEntry}
        onCancel={() => setEditingEntry(null)}
      />

      <div className="flex justify-between items-center mb-6">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Buscar por fecha o nota..."
            className="input search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex bg-muted-soft p-1 rounded-lg gap-1 border border-highlight">
          <button
            onClick={() => setViewType('calendar')}
            className={`btn btn-sm ${viewType === 'calendar' ? 'btn-primary' : 'btn-ghost'}`}
          >
            Calendario
          </button>
          <button
            onClick={() => setViewType('list')}
            className={`btn btn-sm ${viewType === 'list' ? 'btn-primary' : 'btn-ghost'}`}
          >
            Lista
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="text-muted">Cargando registros...</div>
        </div>
      ) : (
        viewType === 'calendar' ? (
          <CalendarView
            entries={filteredEntries}
            onEdit={handleEdit}
            onDelete={handleDelete}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
          />
        ) : (
          <EntryList entries={filteredEntries} onDelete={handleDelete} onEdit={handleEdit} />
        )
      )}
    </main>
  );
}
