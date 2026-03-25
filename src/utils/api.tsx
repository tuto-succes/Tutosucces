// API utility for communicating with Supabase backend
import { projectId, publicAnonKey } from './supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-385c5805`;

// Helper to get access token from localStorage
function getAccessToken(): string | null {
  return localStorage.getItem('access_token');
}

// Helper to make authenticated requests
async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const token = getAccessToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : `Bearer ${publicAnonKey}`,
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  } catch (error: any) {
    // Better error handling for network issues
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      console.error('❌ Erreur de connexion au serveur:', error);
      console.error('URL tentée:', `${API_BASE_URL}${endpoint}`);
      console.error('Vérifiez que le serveur Edge Function est déployé.');
      throw new Error('Impossible de contacter le serveur. Vérifiez que le serveur Supabase est déployé et accessible.');
    }
    throw error;
  }
}

// ============================================================================
// AUTH API
// ============================================================================

export const auth = {
  async login(email: string, password: string) {
    const data = await apiRequest('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Store token in localStorage
    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
    }
    
    return data;
  },

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('currentUser');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  },

  async getProfile() {
    return apiRequest('/profile');
  },
};

// ============================================================================
// USER API
// ============================================================================

export const users = {
  async getById(userId: string) {
    return apiRequest(`/users/${userId}`);
  },

  async update(userId: string, updates: any) {
    return apiRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async getAll() {
    return apiRequest('/users');
  },
};

// ============================================================================
// TUTOR API
// ============================================================================

export const tutors = {
  async getAll(filters?: { subject?: string; level?: string; mode?: string }) {
    const params = new URLSearchParams();
    if (filters?.subject) params.append('subject', filters.subject);
    if (filters?.level) params.append('level', filters.level);
    if (filters?.mode) params.append('mode', filters.mode);
    
    const query = params.toString();
    return apiRequest(`/tutors${query ? `?${query}` : ''}`);
  },

  async getAvailability(tutorId: string) {
    return apiRequest(`/tutors/${tutorId}/availability`);
  },

  async updateAvailability(tutorId: string, availability: any) {
    return apiRequest(`/tutors/${tutorId}/availability`, {
      method: 'PUT',
      body: JSON.stringify(availability),
    });
  },
};

// ============================================================================
// SESSION API
// ============================================================================

export const sessions = {
  async getAll(filters?: { status?: string }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    
    const query = params.toString();
    return apiRequest(`/sessions${query ? `?${query}` : ''}`);
  },

  async create(sessionData: any) {
    return apiRequest('/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  },

  async update(sessionId: string, updates: any) {
    return apiRequest(`/sessions/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
};

// ============================================================================
// MESSAGE API
// ============================================================================

export const messages = {
  async getAll(withUserId?: string) {
    const params = new URLSearchParams();
    if (withUserId) params.append('with', withUserId);
    
    const query = params.toString();
    return apiRequest(`/messages${query ? `?${query}` : ''}`);
  },

  async send(recipientId: string, content: string, conversationId?: string) {
    return apiRequest('/messages', {
      method: 'POST',
      body: JSON.stringify({ recipientId, content, conversationId }),
    });
  },

  async markAsRead(messageId: string) {
    return apiRequest(`/messages/${messageId}/read`, {
      method: 'PUT',
    });
  },
};

// ============================================================================
// PAYMENT API
// ============================================================================

export const payments = {
  async getAll() {
    return apiRequest('/payments');
  },

  async create(paymentData: any) {
    return apiRequest('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },
};

// ============================================================================
// INVOICE API
// ============================================================================

export const invoices = {
  async getAll() {
    return apiRequest('/invoices');
  },
};

// ============================================================================
// PROGRESS REPORT API
// ============================================================================

export const progressReports = {
  async getAll() {
    return apiRequest('/progress-reports');
  },

  async create(reportData: any) {
    return apiRequest('/progress-reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  },
};

// ============================================================================
// CONTACT API
// ============================================================================

export const contact = {
  async submit(data: { firstName: string; lastName: string; email: string; phone?: string; message: string }) {
    return apiRequest('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getMessages() {
    return apiRequest('/contact-messages');
  },
};

// ============================================================================
// STATS API (Admin only)
// ============================================================================

export const stats = {
  async getAll() {
    return apiRequest('/stats');
  },
};

// ============================================================================
// HEALTH CHECK
// ============================================================================

export async function healthCheck() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  } catch (error) {
    console.error('Health check failed:', error);
    return { status: 'error', error };
  }
}