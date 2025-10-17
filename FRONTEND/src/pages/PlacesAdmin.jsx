import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

import api from "@lib/api";
import "./PlacesAdmin.css";

// -- Configuración del Mapa --
const SANTA_CRUZ_CENTER = [-17.7833, -63.1821];
// Arreglo para el ícono por defecto de Leaflet que a veces se rompe con Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});


// -- Funciones Helper --
function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function normalizeErrors(obj) {
  if (!obj || typeof obj !== 'object') return 'Error 400. Revisa los campos.';
  return Object.entries(obj).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' | ') : v}`).join(' · ');
}

// Componente interno para manejar los clics en el mapa
function MapClickHandler({ setCoordinates }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setCoordinates({ lat: lat.toFixed(6), lng: lng.toFixed(6) });
    },
  });
  return null;
}

// Componente para cambiar la vista del mapa automáticamente
function ChangeMapView({ center }) {
  const map = useMap();
  useEffect(() => {
    // Comprueba que las coordenadas no sean vacías antes de intentar mover el mapa
    if (center && center[0] && center[1] && !isNaN(center[0]) && !isNaN(center[1])) {
      map.flyTo(center, 15);
    }
  }, [center, map]);

  return null;
}


export default function PlacesAdmin() {
  const [places, setPlaces] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [q, setQ] = useState("");
  
  const initialFormState = {
    name: "", slug: "", category: "otro", description: "",
    address: "", lat: "", lng: "", is_active: true,
  };
  const [createForm, setCreateForm] = useState(initialFormState);
  const [createMsg, setCreateMsg] = useState("");
  const [creating, setCreating] = useState(false);
  
  const [selectedSlug, setSelectedSlug] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailMsg, setDetailMsg] = useState("");
  const [editForm, setEditForm] = useState(initialFormState);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const filteredPlaces = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return places;
    return places.filter(p => p.name.toLowerCase().includes(term) || p.slug.toLowerCase().includes(term));
  }, [places, q]);

  // -- API Calls --
  const fetchList = async () => {
    setLoadingList(true);
    try {
      const { data } = await api.get("/places/");
      setPlaces(Array.isArray(data) ? data : (data?.results || []));
    } catch (err) {
      console.error("Error fetching places:", err);
    } finally {
      setLoadingList(false);
    }
  };

  const fetchDetail = async (slug) => {
    setLoadingDetail(true);
    setDetailMsg("");
    try {
      const { data } = await api.get(`/places/${slug}/`);
      setDetail(data);
      setEditForm({
        name: data.name || "",
        slug: data.slug || "",
        category: data.category || "otro",
        description: data.description || "",
        address: data.address || "",
        lat: data.lat || "",
        lng: data.lng || "",
        is_active: data.is_active,
      });
    } catch (err) {
      setDetail(null);
      setDetailMsg("Lugar no encontrado.");
    } finally {
      setLoadingDetail(false);
    }
  };
  
  const createPlace = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateMsg("");
    try {
      await api.post("/places/", createForm);
      setCreateMsg("✔ Lugar creado correctamente.");
      setCreateForm(initialFormState);
      fetchList();
    } catch (err) {
      const msg = err.response?.data ? normalizeErrors(err.response.data) : "Error de servidor.";
      setCreateMsg(msg);
    } finally {
      setCreating(false);
    }
  };

  const updatePlace = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setDetailMsg("");
    try {
        await api.put(`/places/${selectedSlug}/`, editForm);
        setDetailMsg("✔ Lugar actualizado.");
        fetchList();
        const newSlug = editForm.slug;
        fetchDetail(newSlug);
        if (selectedSlug !== newSlug) {
            setSelectedSlug(newSlug);
        }
    } catch (err) {
        const msg = err.response?.data ? normalizeErrors(err.response.data) : "Error de servidor.";
        setDetailMsg(msg);
    } finally {
        setUpdating(false);
    }
  };
  
  const deletePlace = async (slug) => {
    if (!window.confirm(`¿Seguro que quieres eliminar el lugar "${slug}"?`)) return;
    setDeleting(true);
    setDetailMsg("");
    try {
        await api.delete(`/places/${slug}/`);
        setDetailMsg("✔ Lugar eliminado.");
        setDetail(null);
        setSelectedSlug(null);
        fetchList();
    } catch (err) {
        setDetailMsg("No se pudo eliminar el lugar.");
    } finally {
        setDeleting(false);
    }
  };

  const handleGetCurrentLocation = (formSetter) => {
    if (!navigator.geolocation) {
      alert("La geolocalización no es soportada por tu navegador.");
      return;
    }
    
    formSetter(prev => ({...prev, lat: "Obteniendo...", lng: "Obteniendo..."}));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        formSetter(prev => ({ 
          ...prev, 
          lat: latitude.toFixed(6), 
          lng: longitude.toFixed(6) 
        }));
      },
      (error) => {
        alert(`Error al obtener la ubicación: ${error.message}`);
        formSetter(prev => ({...prev, lat: "", lng: ""}));
      }
    );
  };
  
  useEffect(() => { fetchList(); }, []);

  return (
    <div className="admin-page-container">
      <div className="admin-page-wrapper">
        <header className="admin-page-header">
          <h1>Administración de Lugares</h1>
          <button onClick={fetchList}>🔄 Recargar</button>
        </header>

        <div className="admin-page-grid">
          <section className="admin-card">
            <h2>Listado de Lugares</h2>
            <input className="admin-input" placeholder="Buscar por nombre..." value={q} onChange={e => setQ(e.target.value)} />
            <div className="admin-list">
              {loadingList ? <div>Cargando...</div> : filteredPlaces.map(p => (
                <button key={p.slug} className={`admin-list-item ${selectedSlug === p.slug ? 'is-active' : ''}`} onClick={() => { setSelectedSlug(p.slug); fetchDetail(p.slug); }}>
                  {p.name}
                </button>
              ))}
            </div>
          </section>

          <section className="admin-card">
            <h2>Crear Nuevo Lugar</h2>
            {createMsg && <div className="admin-alert">{createMsg}</div>}
            <form onSubmit={createPlace} className="admin-form">
              <label>Nombre *</label>
              <input className="admin-input" value={createForm.name} onChange={e => {
                setCreateForm({...createForm, name: e.target.value, slug: slugify(e.target.value)})
              }} required />

              <label>Slug (auto-generado) *</label>
              <input className="admin-input" value={createForm.slug} onChange={e => setCreateForm({...createForm, slug: e.target.value})} required />

              <label>Categoría</label>
              <select className="admin-input" value={createForm.category} onChange={e => setCreateForm({...createForm, category: e.target.value})}>
                  <option value="mirador">Mirador</option>
                  <option value="cascada">Cascada</option>
                  <option value="ruta">Ruta</option>
                  <option value="gastronomia">Gastronomía</option>
                  <option value="hospedaje">Hospedaje</option>
                  <option value="otro">Otro</option>
              </select>

              <label>Descripción</label>
              <textarea className="admin-input" rows="4" value={createForm.description} onChange={e => setCreateForm({...createForm, description: e.target.value})}></textarea>
              
              <div className="coords-picker">
                  <div>
                      <label>Latitud</label>
                      <input type="text" className="admin-input" value={createForm.lat} onChange={e => setCreateForm({...createForm, lat: e.target.value})} />
                  </div>
                  <div>
                      <label>Longitud</label>
                      <input type="text" className="admin-input" value={createForm.lng} onChange={e => setCreateForm({...createForm, lng: e.target.value})} />
                  </div>
              </div>

              <div className="map-actions">
                <label>Selecciona en el mapa</label>
                <button type="button" className="admin-btn-location" onClick={() => handleGetCurrentLocation(setCreateForm)}>
                  📍 Usar mi ubicación actual
                </button>
              </div>
              <div className="map-container">
                  <MapContainer center={SANTA_CRUZ_CENTER} zoom={13} style={{ height: '100%', width: '100%' }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
                      {createForm.lat && createForm.lng && !isNaN(createForm.lat) && !isNaN(createForm.lng) && <Marker position={[createForm.lat, createForm.lng]} />}
                      <MapClickHandler setCoordinates={({ lat, lng }) => setCreateForm(prev => ({ ...prev, lat, lng }))} />
                      <ChangeMapView center={[createForm.lat, createForm.lng]} />
                  </MapContainer>
              </div>
              
              <label className="admin-checkbox"><input type="checkbox" checked={createForm.is_active} onChange={e => setCreateForm({...createForm, is_active: e.target.checked})} /> Activo</label>
              
              <button type="submit" className="admin-btn-primary" disabled={creating}>{creating ? 'Guardando...' : 'Crear Lugar'}</button>
            </form>
          </section>

          <section className="admin-card full-width">
            <h2>Detalle / Editar Lugar</h2>
            {loadingDetail && <div>Cargando detalle...</div>}
            {detailMsg && <div className="admin-alert">{detailMsg}</div>}
            
            {detail && (
              <form onSubmit={updatePlace} className="admin-form">
                  <label>Nombre *</label>
                  <input className="admin-input" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value, slug: slugify(e.target.value)})} required />
                  <label>Slug *</label>
                  <input className="admin-input" value={editForm.slug} onChange={e => setEditForm({...editForm, slug: e.target.value})} required />
                  <label>Categoría</label>
                  <select className="admin-input" value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})}>
                      <option value="mirador">Mirador</option>
                      <option value="cascada">Cascada</option>
                      <option value="ruta">Ruta</option>
                      <option value="gastronomia">Gastronomía</option>
                      <option value="hospedaje">Hospedaje</option>
                      <option value="otro">Otro</option>
                  </select>
                  <label>Descripción</label>
                  <textarea className="admin-input" rows="4" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})}></textarea>
                  <div className="coords-picker">
                      <div>
                          <label>Latitud</label>
                          <input type="text" className="admin-input" value={editForm.lat} onChange={e => setEditForm({...editForm, lat: e.target.value})} />
                      </div>
                      <div>
                          <label>Longitud</label>
                          <input type="text" className="admin-input" value={editForm.lng} onChange={e => setEditForm({...editForm, lng: e.target.value})} />
                      </div>
                  </div>
                  <div className="map-actions">
                    <label>Selecciona en el mapa</label>
                    <button type="button" className="admin-btn-location" onClick={() => handleGetCurrentLocation(setEditForm)}>
                      📍 Usar mi ubicación actual
                    </button>
                  </div>
                  <div className="map-container">
                      <MapContainer center={SANTA_CRUZ_CENTER} zoom={13} style={{ height: '100%', width: '100%' }}>
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                          {editForm.lat && editForm.lng && !isNaN(editForm.lat) && !isNaN(editForm.lng) && <Marker position={[editForm.lat, editForm.lng]} />}
                          <MapClickHandler setCoordinates={({ lat, lng }) => setEditForm(prev => ({ ...prev, lat, lng }))} />
                          <ChangeMapView center={[editForm.lat, editForm.lng]} />
                      </MapContainer>
                  </div>
                  <label className="admin-checkbox"><input type="checkbox" checked={editForm.is_active} onChange={e => setEditForm({...editForm, is_active: e.target.checked})} /> Activo</label>

                  <div className="admin-actions">
                      <button type="submit" className="admin-btn-primary" disabled={updating}>{updating ? 'Actualizando...' : 'Actualizar Lugar'}</button>
                      <button type="button" className="admin-btn-danger" disabled={deleting} onClick={() => deletePlace(detail.slug)}>{deleting ? 'Eliminando...' : 'Eliminar'}</button>
                  </div>
              </form>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}