import { useEffect, useState } from "react";
import api from "../lib/api";

// Cache a nivel de módulo: Navbar, Home, Información y Cómo Llegar usan esta
// misma info y no tiene sentido que cada uno dispare su propio GET.
let cache = null;
let inFlight = null;

function loadSiteSettings() {
  if (cache) return Promise.resolve(cache);
  if (!inFlight) {
    inFlight = api.get("/site-settings/")
      .then(({ data }) => { cache = data; return data; })
      .finally(() => { inFlight = null; });
  }
  return inFlight;
}

// Llamar tras guardar cambios en el panel de admin para que el resto del
// sitio (y esta misma sesión) recoja los valores nuevos en vez del caché.
export function setSiteSettingsCache(data) {
  cache = data;
}

export function useSiteSettings() {
  const [settings, setSettings] = useState(cache);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    if (cache) {
      setSettings(cache);
      setLoading(false);
      return;
    }
    let mounted = true;
    loadSiteSettings().then((data) => {
      if (mounted) {
        setSettings(data);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  return { settings, loading };
}
