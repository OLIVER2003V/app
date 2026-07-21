import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/errorMessage";
import { setSiteSettingsCache } from "@/hooks/useSiteSettings";
import {
  ArrowLeft, Loader2, Save, Clock, Ticket, Car, Tent, Utensils,
  ShieldAlert, ListChecks, Backpack, Link2, Plus, X, CheckCircle2, AlertTriangle, Languages, MapPin,
} from "lucide-react";

const initialForm = {
  schedule_hours: "",
  general_price: 0,
  park_fee_students: 0,
  park_fee_nationals: 0,
  park_fee_foreigners: 0,
  transport_options: [],
  route_start_text: "",
  route_start_text_en: "",
  camping_price_per_tent: 0,
  camping_text: "",
  camping_text_en: "",
  gastronomy_text: "",
  gastronomy_text_en: "",
  gastronomy_note: "",
  gastronomy_note_en: "",
  security_text: "",
  security_text_en: "",
  whatsapp_group_url: "",
  route_video_youtube_id: "",
  park_rules: [],
  park_rules_en: [],
  activities: [],
  activities_en: [],
  what_to_bring: [],
  what_to_bring_en: [],
};

function Section({ icon, title, desc, children }) {
  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-1">
        <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <h2 className="text-lg font-bold text-white">{title}</h2>
      </div>
      {desc && <p className="text-xs text-slate-500 mb-4 ml-12">{desc}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{label}</label>
      {children}
    </div>
  );
}

const inputClass = "w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none transition-all";

function ListEditor({ items, onChange, placeholder }) {
  const [draft, setDraft] = useState("");

  const addItem = () => {
    const value = draft.trim();
    if (!value) return;
    onChange([...items, value]);
    setDraft("");
  };

  const removeItem = (idx) => {
    onChange(items.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
          <span className="flex-1 text-sm text-slate-300">{item}</span>
          <button
            type="button"
            onClick={() => removeItem(idx)}
            className="text-slate-500 hover:text-red-400 transition-colors shrink-0"
            aria-label="Quitar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem(); } }}
          placeholder={placeholder}
          className={inputClass}
        />
        <button
          type="button"
          onClick={addItem}
          className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shrink-0"
          aria-label="Agregar"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

const miniInputClass = "bg-slate-950 border border-slate-700 rounded-lg px-2 py-2 text-sm text-white focus:border-emerald-500 outline-none transition-all";

// Antes "Transporte Local" eran 2 campos numéricos fijos (camioneta/mototaxi):
// el admin solo podía cambiar el precio, no agregar una opción nueva (ej. un
// bus público) ni renombrarla. Ahora es una lista libre de {emoji, label, price}.
function TransportEditor({ items, onChange }) {
  const [draft, setDraft] = useState({ emoji: "", label: "", price: "" });

  const addItem = () => {
    if (!draft.label.trim()) return;
    onChange([...items, { emoji: draft.emoji.trim() || "🚐", label: draft.label.trim(), price: Number(draft.price) || 0 }]);
    setDraft({ emoji: "", label: "", price: "" });
  };

  const removeItem = (idx) => onChange(items.filter((_, i) => i !== idx));

  const updateItem = (idx, field, value) => {
    onChange(items.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  };

  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
          <input
            type="text"
            value={item.emoji}
            onChange={(e) => updateItem(idx, "emoji", e.target.value)}
            className="w-9 shrink-0 bg-transparent text-center text-lg outline-none"
            maxLength={4}
            aria-label="Emoji"
          />
          <input
            type="text"
            value={item.label}
            onChange={(e) => updateItem(idx, "label", e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-200 outline-none"
            placeholder="Nombre"
          />
          <input
            type="number"
            min="0"
            value={item.price}
            onChange={(e) => updateItem(idx, "price", Number(e.target.value))}
            className="w-16 shrink-0 bg-transparent text-right text-sm font-bold text-emerald-400 outline-none"
            aria-label="Precio en bolivianos"
          />
          <span className="shrink-0 text-xs text-slate-500">Bs</span>
          <button
            type="button"
            onClick={() => removeItem(idx)}
            className="shrink-0 text-slate-500 transition-colors hover:text-red-400"
            aria-label="Quitar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={draft.emoji}
          onChange={(e) => setDraft((d) => ({ ...d, emoji: e.target.value }))}
          placeholder="🚐"
          maxLength={4}
          className={`w-9 shrink-0 text-center ${miniInputClass}`}
        />
        <input
          type="text"
          value={draft.label}
          onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem(); } }}
          placeholder="Ej. Bus público"
          className={`min-w-0 flex-1 ${miniInputClass}`}
        />
        <input
          type="number"
          min="0"
          value={draft.price}
          onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem(); } }}
          placeholder="Bs"
          className={`w-16 shrink-0 ${miniInputClass}`}
        />
        <button
          type="button"
          onClick={addItem}
          className="shrink-0 rounded-lg bg-emerald-600 p-2 text-white transition-colors hover:bg-emerald-700"
          aria-label="Agregar"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function LangSwitch({ lang, setLang }) {
  return (
    <div className="inline-flex rounded-lg bg-slate-950 border border-slate-700 p-1 shrink-0">
      {["es", "en"].map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-colors ${
            lang === l ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          {l === "es" ? "Español" : "English"}
        </button>
      ))}
    </div>
  );
}

