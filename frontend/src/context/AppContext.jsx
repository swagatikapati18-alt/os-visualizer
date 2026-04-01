import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [darkMode, setDarkMode] = useState(true);
  const [activeModule, setActiveModule] = useState('scheduling');

  useEffect(() => {
    document.documentElement.classList.toggle('light', !darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((d) => !d);

  return (
    <AppContext.Provider value={{ darkMode, toggleDarkMode, activeModule, setActiveModule }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
