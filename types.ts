
export type Role = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
}

export type TaskStatus = 'pending' | 'in-progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Comment {
  id: string;
  text: string;
  userId: string;
  userName: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  ownerId: string; // The user assigned to the task
  ownerName: string;
  comments: Comment[];
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: string;
  details?: string;
  entityId?: string; // Link activity to a specific entity (e.g., Task ID)
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
