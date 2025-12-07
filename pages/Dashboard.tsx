import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import StatCard from '../components/StatCard';
import { CheckCircle, Clock, AlertCircle, Sparkles, Loader2, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { analyzeProjectHealth } from '../services/geminiService';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

const Dashboard: React.FC = () => {
  const { getTasksByRole, activities } = useData();
  const { user } = useAuth();
  const tasks = getTasksByRole();
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Calculate Stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;

  // Chart Data
  const statusData = [
    { name: 'Completed', value: completedTasks },
    { name: 'In Progress', value: inProgressTasks },
    { name: 'Pending', value: pendingTasks },
  ];

  const priorityData = [
    { name: 'High', value: tasks.filter(t => t.priority === 'high').length },
    { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length },
    { name: 'Low', value: tasks.filter(t => t.priority === 'low').length },
  ];

  const handleAiAnalysis = async () => {
    setIsAnalyzing(true);
    const result = await analyzeProjectHealth(tasks);
    setAiInsight(result);
    setIsAnalyzing(false);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  // Filter activities for the dashboard (global for admin, user-specific for users if desired, but typically dashboards show team activity in admin view)
  const displayActivities = activities.slice(0, 5); 

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 mt-2">Welcome back, {user?.name}. Here's what's happening.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Tasks"
          value={totalTasks}
          icon={<Clock size={24} />}
          color="bg-indigo-500"
          trend="+12% from last week"
        />
        <StatCard
          title="Completed"
          value={completedTasks}
          icon={<CheckCircle size={24} />}
          color="bg-emerald-500"
          trend="+5% from last week"
        />
        <StatCard
          title="In Progress"
          value={inProgressTasks}
          icon={<Loader2 size={24} />}
          color="bg-amber-500"
        />
        <StatCard
          title="Pending"
          value={pendingTasks}
          icon={<AlertCircle size={24} />}
          color="bg-rose-500"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Charts Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Status Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Task Status Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Priority Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             <h3 className="text-lg font-bold text-slate-800 mb-6">Task Priority</h3>
             <div className="h-64 flex justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
             </div>
          </div>
        </div>

        {/* AI & Activity Column */}
        <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="text-yellow-300" />
                    <h3 className="text-lg font-bold">Project Intelligence</h3>
                </div>
                <p className="text-indigo-100 text-sm mb-6">
                    Analyze your current workload, detect bottlenecks, and suggest next steps based on your task data.
                </p>
                
                {!aiInsight ? (
                    <button 
                        onClick={handleAiAnalysis}
                        disabled={isAnalyzing}
                        className="w-full py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        {isAnalyzing ? <Loader2 className="animate-spin" size={16} /> : 'Generate Executive Summary'}
                    </button>
                ) : (
                    <div className="bg-white/10 rounded-lg p-4 text-sm text-indigo-50 leading-relaxed animate-fade-in">
                        {aiInsight}
                        <button 
                            onClick={() => setAiInsight(null)}
                            className="text-xs text-indigo-200 mt-3 hover:text-white underline block"
                        >
                            Clear Analysis
                        </button>
                    </div>
                )}
            </div>

            {/* Recent Activity (Real Data) */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <Activity size={20} className="text-indigo-500" />
                  <h3 className="text-lg font-bold text-slate-800">Recent Activity</h3>
                </div>
                
                <div className="space-y-4">
                    {displayActivities.length > 0 ? displayActivities.map((activity) => (
                        <div key={activity.id} className="flex gap-3 pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0"></div>
                            <div>
                                <p className="text-sm text-slate-600">
                                  <span className="font-semibold text-slate-800">{activity.action}</span>
                                  {activity.details && `: ${activity.details}`}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-xs text-slate-400">{formatTime(activity.timestamp)}</p>
                                    <span className="text-xs text-slate-300">•</span>
                                    <p className="text-xs text-indigo-500 font-medium">{activity.userName}</p>
                                </div>
                            </div>
                        </div>
                    )) : (
                      <p className="text-sm text-slate-400 italic">No recent activity recorded.</p>
                    )}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;