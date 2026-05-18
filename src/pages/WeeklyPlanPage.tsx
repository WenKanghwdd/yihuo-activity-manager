import { useEffect, useState, useRef, useCallback } from 'react';
import { Printer, Palette, X, Clock, Search } from 'lucide-react';
import { useWeeklyPlanStore } from '../store/weeklyPlanStore';
import { useThemeStore } from '../store/themeStore';
import { useActivityLibraryStore } from '../store/activityLibraryStore';
import { THEME_CONFIGS, WEEKDAY_NAMES } from '../types';
import type { ThemeType, WeeklyPlanCell, Activity, Weekday, SlotId } from '../types';
import { hasOutdoorKeyword } from '../utils/helpers';
import { useReactToPrint } from 'react-to-print';
import ActivityDetailModal from '../components/activityLibrary/ActivityDetailModal';

const SLOT_LABELS: Record<SlotId, string> = {
  morning: '上午',
  afternoon: '下午',
  evening: '晚上',
};

const SLOT_ORDER: SlotId[] = ['morning', 'afternoon', 'evening'];

export default function WeeklyPlanPage() {
  const { currentPlan, loaded, loading, loadOrCreatePlan, updateCell, setTheme, setTimeRange, clearCell, getDayTimeConfig } =
    useWeeklyPlanStore();
  const { currentTheme, setTheme: setAppTheme } = useThemeStore();
  const { activities, loaded: libLoaded, loadActivities } = useActivityLibraryStore();
  const printRef = useRef<HTMLDivElement>(null);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [pickSlot, setPickSlot] = useState<{ slotId: string; weekday: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [detailActivity, setDetailActivity] = useState<Activity | null>(null);
  const [showAllTimeEdit, setShowAllTimeEdit] = useState(false);
  const [allTimeValues, setAllTimeValues] = useState<Record<string, { start: string; end: string }>>({});
  const [editingTimeDay, setEditingTimeDay] = useState<number | null>(null);
  const [editingTimeSlot, setEditingTimeSlot] = useState<SlotId | null>(null);

  useEffect(() => {
    if (!libLoaded) loadActivities();
    loadOrCreatePlan();
  }, [loadOrCreatePlan, loadActivities, libLoaded]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    pageStyle: `@page { size: A4 landscape; margin: 8mm; }`,
  });

  const getCell = (slotId: string, weekday: number): WeeklyPlanCell | undefined => {
    return currentPlan?.cells[`${slotId}-${weekday}`];
  };

  const getActivityName = (cell?: WeeklyPlanCell): string => {
    if (cell?.customText) return cell.customText;
    if (cell?.activityId) {
      const act = activities.find((a) => a.id === cell.activityId);
      return act?.name || '';
    }
    return '';
  };

  const getActivity = (cell?: WeeklyPlanCell): Activity | undefined => {
    if (cell?.activityId) return activities.find((a) => a.id === cell.activityId);
    return undefined;
  };

  const handlePickActivity = (activity: Activity) => {
    if (!pickSlot) return;
    updateCell(pickSlot.slotId, pickSlot.weekday as Weekday, {
      activityId: activity.id,
      customText: '',
    });
    setPickSlot(null);
    setSearchQuery('');
  };

  const handleClearCell = (slotId: string, weekday: number) => {
    clearCell(slotId, weekday as Weekday);
  };

  const handleTimeChange = (weekday: number, slotId: SlotId, start: string, end: string) => {
    setTimeRange(weekday as Weekday, slotId, start, end);
  };

  const applyTimeToAll = (slotId: SlotId, start: string, end: string) => {
    for (let d = 1; d <= 7; d++) {
      setTimeRange(d as Weekday, slotId, start, end);
    }
    setShowAllTimeEdit(false);
  };

  const filteredActivities = activities.filter((a) => {
    if (!searchQuery) return true;
    return a.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const theme = THEME_CONFIGS[currentTheme];

  if (loading && !loaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-3 border-warm-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 no-print">
        <button
          onClick={() => setShowThemePicker(!showThemePicker)}
          className="flex items-center gap-1.5 px-3 py-2 bg-white border border-warm-200 rounded-lg hover:bg-warm-50 text-sm text-warm-700 transition-colors"
        >
          <Palette className="w-4 h-4" />
          风格模板
        </button>
        <button
          onClick={() => { setShowAllTimeEdit(true); }}
          className="flex items-center gap-1.5 px-3 py-2 bg-white border border-warm-200 rounded-lg hover:bg-warm-50 text-sm text-warm-700 transition-colors"
        >
          <Clock className="w-4 h-4" />
          统一设置时间
        </button>
        <div className="flex-1" />
        <select
          onChange={(e) => {
            const paperSize = e.target.value;
            handlePrint?.();
          }}
          className="px-3 py-2 border border-warm-200 rounded-lg text-sm text-warm-700 bg-white"
        >
          <option value="A4">A4 横向</option>
          <option value="A3">A3 横向</option>
        </select>
        <button
          onClick={() => handlePrint?.()}
          className="flex items-center gap-1.5 px-4 py-2 bg-warm-500 text-white rounded-lg hover:bg-warm-600 text-sm font-medium transition-colors"
        >
          <Printer className="w-4 h-4" />
          打印
        </button>
      </div>

      {/* Theme Picker */}
      {showThemePicker && (
        <div className="no-print bg-white rounded-xl border border-warm-100 p-4 shadow-sm">
          <h3 className="text-sm font-medium text-warm-700 mb-3">选择风格模板</h3>
          <div className="flex flex-wrap gap-2">
            {Object.values(THEME_CONFIGS).map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setTheme(t.key as ThemeType);
                  setAppTheme(t.key as ThemeType);
                  setShowThemePicker(false);
                }}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  currentTheme === t.key ? 'ring-2 ring-warm-500 font-medium' : 'hover:bg-warm-50'
                }`}
                style={{ backgroundColor: t.bg, color: t.cellText, borderColor: t.border }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Unified time editor */}
      {showAllTimeEdit && (
        <div className="no-print bg-white rounded-xl border border-warm-100 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-warm-700">统一设置所有时间</h3>
            <button onClick={() => setShowAllTimeEdit(false)} className="text-warm-400 hover:text-warm-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {SLOT_ORDER.map((slotId) => {
              const cfg = currentPlan?.timeConfig?.[1]?.[slotId] || { startTime: '08:00', endTime: '11:00' };
              return (
                <div key={slotId} className="flex items-center gap-3">
                  <span className="w-12 text-sm text-warm-700 font-medium">{SLOT_LABELS[slotId]}</span>
                  <input
                    type="time"
                    defaultValue={cfg.startTime}
                    onBlur={(e) => {
                      const endInput = document.getElementById(`all-${slotId}-end`) as HTMLInputElement;
                      if (endInput) applyTimeToAll(slotId, e.target.value, endInput.value);
                    }}
                    className="px-2 py-1.5 border border-warm-200 rounded-lg text-sm"
                  />
                  <span className="text-warm-400 text-sm">至</span>
                  <input
                    id={`all-${slotId}-end`}
                    type="time"
                    defaultValue={cfg.endTime}
                    onBlur={(e) => {
                      const startInput = document.getElementById(`all-${slotId}-start`) as HTMLInputElement;
                      if (startInput) applyTimeToAll(slotId, startInput.value, e.target.value);
                    }}
                    className="px-2 py-1.5 border border-warm-200 rounded-lg text-sm"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Weekly Plan Table */}
      <div ref={printRef} className="overflow-x-auto rounded-xl border" style={{ borderColor: theme.border }}>
        <table className="w-full min-w-[700px] border-collapse text-sm" style={{ backgroundColor: theme.bg }}>
          {/* Header */}
          <thead>
            <tr>
              <th
                className="sticky left-0 z-10 w-24 p-2 text-xs font-medium text-center border-r border-b"
                style={{ backgroundColor: theme.headerBg, color: theme.headerText, borderColor: theme.border }}
              >
                时段
              </th>
              {([1, 2, 3, 4, 5, 6, 7] as const).map((day) => (
                <th
                  key={day}
                  className="p-2 font-medium text-center text-xs border-b"
                  style={{ backgroundColor: theme.headerBg, color: theme.headerText, borderColor: theme.border }}
                >
                  {WEEKDAY_NAMES[day]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SLOT_ORDER.map((slotId) => (
              <tr key={slotId}>
                {/* Time slot label with inline time editor */}
                <td
                  className="sticky left-0 z-10 p-2 text-xs font-medium border-r border-b align-middle"
                  style={{ backgroundColor: theme.bg, color: theme.cellText, borderColor: theme.border }}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-semibold">{SLOT_LABELS[slotId]}</span>
                    <div className="no-print flex items-center gap-0.5">
                      {editingTimeSlot === slotId && editingTimeDay === 0 ? (
                        <div className="flex gap-0.5">
                          <input
                            type="time"
                            autoFocus
                            defaultValue={currentPlan?.timeConfig?.[1]?.[slotId]?.startTime || '08:00'}
                            className="w-14 text-[10px] p-0.5 border border-warm-300 rounded"
                            onChange={(e) => {
                              const end = (document.getElementById(`t-all-${slotId}`) as HTMLInputElement)?.value;
                              if (end) applyTimeToAll(slotId, e.target.value, end);
                            }}
                          />
                          <span className="text-[10px] text-warm-400">至</span>
                          <input
                            id={`t-all-${slotId}`}
                            type="time"
                            defaultValue={currentPlan?.timeConfig?.[1]?.[slotId]?.endTime || '11:00'}
                            className="w-14 text-[10px] p-0.5 border border-warm-300 rounded"
                            onChange={(e) => {
                              const start = (document.querySelector(`[data-start="${slotId}"]`) as HTMLInputElement)?.value;
                              if (start) applyTimeToAll(slotId, start, e.target.value);
                            }}
                          />
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTimeSlot(slotId);
                            setEditingTimeDay(0);
                          }}
                          className="text-[10px] text-warm-400 hover:text-warm-600 underline"
                        >
                          {currentPlan?.timeConfig?.[1]?.[slotId]?.startTime || '08:00'}-
                          {currentPlan?.timeConfig?.[1]?.[slotId]?.endTime || '11:00'}
                        </button>
                      )}
                    </div>
                  </div>
                </td>

                {([1, 2, 3, 4, 5, 6, 7] as const).map((day) => {
                  const cell = getCell(slotId, day);
                  const activityName = getActivityName(cell);
                  const act = getActivity(cell);
                  const outdoor = hasOutdoorKeyword(cell?.note || '') || hasOutdoorKeyword(activityName);
                  const dayTimeConfig = currentPlan?.timeConfig?.[day];
                  const timeRange = dayTimeConfig?.[slotId];

                  return (
                    <td
                      key={day}
                      className="relative p-2 border-b border-r align-top cursor-pointer hover:bg-warm-50/50 transition-colors min-h-[90px]"
                      style={{
                        backgroundColor: cell ? `${theme.cellBg}` : theme.cellBg,
                        color: theme.cellText,
                        borderColor: theme.border,
                      }}
                      onClick={() => {
                        setPickSlot({ slotId, weekday: day });
                        setSearchQuery('');
                      }}
                    >
                      {/* Per-day time editor */}
                      <div className="no-print mb-1">
                        {editingTimeSlot === slotId && editingTimeDay === day ? (
                          <div className="flex gap-0.5 items-center">
                            <input
                              type="time"
                              autoFocus
                              defaultValue={timeRange?.startTime || '08:00'}
                              className="w-14 text-[9px] p-0.5 border border-warm-300 rounded"
                              onBlur={(e) => {
                                const endEl = document.getElementById(`t-${slotId}-${day}`) as HTMLInputElement;
                                handleTimeChange(day, slotId, e.target.value, endEl?.value || '11:00');
                                setEditingTimeSlot(null);
                                setEditingTimeDay(null);
                              }}
                            />
                            <span className="text-[9px] text-warm-400">~</span>
                            <input
                              id={`t-${slotId}-${day}`}
                              type="time"
                              defaultValue={timeRange?.endTime || '11:00'}
                              className="w-14 text-[9px] p-0.5 border border-warm-300 rounded"
                              onBlur={(e) => {
                                const startEl = document.querySelector(`[data-start-edit="${slotId}-${day}"]`) as HTMLInputElement;
                                handleTimeChange(day, slotId, startEl?.value || '08:00', e.target.value);
                                setEditingTimeSlot(null);
                                setEditingTimeDay(null);
                              }}
                            />
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingTimeSlot(slotId);
                              setEditingTimeDay(day);
                            }}
                            className="text-[9px] text-warm-400 hover:text-warm-600 underline"
                          >
                            {timeRange?.startTime || '?'}~{timeRange?.endTime || '?'}
                          </button>
                        )}
                      </div>

                      {/* Image */}
                      {cell?.imageBase64 && (
                        <div className="mb-1">
                          <img src={cell.imageBase64} alt="活动图片" className="w-full h-16 object-cover rounded border" style={{ borderColor: theme.border }} />
                        </div>
                      )}

                      {/* Activity name (click to view detail) */}
                      {activityName && (
                        <div
                          className="text-sm font-medium mb-0.5"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (act) setDetailActivity(act);
                          }}
                        >
                          {activityName}
                        </div>
                      )}

                      {/* Note */}
                      {cell?.note && (
                        <div className={`text-[10px] ${outdoor ? 'text-red-600 font-semibold' : 'text-warm-500'} mb-0.5`}>
                          {outdoor && '⚠️ '}
                          {cell.note}
                        </div>
                      )}

                      {/* Clear button */}
                      {cell && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClearCell(slotId, day);
                          }}
                          className="absolute top-1 right-1 p-0.5 text-red-300 hover:text-red-500 opacity-0 hover:opacity-100 transition-opacity no-print"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Activity Picker Modal */}
      {pickSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => { setPickSlot(null); setSearchQuery(''); }}>
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-warm-100 shrink-0">
              <h3 className="text-base font-semibold text-warm-800">
                {WEEKDAY_NAMES[pickSlot.weekday as Weekday]} · {SLOT_LABELS[pickSlot.slotId as SlotId]} 选择活动
              </h3>
              <button onClick={() => { setPickSlot(null); setSearchQuery(''); }} className="p-1 hover:bg-warm-50 rounded-lg">
                <X className="w-5 h-5 text-warm-400" />
              </button>
            </div>

            {/* Search */}
            <div className="px-5 py-3 border-b border-warm-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索活动..."
                  className="w-full pl-9 pr-3 py-2 border border-warm-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-warm-400"
                />
              </div>
            </div>

            {/* Activity list */}
            <div className="flex-1 overflow-y-auto px-5 py-3">
              {filteredActivities.length === 0 ? (
                <div className="text-center py-10 text-warm-400 text-sm">暂无活动</div>
              ) : (
                <div className="space-y-1.5">
                  {filteredActivities.map((act) => (
                    <button
                      key={act.id}
                      onClick={() => handlePickActivity(act)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-warm-50 transition-colors text-left border border-transparent hover:border-warm-200"
                    >
                      <div className="w-10 h-10 rounded-lg bg-warm-100 flex items-center justify-center text-warm-500 text-xs font-bold shrink-0">
                        {act.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-warm-800">{act.name}</p>
                        <p className="text-xs text-warm-400 truncate">{act.tags.join(' · ')}</p>
                      </div>
                      <span className="text-xs text-warm-300 shrink-0">选择 →</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer - quick actions */}
            <div className="px-5 py-3 border-t border-warm-100 flex gap-2 shrink-0">
              <button
                onClick={() => {
                  const name = prompt('输入活动名称（手动输入）：');
                  if (name?.trim()) {
                    updateCell(pickSlot.slotId, pickSlot.weekday as Weekday, { customText: name.trim() });
                    setPickSlot(null);
                    setSearchQuery('');
                  }
                }}
                className="flex-1 px-3 py-2 border border-warm-200 rounded-lg text-sm text-warm-600 hover:bg-warm-50 transition-colors"
              >
                手动输入
              </button>
              <button
                onClick={() => {
                  handleClearCell(pickSlot.slotId, pickSlot.weekday);
                  setPickSlot(null);
                  setSearchQuery('');
                }}
                className="px-3 py-2 border border-red-200 text-red-500 rounded-lg text-sm hover:bg-red-50 transition-colors"
              >
                清空
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Detail Modal */}
      {detailActivity && (
        <ActivityDetailModal
          activity={detailActivity}
          open={!!detailActivity}
          onClose={() => setDetailActivity(null)}
        />
      )}
    </div>
  );
}
