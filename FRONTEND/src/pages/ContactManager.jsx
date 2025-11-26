import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../lib/api";
import { 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  Phone, 
  Mail, 
  CheckCircle, 
  XCircle, 
  Save, 
  ArrowLeft,
  Search,
  MessageCircle
} from "lucide-react";

// Nota: Asegúrate de tener Tailwind CSS configurado para que estos estilos funcionen.
// Si usas CSS puro, avísame para darte el CSS correspondiente.

// =====================================================
// 📋 LISTA DE CONTACTOS (DASHBOARD STYLE)
// =====================================================
export function ListContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    api
      .get("/contact/")
      .then(({ data }) => setContacts(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este contacto permanentemente?")) return;
    try {
      await api.delete(`/contact/${id}/`);
      setContacts((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
      alert("Error al eliminar el contacto");
    }
  };

  // Filtrado simple por nombre
  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryBadge = (cat) => {
    const styles = {
      ASOCIACION: "bg-purple-100 text-purple-800 border-purple-200",
      GASTRONOMIA: "bg-orange-100 text-orange-800 border-orange-200",
      TRANSPORTE: "bg-blue-100 text-blue-800 border-blue-200",
      OPERADORES: "bg-emerald-100 text-emerald-800 border-emerald-200",
      GENERAL: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return styles[cat] || styles.GENERAL;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-emerald-600">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header del Dashboard */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
              <Users className="h-8 w-8 text-emerald-600" />
              Gestión de Contactos
            </h1>
            <p className="text-slate-500 mt-1">Administra la agenda telefónica pública del sitio.</p>
          </div>
          <Link 
            to="/admin/contactos/nuevo" 
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5"
          >
            <Plus className="h-5 w-5" />
            Nuevo Contacto
          </Link>
        </div>

        {/* Barra de Búsqueda */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
            <Search className="h-5 w-5 text-slate-400" />
            <input 
                type="text" 
                placeholder="Buscar por nombre..." 
                className="flex-grow outline-none text-slate-700 placeholder:text-slate-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        {/* Tabla / Lista */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {filteredContacts.length === 0 ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                <Users className="h-16 w-16 mb-4 opacity-20" />
                <p className="text-lg">No se encontraron contactos.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                    <th className="px-6 py-4">Nombre / Categoría</th>
                    <th className="px-6 py-4">Contacto</th>
                    <th className="px-6 py-4 text-center">Estado</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredContacts.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 text-base">{c.name}</div>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold border ${getCategoryBadge(c.category)}`}>
                          {c.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 space-y-1">
                        {c.phone && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Phone className="h-3 w-3 text-slate-400" /> {c.phone}
                            </div>
                        )}
                         {c.whatsapp && (
                            <div className="flex items-center gap-2 text-sm text-green-600">
                                <MessageCircle className="h-3 w-3" /> {c.whatsapp}
                            </div>
                        )}
                        {c.email && (
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Mail className="h-3 w-3 text-slate-400" /> {c.email}
                            </div>
                        )}
                        {!c.phone && !c.email && !c.whatsapp && <span className="text-slate-400 text-xs italic">Sin datos</span>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {c.is_active ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                            <CheckCircle className="h-3 w-3" /> Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">
                            <XCircle className="h-3 w-3" /> Inactivo
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            to={`/admin/contactos/${c.id}/editar`}
                            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =====================================================
// ➕ CREAR CONTACTO (FORMULARIO PRO)
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
      navigate("/admin/contactos");
    } catch (err) {
      setError("Error al crear el contacto. Revisa los datos.");
      console.error(err.response?.data || err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 flex items-center justify-center font-sans">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        
        {/* Header del Formulario */}
        <div className="bg-emerald-600 px-8 py-6 flex items-center gap-4">
            <button onClick={() => navigate("/admin/contactos")} className="text-white/70 hover:text-white transition-colors">
                <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
                <h1 className="text-2xl font-black text-white">Nuevo Contacto</h1>
                <p className="text-emerald-100 text-sm">Información visible para los turistas.</p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <ContactFormFields
            formData={formData}
            handleInputChange={handleInputChange}
          />

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm flex items-center gap-2">
                <XCircle className="h-4 w-4" /> {error}
            </div>
          )}

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors"
              onClick={() => navigate("/admin/contactos")}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                 <>Guardando...</>
              ) : (
                 <><Save className="h-5 w-5" /> Guardar Contacto</>
              )}
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
      navigate("/admin/contactos");
    } catch (err) {
      console.error(err);
      alert("Error al actualizar el contacto");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!formData) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-emerald-600 rounded-full border-t-transparent"></div></div>;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 flex items-center justify-center font-sans">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        
        <div className="bg-slate-800 px-8 py-6 flex items-center gap-4">
             <button onClick={() => navigate("/admin/contactos")} className="text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
                <h1 className="text-2xl font-black text-white">Editar Contacto</h1>
                <p className="text-slate-400 text-sm">Modificando: {formData.name}</p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <ContactFormFields
            formData={formData}
            handleInputChange={handleInputChange}
          />

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors"
              onClick={() => navigate("/admin/contactos")}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-50"
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
// 🧩 CAMPOS REUTILIZABLES (ESTILOS MODERNOS)
// =====================================================
function ContactFormFields({ formData, handleInputChange }) {
  const inputClass = "w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-slate-700 font-medium placeholder:text-slate-400";
  const labelClass = "block text-sm font-bold text-slate-700 mb-2 ml-1";

  return (
    <>
      <div>
        <label htmlFor="name" className={labelClass}>Nombre Completo / Razón Social</label>
        <div className="relative">
            <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Ej: Asociación de Guías Locales"
            required
            className={inputClass}
            />
        </div>
      </div>

      <div>
        <label htmlFor="category" className={labelClass}>Categoría</label>
        <div className="relative">
             <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`${inputClass} appearance-none cursor-pointer`}
            >
                <option value="ASOCIACION">Asociación y Guías</option>
                <option value="GASTRONOMIA">Gastronomía (Comida)</option>
                <option value="TRANSPORTE">Transporte</option>
                <option value="OPERADORES">Operadores Turísticos</option>
                <option value="GENERAL">General / Información</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="phone" className={labelClass}>Teléfono (Llamadas)</label>
          <div className="relative">
             <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone || ""}
                onChange={handleInputChange}
                placeholder="Ej: 70482396"
                className={`${inputClass} pl-12`}
            />
          </div>
        </div>
        <div>
          <label htmlFor="whatsapp" className={labelClass}>WhatsApp (Enlace)</label>
          <div className="relative">
            <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
                id="whatsapp"
                name="whatsapp"
                type="tel"
                value={formData.whatsapp || ""}
                onChange={handleInputChange}
                placeholder="Ej: 59170482396"
                className={`${inputClass} pl-12`}
            />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>Correo Electrónico</label>
        <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
                id="email"
                name="email"
                type="email"
                value={formData.email || ""}
                onChange={handleInputChange}
                placeholder="contacto@ejemplo.com"
                className={`${inputClass} pl-12`}
            />
        </div>
      </div>

      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
        <label className="flex items-center gap-3 cursor-pointer">
          <div className="relative flex items-center">
             <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="peer h-6 w-6 cursor-pointer appearance-none rounded-md border-2 border-slate-300 transition-all checked:border-emerald-500 checked:bg-emerald-500"
            />
            <CheckCircle className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
          </div>
          <div>
             <span className="font-bold text-slate-700 block">Contacto Visible</span>
             <span className="text-xs text-slate-500">Si desmarcas esto, el contacto se ocultará en la web sin borrarse.</span>
          </div>
        </label>
      </div>
    </>
  );
}

// Icono auxiliar para el select
function ChevronDown(props) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
    )
}