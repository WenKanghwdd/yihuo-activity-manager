/**
 * brandStore — 用户品牌 Logo 管理
 * 数据存储在 IndexedDB settings store 中
 */

import { create } from 'zustand';
import { getByKey, putItem } from '../db';

export interface BrandConfig {
  base64: string | null;     // 图片 base64 数据
  size: 'small' | 'medium' | 'large';  // 打印尺寸
  position: 'left' | 'right';          // 相对系统标的位置
  enabled: boolean;                     // 是否打印显示
}

const DEFAULT_CONFIG: BrandConfig = {
  base64: null,
  size: 'medium',
  position: 'right',
  enabled: true,
};

interface BrandState {
  config: BrandConfig;
  loaded: boolean;
  loadConfig: () => Promise<void>;
  updateConfig: (partial: Partial<BrandConfig>) => Promise<void>;
  uploadLogo: (base64: string) => Promise<void>;
  removeLogo: () => Promise<void>;
}

export const useBrandStore = create<BrandState>((set, get) => ({
  config: { ...DEFAULT_CONFIG },
  loaded: false,

  loadConfig: async () => {
    const saved = await getByKey<BrandConfig>('settings', 'brandLogo');
    if (saved) {
      set({ config: saved, loaded: true });
    } else {
      set({ loaded: true });
    }
  },

  updateConfig: async (partial) => {
    const newConfig = { ...get().config, ...partial };
    await putItem('settings', { key: 'brandLogo', ...newConfig });
    set({ config: newConfig });
  },

  uploadLogo: async (base64: string) => {
    const newConfig = { ...get().config, base64, enabled: true };
    await putItem('settings', { key: 'brandLogo', ...newConfig });
    set({ config: newConfig });
  },

  removeLogo: async () => {
    const newConfig = { ...get().config, base64: null, enabled: false };
    await putItem('settings', { key: 'brandLogo', ...newConfig });
    set({ config: newConfig });
  },
}));
