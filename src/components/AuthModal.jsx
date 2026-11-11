import React, { useState } from 'react';
import { Sparkles, X, Send, Lock, Mail, Building, User, AlertCircle, Loader2 } from 'lucide-react';
import { registerCompany, loginCompany } from '../services/api';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    empresa: '',
    password: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let data;
      if (isRegister) {
        data = await registerCompany(formData);
      } else {
        data = await loginCompany({
          email: formData.email,
          password: formData.password
        });
      }

      // Guardar sesión y Token JWT real en el navegador
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (onLoginSuccess) {
        onLoginSuccess(data.user);
      }

      onClose();
    } catch (err) {
      setError(err.message || 'Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    /* CONTENEDOR EXTERNO: Centrado perfecto con flexbox y fondo oscuro */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
      <dialog
        open
        className="relative m-0 bg-zinc-900 text-white p-6 sm:p-8 rounded-3xl border border-purple-500/40 max-w-lg w-full shadow-[0_0_50px_rgba(168,85,247,0.4)] backdrop-blur-2xl block"
      >
        {/* CABECERA DEL MODAL */}
        <header className="flex justify-between items-center mb-6 border-b border-purple-900/40 pb-4">
          <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            {isRegister ? 'Crear Cuenta de Empresa' : 'Portal de Empresa'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-zinc-800"
          >
            <X className="w-6 h-6" />
          </button>
        </header>

        {/* PESTAÑAS DE NAVEGACIÓN */}
        <nav className="flex gap-2 p-1.5 bg-zinc-950 rounded-xl border border-purple-900/40 mb-6">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${!isRegister
              ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
              : 'text-zinc-400 hover:text-white'
              }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${isRegister
              ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
              : 'text-zinc-400 hover:text-white'
              }`}
          >
            Registrar Empresa
          </button>
        </nav>

        {/* MENSAJE DE ERROR SI FALLA EL LOGIN/REGISTRO */}
        {error && (
          <aside className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-500/50 flex items-center gap-2 text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </aside>
        )}

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {isRegister && (
            <>
              <label className="block">
                <span className="text-xs font-medium text-zinc-300 flex items-center gap-1.5 mb-1">
                  <User className="w-3.5 h-3.5 text-purple-400" /> Nombre Completo
                </span>
                <input
                  type="text"
                  required
                  placeholder="Ej. David Rocha"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full bg-zinc-950 border border-purple-900/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 text-white placeholder:text-zinc-600 transition-all"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-zinc-300 flex items-center gap-1.5 mb-1">
                  <Building className="w-3.5 h-3.5 text-purple-400" /> Nombre de tu Empresa / Marca
                </span>
                <input
                  type="text"
                  required
                  placeholder="Ej. Nova Brand Co."
                  value={formData.empresa}
                  onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                  className="w-full bg-zinc-950 border border-purple-900/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 text-white placeholder:text-zinc-600 transition-all"
                />
              </label>
            </>
          )}

          <label className="block">
            <span className="text-xs font-medium text-zinc-300 flex items-center gap-1.5 mb-1">
              <Mail className="w-3.5 h-3.5 text-purple-400" /> Correo o Usuario
            </span>
            <input
              type="text"
              required
              placeholder="contacto@tuempresa.com o Usuario"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-zinc-950 border border-purple-900/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 text-white placeholder:text-zinc-600 transition-all"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-zinc-300 flex items-center gap-1.5 mb-1">
              <Lock className="w-3.5 h-3.5 text-purple-400" /> Contraseña
            </span>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-zinc-950 border border-purple-900/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 text-white placeholder:text-zinc-600 transition-all"
            />
          </label>

          <footer className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <span>{isRegister ? 'Registrar Mi Empresa' : 'Ingresar al Dashboard'}</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </footer>
        </form>
      </dialog>
    </div>
  );
}