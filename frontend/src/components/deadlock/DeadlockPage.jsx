import React, { useState, useEffect, useRef } from 'react';
import { Play, Plus, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { bankersAlgorithm, buildRAG } from '../../utils/deadlockAlgorithms';
import SaveSimulation from '../common/SaveSimulation';
import * as d3 from 'd3';

const DEFAULT_STATE = {
  processes: ['P0', 'P1', 'P2', 'P3', 'P4'],
  resources: ['R1', 'R2', 'R3'],
  available: [3, 3, 2],
  allocation: [
    [0, 1, 0],
    [2, 0, 0],
    [3, 0, 2],
    [2, 1, 1],
    [0, 0, 2],
  ],
  maxMatrix: [
    [7, 5, 3],
    [3, 2, 2],
    [9, 0, 2],
    [2, 2, 2],
    [4, 3, 3],
  ],
};

function RAGGraph({ ragData }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!ragData || !svgRef.current) return;
    const { processes, resources, assignmentEdges, requestEdges } = ragData;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const W = svgRef.current.clientWidth || 600;
    const H = 320;
    svg.attr('width', W).attr('height', H);

    // Defs: arrowheads
    const defs = svg.append('defs');
    ['assign', 'request'].forEach((type) => {
      defs.append('marker')
        .attr('id', `arrow-${type}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 18).attr('refY', 0)
        .attr('markerWidth', 6).attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', type === 'assign' ? '#4ade80' : '#fb923c');
    });

    // Node positions
    const pCount = processes.length;
    const rCount = resources.length;
    const pNodes = processes.map((p, i) => ({
      id: p, type: 'process',
      x: ((i + 1) / (pCount + 1)) * W,
      y: H * 0.25,
    }));
    const rNodes = resources.map((r, i) => ({
      id: r, type: 'resource',
      x: ((i + 1) / (rCount + 1)) * W,
      y: H * 0.75,
    }));
    const nodes = [...pNodes, ...rNodes];
    const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

    // Draw edges
    const drawEdge = (from, to, color, markerId) => {
      const s = nodeMap[from], t = nodeMap[to];
      if (!s || !t) return;
      svg.append('line')
        .attr('x1', s.x).attr('y1', s.y)
        .attr('x2', t.x).attr('y2', t.y)
        .attr('stroke', color).attr('stroke-width', 1.5)
        .attr('marker-end', `url(#${markerId})`)
        .attr('stroke-dasharray', markerId === 'arrow-request' ? '5,3' : 'none')
        .attr('opacity', 0.8);
    };

    assignmentEdges.forEach((e) => drawEdge(e.from, e.to, '#4ade80', 'arrow-assign'));
    requestEdges.forEach((e) => drawEdge(e.from, e.to, '#fb923c', 'arrow-request'));

    // Draw process nodes (circles)
    pNodes.forEach((n) => {
      const g = svg.append('g').attr('transform', `translate(${n.x},${n.y})`);
      g.append('circle').attr('r', 22).attr('fill', '#6366f122').attr('stroke', '#6366f1').attr('stroke-width', 2);
      g.append('text').attr('text-anchor', 'middle').attr('dy', '0.35em')
        .attr('fill', '#e2e8f0').attr('font-size', 12).attr('font-family', "'JetBrains Mono', monospace").attr('font-weight', 600)
        .text(n.id);
    });

    // Draw resource nodes (rectangles)
    rNodes.forEach((n) => {
      const g = svg.append('g').attr('transform', `translate(${n.x},${n.y})`);
      g.append('rect').attr('x', -24).attr('y', -18).attr('width', 48).attr('height', 36)
        .attr('rx', 6).attr('fill', '#22d3ee22').attr('stroke', '#22d3ee').attr('stroke-width', 2);
      g.append('text').attr('text-anchor', 'middle').attr('dy', '0.35em')
        .attr('fill', '#e2e8f0').attr('font-size', 12).attr('font-family', "'JetBrains Mono', monospace").attr('font-weight', 600)
        .text(n.id);
    });

    // Legend
    const leg = svg.append('g').attr('transform', `translate(12, ${H - 44})`);
    leg.append('line').attr('x1', 0).attr('y1', 10).attr('x2', 20).attr('y2', 10)
      .attr('stroke', '#4ade80').attr('stroke-width', 2).attr('marker-end', 'url(#arrow-assign)');
    leg.append('text').attr('x', 26).attr('y', 14).attr('fill', '#94a3b8').attr('font-size', 10).text('Assignment');
    leg.append('line').attr('x1', 0).attr('y1', 28).attr('x2', 20).attr('y2', 28)
      .attr('stroke', '#fb923c').attr('stroke-width', 2).attr('stroke-dasharray', '5,3').attr('marker-end', 'url(#arrow-request)');
    leg.append('text').attr('x', 26).attr('y', 32).attr('fill', '#94a3b8').attr('font-size', 10).text('Request');
  }, [ragData]);

  return <svg ref={svgRef} style={{ width: '100%', height: 320 }} />;
}

export default function DeadlockPage() {
  const [state, setState] = useState(DEFAULT_STATE);
  const [result, setResult] = useState(null);
  const [ragData, setRagData] = useState(null);

  const { processes, resources, available, allocation, maxMatrix } = state;

  const handleRun = () => {
    const res = bankersAlgorithm({ processes, allocation, maxMatrix, available });
    const rag = buildRAG({ processes, allocation, maxMatrix, available });
    setResult(res);
    setRagData(rag);
  };

  const updateMatrix = (matrix, i, j, val, key) => {
    const updated = matrix.map((row) => [...row]);
    updated[i][j] = parseInt(val) || 0;
    setState((s) => ({ ...s, [key]: updated }));
  };

  const updateAvailable = (j, val) => {
    const a = [...available];
    a[j] = parseInt(val) || 0;
    setState((s) => ({ ...s, available: a }));
  };

  const addProcess = () => {
    const pid = `P${processes.length}`;
    setState((s) => ({
      ...s,
      processes: [...s.processes, pid],
      allocation: [...s.allocation, Array(resources.length).fill(0)],
      maxMatrix: [...s.maxMatrix, Array(resources.length).fill(0)],
    }));
  };

  const removeProcess = (i) => {
    setState((s) => ({
      ...s,
      processes: s.processes.filter((_, idx) => idx !== i),
      allocation: s.allocation.filter((_, idx) => idx !== i),
      maxMatrix: s.maxMatrix.filter((_, idx) => idx !== i),
    }));
  };

  const addResource = () => {
    setState((s) => ({
      ...s,
      resources: [...s.resources, `R${s.resources.length + 1}`],
      available: [...s.available, 0],
      allocation: s.allocation.map((row) => [...row, 0]),
      maxMatrix: s.maxMatrix.map((row) => [...row, 0]),
    }));
  };

  const MatrixTable = ({ matrix, matrixKey, label }) => (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, fontFamily: "'Space Grotesk', sans-serif" }}>
        {label}
      </div>
      <table className="data-table" style={{ fontSize: 12 }}>
        <thead>
          <tr>
            <th>Process</th>
            {resources.map((r) => <th key={r}>{r}</th>)}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {processes.map((p, i) => (
            <tr key={i}>
              <td style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: '#6366f1' }}>{p}</td>
              {resources.map((_, j) => (
                <td key={j}>
                  <input
                    type="number" min="0"
                    className="input-field"
                    value={matrix[i]?.[j] ?? 0}
                    onChange={(e) => updateMatrix(matrix, i, j, e.target.value, matrixKey)}
                    style={{ width: 52, padding: '4px 6px', fontSize: 12 }}
                  />
                </td>
              ))}
              <td>
                <button onClick={() => removeProcess(i)} style={{ color: '#f87171', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <Trash2 size={12} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22, color: 'var(--text-primary)' }}>
            Deadlock Detection
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            Banker's Algorithm — safe sequence & resource allocation graph
          </p>
        </div>
        {result && (
          <SaveSimulation type="deadlock" algorithm="bankers" inputData={state} results={result} />
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Config (left) */}
        <div className="xl:col-span-3 flex flex-col gap-4">
          {/* Available resources */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFamily: "'Space Grotesk', sans-serif" }}>
                Available Resources
              </span>
              <button onClick={addResource} className="btn-secondary flex items-center gap-1" style={{ padding: '4px 10px', fontSize: 12 }}>
                <Plus size={12} /> Resource
              </button>
            </div>
            <div className="flex gap-3">
              {resources.map((r, j) => (
                <div key={j} className="flex flex-col items-center gap-1">
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>{r}</span>
                  <input
                    type="number" min="0"
                    className="input-field"
                    value={available[j] ?? 0}
                    onChange={(e) => updateAvailable(j, e.target.value)}
                    style={{ width: 60, padding: '6px', textAlign: 'center', fontSize: 14, fontFamily: "'JetBrains Mono', monospace" }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Allocation matrix */}
          <div className="card" style={{ overflowX: 'auto' }}>
            <MatrixTable matrix={allocation} matrixKey="allocation" label="Allocation Matrix" />
          </div>

          {/* Max matrix */}
          <div className="card" style={{ overflowX: 'auto' }}>
            <MatrixTable matrix={maxMatrix} matrixKey="maxMatrix" label="Maximum Need Matrix" />
          </div>

          {/* Need matrix (computed) */}
          {result && (
            <div className="card" style={{ overflowX: 'auto' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, fontFamily: "'Space Grotesk', sans-serif" }}>
                Need Matrix (Max - Allocation)
              </div>
              <table className="data-table" style={{ fontSize: 12 }}>
                <thead>
                  <tr>
                    <th>Process</th>
                    {resources.map((r) => <th key={r}>{r}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {processes.map((p, i) => (
                    <tr key={i}>
                      <td style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: '#6366f1' }}>{p}</td>
                      {result.need[i]?.map((v, j) => (
                        <td key={j} style={{ fontFamily: "'JetBrains Mono', monospace", color: v === 0 ? '#4ade80' : 'var(--text-primary)' }}>
                          {v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={addProcess} className="btn-secondary flex items-center gap-2">
              <Plus size={14} /> Add Process
            </button>
            <button onClick={handleRun} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <Play size={14} /> Run Banker's Algorithm
            </button>
          </div>
        </div>

        {/* Results (right) */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          {result ? (
            <>
              {/* Safety result */}
              <div
                className="card"
                style={{
                  border: `1px solid ${result.isSafe ? '#4ade80' : '#f87171'}44`,
                  background: `${result.isSafe ? '#4ade80' : '#f87171'}08`,
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  {result.isSafe
                    ? <CheckCircle size={24} style={{ color: '#4ade80' }} />
                    : <AlertTriangle size={24} style={{ color: '#f87171' }} />
                  }
                  <div>
                    <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, color: result.isSafe ? '#4ade80' : '#f87171' }}>
                      {result.isSafe ? 'Safe State' : 'Deadlock Detected!'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {result.isSafe ? 'System is in a safe state.' : 'No safe sequence exists.'}
                    </div>
                  </div>
                </div>

                {result.isSafe && (
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Safe Sequence
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.safeSequence.map((p, i) => (
                        <React.Fragment key={i}>
                          <div
                            className="badge"
                            style={{ background: '#6366f122', color: '#6366f1', border: '1px solid #6366f144' }}
                          >
                            {p}
                          </div>
                          {i < result.safeSequence.length - 1 && (
                            <span style={{ color: 'var(--text-muted)', alignSelf: 'center' }}>→</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}

                {!result.isSafe && result.deadlockedProcesses.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, color: '#f87171', marginBottom: 8, fontWeight: 500 }}>
                      Deadlocked Processes:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.deadlockedProcesses.map((p, i) => (
                        <div key={i} className="badge" style={{ background: '#f8717122', color: '#f87171', border: '1px solid #f8717144' }}>
                          {p}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* RAG */}
              <div className="card">
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, color: 'var(--text-primary)', fontSize: 14, marginBottom: 8 }}>
                  Resource Allocation Graph
                </h3>
                <RAGGraph ragData={ragData} />
              </div>
            </>
          ) : (
            <div className="card flex flex-col items-center justify-center" style={{ minHeight: 300 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Run the algorithm to see results</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
