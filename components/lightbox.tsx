'use client';

import { useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export function Lightbox({ src, alt, onClose, onPrev, onNext }: { src: string; alt?: string; onClose: () => void; onPrev?: () => void; onNext?: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
      if (e.key === 'ArrowRight' && onNext) onNext();
    }
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose, onPrev, onNext]);

  return <div className="lightbox-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={alt || 'Image preview'}>
    <button type="button" className="lightbox-close" onClick={onClose} aria-label="Close"><X size={22} /></button>
    {onPrev && <button type="button" className="lightbox-nav lightbox-prev" onClick={e => { e.stopPropagation(); onPrev(); }} aria-label="Previous image"><ChevronLeft size={26} /></button>}
    <img className="lightbox-image" src={src} alt={alt || ''} onClick={e => e.stopPropagation()} />
    {onNext && <button type="button" className="lightbox-nav lightbox-next" onClick={e => { e.stopPropagation(); onNext(); }} aria-label="Next image"><ChevronRight size={26} /></button>}
  </div>;
}
