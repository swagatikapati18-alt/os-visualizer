import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Trash2, Play, RotateCcw, Download, Zap } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, Title, Tooltip, Legend,
} from 'chart.js';
import {
  fcfs, sjfNonPreemptive, sjfPreemptive,
  roundRobin, priorityNonPreemptive,
  computeAverages, assignColors,
} from '../../utils/schedulingAlgorithms';
import GanttChart from '../common/GanttChart';
import AnimationControls from '../common/AnimationControls';
import StatsCard from '../common/StatsCard';
import SaveSimulation from '../common/SaveSimulation';
import { exportToPDF } from '../../utils/pdfExport';
import { Clock, Timer } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ALGORITHMS = [
  { id: 'fcfs', label: 'FCFS', name: 'First Come First Serve' },
  { id: 'sjf', label: 'SJF (Non-Preemptive)', name: 'Shortest Job First' },
  { id: 'srtf', label: 'SRTF (Preemptive)', name: 'Shortest Remaining Time First' },
  { id: 'rr', label: 'Round Robin', name: 'Round Robin' },
  { id: 'priority', label: 'Priority', name: 'Priority Scheduling' },
];

const defaultProcesses = [
  { pid: 'P1', arrivalTime: 0, burstTime: 6, priority: 2 },
  { pid: 'P2', arrivalTime: 2, burstTime: 4, priority: 1 },
  { pid: 'P3', arrivalTime: 4, burstTime: 2, priority: 3 },
  { pid: 'P4', arrivalTime: 6, burstTime: 5, priority: 2 },
];

function runAlgorithm(algo, procs, tq) {
  const colored = assignColors(procs);
  switch (algo) {
    case 'fcfs': return fcfs(colored);
    case 'sjf': return sjfNonPreemptive(colored);
    case 'srtf': return sjfPreemptive(colored);
    case 'rr': return roundRobin(colored, tq);
    case 'priority': return priorityNonPreemptive(colored);
    default: return fcfs(colored);
  }
}

