import { Database } from './types';

class SupabaseQueryBuilder {
  private table: string;
  private action: 'select' | 'insert' | 'update' | 'delete' = 'select';
  private filter: { column: string; value: any } | null = null;
  private sort: { column: string; ascending: boolean } | null = null;
  private limitCount: number | null = null;
  private singleResult: boolean = false;
  private payload: any = null;

  constructor(table: string) {
    this.table = table;
  }

  select(columns?: string) {
    this.action = 'select';
    return this;
  }

  insert(data: any) {
    this.action = 'insert';
    this.payload = data;
    return this;
  }

  update(data: any) {
    this.action = 'update';
    this.payload = data;
    return this;
  }

  delete() {
    this.action = 'delete';
    return this;
  }

  eq(column: string, value: any) {
    this.filter = { column, value };
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.sort = { column, ascending: options?.ascending !== false };
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.singleResult = true;
    return this;
  }

  maybeSingle() {
    this.singleResult = true;
    return this;
  }

  async then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    try {
      const response = await fetch('/api/db/' + this.table, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('cf-access-token') || ''}`,
        },
        body: JSON.stringify({
          action: this.action,
          filter: this.filter,
          sort: this.sort,
          limit: this.limitCount,
          single: this.singleResult,
          payload: this.payload,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Database request failed');
      }

      const result = await response.json();
      const resolvedValue = { data: result.data, error: null };
      return onfulfilled ? onfulfilled(resolvedValue) : resolvedValue;
    } catch (err: any) {
      const resolvedValue = { data: null, error: { message: err.message } };
      return onfulfilled ? onfulfilled(resolvedValue) : resolvedValue;
    }
  }
}

const authListeners = new Set<(event: string, session: any) => void>();

export const supabase = {
  auth: {
    async signUp({ email, password, options }: any) {
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, fullName: options?.data?.full_name }),
        });
        const data = await res.json();
        if (!res.ok) return { data: null, error: { message: data.message || 'Registration failed' } };
        
        localStorage.setItem('cf-access-token', data.accessToken);
        localStorage.setItem('cf-refresh-token', data.refreshToken);
        
        const user = data.user;
        const session = { access_token: data.accessToken, refresh_token: data.refreshToken, user };
        
        authListeners.forEach(cb => cb('SIGNED_IN', session));
        return { data: { user, session }, error: null };
      } catch (err: any) {
        return { data: null, error: { message: err.message } };
      }
    },

    async signInWithPassword({ email, password }: any) {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) return { data: null, error: { message: data.message || 'Login failed' } };
        
        localStorage.setItem('cf-access-token', data.accessToken);
        localStorage.setItem('cf-refresh-token', data.refreshToken);
        
        const user = data.user;
        const session = { access_token: data.accessToken, refresh_token: data.refreshToken, user };
        
        authListeners.forEach(cb => cb('SIGNED_IN', session));
        return { data: { user, session }, error: null };
      } catch (err: any) {
        return { data: null, error: { message: err.message } };
      }
    },

    async signOut() {
      try {
        const refreshToken = localStorage.getItem('cf-refresh-token');
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
      } catch (err) {}
      localStorage.removeItem('cf-access-token');
      localStorage.removeItem('cf-refresh-token');
      authListeners.forEach(cb => cb('SIGNED_OUT', null));
      return { error: null };
    },

    async getUser() {
      try {
        const token = localStorage.getItem('cf-access-token');
        if (!token) return { data: { user: null }, error: new Error('No access token') };
        
        const res = await fetch('/api/auth/user', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) {
          // Try to refresh token
          const refreshRes = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: localStorage.getItem('cf-refresh-token') }),
          });
          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            localStorage.setItem('cf-access-token', refreshData.accessToken);
            localStorage.setItem('cf-refresh-token', refreshData.refreshToken);
            
            // Retry getUser
            const retryRes = await fetch('/api/auth/user', {
              headers: { 'Authorization': `Bearer ${refreshData.accessToken}` }
            });
            const retryData = await retryRes.json();
            if (retryRes.ok) {
              return { data: { user: retryData.user }, error: null };
            }
          }
          return { data: { user: null }, error: new Error('User fetch failed') };
        }
        return { data: { user: data.user }, error: null };
      } catch (err: any) {
        return { data: { user: null }, error: err };
      }
    },

    async getSession() {
      const token = localStorage.getItem('cf-access-token');
      try {
        const userRes = await this.getUser();
        return {
          data: {
            session: token && userRes.data?.user ? { access_token: token, user: userRes.data.user } : null
          },
          error: null
        };
      } catch (err) {
        return { data: { session: null }, error: err };
      }
    },

    async resetPasswordForEmail(email: string, options?: any) {
      try {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, redirectTo: options?.redirectTo }),
        });
        const data = await res.json();
        if (!res.ok) return { error: { message: data.message || 'Forgot password request failed' } };
        return { error: null };
      } catch (err: any) {
        return { error: err };
      }
    },

    async updateUser({ password }: any) {
      try {
        const token = localStorage.getItem('cf-access-token');
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ password }),
        });
        const data = await res.json();
        if (!res.ok) return { error: { message: data.message || 'Reset password failed' } };
        return { error: null };
      } catch (err: any) {
        return { error: err };
      }
    },

    onAuthStateChange(callback: any) {
      authListeners.add(callback);
      // Immediately run with current status
      this.getUser().then(({ data }) => {
        if (data?.user) {
          const session = { access_token: localStorage.getItem('cf-access-token'), user: data.user };
          callback('SIGNED_IN', session);
        } else {
          callback('SIGNED_OUT', null);
        }
      });
      return {
        data: {
          subscription: {
            unsubscribe() {
              authListeners.delete(callback);
            }
          }
        }
      };
    }
  },
  from(table: string) {
    return new SupabaseQueryBuilder(table);
  }
} as any;
