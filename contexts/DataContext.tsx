
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Task, ActivityLog, Comment } from '../types';
import { useAuth } from './AuthContext';

// Professional Initial Data
const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Implement Authentication Flow',
    description: 'Integrate JWT based auth with secure route protection.',
    status: 'completed',
    priority: 'high',
    dueDate: '2023-11-15',
    ownerId: 'admin-seed',
    ownerName: 'System Admin',
    comments: [
        { id: 'c1', text: 'Initial setup complete, waiting for review.', userId: 'admin-seed', userName: 'System Admin', createdAt: '2023-11-14T10:00:00Z' }
    ]
  },
  {
    id: 't2',
    title: 'Database Schema Design',
    description: 'Finalize Mongoose schemas for Users, Orders, and Products.',
    status: 'in-progress',
    priority: 'high',
    dueDate: '2023-11-20',
    ownerId: 'admin-seed',
    ownerName: 'System Admin',
    comments: []
  },
  {
    id: 't3',
    title: 'Client Dashboard UI',
    description: 'Implement responsive grid layout for the main statistics page.',
    status: 'pending',
    priority: 'medium',
    dueDate: '2023-11-25',
    ownerId: 'admin-seed',
    ownerName: 'System Admin',
    comments: []
  },
];

interface DataContextType {
  tasks: Task[];
  activities: ActivityLog[];
  addTask: (task: Omit<Task, 'id' | 'ownerName' | 'comments'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addComment: (taskId: string, text: string) => void;
  getTasksByRole: () => Task[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  useEffect(() => {
    const storedTasks = localStorage.getItem('nexus_tasks');
    const storedActivities = localStorage.getItem('nexus_activities');

    if (storedTasks) {
      // Parse and migrate tasks to ensure comments array exists
      const parsedTasks = JSON.parse(storedTasks);
      const migratedTasks = parsedTasks.map((t: any) => ({
        ...t,
        comments: t.comments || []
      }));
      setTasks(migratedTasks);
    } else {
      setTasks(INITIAL_TASKS);
      localStorage.setItem('nexus_tasks', JSON.stringify(INITIAL_TASKS));
    }

    if (storedActivities) {
      setActivities(JSON.parse(storedActivities));
    }
  }, []);

  const logActivity = (action: string, details?: string, entityId?: string) => {
    if (!user) return;
    const newActivity: ActivityLog = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      userName: user.name,
      timestamp: new Date().toISOString(),
      action,
      details,
      entityId
    };
    const updatedActivities = [newActivity, ...activities].slice(0, 100); // Keep last 100
    setActivities(updatedActivities);
    localStorage.setItem('nexus_activities', JSON.stringify(updatedActivities));
  };

  const saveTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    localStorage.setItem('nexus_tasks', JSON.stringify(newTasks));
  };

  const addTask = (newTaskData: Omit<Task, 'id' | 'ownerName' | 'comments'>) => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newTask: Task = {
      ...newTaskData,
      id: newId,
      ownerName: user?.name || 'Unknown',
      comments: []
    };
    saveTasks([newTask, ...tasks]);
    logActivity('Created Task', `Added "${newTask.title}"`, newId);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    const oldTask = tasks.find(t => t.id === id);
    const newTasks = tasks.map(t => (t.id === id ? { ...t, ...updates } : t));
    saveTasks(newTasks);

    if (oldTask && updates.status && oldTask.status !== updates.status) {
        logActivity('Updated Status', `Moved "${oldTask.title}" to ${updates.status}`, id);
    } else if (oldTask && !updates.comments) { // Don't log on comments to avoid spam here, handled in addComment
        logActivity('Updated Task', `Modified details for "${oldTask.title}"`, id);
    }
  };

  const addComment = (taskId: string, text: string) => {
    if (!user) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newComment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      userId: user.id,
      userName: user.name,
      createdAt: new Date().toISOString()
    };

    const updatedTask = { ...task, comments: [...task.comments, newComment] };
    updateTask(taskId, updatedTask);
    logActivity('Added Comment', `Commented on "${task.title}"`, taskId);
  };

  const deleteTask = (id: string) => {
    const taskToDelete = tasks.find(t => t.id === id);
    saveTasks(tasks.filter(t => t.id !== id));
    if (taskToDelete) {
        logActivity('Deleted Task', `Removed "${taskToDelete.title}"`, id);
    }
  };

  const getTasksByRole = () => {
    if (!user) return [];
    if (user.role === 'admin') return tasks; 
    return tasks.filter(t => t.ownerId === user.id); 
  };

  return (
    <DataContext.Provider value={{ tasks, activities, addTask, updateTask, deleteTask, addComment, getTasksByRole }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