export default function SchedulingPage() {
  const [algorithm, setAlgorithm] = useState('fcfs');
  const [processes, setProcesses] = useState(defaultProcesses);
  const [timeQuantum, setTimeQuantum] = useState(2);
  const [result, setResult] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [speed, setSpeed] = useState(1);
  const chartRef = useRef(null);
  const intervalRef = useRef(null);

  const totalSteps = result?.gantt?.length || 0;

  const handleRun = useCallback(() => {
    const valid = processes.filter((p) => p.pid && p.burstTime > 0);
    if (!valid.length) return;
    const res = runAlgorithm(algorithm, valid, timeQuantum);
    setResult(res);
    setCurrentStep(-1);
    setIsPlaying(false);
    setAnimating(false);
  }, [algorithm, processes, timeQuantum]);

  const handleAnimate = () => {
    if (!result) handleRun();
    setAnimating(true);
    setCurrentStep(0);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (isPlaying && currentStep < totalSteps - 1) {
      intervalRef.current = setTimeout(() => {
        setCurrentStep((s) => s + 1);
      }, 600 / speed);
    } else if (currentStep >= totalSteps - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(intervalRef.current);
  }, [isPlaying, currentStep, totalSteps, speed]);

  const handleReset = () => {
    setCurrentStep(-1);
    setIsPlaying(false);
    setAnimating(false);
  };

  const addProcess = () => {
    const newPid = `P${processes.length + 1}`;
    setProcesses([...processes, { pid: newPid, arrivalTime: 0, burstTime: 1, priority: 1 }]);
  };

  const removeProcess = (i) => setProcesses(processes.filter((_, idx) => idx !== i));

  const updateProcess = (i, field, val) => {
    const updated = [...processes];
    updated[i] = { ...updated[i], [field]: field === 'pid' ? val : parseInt(val) || 0 };
    setProcesses(updated);
  };

  const averages = result ? computeAverages(result.processes) : null;

  const chartData = result
    ? {
        labels: result.processes.map((p) => p.pid),
        datasets: [
          {
            label: 'Waiting Time',
            data: result.processes.map((p) => p.waitingTime),
            backgroundColor: '#6366f144',
            borderColor: '#6366f1',
            borderWidth: 2,
            borderRadius: 6,
          },
          {
            label: 'Turnaround Time',
            data: result.processes.map((p) => p.turnaroundTime),
            backgroundColor: '#22d3ee44',
            borderColor: '#22d3ee',
            borderWidth: 2,
            borderRadius: 6,
          },
        ],
      }
    : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: '#94a3b8', font: { family: 'JetBrains Mono', size: 11 } },
      },
    },
    scales: {
      x: { ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono', size: 11 } }, grid: { color: '#2a2a3d' } },
      y: { ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono', size: 11 } }, grid: { color: '#2a2a3d' } },
    },
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22, color: 'var(--text-primary)' }}>
            Process Scheduling
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            Visualize CPU scheduling algorithms with step-by-step animation
          </p>
        </div>
        <div className="flex gap-2">
          {result && (
            <>
              <SaveSimulation
                type="scheduling" algorithm={algorithm}
                inputData={{ processes, timeQuantum }}
                results={result}
              />
              <button
                className="btn-secondary flex items-center gap-2"
                style={{ fontSize: 13 }}
                onClick={() => exportToPDF({
                  title: 'Process Scheduling',
                  algorithm: ALGORITHMS.find((a) => a.id === algorithm)?.name,
                  tableHeaders: ['Process', 'Arrival', 'Burst', 'Completion', 'Waiting', 'Turnaround'],
                  tableData: result.processes.map((p) => [
                    p.pid, p.arrivalTime, p.burstTime,
                    p.completionTime, p.waitingTime, p.turnaroundTime,
                  ]),
                  averages: { 'Avg Waiting Time': `${averages?.avgWT} units`, 'Avg Turnaround Time': `${averages?.avgTAT} units` },
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
        {/* Left: Config */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          {/* Algorithm selector */}
          <div className="card">
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 8, fontWeight: 500 }}>
              Algorithm
            </label>
            <select
              className="input-field"
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
            >
              {ALGORITHMS.map((a) => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </select>

            {algorithm === 'rr' && (
              <div className="mt-3">
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Time Quantum: <span style={{ color: '#6366f1', fontFamily: 'monospace' }}>{timeQuantum}</span>
                </label>
                <input
                  type="range" min="1" max="10" value={timeQuantum}
                  onChange={(e) => setTimeQuantum(parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            )}
          </div>

          {/* Process table */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFamily: "'Space Grotesk', sans-serif" }}>
                Processes ({processes.length})
              </span>
              <button onClick={addProcess} className="btn-primary flex items-center gap-1" style={{ padding: '4px 12px', fontSize: 12 }}>
                <Plus size={12} /> Add
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ fontSize: 12 }}>
                <thead>
                  <tr>
                    <th>PID</th>
                    <th>AT</th>
                    <th>BT</th>
                    {(algorithm === 'priority') && <th>Pri</th>}
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {processes.map((p, i) => (
                    <tr key={i}>
                      <td>
                        <input
                          className="input-field" value={p.pid}
                          onChange={(e) => updateProcess(i, 'pid', e.target.value)}
                          style={{ width: 50, padding: '4px 6px', fontSize: 12 }}
                        />
                      </td>
                      <td>
                        <input
                          type="number" className="input-field" value={p.arrivalTime} min="0"
                          onChange={(e) => updateProcess(i, 'arrivalTime', e.target.value)}
                          style={{ width: 50, padding: '4px 6px', fontSize: 12 }}
                        />
                      </td>
                      <td>
                        <input
                          type="number" className="input-field" value={p.burstTime} min="1"
                          onChange={(e) => updateProcess(i, 'burstTime', e.target.value)}
                          style={{ width: 50, padding: '4px 6px', fontSize: 12 }}
                        />
                      </td>
                      {algorithm === 'priority' && (
                        <td>
                          <input
                            type="number" className="input-field" value={p.priority} min="1"
                            onChange={(e) => updateProcess(i, 'priority', e.target.value)}
                            style={{ width: 50, padding: '4px 6px', fontSize: 12 }}
                          />
                        </td>
                      )}
                      <td>
                        <button
                          onClick={() => removeProcess(i)}
                          style={{ color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 8 }}>
              AT = Arrival Time, BT = Burst Time, Pri = Priority
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button onClick={handleRun} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <Play size={14} /> Run
            </button>
            <button onClick={handleAnimate} className="btn-secondary flex-1 flex items-center justify-center gap-2">
              <Zap size={14} /> Animate
            </button>
          </div>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {result ? (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <StatsCard label="Avg Waiting Time" value={averages?.avgWT} unit="units" color="#6366f1" icon={Clock} />
                <StatsCard label="Avg Turnaround Time" value={averages?.avgTAT} unit="units" color="#22d3ee" icon={Timer} />
              </div>

              {/* Animation controls */}
              {animating && (
                <AnimationControls
                  isPlaying={isPlaying}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onReset={handleReset}
                  onStepBack={() => setCurrentStep((s) => Math.max(0, s - 1))}
                  onStepForward={() => setCurrentStep((s) => Math.min(totalSteps - 1, s + 1))}
                  currentStep={Math.max(0, currentStep)}
                  totalSteps={totalSteps}
                  speed={speed}
                  onSpeedChange={setSpeed}
                />
              )}

              {/* Gantt */}
              <GanttChart
                gantt={result.gantt}
                animating={animating}
                currentStep={animating ? currentStep : undefined}
              />

              {/* Process results table */}
              <div className="card">
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, color: 'var(--text-primary)', fontSize: 14, marginBottom: 12 }}>
                  Process Details
                </h3>
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Process</th>
                        <th>Arrival</th>
                        <th>Burst</th>
                        <th>Completion</th>
                        <th>Waiting</th>
                        <th>Turnaround</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.processes.map((p, i) => (
                        <tr key={i}>
                          <td>
                            <div className="flex items-center gap-2">
                              <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
                              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{p.pid}</span>
                            </div>
                          </td>
                          <td style={{ fontFamily: "'JetBrains Mono', monospace" }}>{p.arrivalTime}</td>
                          <td style={{ fontFamily: "'JetBrains Mono', monospace" }}>{p.burstTime}</td>
                          <td style={{ fontFamily: "'JetBrains Mono', monospace", color: '#4ade80' }}>{p.completionTime}</td>
                          <td style={{ fontFamily: "'JetBrains Mono', monospace", color: '#fb923c' }}>{p.waitingTime}</td>
                          <td style={{ fontFamily: "'JetBrains Mono', monospace", color: '#22d3ee' }}>{p.turnaroundTime}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bar chart */}
              <div className="card">
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, color: 'var(--text-primary)', fontSize: 14, marginBottom: 12 }}>
                  Waiting vs Turnaround Time
                </h3>
                <Bar ref={chartRef} data={chartData} options={chartOptions} />
              </div>
            </>
          ) : (
            <div className="card flex flex-col items-center justify-center" style={{ minHeight: 300 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⚙️</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Configure processes and click Run</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
