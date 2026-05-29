import { useState, type ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export default function CollapsibleCard({ title, children, defaultOpen = false, className = '' }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`bg-white rounded-xl border border-warm-100 ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3 text-left transition-colors hover:bg-warm-50 rounded-xl"
      >
        <div className="flex-1">{title}</div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-warm-400 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-warm-400 shrink-0" />
        )}
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}
