import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/common/Sidebar';
import SchedulingPage from './components/scheduling/SchedulingPage';
import MemoryPage from './components/memory/MemoryPage';
import DeadlockPage from './components/deadlock/DeadlockPage';
import DiskPage from './components/disk/DiskPage';
import HistoryPage from './components/common/HistoryPage';

function AppContent() {
  const { activeModule, setActiveModule } = useApp();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderPage = () => {
    switch (activeModule) {
      case 'scheduling':
        return <SchedulingPage />;
      case 'memory':
        return <MemoryPage />;
      case 'deadlock':
        return <DeadlockPage />;
      case 'disk':
        return <DiskPage />;
      case 'history':
        return <HistoryPage />;
      default:
        return <SchedulingPage />;
    }
  };

  return (
    <div
      className="flex min-h-screen grid-bg"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-6 py-3"
          style={{
            background: 'rgba(15, 15, 26, 0.85)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div className="flex items-center gap-2">
            {['scheduling', 'memory', 'deadlock', 'disk'].map((mod) => (
              <span
                key={mod}
                style={{ color: 'var(--text-muted)', fontSize: 12 }}
              >
                {mod === activeModule && (
                  <span
                    style={{
                      color: 'var(--text-primary)',
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 600,
                      textTransform: 'capitalize',
                    }}
                  >
                    {mod}
                  </span>
                )}
              </span>
            ))}

            <span
              style={{
                color: 'var(--text-primary)',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: 13,
                textTransform: 'capitalize',
              }}
            >
              {activeModule}
            </span>
          </div>

          <button
            onClick={() => setActiveModule('history')}
            className="btn-secondary flex items-center gap-2"
            style={{ fontSize: 12, padding: '5px 14px' }}
          >
            📋 Saved Runs
          </button>
        </div>

        {/* Page Content */}
        <div className="p-6">{renderPage()}</div>
      </main>
    </div>
  );
}

/* ✅ FINAL APP COMPONENT (ONLY ONE!) */
export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}