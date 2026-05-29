import { registerSyncStore } from './syncService';
import { getAll, putItem } from './db';

/** 注册所有数据 store 到同步服务 */
export function initSyncStores() {
  // 活动库
  registerSyncStore('活动库', 'activities', () => getAll('activities'), (item) => putItem('activities', item));

  // 长者信息
  registerSyncStore('长者信息', 'elderly', () => getAll('elderly'), (item) => putItem('elderly', item));

  // 长者分组
  registerSyncStore('长者分组', 'elderly_groups', () => getAll('elderlyGroups'), (item) => putItem('elderlyGroups', item));

  // 周计划
  registerSyncStore('周计划', 'weekly_plans', () => getAll('weeklyPlans'), (item) => putItem('weeklyPlans', item));

  // 周计划单元格
  registerSyncStore('周计划单元格', 'weekly_plan_cells', () => getAll('weeklyPlanCells'), (item) => putItem('weeklyPlanCells', item));

  // 活动记录
  registerSyncStore('活动记录', 'activity_records', () => getAll('activityRecords'), (item) => putItem('activityRecords', item));

  // 设置
  registerSyncStore('设置', 'settings', () => getAll('settings'), (item) => putItem('settings', item));
}
