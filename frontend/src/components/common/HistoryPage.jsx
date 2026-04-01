import React, { useState, useEffect } from 'react';
import { Trash2, Clock, RefreshCw } from 'lucide-react';
import { getSimulations, deleteSimulation } from '../../utils/api';

const TYPE_COLORS = {
  scheduling: '#6366f1',
  memory: '#22d3ee',
  deadlock: '#fb923c',
  disk: '#4ade80',
};

const TYPE_ICONS = {
  scheduling: '⚙️',
  memory: '🧠',
  deadlock: '🔒',
  disk: '💿',
};

export default function HistoryPage() {
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchSims = async () => {
    setLoading(true);
    try {
      const res = await getSimulations(filter !== 'all' ? filter : undefined);
      setSimulations(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSims(); }, [filter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this simulation?')) return;
    await deleteSimulation(id);
    fetchSims();
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22, color: 'var(--text-primary)' }}>
            Saved Simulations
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            View and manage your previous simulation runs
          </p>
        </div>
        <button onClick={fetchSims} className="btn-secondary flex items-center gap-2" style={{ fontSize: 13 }}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {['all', 'scheduling', 'memory', 'deadlock', 'disk'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={filter === f ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '6px 16px', fontSize: 12, textTransform: 'capitalize' }}
          >
            {f === 'all' ? 'All' : `${TYPE_ICONS[f]} ${f}`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card flex items-center justify-center" style={{ minHeight: 200 }}>
          <div style={{ color: 'var(--text-muted)' }}>Loading...</div>
        </div>
      ) : simulations.length === 0 ? (
        <div className="card flex flex-col items-center justify-center" style={{ minHeight: 200 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
          <div style={{ color: 'var(--text-muted)' }}>No saved simulations yet.</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            Make sure the backend is running and save a simulation first.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {simulations.map((sim) => {
            const color = TYPE_COLORS[sim.type] || '#6366f1';
            return (
              <div key={sim._id} className="card" style={{ border: `1px solid ${color}33` }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 20 }}>{TYPE_ICONS[sim.type]}</span>
                    <div>
                      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
                        {sim.name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                        {sim.algorithm?.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(sim._id)}
                    style={{ color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div
                  className="badge mb-3"
                  style={{ background: `${color}22`, color, border: `1px solid ${color}44`, textTransform: 'capitalize' }}
                >
                  {sim.type}
                </div>

                <div className="flex items-center gap-1" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  <Clock size={11} />
                  <span>{new Date(sim.createdAt).toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
