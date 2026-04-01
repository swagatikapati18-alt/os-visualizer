import React, { useState, useRef } from 'react';
import { Play, Download } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Title, Tooltip, Legend,
} from 'chart.js';
import { fcfsDisk, sstf, scan, cscan } from '../../utils/diskAlgorithms';
import StatsCard from '../common/StatsCard';
import SaveSimulation from '../common/SaveSimulation';
import { exportToPDF } from '../../utils/pdfExport';
import { HardDrive, ArrowRight } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ALGORITHMS = [
  { id: 'fcfs', label: 'FCFS', name: 'First Come First Serve' },
  { id: 'sstf', label: 'SSTF', name: 'Shortest Seek Time First' },
  { id: 'scan', label: 'SCAN', name: 'SCAN (Elevator)' },
  { id: 'cscan', label: 'C-SCAN', name: 'Circular SCAN' },
];

const DEFAULT_REQUESTS = '98 183 37 122 14 124 65 67';
const DEFAULT_HEAD = 53;

function runDiskAlgo(algo, requests, head, diskSize) {
  switch (algo) {
    case 'fcfs': return fcfsDisk(requests, head);
    case 'sstf': return sstf(requests, head);
    case 'scan': return scan(requests, head, diskSize);
    case 'cscan': return cscan(requests, head, diskSize);
    default: return fcfsDisk(requests, head);
  }
}

