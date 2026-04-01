import React, { useState } from 'react';
import { Play, Download, RefreshCw } from 'lucide-react';
import { fifo, lru, optimal } from '../../utils/memoryAlgorithms';
import StatsCard from '../common/StatsCard';
import SaveSimulation from '../common/SaveSimulation';
import { AlertCircle, CheckCircle } from 'lucide-react';

const ALGORITHMS = [
  { id: 'fifo', label: 'FIFO', name: 'First In First Out' },
  { id: 'lru', label: 'LRU', name: 'Least Recently Used' },
  { id: 'optimal', label: 'Optimal', name: 'Optimal Page Replacement' },
];

const DEFAULT_PAGES = '7 0 1 2 0 3 0 4 2 3 0 3 2 1 2 0 1 7 0 1';

function runPageReplacement(algo, pages, frames) {
  switch (algo) {
    case 'fifo': return fifo(pages, frames);
    case 'lru': return lru(pages, frames);
    case 'optimal': return optimal(pages, frames);
    default: return fifo(pages, frames);
  }
}

export default function MemoryPage() {
  const [algorithm, setAlgorithm] = useState('fifo');
  const [pageString, setPageString] = useState(DEFAULT_PAGES);
  const [frameCount, setFrameCount] = useState(3);
  const [result, setResult] = useState(null);
  const [animStep, setAnimStep] = useState(-1);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleRun = () => {
    const pages = pageString.trim().split(/\s+/).map(Number).filter((n) => !isNaN(n));
    if (!pages.length) return;
    const res = runPageReplacement(algorithm, pages, frameCount);
    setResult(res);
    setAnimStep(res.history.length - 1);
    setIsAnimating(false);
  };

  const handleAnimate = () => {
    const pages = pageString.trim().split(/\s+/).map(Number).filter((n) => !isNaN(n));
    if (!pages.length) return;
    const res = runPageReplacement(algorithm, pages, frameCount);
    setResult(res);
    setAnimStep(0);
    setIsAnimating(true);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      setAnimStep(step);
      if (step >= res.history.length - 1) {
        clearInterval(interval);
        setIsAnimating(false);
      }
    }, 400);
  };

  const visibleHistory = result ? result.history.slice(0, animStep + 1) : [];
  const faultRate = result ? ((result.faults / result.history.length) * 100).toFixed(1) : 0;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22, color: 'var(--text-primary)' }}>
            Memory Management
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            Page replacement algorithms with frame-by-frame visualization
          </p>
        </div>
        {result && (
          <SaveSimulation
            type="memory" algorithm={algorithm}
            inputData={{ pages: pageString, frameCount }}
            results={result}
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Config */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="card">
            <div className="mb-4">
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>Algorithm</label>
              <select className="input-field" value={algorithm} onChange={(e) => setAlgorithm(e.target.value)}>
                {ALGORITHMS.map((a) => <option key={a.id} value={a.id}>{a.label} — {a.name}</option>)}
              </select>
            </div>

            <div className="mb-4">
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Number of Frames: <span style={{ color: '#22d3ee', fontFamily: 'monospace' }}>{frameCount}</span>
              </label>
              <input type="range" min="1" max="7" value={frameCount}
                onChange={(e) => setFrameCount(parseInt(e.target.value))}
                style={{ width: '100%' }} />
            </div>

            <div className="mb-4">
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Page Reference String
              </label>
              <textarea
                className="input-field"
                value={pageString}
                onChange={(e) => setPageString(e.target.value)}
                placeholder="e.g. 1 2 3 4 1 2 5 1 2 3 4 5"
                rows={3}
                style={{ resize: 'vertical', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}
              />
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                Space-separated page numbers
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={handleRun} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <Play size={14} /> Run
              </button>
              <button onClick={handleAnimate} className="btn-secondary flex items-center gap-2" style={{ padding: '8px 12px' }}>
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          {/* Stats */}
          {result && (
            <div className="flex flex-col gap-3">
              <StatsCard label="Page Faults" value={result.faults} color="#f472b6" icon={AlertCircle} />
              <StatsCard label="Page Hits" value={result.hits} color="#4ade80" icon={CheckCircle} />
              <StatsCard label="Fault Rate" value={`${faultRate}%`} color="#fb923c" />
            </div>
          )}
        </div>

        {/* Results */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {result ? (
            <>
              {/* Frame visualization */}
              <div className="card">
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, color: 'var(--text-primary)', fontSize: 14, marginBottom: 16 }}>
                  Frame Allocation
                </h3>
                <div style={{ overflowX: 'auto' }}>
                  <div style={{ minWidth: Math.max(600, visibleHistory.length * 52), display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {/* Page reference row */}
                    <div className="flex gap-1 mb-2">
                      {visibleHistory.map((h, i) => (
                        <div
                          key={i}
                          style={{
                            width: 44, height: 28,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: h.fault ? '#f472b622' : '#4ade8022',
                            border: `1px solid ${h.fault ? '#f472b6' : '#4ade80'}`,
                            borderRadius: 6,
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 12, fontWeight: 700,
                            color: h.fault ? '#f472b6' : '#4ade80',
                            flexShrink: 0,
                          }}
                        >
                          {h.page}
                        </div>
                      ))}
                    </div>

                    {/* Frame rows */}
                    {Array.from({ length: frameCount }).map((_, frameIdx) => (
                      <div key={frameIdx} className="flex gap-1 items-center">
                        <div style={{ width: 20, fontSize: 10, color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>
                          F{frameIdx + 1}
                        </div>
                        {visibleHistory.map((h, i) => {
                          const val = h.frames[frameIdx];
                          return (
                            <div
                              key={i}
                              style={{
                                width: 44, height: 36,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: val !== undefined
                                  ? (h.fault && h.frames[frameIdx] === h.page ? '#6366f133' : 'var(--bg-hover)')
                                  : 'transparent',
                                border: `1px solid ${val !== undefined
                                  ? (h.fault && h.frames[frameIdx] === h.page ? '#6366f1' : 'var(--border)')
                                  : 'transparent'}`,
                                borderRadius: 6,
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: 13, fontWeight: 600,
                                color: h.fault && h.frames[frameIdx] === h.page ? '#6366f1' : 'var(--text-primary)',
                                flexShrink: 0,
                                transition: 'all 0.2s',
                              }}
                            >
                              {val !== undefined ? val : '—'}
                            </div>
                          );
                        })}
                      </div>
                    ))}

                    {/* Fault indicator */}
                    <div className="flex gap-1 mt-1">
                      <div style={{ width: 20 }} />
                      {visibleHistory.map((h, i) => (
                        <div
                          key={i}
                          style={{
                            width: 44, height: 16,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 10, flexShrink: 0,
                            color: h.fault ? '#f472b6' : '#4ade80',
                          }}
                        >
                          {h.fault ? 'F' : '✓'}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex gap-4 mt-4 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-2">
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: '#f472b6' }} />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Page Fault</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: '#4ade80' }} />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Page Hit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: '#6366f1' }} />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Newly Loaded</span>
                  </div>
                </div>
              </div>

              {/* Fault summary bar */}
              <div className="card">
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, color: 'var(--text-primary)', fontSize: 14, marginBottom: 12 }}>
                  Fault/Hit Distribution
                </h3>
                <div className="flex" style={{ height: 32, borderRadius: 8, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${faultRate}%`,
                      background: 'linear-gradient(90deg, #f472b6, #ec4899)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, color: 'white', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace",
                      transition: 'width 0.5s ease',
                    }}
                  >
                    {faultRate > 15 && `${result.faults} faults`}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      background: 'linear-gradient(90deg, #4ade80, #22c55e)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, color: 'white', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {(100 - parseFloat(faultRate)) > 15 && `${result.hits} hits`}
                  </div>
                </div>
                <div className="flex justify-between mt-1" style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                  <span>Fault rate: {faultRate}%</span>
                  <span>Hit rate: {(100 - parseFloat(faultRate)).toFixed(1)}%</span>
                </div>
              </div>
            </>
          ) : (
            <div className="card flex flex-col items-center justify-center" style={{ minHeight: 300 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🧠</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Configure and run a page replacement simulation</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
