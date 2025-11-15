import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
};

export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken');
};

export const setTokens = (accessToken: string, refreshToken: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

export const clearTokens = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userInfo');
};

// Interceptor to add access token to requests
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearTokens();
        if (typeof window !== 'undefined') {
          toast.error('🔒 Your session has expired. Please login again to continue.', {
            icon: '🔒',
            duration: 5000,
          });
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError: any) {
        clearTokens();
        if (typeof window !== 'undefined') {
          const refreshErrorMsg = refreshError.response?.data?.error || '';
          if (refreshErrorMsg.toLowerCase().includes('expired') || refreshErrorMsg.toLowerCase().includes('invalid')) {
            toast.error('🔒 Your session has expired. Please login again to continue.', {
              icon: '🔒',
              duration: 5000,
            });
          } else {
            toast.error('🔒 Session expired or invalid. Please login again.', {
              icon: '🔒',
              duration: 5000,
            });
          }
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const setUserInfo = (user: { id: string; email: string; name: string }) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('userInfo', JSON.stringify(user));
};

export const getUserInfo = (): { id: string; email: string; name: string } | null => {
  if (typeof window === 'undefined') return null;
  const info = localStorage.getItem('userInfo');
  return info ? JSON.parse(info) : null;
};

export const authAPI = {
  register: async (email: string, password: string, name: string) => {
    const response = await api.post('/auth/register', { email, password, name });
    if (response.data.user) {
      setUserInfo(response.data.user);
    }
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.user) {
      setUserInfo(response.data.user);
    }
    return response.data;
  },

  logout: async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      await api.post('/auth/logout', { refreshToken });
    }
    clearTokens();
  },
};

// Task API
export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TasksResponse {
  tasks: Task[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  statusCounts?: {
    pending: number;
    inProgress: number;
    completed: number;
  };
}

export interface TaskFilters {
  page?: number;
  limit?: number;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  search?: string;
}

export const taskAPI = {
  getTasks: async (filters: TaskFilters = {}): Promise<TasksResponse> => {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);

    const response = await api.get(`/tasks?${params.toString()}`);
    return response.data;
  },

  getTask: async (id: string): Promise<Task> => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  createTask: async (title: string, description?: string, status?: Task['status']): Promise<Task> => {
    const response = await api.post('/tasks', { title, description, status });
    return response.data;
  },

  updateTask: async (id: string, data: Partial<Task>): Promise<Task> => {
    const response = await api.patch(`/tasks/${id}`, data);
    return response.data;
  },

  deleteTask: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },

  toggleTask: async (id: string): Promise<Task> => {
    const response = await api.post(`/tasks/${id}/toggle`);
    return response.data;
  },
};

export default api;


