import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Cpu, HardDrive, AlertTriangle, Database,
  Moon, Sun, ChevronRight, Activity
} from 'lucide-react';

const navItems = [
  {
    id: 'scheduling',
    label: 'Process Scheduling',
    icon: Cpu,
    color: '#6366f1',
    sub: 'FCFS, SJF, RR, Priority',
  },
  {
    id: 'memory',
    label: 'Memory Management',
    icon: HardDrive,
    color: '#22d3ee',
    sub: 'Paging, Page Replacement',
  },
  {
    id: 'deadlock',
    label: 'Deadlock Detection',
    icon: AlertTriangle,
    color: '#fb923c',
    sub: "Banker's Algorithm",
  },
  {
    id: 'disk',
    label: 'Disk Scheduling',
    icon: Database,
    color: '#4ade80',
    sub: 'FCFS, SSTF, SCAN, C-SCAN',
  },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const { activeModule, setActiveModule, darkMode, toggleDarkMode } = useApp();

  return (
    <aside
      className="flex flex-col transition-all duration-300 h-screen sticky top-0"
      style={{
        width: collapsed ? 72 : 260,
        background: 'var(--bg-card)',
        borderRight: '1px solid var(--border)',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 py-5 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <div
          className="flex items-center justify-center rounded-xl flex-shrink-0"
          style={{
            width: 40, height: 40,
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            boxShadow: '0 4px 15px rgba(99,102,241,0.4)',
          }}
        >
          <Activity size={20} color="white" />
        </div>
        {!collapsed && (
          <div>
            <div
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}
            >
              OS Visualizer
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Interactive Simulations</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {!collapsed && (
          <div
            className="px-3 mb-3"
            style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}
          >
            Modules
          </div>
        )}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className="w-full flex items-center gap-3 rounded-xl mb-1 transition-all duration-200 group"
              style={{
                padding: collapsed ? '10px' : '10px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                background: isActive
                  ? `linear-gradient(135deg, ${item.color}22, ${item.color}11)`
                  : 'transparent',
                border: isActive
                  ? `1px solid ${item.color}44`
                  : '1px solid transparent',
                color: isActive ? item.color : 'var(--text-muted)',
              }}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} style={{ flexShrink: 0, color: isActive ? item.color : 'var(--text-muted)' }} />
              {!collapsed && (
                <div className="flex-1 text-left">
                  <div style={{ fontSize: 13, fontWeight: 600, color: isActive ? item.color : 'var(--text-primary)', fontFamily: "'Space Grotesk', sans-serif" }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                    {item.sub}
                  </div>
                </div>
              )}
              {!collapsed && isActive && (
                <ChevronRight size={14} style={{ color: item.color, flexShrink: 0 }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom controls */}
      <div
        className="p-3 border-t flex flex-col gap-2"
        style={{ borderColor: 'var(--border)' }}
      >
        <button
          onClick={toggleDarkMode}
          className="flex items-center gap-3 rounded-xl px-3 py-2 w-full transition-all duration-200"
          style={{
            background: 'var(--bg-hover)',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
          title="Toggle theme"
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          {!collapsed && (
            <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </span>
          )}
        </button>

        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex items-center gap-3 rounded-xl px-3 py-2 w-full transition-all duration-200"
          style={{
            background: 'var(--bg-hover)',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          <ChevronRight
            size={16}
            style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.3s' }}
          />
          {!collapsed && <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
