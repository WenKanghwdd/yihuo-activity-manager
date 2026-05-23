/**
 * 懒加载 Supabase Auth — 只在需要时创建客户端
 * 避免主应用启动时因 Supabase 连接不上而白屏
 */
let _supabase: any = null;

export async function getSupabase() {
  if (_supabase) return _supabase;
  const { createClient } = await import('@supabase/supabase-js');
  _supabase = createClient(
    'https://uydyblzlphwnqsfkiuwj.supabase.co',
    'sb_publishable_APgaDyF0QGeymCU9eFR7fQ_45HE9QZp'
  );
  return _supabase;
}

let _cachedSession: any = null;

export async function getSession() {
  try {
    const supabase = await getSupabase();
    const { data } = await supabase.auth.getSession();
    _cachedSession = data.session;
    return data.session;
  } catch {
    return null;
  }
}

export async function signUp(email: string, password: string) {
  const supabase = await getSupabase();
  const { error } = await supabase.auth.signUp({ email, password });
  return { error: error?.message };
}

export async function signIn(email: string, password: string) {
  const supabase = await getSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error: error?.message };
}

export async function signOut() {
  const supabase = await getSupabase();
  await supabase.auth.signOut();
  _cachedSession = null;
}

export async function resetPassword(email: string) {
  const supabase = await getSupabase();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: (typeof window !== 'undefined' ? window.location.origin : '') + '/#/auth',
  });
  return { error: error?.message };
}

export async function updatePassword(newPassword: string) {
  const supabase = await getSupabase();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  return { error: error?.message };
}

export async function updateProfile(data: { email?: string; username?: string }) {
  const supabase = await getSupabase();
  try {
    const updates: any = {};
    if (data.email) updates.email = data.email;
    if (data.username) updates.data = { username: data.username };
    const { error } = await supabase.auth.updateUser(updates);
    if (error) return { error: error.message };
    return {};
  } catch (e: any) {
    return { error: e.message };
  }
}

/** 检查 Supabase API 可访问性 */
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch('https://uydyblzlphwnqsfkiuwj.supabase.co/auth/v1/settings', {
      signal: controller.signal,
    });
    clearTimeout(timer);
    return true;
  } catch {
    return false;
  }
}
