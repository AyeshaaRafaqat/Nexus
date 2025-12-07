import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Sidebar from './components/Sidebar';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  if (isLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="animate-pulse flex flex-col items-center">
                <div className="h-12 w-12 bg-indigo-200 rounded-full mb-4"></div>
                <div className="h-4 w-32 bg-slate-200 rounded"></div>
            </div>
        </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar currentView={currentView} onChangeView={setCurrentView} />
      <main className="flex-1 ml-64 min-h-screen">
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'tasks' && <Tasks />}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
};

export default App;
