/**
 * 云同步服务 — 将本地 IndexedDB 数据同步到 Supabase
 * 策略：双向同步，后写入者覆盖
 */
import { getSupabase, checkSupabaseConnection as checkConn } from './supabaseAuthLazy';

/** 需要同步的 store 定义 */
interface SyncStore<T> {
  name: string;
  tableName: string;
  getAll: () => Promise<T[]>;
  putItem: (item: T) => Promise<void>;
}

/** 注册所有要同步的 store */
const syncStores: SyncStore<any>[] = [];

export function registerSyncStore<T>(
  name: string,
  tableName: string,
  getAll: () => Promise<T[]>,
  putItem: (item: T) => Promise<void>,
) {
  syncStores.push({ name, tableName, getAll, putItem });
}

/** 从 Supabase 拉取数据 */
export async function pullFromCloud(store: SyncStore<any>): Promise<number> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from(store.tableName)
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) throw new Error(`拉取 ${store.name} 失败: ${error.message}`);
  if (!data || data.length === 0) return 0;

  for (const row of data) {
    await store.putItem(row.data);
  }
  return data.length;
}

/** 推送数据到 Supabase */
export async function pushToCloud(store: SyncStore<any>): Promise<number> {
  const items = await store.getAll();
  if (items.length === 0) return 0;

  const supabase = await getSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) throw new Error('请先登录后再同步');

  const now = new Date().toISOString();
  const rows = items.map((item: any) => ({
    id: item.id,
    data: item,
    user_id: userId,
    updated_at: now,
  }));

  const { error } = await supabase
    .from(store.tableName)
    .upsert(rows, { onConflict: 'id' });

  if (error) throw new Error(`推送 ${store.name} 失败: ${error.message}`);
  return rows.length;
}

/** 全量同步：先推后拉 */
export async function syncAll(
  onProgress?: (msg: string) => void,
): Promise<{ pushed: number; pulled: number }> {
  let totalPushed = 0;
  let totalPulled = 0;

  for (const store of syncStores) {
    onProgress?.(`同步 ${store.name}...`);
    const pushed = await pushToCloud(store);
    totalPushed += pushed;
    const pulled = await pullFromCloud(store);
    totalPulled += pulled;
  }

  return { pushed: totalPushed, pulled: totalPulled };
}

/** 检查 Supabase 连接状态 */
export async function checkConnection(): Promise<boolean> {
  return checkConn();
}

export { type SyncStore };
