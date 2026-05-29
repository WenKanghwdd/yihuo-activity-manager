/**
 * 二十四节气计算工具
 * 基于公式：day = floor(year * 0.2422 + C) - floor((year - 1) / 4) （上半年）
 *        day = floor(year * 0.2422 + C) - floor(year / 4)       （下半年）
 * 其中 year 取后两位，精度 ±1 天（1900-2100 年可用）
 */

const TERM_NAMES = [
  '小寒', '大寒', '立春', '雨水', '惊蛰', '春分',
  '清明', '谷雨', '立夏', '小满', '芒种', '夏至',
  '小暑', '大暑', '立秋', '处暑', '白露', '秋分',
  '寒露', '霜降', '立冬', '小雪', '大雪', '冬至',
];

const TERM_MONTHS = [
  1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6,
  7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12,
];

/** C 常量（适用于 1900-2100 年） */
const C_VALUES = [
  5.4055, 20.12, 3.87, 18.73, 5.63, 20.646,
  4.81, 20.10, 5.52, 21.04, 5.678, 21.37,
  6.58, 22.26, 7.71, 23.34, 7.85, 23.61,
  7.10, 22.82, 7.60, 22.93, 7.55, 22.80,
];

export interface SolarTerm {
  month: number;
  day: number;
  name: string;
}

/**
 * 获取指定年份的全部 24 个节气
 */
export function getSolarTerms(year: number): SolarTerm[] {
  const Y = year % 100;
  const results: SolarTerm[] = [];

  for (let i = 0; i < 24; i++) {
    let day: number;
    if (i < 12) {
      // 上半年（月份 1-6）
      day = Math.floor(Y * 0.2422 + C_VALUES[i]) - Math.floor((Y - 1) / 4);
    } else {
      // 下半年（月份 7-12）
      day = Math.floor(Y * 0.2422 + C_VALUES[i]) - Math.floor(Y / 4);
    }
    results.push({ month: TERM_MONTHS[i], day, name: TERM_NAMES[i] });
  }
  return results;
}

/**
 * 获取指定年月中每一天的节气名（没有节气的日期返回 null）
 */
export function getDailySolarTerms(year: number, month: number): Map<number, string> {
  const terms = getSolarTerms(year);
  const map = new Map<number, string>();

  for (const t of terms) {
    if (t.month === month) {
      map.set(t.day, t.name);
    }
  }

  return map;
}
