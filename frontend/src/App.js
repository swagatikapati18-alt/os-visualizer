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
    <div className="flex min-h-screen">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      <main className="flex-1">
        <button onClick={() => setActiveModule('history')}>
          Saved Runs
        </button>

        <div>{renderPage()}</div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}