export default function DiskPage() {
  const [algorithm, setAlgorithm] = useState('fcfs');
  const [requestString, setRequestString] = useState(DEFAULT_REQUESTS);
  const [initialHead, setInitialHead] = useState(DEFAULT_HEAD);
  const [diskSize, setDiskSize] = useState(200);
  const [result, setResult] = useState(null);
  const chartRef = useRef(null);

  const handleRun = () => {
    const requests = requestString.trim().split(/\s+/).map(Number).filter((n) => !isNaN(n));
    if (!requests.length) return;
    const res = runDiskAlgo(algorithm, requests, initialHead, diskSize);
    setResult({ ...res, requests });
  };

  const chartData = result
    ? {
        labels: result.order.map((_, i) => i === 0 ? 'Start' : `Step ${i}`),
        datasets: [
          {
            label: 'Head Position',
            data: result.order,
            borderColor: '#6366f1',
            backgroundColor: '#6366f122',
            pointBackgroundColor: result.order.map((v, i) => {
              if (i === 0) return '#facc15';
              return result.requests?.includes(v) ? '#4ade80' : '#fb923c';
            }),
            pointBorderColor: result.order.map((v, i) => {
              if (i === 0) return '#facc15';
              return result.requests?.includes(v) ? '#4ade80' : '#fb923c';
            }),
            pointRadius: 7,
            pointHoverRadius: 10,
            borderWidth: 2.5,
            tension: 0.1,
            fill: false,
          },
        ],
      }
    : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `Cylinder: ${ctx.parsed.y}`,
        },
        backgroundColor: '#1e1e30',
        borderColor: '#2a2a3d',
        borderWidth: 1,
        titleColor: '#e2e8f0',
        bodyColor: '#94a3b8',
      },
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono', size: 10 } },
        grid: { color: '#2a2a3d' },
      },
      y: {
        min: 0, max: diskSize,
        ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono', size: 10 } },
        grid: { color: '#2a2a3d' },
        title: { display: true, text: 'Cylinder Number', color: '#94a3b8', font: { size: 11 } },
      },
    },
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22, color: 'var(--text-primary)' }}>
            Disk Scheduling
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            Visualize disk head movement and total seek time
          </p>
        </div>
        <div className="flex gap-2">
          {result && (
            <>
              <SaveSimulation
                type="disk" algorithm={algorithm}
                inputData={{ requestString, initialHead, diskSize }}
                results={result}
              />
              <button
                className="btn-secondary flex items-center gap-2" style={{ fontSize: 13 }}
                onClick={() => exportToPDF({
                  title: 'Disk Scheduling',
                  algorithm: ALGORITHMS.find((a) => a.id === algorithm)?.name,
                  tableHeaders: ['Step', 'Cylinder', 'Seek Distance'],
                  tableData: result.order.map((v, i) => [
                    i === 0 ? 'Initial' : `Step ${i}`,
                    v,
                    i === 0 ? 0 : Math.abs(v - result.order[i - 1]),
                  ]),
                  averages: { 'Total Seek Time': `${result.totalSeek} cylinders` },
                  chartRef,
                })}
              >
                <Download size={14} /> PDF
              </button>
            </>
          )}
        </div>
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
                Disk Request Queue
              </label>
              <textarea
                className="input-field"
                value={requestString}
                onChange={(e) => setRequestString(e.target.value)}
                placeholder="e.g. 98 183 37 122 14 124 65 67"
                rows={3}
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, resize: 'vertical' }}
              />
            </div>

            <div className="mb-4">
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Initial Head: <span style={{ color: '#facc15', fontFamily: 'monospace' }}>{initialHead}</span>
              </label>
              <input type="range" min="0" max={diskSize - 1} value={initialHead}
                onChange={(e) => setInitialHead(parseInt(e.target.value))}
                style={{ width: '100%' }} />
              <div className="flex justify-between" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                <span>0</span><span>{diskSize - 1}</span>
              </div>
            </div>

            <div className="mb-4">
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Disk Size: <span style={{ color: '#22d3ee', fontFamily: 'monospace' }}>{diskSize}</span>
              </label>
              <input type="range" min="100" max="500" step="50" value={diskSize}
                onChange={(e) => setDiskSize(parseInt(e.target.value))}
                style={{ width: '100%' }} />
            </div>

            <button onClick={handleRun} className="btn-primary w-full flex items-center justify-center gap-2">
              <Play size={14} /> Run Simulation
            </button>
          </div>

          {/* Stats */}
          {result && (
            <div className="flex flex-col gap-3">
              <StatsCard label="Total Seek Time" value={result.totalSeek} unit="cylinders" color="#6366f1" icon={HardDrive} />
              <StatsCard label="Requests Served" value={result.requests?.length || 0} color="#22d3ee" />
              <StatsCard
                label="Avg Seek / Request"
                value={result.requests?.length
                  ? (result.totalSeek / result.requests.length).toFixed(1)
                  : 0}
                unit="cylinders"
                color="#4ade80"
              />
            </div>
          )}
        </div>

        {/* Results */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {result ? (
            <>
              {/* Chart */}
              <div className="card">
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, color: 'var(--text-primary)', fontSize: 14, marginBottom: 12 }}>
                  Head Movement Graph
                </h3>
                <Line ref={chartRef} data={chartData} options={chartOptions} />
                <div className="flex gap-4 mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                  {[
                    { color: '#facc15', label: 'Initial Position' },
                    { color: '#4ade80', label: 'Request Served' },
                    { color: '#fb923c', label: 'Intermediate' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }} />
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seek sequence */}
              <div className="card">
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, color: 'var(--text-primary)', fontSize: 14, marginBottom: 12 }}>
                  Seek Sequence
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  {result.order.map((pos, i) => (
                    <React.Fragment key={i}>
                      <div
                        className="badge"
                        style={{
                          background: i === 0 ? '#facc1522' : '#6366f122',
                          color: i === 0 ? '#facc15' : '#6366f1',
                          border: `1px solid ${i === 0 ? '#facc1544' : '#6366f144'}`,
                          fontSize: 12,
                        }}
                      >
                        {pos}
                        {i === 0 && <span style={{ marginLeft: 4, fontSize: 9, opacity: 0.7 }}>HEAD</span>}
                      </div>
                      {i < result.order.length - 1 && (
                        <div className="flex items-center gap-1">
                          <ArrowRight size={12} style={{ color: 'var(--text-muted)' }} />
                          <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                            {Math.abs(result.order[i + 1] - pos)}
                          </span>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <div
                  className="flex items-center justify-end mt-3 pt-3"
                  style={{ borderTop: '1px solid var(--border)' }}
                >
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: '#6366f1', fontWeight: 600 }}>
                    Total: {result.totalSeek} cylinders
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="card flex flex-col items-center justify-center" style={{ minHeight: 300 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>💿</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Configure and run a disk scheduling simulation</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
