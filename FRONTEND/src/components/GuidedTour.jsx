// src/components/GuidedTour.jsx
import React, { useEffect, useState, useLayoutEffect } from "react";

/* ---------------- TOUR: pasos ---------------- */
const tourSteps = [
  { selector: '#novedades', title: 'Novedades y Guías', content: 'Aquí encontrarás las últimas noticias, consejos y guías para inspirar tu próxima aventura en nuestra comunidad.' },
  { selector: '#planifica', title: 'Planifica tu Visita', content: 'Todo lo práctico está aquí: cómo llegar, horarios, tarifas y un acceso directo a WhatsApp para tus consultas.' },
  { selector: '#opiniones', title: 'La Voz de los Visitantes', content: 'Lee las experiencias de otros viajeros como tú para conocer sus lugares favoritos y recomendaciones.' },
  { selector: '#mapa', title: 'Explora el Mapa', content: 'Usa nuestro mapa interactivo para visualizar la ruta principal y ubicar los puntos de interés más importantes.' }
];

/* ---------------- TOUR: scroll robusto (sin cambios) ---------------- */
const smoothScrollTo = (element, onScrollEnd) => {
  if (!element) { onScrollEnd(); return; }
  const rect = element.getBoundingClientRect();
  const target = rect.top + window.scrollY - (window.innerHeight / 2) + (rect.height / 2);
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const dest = Math.max(0, Math.min(target, max));
  const prevOverflowY = document.body.style.overflowY;
  document.body.style.overflowY = "auto";
  window.scrollTo({ top: dest, behavior: "smooth" });
  let start = performance.now();
  const tick = () => {
    const curr = window.scrollY;
    const elapsed = performance.now() - start;
    if (Math.abs(curr - dest) < 2 || elapsed > 2000) {
      document.body.style.overflowY = prevOverflowY || "";
      onScrollEnd();
      return;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

/* ---------------- TOUR: componente ---------------- */
export const GuidedTour = ({ onComplete }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [styles, setStyles] = useState({ highlight: {}, tooltip: {} });
  const [isExiting, setIsExiting] = useState(false);

  const currentStep = tourSteps[stepIndex];

  // Efecto para la clase del body (sin cambios)
  useEffect(() => {
    document.body.classList.add('tour-active');
    // En tu global.css, asegúrate de tener:
    // body.tour-active { overscroll-behavior: contain; }
    return () => { document.body.classList.remove('tour-active'); };
  }, []);

  // Lógica de posicionamiento (sin cambios)
  useLayoutEffect(() => {
    const element = document.querySelector(currentStep?.selector);
    if (!element) {
      setTimeout(() => setStepIndex(i => Math.min(i + 1, tourSteps.length)), 0);
      return;
    }
    const updatePosition = () => {
      const rect = element.getBoundingClientRect();
      const tooltipHeight = 210; const margin = 20;
      const spaceBelow = window.innerHeight - rect.bottom;
      const placeAbove = (spaceBelow < (tooltipHeight + margin)) && (rect.top > (tooltipHeight + margin));
      let top = placeAbove ? (rect.top - tooltipHeight - margin) : (rect.top + rect.height + margin);
      if ((top + tooltipHeight) > window.innerHeight) top = window.innerHeight - tooltipHeight - margin;
      if (top < margin) top = margin;
      setStyles({
        highlight: {
          width: `${rect.width + 20}px`, height: `${rect.height + 20}px`,
          top: `${rect.top - 10}px`, left: `${rect.left - 10}px`, opacity: 1,
        },
        tooltip: {
          top: `${top}px`, left: `${rect.left + rect.width / 2}px`,
          transform: 'translateX(-50%) scale(1)', opacity: 1,
        }
      });
    };
    smoothScrollTo(element, updatePosition);
    window.addEventListener('resize', updatePosition, { passive: true });
    window.addEventListener('scroll', updatePosition, { passive: true });
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [stepIndex, currentStep]);

  const handleComplete = () => {
    setIsExiting(true);
    setTimeout(onComplete, 300);
  };

  const goToStep = (index) => {
    setStyles(prev => ({
      highlight: { ...prev.highlight, opacity: 0 },
      tooltip: { ...prev.tooltip, transform: 'translateX(-50%) scale(0.95)', opacity: 0 }
    }));
    setTimeout(() => {
      if (index >= tourSteps.length) {
        handleComplete();
      } else {
        setStepIndex(index);
      }
    }, 300);
  };

  if (!currentStep) return null;

  // ▼▼▼ JSX REFACTORIZADO CON TAILWIND ▼▼▼
  return (
    <div
      className={`fixed inset-0 z-[9999] cursor-pointer bg-slate-900/80 transition-opacity duration-300 ease-ease ${isExiting ? 'opacity-0' : 'opacity-100'}`}
      onClick={handleComplete}
    >
      <div
        className="pointer-events-none absolute rounded-lg transition-all duration-500 ease-ease [box-shadow:0_0_0_500vmax_rgba(16,24,40,0.8)]"
        style={styles.highlight}
        onClick={(e) => e.stopPropagation()}
      />
      <div
        className="fixed z-[10000] w-[min(90vw,380px)] cursor-auto rounded-lg border-t-4 border-primary bg-white p-5 shadow-2xl transition-all duration-300 ease-ease sm:p-6"
        style={styles.tooltip}
        onClick={(e) => e.stopPropagation()}
      >
        <h4 className="mb-2 text-xl font-bold text-primary-600">{currentStep.title}</h4>
        <p className="mb-5 text-base leading-relaxed text-text-light">{currentStep.content}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-text-muted">{stepIndex + 1} / {tourSteps.length}</span>
          <div className="flex gap-2">
            <button
              onClick={handleComplete}
              className="rounded-sm px-4 py-2 text-sm font-bold text-text-muted transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-600/50"
            >
              Saltar
            </button>
            <button
              onClick={() => goToStep(stepIndex + 1)}
              className="rounded-sm bg-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/50"
            >
              {stepIndex === tourSteps.length - 1 ? 'Finalizar' : 'Siguiente'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};