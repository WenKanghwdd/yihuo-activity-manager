import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// 全局错误捕获
window.addEventListener('error', (e) => {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `<div style="padding:20px;font-family:sans-serif;">
      <h2 style="color:#c00;">页面加载出错</h2>
      <pre style="font-size:12px;background:#fee;padding:12px;border-radius:8px;overflow:auto;">${e.message || e.error?.message || '未知错误'}\n${e.error?.stack || ''}</pre>
      <p style="color:#666;font-size:13px;">请截图发给管理员</p>
    </div>`;
  }
});

// 在 root 渲染前先显示 loading
const root = document.getElementById('root')!;
root.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:#fef7f0;">
  <div style="text-align:center;">
    <div style="width:32px;height:32px;border:3px solid #fbc98a;border-top-color:#7c3aed;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 12px;"></div>
    <p style="color:#9a440b;font-size:14px;font-family:sans-serif;">悦活加载中...</p>
  </div>
  <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
</div>`;

createRoot(root).render(<App />);
