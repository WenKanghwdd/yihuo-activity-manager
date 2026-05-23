import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase } from './supabaseClient';
import type { Session, User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ error?: string }>;
  updateProfile: (data: { email?: string; username?: string }) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  session: null,
  loading: true,
  signUp: async () => ({}),
  signIn: async () => ({}),
  signOut: async () => {},
  resetPassword: async () => ({}),
  updatePassword: async () => ({}),
  updateProfile: async () => ({}),
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    // 加超时：5秒内连不上 Supabase 就不等了
    const timer = setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 5000);

    // 检查当前会话
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (!cancelled) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          clearTimeout(timer);
        }
      })
      .catch(() => {
        // 网络错误：直接跳过，无用户状态
        if (!cancelled) {
          setLoading(false);
          clearTimeout(timer);
        }
      });

    // 监听登录状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled) {
        setSession(session);
        setUser(session?.user ?? null);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      return { error: error?.message };
    } catch (e: any) {
      return { error: e.message || '网络错误，请检查网络连接' };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error?.message };
    } catch (e: any) {
      return { error: e.message || '网络错误，请检查网络连接' };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/#/auth',
      });
      return { error: error?.message };
    } catch (e: any) {
      return { error: e.message || '网络错误' };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      return { error: error?.message };
    } catch (e: any) {
      return { error: e.message || '网络错误' };
    }
  };

  const updateProfile = async (data: { email?: string; username?: string }) => {
    try {
      const updates: any = {};
      if (data.email) updates.email = data.email;
      if (data.username) updates.data = { ...user?.user_metadata, username: data.username };

      const { error } = await supabase.auth.updateUser(updates);
      if (error) return { error: error.message };

      // 刷新本地用户信息
      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      if (updatedUser) setUser(updatedUser);

      return {};
    } catch (e: any) {
      return { error: e.message || '网络错误' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut, resetPassword, updatePassword, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
