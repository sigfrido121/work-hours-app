'use client';
import { useState, useEffect, useCallback } from 'react';
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
  const [viewType, setViewType] = useState('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [deletingId, setDeletingId] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 31, total: 0, totalPages: 0 });

  const fetchEntries = useCallback(async (page = 1) => {
    const res = await fetch(`/api/entries?page=${page}&limit=${pagination.limit}`);
    const data = await res.json();
    if (data.success) {
      setEntries(data.data);
      setPagination(data.pagination);
    }
    setLoading(false);
  }, [pagination.limit]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleDelete = async (id) => {
    if (!confirm('¿Seguro que quieres eliminar este registro?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/entries/${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (entries.length === 1 && pagination.page > 1) {
          fetchEntries(pagination.page - 1);
        } else {
          fetchEntries(pagination.page);
        }
      }
    } finally {
      setDeletingId(null);
    }
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
          fetchEntries(pagination.page);
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
            deletingId={deletingId}
          />
        ) : (
          <>
            <EntryList entries={filteredEntries} onDelete={handleDelete} onEdit={handleEdit} deletingId={deletingId} />
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  className="btn btn-sm btn-outline"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchEntries(pagination.page - 1)}
                >
                  Anterior
                </button>
                <span className="text-sm text-muted">
                  Página {pagination.page} de {pagination.totalPages}
                </span>
                <button
                  className="btn btn-sm btn-outline"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchEntries(pagination.page + 1)}
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )
      )}
    </main>
  );
}
