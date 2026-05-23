/**
 * Supabase 客户端（懒加载）
 * 只在调用时初始化，不阻塞主应用启动
 */
export { getSupabase, getSession, checkSupabaseConnection } from './supabaseAuthLazy';
