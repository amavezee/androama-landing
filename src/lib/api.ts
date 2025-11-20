import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: string;
  email: string;
  username: string | null;
  edition: string;
  subscription_status: string;
  subscription_tier: string;
  license_key?: string | null;
  subscription_end?: string | null;
  created_at: string;
  last_login: string | null;
  is_active: boolean;
  email_verified: boolean;
  is_admin: boolean;
  oauth_provider?: string | null;
  avatar_url?: string | null;
  has_downloaded?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username?: string;
  edition?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<User> => {
    const response = await api.post<User>('/api/auth/register', data);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/api/auth/me');
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/api/auth/logout');
  },

  googleLogin: async (token: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/google', { token });
    return response.data;
  },
};

export const userAPI = {
  getProfile: async (): Promise<User> => {
    const response = await api.get<User>('/api/users/profile');
    return response.data;
  },

  updateProfile: async (data: { username?: string; edition?: string; avatar_url?: string | null }): Promise<User> => {
    const response = await api.put<User>('/api/users/profile', data);
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.post('/api/users/profile/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },
};

export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  is_pinned: boolean;
  is_announcement: boolean;
  is_solved: boolean;
  views: number;
  likes_count: number;
  replies_count: number;
  created_at: string;
  updated_at: string;
  author: {
    id: string;
    username: string | null;
    email: string;
    edition: string;
    is_admin: boolean;
    avatar_url: string | null;
  };
  user_liked: boolean;
}

export interface CommunityReply {
  id: string;
  content: string;
  is_official: boolean;
  likes_count: number;
  created_at: string;
  updated_at: string;
  author: {
    id: string;
    username: string | null;
    email: string;
    is_admin: boolean;
    avatar_url: string | null;
  };
  user_liked: boolean;
}

export const communityAPI = {
  getPosts: async (params?: {
    category?: string;
    search?: string;
    sort_by?: 'newest' | 'popular' | 'trending';
    skip?: number;
    limit?: number;
  }): Promise<CommunityPost[]> => {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params?.skip) queryParams.append('skip', params.skip.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const response = await api.get<CommunityPost[]>(`/api/community/posts?${queryParams.toString()}`);
    return response.data;
  },

  getPost: async (postId: string): Promise<CommunityPost> => {
    const response = await api.get<CommunityPost>(`/api/community/posts/${postId}`);
    return response.data;
  },

  createPost: async (data: {
    title: string;
    content: string;
    category: string;
    tags?: string[];
  }): Promise<CommunityPost> => {
    const response = await api.post<CommunityPost>('/api/community/posts', data);
    return response.data;
  },

  updatePost: async (postId: string, data: {
    title?: string;
    content?: string;
    category?: string;
    tags?: string[];
    is_solved?: boolean;
  }): Promise<CommunityPost> => {
    const response = await api.put<CommunityPost>(`/api/community/posts/${postId}`, data);
    return response.data;
  },

  deletePost: async (postId: string): Promise<void> => {
    await api.delete(`/api/community/posts/${postId}`);
  },

  togglePostLike: async (postId: string): Promise<{ liked: boolean; likes_count: number }> => {
    const response = await api.post<{ liked: boolean; likes_count: number }>(`/api/community/posts/${postId}/like`);
    return response.data;
  },

  getReplies: async (postId: string): Promise<CommunityReply[]> => {
    const response = await api.get<CommunityReply[]>(`/api/community/posts/${postId}/replies`);
    return response.data;
  },

  createReply: async (postId: string, content: string): Promise<CommunityReply> => {
    const response = await api.post<CommunityReply>(`/api/community/posts/${postId}/replies`, { content });
    return response.data;
  },

  toggleReplyLike: async (replyId: string): Promise<{ liked: boolean; likes_count: number }> => {
    const response = await api.post<{ liked: boolean; likes_count: number }>(`/api/community/replies/${replyId}/like`);
    return response.data;
  },
};

export const publicAPI = {
  joinBetaWaitlist: async (email: string): Promise<{ message: string; success: boolean }> => {
    const response = await api.post<{ message: string; success: boolean }>('/api/public/beta-waitlist', { email });
    return response.data;
  },

  getWaitlistCount: async (): Promise<{ count: number }> => {
    const response = await api.get<{ count: number }>('/api/public/beta-waitlist');
    return response.data;
  },
};

export interface AdminStats {
  total_users: number;
  active_users: number;
  total_waitlist: number;
  waitlist_notified: number;
  total_posts: number;
  total_replies: number;
  users_last_7_days: number;
  users_last_30_days: number;
  posts_last_7_days: number;
  users_with_downloads: number;
}

export interface BetaWaitlistEntry {
  id: string;
  email: string;
  created_at: string;
  notified: boolean;
  notified_at: string | null;
}

export const adminAPI = {
  getStats: async (): Promise<AdminStats> => {
    const response = await api.get<AdminStats>('/api/admin/stats');
    return response.data;
  },

  getWaitlist: async (skip?: number, limit?: number): Promise<BetaWaitlistEntry[]> => {
    const queryParams = new URLSearchParams();
    if (skip) queryParams.append('skip', skip.toString());
    if (limit) queryParams.append('limit', limit.toString());
    const response = await api.get<BetaWaitlistEntry[]>(`/api/admin/waitlist?${queryParams.toString()}`);
    return response.data;
  },

  getUsers: async (skip?: number, limit?: number): Promise<User[]> => {
    const queryParams = new URLSearchParams();
    if (skip) queryParams.append('skip', skip.toString());
    if (limit) queryParams.append('limit', limit.toString());
    const response = await api.get<User[]>(`/api/admin/users?${queryParams.toString()}`);
    return response.data;
  },

  getBetaPassword: async (): Promise<{ password: string }> => {
    const response = await api.get<{ password: string }>('/api/admin/beta-password');
    return response.data;
  },

  updateBetaPassword: async (password: string): Promise<{ message: string; password: string }> => {
    const response = await api.put<{ message: string; password: string }>('/api/admin/beta-password', { 
      password: password 
    });
    return response.data;
  },
};

export interface App {
  id: string;
  name: string;
  description: string;
  version: string;
  packageName: string;
  downloadUrl: string;
  iconUrl?: string;
  category: string;
  isEssential: boolean;
  build?: number;
}

export interface AppListResponse {
  apps: App[];
  lastUpdated: string;
}

export interface AppCreateData {
  name: string;
  description: string;
  version: string;
  package_name: string;
  category?: string;
  icon_url?: string;
  is_essential?: boolean;
}

export interface AppUpdateData {
  name?: string;
  description?: string;
  version?: string;
  package_name?: string;
  category?: string;
  icon_url?: string;
  is_essential?: boolean;
}

export const appManagementAPI = {
  uploadApp: async (file: File, data: AppCreateData): Promise<{ message: string; app: App }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('version', data.version);
    formData.append('package_name', data.package_name);
    formData.append('category', data.category || 'Other');
    if (data.icon_url) formData.append('icon_url', data.icon_url);
    formData.append('is_essential', (data.is_essential || false).toString());

    const response = await api.post<{ message: string; app: App }>('/api/admin/apps/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getApps: async (): Promise<AppListResponse> => {
    const response = await api.get<AppListResponse>('/api/admin/apps/list');
    return response.data;
  },

  updateApp: async (appId: string, data: AppUpdateData): Promise<{ message: string; app: App }> => {
    const response = await api.put<{ message: string; app: App }>(`/api/admin/apps/${appId}`, data);
    return response.data;
  },

  deleteApp: async (appId: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/api/admin/apps/${appId}`);
    return response.data;
  },
};

export default api;

