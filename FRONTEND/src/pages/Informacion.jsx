import React from 'react';
import './Informacion.css';

// --- Iconos para las secciones (añadí los nuevos) ---
const ClockIcon = () => <span className="info-icon">🕒</span>;
const PriceIcon = () => <span className="info-icon">💰</span>;
const RulesIcon = () => <span className="info-icon">🚫</span>;
const ActivityIcon = () => <span className="info-icon">🤸</span>;
const FoodIcon = () => <span className="info-icon">🍲</span>;
const RecommIcon = () => <span className="info-icon">🎒</span>;


export default function Informacion() {
  return (
    <div className="info-page">
      <header className="info-header">
        <div className="info-wrapper">
          <h1>Información Esencial</h1>
          <p className="info-subtitle">Todo lo que necesitas saber para tu visita</p>
        </div>
      </header>

      <div className="info-wrapper">
        {/* --- Sección de Horarios y Tarifas (NUEVA) --- */}
        <section className="info-highlight-section">
          <div className="info-box">
            <div className="info-box-icon"><ClockIcon /></div>
            <div className="info-box-content">
              <h3>Horario de Ingreso</h3>
              <p>Lunes a Domingo: <strong>08:00 - 18:00 hrs</strong></p>
            </div>
          </div>
          <div className="info-box">
            <div className="info-box-icon"><PriceIcon /></div>
            <div className="info-box-content">
              <h3>Tarifas de Ingreso</h3>
              <p>Comunidad Jardín de las Delicias: <strong>15 Bs General</strong></p>
              <p>Parque Amboró (SISCO): <strong>20 Bs Nacionales / 100 Bs Extranjeros</strong></p>
            </div>
          </div>
        </section>

        <div className="info-grid">
          {/* --- Tarjeta de Reglas (NUEVA) --- */}
          <div className="info-card rules-card">
            <h2 className="card-title"><RulesIcon /> Reglas y Prohibiciones</h2>
            <p>Para proteger el entorno natural y garantizar una visita segura para todos, por favor respeta las siguientes normas:</p>
            <ul>
              <li>No ingresar bebidas alcohólicas ni sustancias controladas.</li>
              <li>No se permite el ingreso de mascotas.</li>
              <li>Prohibido hacer fogatas fuera de las áreas designadas.</li>
              <li>No dejar basura. Ayúdanos a mantener el lugar limpio.</li>
              <li>Respetar la flora y fauna local. No extraer plantas ni molestar a los animales.</li>
            </ul>
          </div>

          {/* Tarjeta de Actividades */}
          <div className="info-card activities-card">
            <h2 className="card-title"><ActivityIcon /> Actividades</h2>
            <p>Podés disfrutar de actividades con la naturaleza como:</p>
            <ul>
              <li>Visita a cataratas y piscinas naturales</li>
              <li>Trekking y senderismo</li>
              <li>Rappel (con operadores turísticos)</li>
              <li>Tirolesas (con operadores turísticos)</li>
              <li>Gastronomía típica</li>
            </ul>
          </div>

          {/* Tarjeta de Gastronomía */}
          <div className="info-card">
            <h2 className="card-title"><FoodIcon /> Gastronomía</h2>
            <p>Las comunarias preparan deliciosas comidas típicas que deleitarán tu paladar. También contamos con alquiler de parrillas para que prepares tu propio asado.</p>
          </div>

          {/* Tarjeta de Recomendaciones */}
          <div className="info-card recommendations-card">
            <h2 className="card-title"><RecommIcon /> Recomendaciones</h2>
            <ul>
              <li>Llevar ropa cómoda y zapatos de trekking o zapatillas con buena suela.</li>
              <li>No olvidar repelente para mosquitos y protector solar.</li>
              <li>Traer suficiente agua para mantenerte hidratado durante las caminatas.</li>
              <li>Contamos con área de Camping (<strong>10 Bs por carpa</strong>). Puedes traer la tuya o alquilar en la comunidad.</li>
            </ul>
          </div>
        </div>

        <footer className="info-footer">
          <h2>¿Te animas a esta aventura?</h2>
        </footer>
      </div>
    </div>
  );
}