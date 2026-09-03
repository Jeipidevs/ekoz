import {
  User,
  Post,
  ThematicCore,
  MarketplaceBusiness,
  Course,
  EventItem,
  ExperienceItem,
  ChatMessage,
  NotificationItem,
  AdminMember,
  AdminSubscription,
} from '../types';

const API_BASE =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    ? '/api/v1'
    : 'http://localhost:3001/api/v1');

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('ekoz_token');
    }
  }

  public setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('ekoz_token', token);
      } else {
        localStorage.removeItem('ekoz_token');
      }
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erro de comunicação com o servidor' }));
      throw new Error(errorData.error || `Erro HTTP ${response.status}`);
    }

    return response.json();
  }

  // --- Auth ---
  public async login(email: string, password: string): Promise<{ user: User; token: string; refreshToken: string }> {
    const data = await this.request<{ user: User; token: string; refreshToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  public async register(payload: any): Promise<{ user: User; token: string; refreshToken: string }> {
    const data = await this.request<{ user: User; token: string; refreshToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    this.setToken(data.token);
    return data;
  }

  public async getMe(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/me');
  }

  public logout(): void {
    this.setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ekoz_user');
    }
  }

  public async updateProfile(profile: Partial<User>): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  }

  // --- Users / Members ---
  public async listMembers(params?: { search?: string; role?: string; plan?: string }): Promise<User[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.role) query.append('role', params.role);
    if (params?.plan) query.append('plan', params.plan);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request<User[]>(`/users${queryString}`);
  }

  // --- Posts / Feed ---
  public async listPosts(category?: string): Promise<Post[]> {
    const query = category && category !== 'Todos' ? `?category=${encodeURIComponent(category)}` : '';
    return this.request<Post[]>(`/posts${query}`);
  }

  public async createPost(content: string, category: Post['category'], mediaUrl?: string): Promise<Post> {
    return this.request<Post>('/posts', {
      method: 'POST',
      body: JSON.stringify({ content, category, mediaUrl }),
    });
  }

  public async toggleLikePost(postId: string): Promise<{ liked: boolean; likesCount: number }> {
    return this.request<{ liked: boolean; likesCount: number }>(`/posts/${postId}/like`, {
      method: 'POST',
    });
  }

  public async addComment(postId: string, content: string): Promise<any> {
    return this.request<any>(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // --- Academy ---
  public async listCourses(): Promise<Course[]> {
    return this.request<Course[]>('/academy/courses');
  }

  public async toggleLessonProgress(lessonId: string): Promise<{ lessonId: string; completed: boolean }> {
    return this.request<{ lessonId: string; completed: boolean }>(`/academy/lessons/${lessonId}/progress`, {
      method: 'POST',
    });
  }

  // --- Marketplace ---
  public async listCores(): Promise<ThematicCore[]> {
    return this.request<ThematicCore[]>('/marketplace/cores');
  }

  public async listBusinesses(coreId?: string, search?: string): Promise<MarketplaceBusiness[]> {
    const query = new URLSearchParams();
    if (coreId && coreId !== 'all') query.append('coreId', coreId);
    if (search) query.append('search', search);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request<MarketplaceBusiness[]>(`/marketplace/businesses${queryString}`);
  }

  public async registerBusiness(payload: Omit<MarketplaceBusiness, 'id' | 'verified'>): Promise<MarketplaceBusiness> {
    return this.request<MarketplaceBusiness>('/marketplace/businesses', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // --- Events ---
  public async listEvents(): Promise<EventItem[]> {
    return this.request<EventItem[]>('/events');
  }

  public async toggleEventRegistration(eventId: string): Promise<{ eventId: string; isRegistered: boolean }> {
    return this.request<{ eventId: string; isRegistered: boolean }>(`/events/${eventId}/rsvp`, {
      method: 'POST',
    });
  }

  // --- Experiences ---
  public async listExperiences(): Promise<ExperienceItem[]> {
    return this.request<ExperienceItem[]>('/experiences');
  }

  public async applyForExperience(experienceId: string, notes?: string): Promise<{ message: string; applicationId: string }> {
    return this.request<{ message: string; applicationId: string }>(`/experiences/${experienceId}/apply`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  // --- Chat ---
  public async getMessages(partnerId: string): Promise<ChatMessage[]> {
    return this.request<ChatMessage[]>(`/chat/conversations/${partnerId}/messages`);
  }

  // --- Notifications ---
  public async listNotifications(): Promise<NotificationItem[]> {
    return this.request<NotificationItem[]>('/notifications');
  }

  public async markNotificationRead(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  }

  public async markAllNotificationsRead(): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/notifications/read-all', {
      method: 'PATCH',
    });
  }

  // --- WhatsApp Push ---
  public async sendWhatsAppPush(payload: { target: string; type: string; title: string; body: string; actionUrl?: string }): Promise<any> {
    return this.request<any>('/whatsapp/send-push', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // --- Admin: Membros ---
  public async adminListUsers(params?: { search?: string; role?: string; active?: boolean }): Promise<AdminMember[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.role) query.append('role', params.role);
    if (params?.active !== undefined) query.append('active', String(params.active));
    const data = await this.request<{ users: AdminMember[] }>(`/admin/users?${query.toString()}`);
    return data.users;
  }

  public async adminUpdateUserRole(userId: string, role: string): Promise<{ user: AdminMember }> {
    return this.request<{ user: AdminMember }>(`/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  public async adminUpdateUserActive(userId: string, active: boolean): Promise<{ user: AdminMember }> {
    return this.request<{ user: AdminMember }>(`/admin/users/${userId}/active`, {
      method: 'PATCH',
      body: JSON.stringify({ active }),
    });
  }

  public async adminListSubscriptions(status?: string): Promise<AdminSubscription[]> {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    const data = await this.request<{ subscriptions: AdminSubscription[] }>(`/admin/subscriptions${query}`);
    return data.subscriptions;
  }

  public async adminRevokeSubscription(subscriptionId: string): Promise<{ subscription: AdminSubscription }> {
    return this.request<{ subscription: AdminSubscription }>(`/admin/subscriptions/${subscriptionId}/revoke`, {
      method: 'PATCH',
    });
  }

  // --- Admin: Eventos ---
  public async adminCreateEvent(payload: Partial<EventItem>): Promise<any> {
    return this.request<any>('/admin/events', { method: 'POST', body: JSON.stringify(payload) });
  }

  public async adminUpdateEvent(eventId: string, payload: Partial<EventItem>): Promise<any> {
    return this.request<any>(`/admin/events/${eventId}`, { method: 'PUT', body: JSON.stringify(payload) });
  }

  public async adminDeleteEvent(eventId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/admin/events/${eventId}`, { method: 'DELETE' });
  }

  // --- Admin: Marketplace (núcleos) ---
  public async adminCreateCore(payload: { name: string; slug: string; icon?: string; description?: string }): Promise<any> {
    return this.request<any>('/admin/cores', { method: 'POST', body: JSON.stringify(payload) });
  }

  public async adminUpdateCore(coreId: string, payload: Partial<ThematicCore>): Promise<any> {
    return this.request<any>(`/admin/cores/${coreId}`, { method: 'PUT', body: JSON.stringify(payload) });
  }

  public async adminDeleteCore(coreId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/admin/cores/${coreId}`, { method: 'DELETE' });
  }

  // --- Admin: Marketplace (negócios) ---
  public async adminUpdateBusiness(businessId: string, payload: Partial<MarketplaceBusiness>): Promise<any> {
    return this.request<any>(`/admin/businesses/${businessId}`, { method: 'PUT', body: JSON.stringify(payload) });
  }

  public async adminDeleteBusiness(businessId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/admin/businesses/${businessId}`, { method: 'DELETE' });
  }

  // --- Admin: Moderação de posts ---
  public async togglePostPin(postId: string): Promise<{ pinned: boolean }> {
    return this.request<{ pinned: boolean }>(`/posts/${postId}/pin`, { method: 'PATCH' });
  }

  public async adminDeletePost(postId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/posts/${postId}`, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
