import React from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';

export default function AnimationControls({
  isPlaying, onPlay, onPause, onReset,
  onStepBack, onStepForward,
  currentStep, totalSteps,
  speed, onSpeedChange,
}) {
  return (
    <div
      className="flex flex-wrap items-center gap-4 p-4 rounded-xl"
      style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)' }}
    >
      {/* Step indicator */}
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--text-muted)', minWidth: 80 }}>
        Step {Math.min(currentStep + 1, totalSteps)} / {totalSteps}
      </div>

      {/* Progress bar */}
      <div className="flex-1" style={{ minWidth: 120 }}>
        <div style={{ background: 'var(--border)', borderRadius: 4, height: 4, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              borderRadius: 4,
              background: 'linear-gradient(90deg, #6366f1, #22d3ee)',
              width: `${totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0}%`,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-1">
        <button onClick={onReset} className="btn-secondary" style={{ padding: '6px 10px' }} title="Reset">
          <RotateCcw size={14} />
        </button>
        <button onClick={onStepBack} className="btn-secondary" style={{ padding: '6px 10px' }} title="Step back"
          disabled={currentStep <= 0}>
          <SkipBack size={14} />
        </button>
        {isPlaying ? (
          <button onClick={onPause} className="btn-primary" style={{ padding: '6px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Pause size={14} /> Pause
          </button>
        ) : (
          <button onClick={onPlay} className="btn-primary" style={{ padding: '6px 16px', display: 'flex', alignItems: 'center', gap: 6 }}
            disabled={currentStep >= totalSteps - 1}>
            <Play size={14} /> Play
          </button>
        )}
        <button onClick={onStepForward} className="btn-secondary" style={{ padding: '6px 10px' }} title="Step forward"
          disabled={currentStep >= totalSteps - 1}>
          <SkipForward size={14} />
        </button>
      </div>

      {/* Speed */}
      <div className="flex items-center gap-2">
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Speed</span>
        <input
          type="range" min="0.5" max="3" step="0.5"
          value={speed} onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
          style={{ width: 72 }}
        />
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-muted)', minWidth: 28 }}>
          {speed}x
        </span>
      </div>
    </div>
  );
}
