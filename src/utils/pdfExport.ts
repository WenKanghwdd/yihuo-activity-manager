/**
 * PDF 导出工具函数
 *
 * 修复：
 * 1. textarea 内容丢失（从原始 DOM 读取 value）
 * 2. contentEditable 未处理
 * 3. data-pdf-image / data-pdf-weather 未显示
 * 4. CSS 选择器脆弱 → 属性选择器
 * 5. Logo SVG CORS 问题
 * 6. 底部留白不足
 * 7. no-print 精确匹配防误删
 * 8. 分页裁剪修复
 * 9. 月计划 ring-shadow 黑块修复
 */

import type { ThemeConfig } from '../types';

export interface PDFExportOptions {
  prefix?: string;
  margin?: number;
  scale?: number;
  orientation?: 'p' | 'l';
  theme?: ThemeConfig;
  year?: number;
  month?: number;
}

/**
 * 导出指定 DOM 元素为 PDF，支持多页
 */
export async function exportToPDF(
  element: HTMLElement,
  prefix: string,
  options: PDFExportOptions = {},
): Promise<void> {
  const {
    margin = 5,
    scale = 2,
    orientation = 'l',
  } = options;

  const html2canvas = (await import('html2canvas-pro')).default;
  const { default: jsPDF } = await import('jspdf');

  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: '#ffffff',
    onclone: (clonedDoc: Document) => {
      // 1. 打印专用元素 → 显示
      clonedDoc.querySelectorAll('[class*="print:block"], [class*="print:flex"]').forEach((el) => {
        const htmlEl = el as HTMLElement;
        htmlEl.className = htmlEl.className
          .replace(/(?:^|\s)hidden(?:\s|$)/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        htmlEl.style.display = htmlEl.className.includes('print:flex') ? 'flex' : 'block';
      });

      // 2. data-pdf-image / data-pdf-weather → 显示
      clonedDoc.querySelectorAll('[data-pdf-image], [data-pdf-weather]').forEach((el) => {
        const htmlEl = el as HTMLElement;
        htmlEl.className = htmlEl.className
          .replace(/(?:^|\s)hidden(?:\s|$)/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        htmlEl.style.display = 'block';
      });

      // 3. 移除 no-print / print:hidden 元素
      const toRemove: Element[] = [];
      clonedDoc.querySelectorAll('[class*="no-print"], [class*="print:hidden"]').forEach((el) => {
        if (
          /(?:^|\s)no-print(?:\s|$)/.test(el.className) ||
          /(?:^|\s)print:hidden(?:\s|$)/.test(el.className)
        ) {
          toRemove.push(el);
        }
      });
      toRemove.forEach((el) => el.parentNode?.removeChild(el));

      // 4. textarea → 纯文本 div（保留内容）
      const originalTextareas = Array.from(element.querySelectorAll('textarea'));
      const clonedTextareas = Array.from(clonedDoc.querySelectorAll('textarea'));
      clonedTextareas.forEach((ta, i) => {
        const p = ta.parentNode;
        if (!p) return;
        const actualValue =
          (originalTextareas[i] as HTMLTextAreaElement)?.value ??
          (ta as HTMLTextAreaElement).value ??
          '';
        const div = clonedDoc.createElement('div');
        div.textContent = actualValue;
        div.className = ta.className
          .replace(/(?:^|\s)no-print(?:\s|$)/g, ' ')
          .replace(/(?:^|\s)print:hidden(?:\s|$)/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        div.style.cssText =
          ta.style.cssText +
          ';min-height:auto;overflow:visible;white-space:pre-wrap;' +
          'word-break:break-word;overflow-wrap:break-word;height:auto;';
        p.replaceChild(div, ta);
      });

      // 5. contentEditable → 普通 div
      clonedDoc.querySelectorAll('[contenteditable]').forEach((el) => {
        const htmlEl = el as HTMLElement;
        const originalEl = element.querySelector('[contenteditable]') as HTMLElement | null;
        const text = originalEl?.textContent ?? htmlEl.textContent ?? '';
        const div = clonedDoc.createElement('div');
        div.textContent = text;
        div.className = htmlEl.className;
        div.style.cssText = htmlEl.style.cssText;
        htmlEl.parentNode?.replaceChild(div, htmlEl);
      });

      // 6. border/ring-shadow 清理（防止月计划黑块）
      clonedDoc.querySelectorAll('[class*="ring"], [style*="box-shadow"]').forEach((el) => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.outline = 'none';
        htmlEl.style.outlineOffset = '0';
        htmlEl.style.boxShadow = 'none';
      });

      // 7. 整体留白
      const root = (clonedDoc.querySelector('[data-export-root]') as HTMLElement | null) || clonedDoc.body;
      const curPt = root.style.paddingTop || '0px';
      root.style.paddingTop = `calc(${curPt} + 0.5cm)`;
      root.style.paddingBottom = '0.5cm';
    },
  });

  // ---- 生成 PDF（支持多页） ----
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF(orientation, 'mm', 'a4');
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const contentW = pageW - margin * 2;
  const imgH = (canvas.height * contentW) / canvas.width;

  if (imgH <= pageH) {
    pdf.addImage(imgData, 'PNG', margin, 0, contentW, imgH);
  } else {
    const imgScale = contentW / canvas.width;
    const sliceHeightPx = Math.floor(pageH / imgScale);
    let offsetY = 0;
    while (offsetY < canvas.height) {
      if (offsetY > 0) pdf.addPage();
      const sliceH = Math.min(sliceHeightPx, canvas.height - offsetY);
      pdf.addImage(
        imgData, 'PNG',
        margin, -(offsetY * imgScale),
        contentW, imgH,
      );
      offsetY += sliceH;
    }
  }

  // ---- 文件名 ----
  const d = new Date();
  const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  pdf.save(`${prefix}_${dateStr}.pdf`);
}
