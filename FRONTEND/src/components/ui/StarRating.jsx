import React, { useState } from 'react';
import StarIcon from '../icons/StarIcon';

/**
 * Componente de calificación por estrellas interactivo
 * @param {object} props
 * @param {number} props.rating - El valor de calificación actual (1-5)
 * @param {function} props.setRating - Función para establecer la calificación
 * @param {string} [props.className] - Clases de Tailwind para el contenedor
 * @param {string} [props.starClassName] - Clases de Tailwind para cada SVG de estrella
 */
export default function StarRating({ rating, setRating, className = "", starClassName = "h-8 w-8" }) {
  const [hover, setHover] = useState(0);

  return (
    <div className={`flex ${className}`} role="radiogroup" aria-label="Calificación">
      {[...Array(5)].map((_, index) => {
        const value = index + 1;
        return (
          <button
            type="button"
            key={value}
            className={`cursor-pointer p-1 ${value <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300'}`}
            onClick={() => setRating(value)}
            onMouseEnter={() => setHover(value)}
            onMouseLeave={() => setHover(0)}
            role="radio"
            aria-checked={value <= rating}
            aria-label={`${value} estrella${value > 1 ? "s" : ""}`}
          >
            <StarIcon className={`${starClassName} transition-transform duration-150 hover:scale-110`} />
          </button>
        );
      })}
    </div>
  );
}