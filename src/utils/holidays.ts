/**
 * 固定日期节日/纪念日列表
 * 
 * 农历节日需要额外计算，此处暂只包含公历固定日期节日
 */

export interface Holiday {
  month: number;  // 1-12
  day: number;
  name: string;
  /** 节日类型：traditional=传统, national=法定, international=国际, other=其他 */
  type: 'traditional' | 'national' | 'international' | 'other' | 'solar_term';
}

/**
 * 固定公历节日列表
 */
const FIXED_HOLIDAYS: Holiday[] = [
  { month: 1, day: 1, name: '元旦', type: 'national' },
  { month: 2, day: 14, name: '情人节', type: 'international' },
  { month: 3, day: 8, name: '妇女节', type: 'international' },
  { month: 3, day: 12, name: '植树节', type: 'other' },
  { month: 4, day: 1, name: '愚人节', type: 'international' },
  { month: 5, day: 1, name: '劳动节', type: 'national' },
  { month: 5, day: 4, name: '青年节', type: 'other' },
  { month: 5, day: 12, name: '护士节', type: 'international' },
  { month: 6, day: 1, name: '儿童节', type: 'international' },
  { month: 7, day: 1, name: '建党节', type: 'national' },
  { month: 8, day: 1, name: '建军节', type: 'national' },
  { month: 9, day: 10, name: '教师节', type: 'other' },
  { month: 10, day: 1, name: '国庆节', type: 'national' },
  { month: 12, day: 25, name: '圣诞节', type: 'international' },
];

/**
 * 获取指定年月的节日列表（按日期分组）
 * 返回 Map<日期, 节日名[]>
 */
export function getMonthlyHolidays(year: number, month: number): Map<number, Holiday[]> {
  const result = new Map<number, Holiday[]>();

  for (const h of FIXED_HOLIDAYS) {
    if (h.month === month) {
      const list = result.get(h.day) || [];
      list.push(h);
      result.set(h.day, list);
    }
  }

  return result;
}
