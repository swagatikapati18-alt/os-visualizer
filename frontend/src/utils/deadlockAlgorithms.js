/**
 * Banker's Algorithm for Deadlock Avoidance
 */
export function bankersAlgorithm({ processes, allocation, maxMatrix, available }) {
  const n = processes.length;
  const m = available.length;

  // Compute need matrix
  const need = allocation.map((alloc, i) =>
    alloc.map((a, j) => maxMatrix[i][j] - a)
  );

  const work = [...available];
  const finish = Array(n).fill(false);
  const safeSequence = [];

  let found = true;
  while (found) {
    found = false;
    for (let i = 0; i < n; i++) {
      if (!finish[i]) {
        // Check if need[i] <= work
        const canAllocate = need[i].every((n, j) => n <= work[j]);
        if (canAllocate) {
          // Allocate and release
          for (let j = 0; j < m; j++) work[j] += allocation[i][j];
          finish[i] = true;
          safeSequence.push(processes[i]);
          found = true;
        }
      }
    }
  }

  const isSafe = finish.every(Boolean);
  return {
    isSafe,
    safeSequence: isSafe ? safeSequence : [],
    need,
    deadlockedProcesses: isSafe
      ? []
      : processes.filter((_, i) => !finish[i]),
  };
}

/**
 * Build resource allocation graph edges
 * Returns { assignmentEdges, requestEdges, cycle }
 */
export function buildRAG({ processes, allocation, maxMatrix, available }) {
  const n = processes.length;
  const m = available.length;
  const resources = Array.from({ length: m }, (_, i) => `R${i + 1}`);
  const assignmentEdges = []; // resource → process
  const requestEdges = []; // process → resource

  const need = allocation.map((alloc, i) =>
    alloc.map((a, j) => maxMatrix[i][j] - a)
  );

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      if (allocation[i][j] > 0) {
        assignmentEdges.push({
          from: resources[j],
          to: processes[i],
          count: allocation[i][j],
        });
      }
      if (need[i][j] > 0) {
        requestEdges.push({
          from: processes[i],
          to: resources[j],
          count: need[i][j],
        });
      }
    }
  }

  return { processes, resources, assignmentEdges, requestEdges };
}
