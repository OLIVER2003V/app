import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/errorMessage";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Loader2, Trash2, UserPlus, Users, ShieldCheck, Pencil, Edit3 } from "lucide-react";

const ROLES = [
  { value: "editor", label: "Editor" },
  { value: "admin", label: "Administrador" },
];

const ROLE_STYLES = {
  admin: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  editor: "bg-violet-500/10 text-violet-400 border-violet-500/20",
};

function Avatar({ name }) {
  const letter = (name || "?").trim().charAt(0).toUpperCase();
  return (
    <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 border border-slate-700 flex items-center justify-center text-sm font-bold text-white">
      {letter}
    </div>
  );
}

export default function UsersAdmin() {
  const { me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [form, setForm] = useState({ username: "", email: "", password: "", role: "editor" });
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState(null);

  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ username: "", email: "", password: "" });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setListError(null);
    try {
      const { data } = await api.get("/auth/users/");
      setUsers(Array.isArray(data) ? data : (data.results || []));
    } catch (err) {
      setListError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (userId, role) => {
    setSavingId(userId);
    try {
      await api.patch(`/auth/users/${userId}/`, { role });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, profile: { ...u.profile, role } } : u));
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`¿Eliminar a "${user.username}" permanentemente? Esta acción no se puede deshacer.`)) return;
    setDeletingId(user.id);
    try {
      await api.delete(`/auth/users/${user.id}/`);
      setUsers(prev => prev.filter(u => u.id !== user.id));
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const openEdit = (u) => {
    setEditingUser(u);
    setEditForm({ username: u.username, email: u.email || "", password: "" });
    setEditError(null);
  };

  const closeEdit = () => {
    setEditingUser(null);
    setEditError(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditSaving(true);
    setEditError(null);
    const payload = { username: editForm.username, email: editForm.email };
    if (editForm.password) payload.password = editForm.password;
    try {
      const { data } = await api.patch(`/auth/users/${editingUser.id}/`, payload);
      setUsers(prev => prev.map(u => u.id === data.id ? data : u));
      closeEdit();
    } catch (err) {
      setEditError(getErrorMessage(err));
    } finally {
      setEditSaving(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setFormError(null);
    try {
      await api.post("/auth/register/", form);
      setForm({ username: "", email: "", password: "", role: "editor" });
      fetchUsers();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-20 relative overflow-hidden">

      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-900/20 rounded-full blur-[128px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-900/20 rounded-full blur-[128px]"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        <div className="flex items-center gap-4 mb-8">
          <Link to="/dashboard" className="p-2 rounded-full bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors text-slate-400 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Usuarios y Roles</h1>
            <p className="text-slate-400 text-sm">Da de alta colaboradores y decide qué pueden editar.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[360px,1fr] gap-6 items-start">

          {/* Alta de usuario */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl lg:sticky lg:top-8">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-emerald-500" /> Nuevo colaborador
            </h2>

            {formError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs leading-relaxed break-words">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreate} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Usuario</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none transition-all"
                  placeholder="ej. mariana"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Correo</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none transition-all"
                  placeholder="opcional"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Contraseña</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Rol</label>
                <select
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none appearance-none"
                >
                  {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <button
                type="submit"
                disabled={creating}
                className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {creating ? <Loader2 className="animate-spin h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
                {creating ? "Creando..." : "Crear usuario"}
              </button>
            </form>
          </div>

          {/* Lista de usuarios */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center gap-2 text-white font-bold">
              <Users className="h-5 w-5 text-slate-400" /> Usuarios ({users.length})
            </div>

            {listError && (
              <div className="m-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
                {listError}
              </div>
            )}

            {loading ? (
              <div className="py-16 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>
            ) : users.length === 0 ? (
              <div className="py-16 text-center text-slate-500 text-sm">No hay usuarios registrados.</div>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {users.map(u => {
                  const role = u.profile?.role || "editor";
                  const isSelf = u.id === me?.id;
                  return (
                    <div key={u.id} className="p-4 flex items-center gap-4 hover:bg-slate-800/30 transition-colors">
                      <Avatar name={u.username} />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-white truncate">{u.username}</p>
                          {isSelf && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-300 font-bold uppercase tracking-wide">Tú</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate">{u.email || "sin correo"}</p>
                      </div>

                      <span className={`hidden sm:inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wide ${ROLE_STYLES[role] || ROLE_STYLES.editor}`}>
                        {role === "admin" ? <ShieldCheck className="h-3 w-3 inline mr-1 -mt-0.5" /> : <Pencil className="h-3 w-3 inline mr-1 -mt-0.5" />}
                        {role}
                      </span>

                      <select
                        value={role}
                        disabled={savingId === u.id || (isSelf && role === "admin")}
                        onChange={e => handleRoleChange(u.id, e.target.value)}
                        title={isSelf && role === "admin" ? "No puedes quitarte tu propio rol de admin" : "Cambiar rol"}
                        aria-label={`Cambiar rol de ${u.username || u.email || u.id}`}
                        className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:border-emerald-500 outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                      </select>

                      <button
                        onClick={() => openEdit(u)}
                        title="Editar usuario, correo o contraseña"
                        aria-label={`Editar usuario ${u.username || u.email || u.id}`}
                        className="p-2 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(u)}
                        disabled={isSelf || deletingId === u.id}
                        title={isSelf ? "No puedes eliminar tu propia cuenta" : "Eliminar usuario"}
                        aria-label={isSelf ? "No puedes eliminar tu propia cuenta" : `Eliminar usuario ${u.username || u.email || u.id}`}
                        className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                      >
                        {deletingId === u.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>

      {editingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={closeEdit}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-emerald-500" /> Editar a {editingUser.username}
            </h3>

            {editError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs leading-relaxed break-words">
                {editError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Usuario</label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={e => setEditForm({ ...editForm, username: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Correo</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Nueva contraseña</label>
                <input
                  type="password"
                  value={editForm.password}
                  onChange={e => setEditForm({ ...editForm, password: e.target.value })}
                  placeholder="Dejar en blanco para no cambiarla"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none transition-all"
                />
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {editSaving ? <Loader2 className="animate-spin h-5 w-5" /> : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
