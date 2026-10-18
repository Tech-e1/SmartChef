// src/components/PrintButton.tsx
import { useEffect } from 'react';

export function PrintButton({ label = 'Print' }: { label?: string }) {
  // Expand anything collapsed and force-load lazy images before printing,
  // otherwise they render blank on the page.
  useEffect(() => {
    const prepare = () => {
      document
        .querySelectorAll<HTMLImageElement>('img[loading="lazy"]')
        .forEach(img => { img.loading = 'eager'; });
    };
    window.addEventListener('beforeprint', prepare);
    return () => window.removeEventListener('beforeprint', prepare);
  }, []);

  return (
    <button
      type="button"
      className="no-print rounded px-3 py-1.5 border text-sm hover:bg-gray-50"
      onClick={() => window.print()}
    >
      {label}
    </button>
  );
}
