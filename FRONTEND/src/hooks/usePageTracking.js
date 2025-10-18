// src/hooks/usePageTracking.js
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';

const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    // Envía la nueva ruta a Google Analytics
    ReactGA.send({ 
        hitType: "pageview", 
        page: location.pathname + location.search 
    });
  }, [location]); 
};

export default usePageTracking;