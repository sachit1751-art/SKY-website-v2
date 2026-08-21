import { useState, useEffect } from 'react';

export function useSavedRoms() {
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('sky_saved_roms');
    return saved ? JSON.parse(saved) : [];
  });

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const isSaved = prev.includes(id);
      const next = isSaved ? prev.filter((i) => i !== id) : [...prev, id];
      localStorage.setItem('sky_saved_roms', JSON.stringify(next));
      return next;
    });
  };

  const isSaved = (id: string) => savedIds.includes(id);

  return { savedIds, toggleSave, isSaved };
}
