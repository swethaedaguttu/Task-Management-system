'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { taskAPI, Task, TaskFilters } from '@/lib/api';
import { authAPI, getUserInfo } from '@/lib/api';
import { getAccessToken } from '@/lib/api';
import toast from 'react-hot-toast';
import TaskModal from '@/components/TaskModal';
import TaskCard from '@/components/TaskCard';
import TaskSkeleton from '@/components/TaskSkeleton';
import Sidebar from '@/components/Sidebar';
import MobileHeader from '@/components/MobileHeader';

export default function DashboardPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskFilters['status'] | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [inProgressCount, setInProgressCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [userInfo, setUserInfo] = useState<{ name?: string; email?: string } | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const filters: TaskFilters = {
        page: currentPage,
        limit: 9,
      };
      if (statusFilter) {
        filters.status = statusFilter as Task['status'];
      }
      if (searchTerm) {
        filters.search = searchTerm;
      }

      const response = await taskAPI.getTasks(filters);
      setTasks(response.tasks);
      setTotalPages(response.pagination.totalPages);
      setTotalTasks(response.pagination.total);
      if (response.statusCounts) {
        setPendingCount(response.statusCounts.pending);
        setInProgressCount(response.statusCounts.inProgress);
        setCompletedCount(response.statusCounts.completed);
      } else {
        // Fallback to counting from current page if statusCounts not available
        setPendingCount(response.tasks.filter(t => t.status === 'PENDING').length);
        setInProgressCount(response.tasks.filter(t => t.status === 'IN_PROGRESS').length);
        setCompletedCount(response.tasks.filter(t => t.status === 'COMPLETED').length);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Token expiration is handled by the interceptor, but show a message if it gets here
        toast.error('🔒 Your session has expired. Please login again.', {
          icon: '🔒',
          duration: 5000,
        });
        router.push('/login');
      } else {
        toast.error('❌ Failed to fetch tasks. Please try again.', {
          duration: 4000,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, searchTerm, router]);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.push('/login');
      return;
    }
    // Get user info from localStorage or token
    const storedUser = getUserInfo();
    if (storedUser) {
      setUserInfo({ name: storedUser.name, email: storedUser.email });
    } else {
      // Fallback: try to decode from token
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserInfo({ name: payload.name, email: payload.email });
      } catch (e) {
        // If can't decode, that's okay
      }
    }
  }, [router]);

  // Fetch tasks when page or filter changes
  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      fetchTasks();
    }
  }, [currentPage, statusFilter, fetchTasks]);

  // Debounced search - reset to page 1 when search term changes (only when searchTerm changes, not page)
  useEffect(() => {
    // Only reset page when search term actually changes
    // Don't do anything if search is empty and we're already on page 1
    if (!searchTerm) return;
    
    const timer = setTimeout(() => {
      // Reset to page 1 when search term changes
      // The main fetch effect will handle fetching when currentPage changes to 1
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]); // Only depend on searchTerm - this prevents reset when page changes

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      router.push('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      router.push('/login');
    }
  };

  const handleSaveTask = async (id: string | null, title: string, description: string, status: Task['status']) => {
    try {
      if (id) {
        await taskAPI.updateTask(id, { title, description, status });
        toast.success('Task updated successfully!', {
          icon: '✅',
          duration: 3000,
        });
      } else {
        await taskAPI.createTask(title, description, status);
        toast.success('Task added successfully!', {
          icon: '✨',
          duration: 3000,
        });
      }
      setIsModalOpen(false);
      setEditingTask(null);
      fetchTasks();
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('🔒 Your session has expired. Please login again.', {
          icon: '🔒',
          duration: 5000,
        });
      } else {
        toast.error(`❌ ${error.response?.data?.error || `Failed to ${id ? 'update' : 'create'} task. Please try again.`}`, {
          duration: 4000,
        });
      }
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await taskAPI.deleteTask(id);
      toast.success('Task deleted successfully!', {
        icon: '🗑️',
        duration: 3000,
      });
      fetchTasks();
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('🔒 Your session has expired. Please login again.', {
          icon: '🔒',
          duration: 5000,
        });
      } else {
        toast.error(`❌ ${error.response?.data?.error || 'Failed to delete task. Please try again.'}`, {
          duration: 4000,
        });
      }
    }
  };

  const handleToggleTask = async (id: string) => {
    try {
      await taskAPI.toggleTask(id);
      toast.success('Task status updated!', {
        icon: '🔄',
        duration: 3000,
      });
      fetchTasks();
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('🔒 Your session has expired. Please login again.', {
          icon: '🔒',
          duration: 5000,
        });
      } else {
        toast.error(`❌ ${error.response?.data?.error || 'Failed to toggle task. Please try again.'}`, {
          duration: 4000,
        });
      }
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTasks();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <Sidebar userInfo={userInfo} onLogout={handleLogout} />
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <MobileHeader userInfo={userInfo} onLogout={handleLogout} />
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 pt-16 lg:pt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  My Tasks
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                  Manage and organize your tasks efficiently
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingTask(null);
                  setIsModalOpen(true);
                }}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold flex items-center space-x-2 transform hover:scale-105 group"
            >
              <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span>New Task</span>
            </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Tasks Card */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-2xl shadow-md border-2 border-indigo-200 dark:border-indigo-800 transition-all hover:shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200 dark:bg-indigo-800 rounded-full -mr-16 -mt-16 opacity-20"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-2">Total Tasks</p>
                  <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">
                    {totalTasks}
                  </p>
                  <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-1">All tasks</p>
                  {/* Progress Bar */}
                  <div className="mt-3 w-full bg-indigo-200 dark:bg-indigo-800 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${totalTasks > 0 ? Math.min((totalTasks / 100) * 100, 100) : 0}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Pending Card */}
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 p-6 rounded-2xl shadow-md border-2 border-yellow-200 dark:border-yellow-800 transition-all hover:shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-200 dark:bg-yellow-800 rounded-full -mr-16 -mt-16 opacity-20"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-2">Pending</p>
                  <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">
                    {pendingCount}
                  </p>
                  <p className="text-xs text-yellow-500 dark:text-yellow-400 mt-1">Awaiting</p>
                  {/* Progress Bar */}
                  <div className="mt-3 w-full bg-yellow-200 dark:bg-yellow-800 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-yellow-500 to-amber-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${totalTasks > 0 ? (pendingCount / totalTasks) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* In Progress Card */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-6 rounded-2xl shadow-md border-2 border-orange-200 dark:border-orange-800 transition-all hover:shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200 dark:bg-orange-800 rounded-full -mr-16 -mt-16 opacity-20"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-2">In Progress</p>
                  <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                    {inProgressCount}
                  </p>
                  <p className="text-xs text-orange-500 dark:text-orange-400 mt-1">Active work</p>
                  {/* Progress Bar */}
                  <div className="mt-3 w-full bg-orange-200 dark:bg-orange-800 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all duration-500 animate-pulse"
                      style={{ width: `${totalTasks > 0 ? (inProgressCount / totalTasks) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Completed Card */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-2xl shadow-md border-2 border-green-200 dark:border-green-800 transition-all hover:shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-200 dark:bg-green-800 rounded-full -mr-16 -mt-16 opacity-20"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">Completed</p>
                  <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                    {completedCount}
                  </p>
                  <p className="text-xs text-green-500 dark:text-green-400 mt-1">Done</p>
                  {/* Progress Bar */}
                  <div className="mt-3 w-full bg-green-200 dark:bg-green-800 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="mb-6 bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search tasks by title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 bg-gray-50 dark:bg-gray-700/50 transition-all"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as TaskFilters['status'] | '');
                  setCurrentPage(1);
                }}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white transition-all font-medium"
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          {/* Tasks List */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <TaskSkeleton key={index} />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
              <div className="mx-auto w-40 h-40 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mb-6 relative">
                <svg className="w-20 h-20 text-indigo-400 dark:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {searchTerm || statusFilter ? 'No tasks found' : 'No Tasks Yet'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg max-w-md mx-auto">
                {searchTerm || statusFilter 
                  ? 'Try adjusting your search or filter criteria to find what you\'re looking for.' 
                  : 'You haven\'t created any tasks yet. Start organizing your work by creating your first task!'}
              </p>
              {!searchTerm && !statusFilter && (
                <button
                  onClick={() => {
                    setEditingTask(null);
                    setIsModalOpen(true);
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold flex items-center space-x-2 mx-auto"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Create Your First Task</span>
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={handleEdit}
                    onDelete={handleDeleteTask}
                    onToggle={handleToggleTask}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10 flex justify-center items-center gap-3">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium text-gray-700 dark:text-gray-300 disabled:hover:bg-transparent"
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      <span>Previous</span>
                    </div>
                  </button>
                  <div className="px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <span className="text-gray-700 dark:text-gray-300 font-semibold">
                      Page <span className="text-indigo-600 dark:text-indigo-400">{currentPage}</span> of {totalPages}
                    </span>
                  </div>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium text-gray-700 dark:text-gray-300 disabled:hover:bg-transparent"
                  >
                    <div className="flex items-center space-x-2">
                      <span>Next</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Task Modal */}
      {isModalOpen && (
        <TaskModal
          task={editingTask}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTask(null);
          }}
          onSave={handleSaveTask}
        />
      )}
    </div>
  );
}

