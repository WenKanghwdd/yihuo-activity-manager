-- 悦活云同步 - Supabase 数据库迁移
-- 使用方法：在 Supabase 后台 → SQL Editor → 粘贴运行

-- ====================================
-- 活动库
-- ====================================
CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================
-- 老人信息
-- ====================================
CREATE TABLE IF NOT EXISTS elderly (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================
-- 老人分组
-- ====================================
CREATE TABLE IF NOT EXISTS elderly_groups (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================
-- 周计划
-- ====================================
CREATE TABLE IF NOT EXISTS weekly_plans (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================
-- 周计划单元格
-- ====================================
CREATE TABLE IF NOT EXISTS weekly_plan_cells (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================
-- 活动记录
-- ====================================
CREATE TABLE IF NOT EXISTS activity_records (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================
-- 设置
-- ====================================
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================
-- 索引（加速查询）
-- ====================================
CREATE INDEX IF NOT EXISTS idx_activities_updated ON activities(updated_at);
CREATE INDEX IF NOT EXISTS idx_elderly_updated ON elderly(updated_at);
CREATE INDEX IF NOT EXISTS idx_weekly_plans_updated ON weekly_plans(updated_at);
CREATE INDEX IF NOT EXISTS idx_activity_records_updated ON activity_records(updated_at);

-- ====================================
-- RLS 策略（使用 anon key 读写）
-- ====================================
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE elderly ENABLE ROW LEVEL SECURITY;
ALTER TABLE elderly_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_plan_cells ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 允许所有操作（通过 anon key + RLS）
CREATE POLICY "允许所有操作" ON activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "允许所有操作" ON elderly FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "允许所有操作" ON elderly_groups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "允许所有操作" ON weekly_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "允许所有操作" ON weekly_plan_cells FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "允许所有操作" ON activity_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "允许所有操作" ON settings FOR ALL USING (true) WITH CHECK (true);
