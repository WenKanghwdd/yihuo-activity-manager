import { useState, useEffect, useCallback } from 'react';

/**
 * 懒加载 Auth Hook — 不阻塞主应用启动
 * 轻量状态管理，只在需要时初始化 Supabase
 */
export function useLazyAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => { if (!cancelled) setLoading(false); }, 3000);

    import('../supabaseAuthLazy').then(async (auth) => {
      if (cancelled) return;
      const session = await auth.getSession();
      if (!cancelled) {
        setUser(session?.user ?? null);
        setLoading(false);
        clearTimeout(timer);
      }
    }).catch(() => {
      if (!cancelled) { setLoading(false); clearTimeout(timer); }
    });

    return () => { cancelled = true; clearTimeout(timer); };
  }, []);

  const signOut = useCallback(async () => {
    const auth = await import('../supabaseAuthLazy');
    await auth.signOut();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data: { username?: string }) => {
    const auth = await import('../supabaseAuthLazy');
    const result = await auth.updateProfile(data);
    if (!result.error) {
      const session = await auth.getSession();
      setUser(session?.user ?? null);
    }
    return result;
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    const auth = await import('../supabaseAuthLazy');
    return auth.updatePassword(newPassword);
  }, []);

  return { user, loading, signOut, updateProfile, updatePassword };
}
