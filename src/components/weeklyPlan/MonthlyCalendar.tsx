import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import type { ThemeConfig } from '../../types';
import type { Holiday } from '../../utils/holidays';

interface MonthlyCalendarProps {
  year: number;
  month: number; // 1-12
  theme: ThemeConfig;
  activities: Record<string, string[]>;
  solarTerms: Map<number, string>;
  holidays: Map<number, Holiday[]>;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

const WEEKDAY_HEADERS = ['日', '一', '二', '三', '四', '五', '六'];
const MONTH_NAMES = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];

const FONT_FAMILY = 'PingFang SC,Microsoft YaHei,Noto Sans SC,sans-serif';

export default function MonthlyCalendar({
  year, month, theme, activities, solarTerms, holidays,
  onPrevMonth, onNextMonth, onToday,
}: MonthlyCalendarProps) {
  const firstDay = new Date(year, month - 1, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const cells: Array<{ day: number | null }> = [];
  for (let i = 0; i < startWeekday; i++) cells.push({ day: null });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d });

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;

  const dateKey = (d: number) =>
    `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const cellStyle = (isToday: boolean): React.CSSProperties => ({
    minHeight: '140px', padding: '6px',
    border: isToday ? '2px solid ' + theme.accent : '1px solid ' + theme.border,
    backgroundColor: isToday ? theme.bg : theme.cellBg,
    outline: isToday ? '2px solid ' + theme.accent : 'none',
    outlineOffset: '-3px',
  });

  return (
    <div className="w-full">
      {/* 月份导航 */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <button onClick={onPrevMonth}
          className="p-1.5 rounded hover:bg-warm-100 text-warm-500 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-[29px] font-black select-none"
          style={{ fontFamily: FONT_FAMILY, color: theme.headerBg }}>
          {year}年{MONTH_NAMES[month - 1]}
        </span>
        <button onClick={onNextMonth}
          className="p-1.5 rounded hover:bg-warm-100 text-warm-500 transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
        <button onClick={onToday}
          className="ml-2 flex items-center gap-1 px-3 py-1.5 text-[18px] text-warm-600 bg-white border border-warm-200 rounded-lg hover:bg-warm-50 transition-colors">
          <Calendar className="w-4 h-4" /> 今天
        </button>
      </div>

      {/* 星期表头 */}
      <div className="grid grid-cols-7">
        {WEEKDAY_HEADERS.map((name) => (
          <div key={name} className="text-center text-[24px] font-bold py-3"
            style={{
              color: theme.accent,
              border: '1px solid ' + theme.border,
              backgroundColor: theme.headerBg + '15',
            }}>
            {name}
          </div>
        ))}
      </div>

      {/* 日期网格 */}
      <div className="grid grid-cols-7">
        {cells.map((cell, idx) => {
          if (cell.day === null) {
            return (
              <div key={`e-${idx}`} style={{
                minHeight: '140px',
                border: '1px solid ' + theme.border,
                backgroundColor: theme.bg + '60',
              }} />
            );
          }

          const d = cell.day;
          const termName = solarTerms.get(d) || null;
          const dayActivities = activities[dateKey(d)] || [];
          const todayFlag = isCurrentMonth && d === today.getDate();

          return (
            <div key={d}
              style={cellStyle(todayFlag)}
            >
              {/* 号数 + 节气 + 节日 */}
              <div className="flex flex-col items-start gap-0.5 mb-1">
                <div className="flex items-center gap-1 flex-wrap">
                  <span style={{
                    fontSize: '24px', fontWeight: 'bold', lineHeight: '1.3',
                    color: todayFlag ? theme.accent : theme.cellText,
                  }}>
                    {d}
                  </span>
                  {termName && (
                    <span className="text-[19px] text-green-600 font-medium leading-tight whitespace-nowrap">
                      {termName}
                    </span>
                  )}
                </div>
                {(() => {
                  const dayHolidays = holidays.get(d) || [];
                  if (dayHolidays.length === 0) return null;
                  return (
                    <div className="flex flex-wrap gap-1">
                      {dayHolidays.map((h, hi) => (
                        <span key={hi}
                          className={`text-[16px] font-medium leading-tight px-1.5 py-0.5 rounded ${
                            h.type === 'national'
                              ? 'text-red-600 bg-red-50'
                              : h.type === 'traditional'
                              ? 'text-rose-700 bg-rose-50'
                              : 'text-orange-600 bg-orange-50'
                          }`}>
                          {h.name}
                        </span>
                      ))}
                    </div>
                  );
                })()}
              </div>
              {/* 活动名称 */}
              {dayActivities.length > 0 && (
                <div className="space-y-1 mt-1">
                  {dayActivities.slice(0, 3).map((name, ai) => (
                    <div key={ai}
                      className="text-[18px] leading-snug px-2 py-1 rounded text-center"
                      style={{
                        backgroundColor: '#fef3c7',
                        color: '#92400e',
                      }}
                      title={name}>
                      {name}
                    </div>
                  ))}
                  {dayActivities.length > 3 && (
                    <div className="text-[17px] text-warm-400 text-center">
                      +{dayActivities.length - 3}项
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
