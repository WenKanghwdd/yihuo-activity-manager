/**
 * 数据持久化增强模块
 * - 请求浏览器持久存储权限（防止手机浏览器自动清除 IndexedDB）
 * - 自动备份 IndexedDB 数据到 localStorage（双重保险）
 * - 启动时检测数据丢失，自动从 localStorage 恢复
 */

const BACKUP_KEY = 'yuehuo_backup_v1';
const BACKUP_TIME_KEY = 'yuehuo_backup_time';

/** 请求持久存储权限 */
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (navigator.storage && navigator.storage.persist) {
      const isPersisted = await navigator.storage.persisted();
      if (!isPersisted) {
        const granted = await navigator.storage.persist();
        console.log(`[持久存储] ${granted ? '已授予 ✓' : '被拒绝 - 浏览器可能仍会清除数据'}`);
        return granted;
      }
      console.log('[持久存储] 已有持久权限 ✓');
      return true;
    }
  } catch (e) {
    console.warn('[持久存储] 请求失败:', e);
  }
  return false;
}

/** 获取所有 store 名称 */
const STORE_NAMES = [
  'activities',
  'weeklyPlans',
  'weeklyPlanCells',
  'elderly',
  'elderlyGroups',
  'activityRecords',
  'settings',
];

/** 备份 IndexedDB 全部数据到 localStorage */
export async function backupToLocalStorage(): Promise<void> {
  try {
    const { getAll } = await import('./db');
    const backup: Record<string, unknown[]> = {};

    for (const storeName of STORE_NAMES) {
      try {
        const data = await getAll<unknown>(storeName);
        if (data.length > 0) {
          backup[storeName] = data;
        }
      } catch {
        // store 可能不存在（比如首次加载），跳过
      }
    }

    const json = JSON.stringify(backup);
    localStorage.setItem(BACKUP_KEY, json);
    localStorage.setItem(BACKUP_TIME_KEY, Date.now().toString());
    console.log(`[备份] 已保存 ${json.length} 字节到 localStorage`);
  } catch (e) {
    console.warn('[备份] 写入 localStorage 失败:', e);
  }
}

/** 检查 localStorage 是否有可用备份 */
export function hasLocalBackup(): boolean {
  return !!localStorage.getItem(BACKUP_KEY);
}

/** 获取备份时间 */
export function getBackupTime(): Date | null {
  const t = localStorage.getItem(BACKUP_TIME_KEY);
  return t ? new Date(parseInt(t)) : null;
}

/** 从 localStorage 恢复数据到 IndexedDB */
export async function restoreFromLocalStorage(): Promise<boolean> {
  try {
    const json = localStorage.getItem(BACKUP_KEY);
    if (!json) return false;

    const backup = JSON.parse(json) as Record<string, unknown[]>;
    const { putItem } = await import('./db');
    let count = 0;

    for (const [storeName, items] of Object.entries(backup)) {
      if (Array.isArray(items)) {
        for (const item of items) {
          await putItem(storeName, item);
          count++;
        }
      }
    }

    console.log(`[恢复] 已从 localStorage 恢复 ${count} 条数据`);
    return true;
  } catch (e) {
    console.warn('[恢复] 从 localStorage 恢复失败:', e);
    return false;
  }
}

/** 设置自动备份（每次操作后延迟保存，避免频繁写入） */
let backupTimer: ReturnType<typeof setTimeout> | null = null;

export function scheduleBackup(delayMs = 2000): void {
  if (backupTimer) clearTimeout(backupTimer);
  backupTimer = setTimeout(() => {
    backupToLocalStorage();
    backupTimer = null;
  }, delayMs);
}

/** 初始化持久化系统 */
export async function initPersistence(): Promise<void> {
  // 1. 请求持久存储权限
  await requestPersistentStorage();

  // 2. 尝试检测数据丢失并恢复
  const { getAll } = await import('./db');
  try {
    // 随便拿一个 store 检查是否为空
    const activities = await getAll<unknown>('activities');
    const elderly = await getAll<unknown>('elderly');

    // 如果 IndexedDB 是空的，但 localStorage 有备份 → 自动恢复
    if (activities.length === 0 && elderly.length === 0 && hasLocalBackup()) {
      console.warn('[持久化] 检测到 IndexedDB 数据为空，正在从 localStorage 备份恢复...');
      await restoreFromLocalStorage();
      // 恢复后刷新页面数据
      window.location.reload();
    }
  } catch {
    // IndexedDB 可能还不可用，忽略
  }
}
