
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Task, TaskPriority, TaskStatus } from '../types';
import { Plus, Search, Filter, Trash2, Edit2, X, MessageSquare, Send, Calendar, User, History } from 'lucide-react';

const Tasks: React.FC = () => {
  const { getTasksByRole, addTask, updateTask, deleteTask, addComment, activities } = useData();
  const { user } = useAuth();
  const tasks = getTasksByRole();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'history'>('details');
  const [newComment, setNewComment] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending' as TaskStatus,
    priority: 'medium' as TaskPriority,
    dueDate: '',
    ownerId: user?.id || ''
  });

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleOpenModal = (task?: Task) => {
    setActiveTab('details');
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        ownerId: task.ownerId
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        dueDate: '',
        ownerId: user?.id || ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask) {
      updateTask(editingTask.id, formData);
    } else {
      addTask(formData);
    }
    setIsModalOpen(false);
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !newComment.trim()) return;
    
    addComment(editingTask.id, newComment);
    setNewComment('');
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'completed': return 'text-emerald-600 bg-emerald-50';
      case 'in-progress': return 'text-indigo-600 bg-indigo-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const getTaskActivities = (taskId: string) => {
    return activities.filter(a => a.entityId === taskId);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Tasks</h1>
          <p className="text-slate-500 mt-1">Manage deliverables and collaborate with your team</p>
        </div>
        <div>
            <button
                onClick={() => handleOpenModal()}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
            >
                <Plus size={20} />
                <span>New Task</span>
            </button>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={18} className="text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-600 w-full"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Task Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Due Date</th>
                {user?.role === 'admin' && <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Owner</th>}
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.length > 0 ? filteredTasks.map((task) => (
                <tr 
                    key={task.id} 
                    onClick={() => handleOpenModal(task)}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">{task.title}</span>
                      <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-500 truncate max-w-xs">{task.description || 'No description'}</span>
                          {task.comments && task.comments.length > 0 && (
                            <span className="flex items-center gap-1 text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
                                <MessageSquare size={10} /> {task.comments.length}
                            </span>
                          )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400" />
                        {task.dueDate || 'No Date'}
                    </div>
                  </td>
                  {user?.role === 'admin' && (
                    <td className="px-6 py-4 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                            <User size={14} className="text-slate-400" />
                            {task.ownerName}
                        </div>
                    </td>
                  )}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete Task"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                        No tasks found. Create one to get started.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-slate-800">{editingTask ? 'Task Details' : 'New Task'}</h2>
                {editingTask && <p className="text-xs text-slate-400">ID: {editingTask.id}</p>}
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg">
                <X size={24} />
              </button>
            </div>

            {/* Tabs (Only if editing) */}
            {editingTask && (
                <div className="flex border-b border-slate-100 px-6 gap-6">
                    <button 
                        onClick={() => setActiveTab('details')}
                        className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'details' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        Details
                    </button>
                    <button 
                        onClick={() => setActiveTab('comments')}
                        className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'comments' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        Discussion
                        <span className="bg-slate-100 px-1.5 rounded-full text-xs text-slate-600">{editingTask.comments?.length || 0}</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'history' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        History
                    </button>
                </div>
            )}
            
            <div className="overflow-y-auto flex-1 p-6">
                {activeTab === 'details' ? (
                    <form id="taskForm" onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                        <input
                        required
                        type="text"
                        value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Task title"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none"
                        placeholder="Task details..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                        <select
                            value={formData.status}
                            onChange={e => setFormData({...formData, status: e.target.value as TaskStatus})}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                        </div>
                        <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                        <select
                            value={formData.priority}
                            onChange={e => setFormData({...formData, priority: e.target.value as TaskPriority})}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                        <input
                        type="date"
                        value={formData.dueDate}
                        onChange={e => setFormData({...formData, dueDate: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    </form>
                ) : activeTab === 'comments' ? (
                    <div className="flex flex-col h-full min-h-[300px]">
                        <div className="flex-1 space-y-4 mb-4">
                            {editingTask?.comments && editingTask.comments.length > 0 ? (
                                editingTask.comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${comment.userId === user?.id ? 'bg-indigo-500' : 'bg-slate-400'}`}>
                                            {comment.userName.charAt(0)}
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-lg rounded-tl-none flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-bold text-slate-700">{comment.userName}</span>
                                                <span className="text-[10px] text-slate-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-sm text-slate-600">{comment.text}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 text-slate-400">
                                    <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No comments yet. Start the conversation!</p>
                                </div>
                            )}
                        </div>
                        <div className="mt-auto pt-4 border-t border-slate-100">
                             <form onSubmit={handlePostComment} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                />
                                <button 
                                    type="submit"
                                    disabled={!newComment.trim()}
                                    className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                >
                                    <Send size={18} />
                                </button>
                             </form>
                        </div>
                    </div>
                ) : (
                    // History Tab
                    <div className="space-y-6">
                        {editingTask && getTaskActivities(editingTask.id).length > 0 ? (
                            <div className="relative border-l-2 border-slate-100 ml-3 space-y-6 py-2">
                                {getTaskActivities(editingTask.id).map((activity) => (
                                    <div key={activity.id} className="relative pl-6">
                                        <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-white"></div>
                                        <p className="text-sm text-slate-800 font-medium">{activity.action}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            {activity.userName} • {new Date(activity.timestamp).toLocaleString()}
                                        </p>
                                        {activity.details && <p className="text-sm text-slate-600 mt-2 bg-slate-50 p-2 rounded border border-slate-100">{activity.details}</p>}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-slate-400 flex flex-col items-center">
                                <History size={32} className="opacity-50 mb-3" />
                                <p>No activity history found for this task.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer actions only for Details Tab */}
            {activeTab === 'details' && (
                <div className="p-6 border-t border-slate-100 flex gap-3 bg-slate-50 shrink-0">
                    <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors font-medium"
                    >
                    Cancel
                    </button>
                    <button
                    type="submit"
                    form="taskForm"
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                    {editingTask ? 'Save Changes' : 'Create Task'}
                    </button>
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
