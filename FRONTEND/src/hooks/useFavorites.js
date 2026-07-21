import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "favoritePlaces";
const EVENT_NAME = "favoritesChanged";

function readFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeFavorites(ids) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event(EVENT_NAME));
}

// Favoritos guardados solo en este navegador (localStorage), sin backend ni
// login: cualquier turista puede marcar lugares aunque no tenga cuenta.
export function useFavorites() {
  const [favorites, setFavorites] = useState(readFavorites);

  useEffect(() => {
    const sync = () => setFavorites(readFavorites());
    window.addEventListener(EVENT_NAME, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT_NAME, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const isFavorite = useCallback((id) => favorites.includes(id), [favorites]);

  const toggleFavorite = useCallback((id) => {
    const current = readFavorites();
    const next = current.includes(id) ? current.filter((f) => f !== id) : [...current, id];
    writeFavorites(next);
  }, []);

  return { favorites, isFavorite, toggleFavorite };
}
