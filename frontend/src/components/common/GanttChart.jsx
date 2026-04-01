import React, { useState, useEffect } from 'react';

/**
 * Animated Gantt Chart
 * Props: gantt [{pid, start, end, color}], animating, currentStep
 */
export default function GanttChart({ gantt, animating, currentStep }) {
  const [visibleCount, setVisibleCount] = useState(gantt.length);

  useEffect(() => {
    if (animating) {
      setVisibleCount(0);
      let i = 0;
      const interval = setInterval(() => {
        i++;
        setVisibleCount(i);
        if (i >= gantt.length) clearInterval(interval);
      }, 500);
      return () => clearInterval(interval);
    } else {
      setVisibleCount(gantt.length);
    }
  }, [animating, gantt]);

  useEffect(() => {
    if (currentStep !== undefined) setVisibleCount(currentStep + 1);
  }, [currentStep]);

  if (!gantt || gantt.length === 0) return null;

  const totalTime = gantt[gantt.length - 1]?.end || 1;
  const visible = gantt.slice(0, visibleCount);

  return (
    <div className="card mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>
          Gantt Chart
        </h3>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-muted)' }}>
          Total Time: {totalTime} units
        </span>
      </div>

      {/* Chart */}
      <div className="overflow-x-auto pb-2">
        <div style={{ minWidth: Math.max(600, totalTime * 28), position: 'relative' }}>
          {/* Bars */}
          <div className="flex" style={{ height: 48 }}>
            {gantt.map((block, i) => {
              const width = ((block.end - block.start) / totalTime) * 100;
              const isVisible = i < visibleCount;
              return (
                <div
                  key={i}
                  style={{
                    width: `${width}%`,
                    background: isVisible
                      ? `linear-gradient(135deg, ${block.color}dd, ${block.color}99)`
                      : 'var(--bg-hover)',
                    border: `1px solid ${isVisible ? block.color : 'var(--border)'}`,
                    borderRadius: 6,
                    margin: '0 1px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    opacity: isVisible ? 1 : 0.3,
                  }}
                >
                  {isVisible && (
                    <>
                      <div
                        style={{
                          position: 'absolute', inset: 0,
                          background: `linear-gradient(135deg, ${block.color}33 0%, transparent 60%)`,
                        }}
                      />
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontWeight: 700,
                          fontSize: 12,
                          color: 'white',
                          textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                          zIndex: 1,
                        }}
                      >
                        {block.pid}
                      </span>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Time markers */}
          <div className="flex mt-1" style={{ position: 'relative', height: 20 }}>
            {gantt.map((block, i) => {
              const leftPct = (block.start / totalTime) * 100;
              return (
                <div key={i} style={{ width: `${((block.end - block.start) / totalTime) * 100}%`, position: 'relative', margin: '0 1px' }}>
                  <span
                    style={{
                      position: 'absolute', left: 0, top: 0,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 10, color: 'var(--text-muted)',
                      transform: 'translateX(-50%)',
                    }}
                  >
                    {block.start}
                  </span>
                  {i === gantt.length - 1 && (
                    <span
                      style={{
                        position: 'absolute', right: 0, top: 0,
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 10, color: 'var(--text-muted)',
                        transform: 'translateX(50%)',
                      }}
                    >
                      {block.end}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-4 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
            {[...new Map(gantt.map((b) => [b.pid, b])).values()].map((block) => (
              <div key={block.pid} className="flex items-center gap-2">
                <div style={{ width: 10, height: 10, borderRadius: 2, background: block.color }} />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-muted)' }}>
                  {block.pid}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
