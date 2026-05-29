import { X, Download } from 'lucide-react';

interface Props {
  src: string;
  alt: string;
  onClose: () => void;
}

export default function ImageLightbox({ src, alt, onClose }: Props) {
  const handleDownload = async () => {
    try {
      const resp = await fetch(src);
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = alt + '.jpg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // fallback: 在新标签打开
      window.open(src, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}>
      <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
        onClick={e => e.stopPropagation()}>
        <img src={src} alt={alt}
          className="max-w-full max-h-[85vh] rounded-xl shadow-2xl" />
        <div className="absolute top-2 right-2 flex gap-1.5">
          <button onClick={handleDownload}
            className="p-2 bg-white/80 rounded-full shadow hover:bg-white transition-colors"
            title="保存图片">
            <Download className="w-4 h-4 text-warm-700" />
          </button>
          <button onClick={onClose}
            className="p-2 bg-white/80 rounded-full shadow hover:bg-white transition-colors"
            title="关闭">
            <X className="w-4 h-4 text-warm-700" />
          </button>
        </div>
      </div>
    </div>
  );
}
