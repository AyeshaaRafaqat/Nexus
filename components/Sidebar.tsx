import React from 'react';
import { LayoutDashboard, ListTodo, LogOut, Hexagon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  currentView: string;
  onChangeView: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  const { logout, user } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'tasks', label: 'My Tasks', icon: <ListTodo size={20} /> },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen fixed left-0 top-0 z-20 transition-all duration-300">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <Hexagon className="text-indigo-500 fill-indigo-500" size={28} />
        <span className="text-xl font-bold text-white tracking-tight">Nexus</span>
      </div>

      <div className="p-4">
        <div className="bg-slate-800/50 rounded-lg p-3 mb-6 flex items-center gap-3">
            <img src={user?.avatar} alt="User" className="w-10 h-10 rounded-full border-2 border-indigo-500" />
            <div>
                <p className="text-sm font-semibold text-white">{user?.name}</p>
                <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
            </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentView === item.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
