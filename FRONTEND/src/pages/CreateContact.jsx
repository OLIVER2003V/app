import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../lib/api";
import "./CreateEvent.css"; // reutilizamos tus estilos
import "./CreateContact.css";

// =====================================================
// 📋 LISTA DE CONTACTOS
// =====================================================
export function ListContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/contact/")
      .then(({ data }) => setContacts(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este contacto?")) return;
    try {
      await api.delete(`/contact/${id}/`);
      setContacts((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
      alert("Error al eliminar el contacto");
    }
  };

  if (loading) return <p>Cargando contactos...</p>;

  return (
    <div className="create-event-page">
      <div className="create-event-container">
        <h1>Contactos</h1>
        <div className="form-actions" style={{ marginBottom: "1rem" }}>
          <Link to="/admin/contactos/nuevo" className="btn btn--primary">
            + Añadir Contacto
          </Link>
        </div>

        {contacts.length === 0 ? (
          <p>No hay contactos registrados.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Activo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.category}</td>
                  <td>{c.phone || "-"}</td>
                  <td>{c.email || "-"}</td>
                  <td>{c.is_active ? "✅" : "❌"}</td>
                  <td>
                    <Link
                      to={`/admin/contactos/${c.id}/editar`}
                      className="btn btn--small"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="btn btn--small btn--danger"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// =====================================================
// ➕ CREAR CONTACTO
// =====================================================
export function CreateContact() {
  const [formData, setFormData] = useState({
    name: "",
    category: "ASOCIACION",
    phone: "",
    whatsapp: "",
    email: "",
    is_active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await api.post("/contact/", formData);
      alert("¡Contacto creado con éxito!");
      navigate("/admin/contactos");
    } catch (err) {
      setError("Error al crear el contacto. Revisa los datos.");
      console.error(err.response?.data || err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-event-page">
      <div className="create-event-container">
        <h1>Añadir Nuevo Contacto</h1>
        <p>Este contacto aparecerá en la página pública.</p>

        <form onSubmit={handleSubmit} className="event-form">
          <ContactFormFields
            formData={formData}
            handleInputChange={handleInputChange}
          />

          {error && <div className="form-error">{error}</div>}

          <div className="form-actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => navigate("/admin/contactos")}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Guardar Contacto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =====================================================
// ✏️ EDITAR CONTACTO
// =====================================================
export function EditContact() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    api
      .get(`/contact/${id}/`)
      .then(({ data }) => setFormData(data))
      .catch(() => alert("No se pudo cargar el contacto."));
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.put(`/contact/${id}/`, formData);
      alert("Contacto actualizado correctamente ✅");
      navigate("/admin/contactos");
    } catch (err) {
      console.error(err);
      alert("Error al actualizar el contacto");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!formData) return <p>Cargando...</p>;

  return (
    <div className="create-event-page">
      <div className="create-event-container">
        <h1>Editar Contacto</h1>
        <form onSubmit={handleSubmit} className="event-form">
          <ContactFormFields
            formData={formData}
            handleInputChange={handleInputChange}
          />

          <div className="form-actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => navigate("/admin/contactos")}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =====================================================
// 🧩 CAMPOS REUTILIZABLES DEL FORMULARIO
// =====================================================
function ContactFormFields({ formData, handleInputChange }) {
  return (
    <>
      <div className="form-group">
        <label htmlFor="name">Nombre Completo</label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Ej: Carla Arroyo"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="category">Categoría</label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleInputChange}
        >
          <option value="ASOCIACION">Asociación y Guías</option>
          <option value="GASTRONOMIA">Gastronomía</option>
          <option value="TRANSPORTE">Transporte</option>
          <option value="OPERADORES">Operadores Turísticos</option>
          <option value="GENERAL">Redes Sociales y General</option>
        </select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="phone">Teléfono</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone || ""}
            onChange={handleInputChange}
            placeholder="Ej: 70482396"
          />
        </div>
        <div className="form-group">
          <label htmlFor="whatsapp">WhatsApp</label>
          <input
            id="whatsapp"
            name="whatsapp"
            type="tel"
            value={formData.whatsapp || ""}
            onChange={handleInputChange}
            placeholder="Ej: 59170482396"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email || ""}
          onChange={handleInputChange}
          placeholder="ejemplo@email.com"
        />
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleInputChange}
          />
          Activo y visible en la página pública
        </label>
      </div>
    </>
  );
}
