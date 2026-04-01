import React, { useState } from 'react';
import { Save, X, Check } from 'lucide-react';
import { saveSimulation } from '../../utils/api';

export default function SaveSimulation({ type, algorithm, inputData, results, onSaved }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await saveSimulation({ type, algorithm, inputData, results, name });
      setSaved(true);
      setTimeout(() => {
        setOpen(false);
        setSaved(false);
        setName('');
        if (onSaved) onSaved();
      }, 1200);
    } catch (e) {
      alert('Failed to save simulation. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-secondary flex items-center gap-2"
        style={{ fontSize: 13 }}
      >
        <Save size={14} /> Save
      </button>

      {open && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="card" style={{ width: 360 }}>
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, color: 'var(--text-primary)' }}>
                Save Simulation
              </h3>
              <button onClick={() => setOpen(false)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>
            <div className="mb-3">
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Simulation Name
              </label>
              <input
                className="input-field"
                placeholder="e.g. Round Robin TQ=3 Test"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                autoFocus
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setOpen(false)} className="btn-secondary" style={{ fontSize: 13 }}>Cancel</button>
              <button
                onClick={handleSave}
                className="btn-primary flex items-center gap-2"
                style={{ fontSize: 13 }}
                disabled={loading || !name.trim()}
              >
                {saved ? <><Check size={14} /> Saved!</> : loading ? 'Saving...' : <><Save size={14} /> Save</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
