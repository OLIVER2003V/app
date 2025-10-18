import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import "./GalleryAdmin.css";

export default function GalleryAdmin() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [mediaType, setMediaType] = useState("IMAGE");
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchItems = () => {
    setLoading(true);
    api
      .get("gallery/")
      .then(({ data }) => setItems(data.results || data))
      .catch(() => setError("No se pudieron cargar los ítems de la galería."))
      .finally(() => setLoading(false));
  };

  useEffect(fetchItems, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Debes seleccionar un archivo.");
      return;
    }
    setIsSubmitting(true);
    setError(null);

    const fd = new FormData();
    fd.append("title", title);
    fd.append("media_type", mediaType);
    
    // REVERTIDO
    fd.append("media_file", file); 
    
    fd.append("order", String(order));
    fd.append("is_active", isActive);

    try {
      await api.post("gallery/", fd);
      // Limpiar formulario
      setTitle("");
      setFile(null);
      setOrder(0);
      setIsActive(true);
      const input = document.getElementById("media_file_input"); // Asegúrate que el id del input coincida
      if (input) input.value = "";
      fetchItems();
    } catch (err) {
      const errorData = err.response?.data;
      const errorMessage = errorData ? JSON.stringify(errorData) : "Error al subir el archivo.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este ítem?")) return;
    try {
      await api.delete(`gallery/${id}/`);
      fetchItems();
    } catch (err) {
      alert("No se pudo eliminar el ítem.");
    }
  };

  const handleToggleActive = async (item) => {
    try {
      await api.patch(`gallery/${item.id}/`, { is_active: !item.is_active });
      fetchItems();
    } catch (err) {
      alert("No se pudo cambiar el estado.");
    }
  };
  
  // El JSX del return no necesita cambios, solo asegúrate de que el input de archivo tenga `name="media_file"`
  return (
    <div className="gallery-admin-page">
      <div className="gallery-admin-container">
        <h1>Gestionar Galería Principal</h1>

        <form onSubmit={handleSubmit} className="upload-form">
          <h3>Añadir Nuevo Ítem</h3>
          {error && <p className="form-error">{error}</p>}

          <div className="form-row">
            <input name="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título" required />
            <select name="media_type" value={mediaType} onChange={(e) => setMediaType(e.target.value)}>
              <option value="IMAGE">Imagen</option>
              <option value="VIDEO">Video (MP4)</option>
            </select>
            <input name="order" type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} placeholder="Orden" />
          </div>

          <input
            id="media_file_input"
            name="media_file" // <-- Nombre original
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            accept="image/*,video/mp4"
            required
          />

          <div className="form-group-checkbox">
            <label>
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              Activo y visible en la página principal
            </label>
          </div>

          <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
            {isSubmitting ? "Subiendo..." : "Añadir a la Galería"}
          </button>
        </form>

        <div className="items-list">
          <h3>Ítems Actuales</h3>
          {loading ? (
            <p>Cargando...</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="gallery-item-row">
                {/* ... tu lógica para mostrar los items ... */}
                <span>{item.title}</span>
                <button onClick={() => handleDelete(item.id)}>Eliminar</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}