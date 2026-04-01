import React from 'react';

export default function StatsCard({ label, value, unit = '', color = '#6366f1', icon: Icon }) {
  return (
    <div
      className="rounded-xl p-4 flex items-center gap-4"
      style={{
        background: `linear-gradient(135deg, ${color}18, ${color}08)`,
        border: `1px solid ${color}33`,
      }}
    >
      {Icon && (
        <div
          className="rounded-lg flex items-center justify-center"
          style={{ width: 40, height: 40, background: `${color}22`, flexShrink: 0 }}
        >
          <Icon size={18} style={{ color }} />
        </div>
      )}
      <div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.2 }}>
          {value}
          {unit && <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 4 }}>{unit}</span>}
        </div>
      </div>
    </div>
  );
}
