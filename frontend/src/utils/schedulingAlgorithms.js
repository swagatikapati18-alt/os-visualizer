/**
 * Process Scheduling Algorithms
 * Returns: { gantt, processes } where gantt is array of { pid, start, end }
 * and processes has computed waitingTime, turnaroundTime, completionTime
 */

// ─── FCFS ────────────────────────────────────────────────────────────────────
export function fcfs(processes) {
  const procs = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
  const gantt = [];
  let time = 0;

  const result = procs.map((p) => {
    if (time < p.arrivalTime) time = p.arrivalTime;
    const start = time;
    const end = time + p.burstTime;
    gantt.push({ pid: p.pid, start, end, color: p.color });
    time = end;
    const completionTime = end;
    const turnaroundTime = completionTime - p.arrivalTime;
    const waitingTime = turnaroundTime - p.burstTime;
    return { ...p, completionTime, turnaroundTime, waitingTime };
  });

  return { gantt, processes: result };
}

// ─── SJF Non-Preemptive ───────────────────────────────────────────────────────
export function sjfNonPreemptive(processes) {
  const procs = processes.map((p) => ({ ...p, remaining: p.burstTime, done: false }));
  const gantt = [];
  let time = 0;
  const completed = [];

  while (completed.length < procs.length) {
    const available = procs.filter((p) => !p.done && p.arrivalTime <= time);
    if (available.length === 0) {
      time++;
      continue;
    }
    available.sort((a, b) => a.burstTime - b.burstTime || a.arrivalTime - b.arrivalTime);
    const p = available[0];
    gantt.push({ pid: p.pid, start: time, end: time + p.burstTime, color: p.color });
    time += p.burstTime;
    p.done = true;
    p.completionTime = time;
    p.turnaroundTime = p.completionTime - p.arrivalTime;
    p.waitingTime = p.turnaroundTime - p.burstTime;
    completed.push(p);
  }

  return { gantt, processes: completed };
}

// ─── SJF Preemptive (SRTF) ───────────────────────────────────────────────────
export function sjfPreemptive(processes) {
  const procs = processes.map((p) => ({
    ...p,
    remaining: p.burstTime,
    done: false,
    startTime: -1,
  }));
  const gantt = [];
  let time = 0;
  let completed = 0;
  const n = procs.length;
  let prev = null;

  while (completed < n) {
    const available = procs.filter((p) => !p.done && p.arrivalTime <= time);
    if (available.length === 0) { time++; prev = null; continue; }
    available.sort((a, b) => a.remaining - b.remaining || a.arrivalTime - b.arrivalTime);
    const p = available[0];
    if (p.startTime === -1) p.startTime = time;

    if (!prev || prev.pid !== p.pid) {
      if (gantt.length && gantt[gantt.length - 1].pid === p.pid) {
        gantt[gantt.length - 1].end++;
      } else {
        gantt.push({ pid: p.pid, start: time, end: time + 1, color: p.color });
      }
    } else {
      gantt[gantt.length - 1].end++;
    }

    p.remaining--;
    time++;
    prev = p;

    if (p.remaining === 0) {
      p.done = true;
      p.completionTime = time;
      p.turnaroundTime = p.completionTime - p.arrivalTime;
      p.waitingTime = p.turnaroundTime - p.burstTime;
      completed++;
    }
  }

  // Merge consecutive same-pid gantt blocks
  const merged = [];
  gantt.forEach((block) => {
    if (merged.length && merged[merged.length - 1].pid === block.pid &&
        merged[merged.length - 1].end === block.start) {
      merged[merged.length - 1].end = block.end;
    } else {
      merged.push({ ...block });
    }
  });

  return { gantt: merged, processes: procs };
}

// ─── Round Robin ─────────────────────────────────────────────────────────────
export function roundRobin(processes, timeQuantum) {
  const procs = processes.map((p) => ({ ...p, remaining: p.burstTime }));
  const gantt = [];
  let time = 0;
  const queue = [];
  const arrived = new Set();

  // Sort by arrival
  procs.sort((a, b) => a.arrivalTime - b.arrivalTime);

  // Seed queue
  procs.filter((p) => p.arrivalTime === 0).forEach((p) => {
    queue.push(p);
    arrived.add(p.pid);
  });

  const tq = parseInt(timeQuantum) || 2;

  while (queue.length > 0) {
    const p = queue.shift();
    if (time < p.arrivalTime) time = p.arrivalTime;

    const exec = Math.min(p.remaining, tq);
    gantt.push({ pid: p.pid, start: time, end: time + exec, color: p.color });
    time += exec;
    p.remaining -= exec;

    // Add newly arrived processes
    procs.forEach((proc) => {
      if (!arrived.has(proc.pid) && proc.arrivalTime <= time && proc.remaining > 0) {
        queue.push(proc);
        arrived.add(proc.pid);
      }
    });

    if (p.remaining > 0) queue.push(p);
    else {
      p.completionTime = time;
      p.turnaroundTime = p.completionTime - p.arrivalTime;
      p.waitingTime = p.turnaroundTime - p.burstTime;
    }
  }

  return { gantt, processes: procs };
}

// ─── Priority Non-Preemptive ──────────────────────────────────────────────────
export function priorityNonPreemptive(processes) {
  const procs = processes.map((p) => ({ ...p, done: false }));
  const gantt = [];
  let time = 0;
  const completed = [];

  while (completed.length < procs.length) {
    const available = procs.filter((p) => !p.done && p.arrivalTime <= time);
    if (available.length === 0) { time++; continue; }
    // Lower number = higher priority
    available.sort((a, b) => a.priority - b.priority || a.arrivalTime - b.arrivalTime);
    const p = available[0];
    gantt.push({ pid: p.pid, start: time, end: time + p.burstTime, color: p.color });
    time += p.burstTime;
    p.done = true;
    p.completionTime = time;
    p.turnaroundTime = p.completionTime - p.arrivalTime;
    p.waitingTime = p.turnaroundTime - p.burstTime;
    completed.push(p);
  }

  return { gantt, processes: completed };
}

// ─── Averages helper ─────────────────────────────────────────────────────────
export function computeAverages(processes) {
  const n = processes.length;
  const avgWT = processes.reduce((s, p) => s + (p.waitingTime || 0), 0) / n;
  const avgTAT = processes.reduce((s, p) => s + (p.turnaroundTime || 0), 0) / n;
  return { avgWT: avgWT.toFixed(2), avgTAT: avgTAT.toFixed(2) };
}

// ─── Process colors ──────────────────────────────────────────────────────────
const COLORS = [
  '#6366f1', '#22d3ee', '#4ade80', '#fb923c',
  '#f472b6', '#facc15', '#a78bfa', '#34d399',
  '#f87171', '#60a5fa',
];

export function assignColors(processes) {
  return processes.map((p, i) => ({ ...p, color: COLORS[i % COLORS.length] }));
}