export default function SiteSettingsAdmin() {
  const [form, setForm] = useState(initialForm);
  const [lang, setLang] = useState("es");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null); // { type: 'error' | 'success', message }
  const toastTimerRef = useRef(null);
  const savedTimerRef = useRef(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    api.get("/site-settings/")
      .then(({ data }) => setForm({ ...initialForm, ...data }))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, []);

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  // Nombre real del campo bilingüe según el idioma que se está editando
  // (ej. "camping_text" en español, "camping_text_en" en inglés).
  const tf = (base) => (lang === "en" ? `${base}_en` : base);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.patch("/site-settings/", form);
      setForm({ ...initialForm, ...data });
      setSiteSettingsCache(data);
      showToast("success", "Cambios guardados correctamente.");
      setJustSaved(true);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      savedTimerRef.current = setTimeout(() => setJustSaved(false), 2500);
    } catch (err) {
      showToast("error", getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-24 relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-900/20 rounded-full blur-[128px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-900/20 rounded-full blur-[128px]"></div>
      </div>

      {/* Aviso flotante: visible sin importar el scroll, ya que el botón de
          Guardar queda hasta abajo de un formulario largo */}
      {toast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-[70] max-w-[90vw] px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium flex items-center gap-2
            ${toast.type === "error" ? "bg-red-950/95 border-red-500/30 text-red-200" : "bg-emerald-950/95 border-emerald-500/30 text-emerald-200"}`}
        >
          {toast.type === "error" ? <AlertTriangle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}
          <span className="break-words">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-1 opacity-60 hover:opacity-100 shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        <div className="flex items-center gap-4 mb-8">
          <Link to="/dashboard" className="p-2 rounded-full bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors text-slate-400 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Información del Sitio</h1>
            <p className="text-slate-400 text-sm">Horarios, tarifas y contenido que ven los turistas en Inicio, Información y Cómo Llegar.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl text-sm font-medium bg-red-500/10 border border-red-500/20 text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          <Section icon={<Clock className="h-5 w-5" />} title="Horarios y Tarifas de Ingreso">
            <Field label="Horario de atención">
              <input type="text" value={form.schedule_hours} onChange={(e) => set("schedule_hours", e.target.value)} className={inputClass} placeholder="08:00 - 18:00" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Precio general (Bs)">
                <input type="number" min="0" value={form.general_price} onChange={(e) => set("general_price", Number(e.target.value))} className={inputClass} />
              </Field>
              <Field label="Parque Amboró · Estudiantes (Bs)">
                <input type="number" min="0" value={form.park_fee_students} onChange={(e) => set("park_fee_students", Number(e.target.value))} className={inputClass} />
              </Field>
              <Field label="Parque Amboró · Nacionales (Bs)">
                <input type="number" min="0" value={form.park_fee_nationals} onChange={(e) => set("park_fee_nationals", Number(e.target.value))} className={inputClass} />
              </Field>
              <Field label="Parque Amboró · Extranjeros (Bs)">
                <input type="number" min="0" value={form.park_fee_foreigners} onChange={(e) => set("park_fee_foreigners", Number(e.target.value))} className={inputClass} />
              </Field>
            </div>
          </Section>

          <Section icon={<Car className="h-5 w-5" />} title="Transporte Local" desc="Opciones y precios desde El Torno, mostrados en Cómo Llegar. Agregá, quitá o renombrá las que necesites.">
            <TransportEditor items={form.transport_options} onChange={(v) => set("transport_options", v)} />
          </Section>

          {/* --- Contenido bilingüe: lo que ve el turista cambia según el
              idioma que elija en el sitio (selector ES/EN del menú) --- */}
          <div className="flex items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <Languages className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Contenido bilingüe</h2>
                <p className="text-xs text-slate-500">Los textos de las secciones de abajo se muestran a los turistas según el idioma que elijan (ES/EN).</p>
              </div>
            </div>
            <LangSwitch lang={lang} setLang={setLang} />
          </div>

          <Section icon={<MapPin className="h-5 w-5" />} title="Punto de Partida" desc="Cómo llegar a El Torno desde Santa Cruz de la Sierra (distancia, tiempo, ruta). Se muestra en 'Cómo Llegar'; queda vacío hasta que lo completes.">
            <Field label="Descripción">
              <textarea
                rows={3}
                value={form[tf("route_start_text")]}
                onChange={(e) => set(tf("route_start_text"), e.target.value)}
                className={inputClass}
                placeholder="Ej: El Torno está a 45 km de Santa Cruz de la Sierra (aprox. 1h 15min en auto) por la carretera a Samaipata..."
              />
            </Field>
          </Section>

          <Section icon={<Tent className="h-5 w-5" />} title="Camping">
            <Field label="Precio por carpa (Bs)">
              <input type="number" min="0" value={form.camping_price_per_tent} onChange={(e) => set("camping_price_per_tent", Number(e.target.value))} className={inputClass} />
            </Field>
            <Field label="Descripción">
              <textarea rows={2} value={form[tf("camping_text")]} onChange={(e) => set(tf("camping_text"), e.target.value)} className={inputClass} />
            </Field>
          </Section>

          <Section icon={<Utensils className="h-5 w-5" />} title="Gastronomía">
            <Field label="Descripción">
              <textarea rows={2} value={form[tf("gastronomy_text")]} onChange={(e) => set(tf("gastronomy_text"), e.target.value)} className={inputClass} />
            </Field>
            <Field label="Nota destacada (ej. alquiler de parrillas)">
              <input type="text" value={form[tf("gastronomy_note")]} onChange={(e) => set(tf("gastronomy_note"), e.target.value)} className={inputClass} />
            </Field>
          </Section>

          <Section icon={<ShieldAlert className="h-5 w-5" />} title="Seguridad">
            <Field label="Texto de seguridad">
              <textarea rows={3} value={form[tf("security_text")]} onChange={(e) => set(tf("security_text"), e.target.value)} className={inputClass} />
            </Field>
          </Section>

          <Section icon={<ListChecks className="h-5 w-5" />} title="Reglas del Parque" desc="Se muestran como lista en la página de Información.">
            <ListEditor items={form[tf("park_rules")]} onChange={(v) => set(tf("park_rules"), v)} placeholder="Ej. No hacer fogatas fuera de áreas designadas" />
          </Section>

          <Section icon={<ListChecks className="h-5 w-5" />} title="Actividades">
            <ListEditor items={form[tf("activities")]} onChange={(v) => set(tf("activities"), v)} placeholder="Ej. Trekking y senderismo por la selva" />
          </Section>

          <Section icon={<Backpack className="h-5 w-5" />} title="Qué llevar">
            <ListEditor items={form[tf("what_to_bring")]} onChange={(v) => set(tf("what_to_bring"), v)} placeholder="Ej. Repelente para mosquitos" />
          </Section>

          <Section icon={<Link2 className="h-5 w-5" />} title="Enlaces">
            <Field label="Link del grupo de WhatsApp">
              <input type="url" value={form.whatsapp_group_url} onChange={(e) => set("whatsapp_group_url", e.target.value)} className={inputClass} placeholder="https://chat.whatsapp.com/..." />
            </Field>
            <Field label="ID del video de YouTube (Cómo Llegar)">
              <input type="text" value={form.route_video_youtube_id} onChange={(e) => set("route_video_youtube_id", e.target.value)} className={inputClass} placeholder="rMBSyYd7JJE" />
            </Field>
          </Section>

          <button
            type="submit"
            disabled={saving}
            className={`w-full flex items-center justify-center gap-2 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all disabled:opacity-50
              ${justSaved ? "bg-emerald-500 shadow-emerald-500/30" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"}`}
          >
            {saving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : justSaved ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            {saving ? "Guardando..." : justSaved ? "¡Guardado!" : "Guardar cambios"}
          </button>
        </form>
      </div>
    </div>
  );
}
