import React, { useEffect } from 'react';
import ReactGA from 'react-ga4';
import usePageTracking from "../hooks/usePageTracking"; // Asegúrate de que la ruta sea correcta

const TRACKING_ID = "G-23092RNY2C"; 

function GASetup() {
    // 1. Inicialización de GA4 (solo una vez)
    useEffect(() => {
        ReactGA.initialize(TRACKING_ID);
    }, []); 
    
    // 2. Seguimiento de las vistas de página (cada vez que cambia la ruta)
    usePageTracking();
    
    // Este componente no renderiza nada visible, solo maneja el tracking.
    // Usamos el 'null' para que sea invisible.
    return null;
}

export default GASetup;