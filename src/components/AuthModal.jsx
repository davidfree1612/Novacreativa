import React, { useState } from 'react';
import { X, Send, Lock, Mail, Building, User, AlertCircle, Loader2 } from 'lucide-react';
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

  const inputClasses =
    "w-full bg-[#090D16] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-50 placeholder:text-slate-500 transition-all autofill:shadow-[inset_0_0_0px_1000px_#090D16] autofill:[-webkit-text-fill-color:#F8FAFC]";

  return (
    /* CONTENEDOR EXTERNO: Centrado perfecto con flexbox y fondo oscuro */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <dialog
        open
        className="relative m-0 bg-[#111827] text-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-800 max-w-lg w-full shadow-[0_0_50px_rgba(6,182,212,0.15)] backdrop-blur-2xl block"
      >
        {/* CABECERA DEL MODAL CON ISOTIPO OFICIAL */}
        <header className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
          <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-2.5">
            <img
              src="/images/nova-logo.png"
              alt="NovaCreativa"
              className="w-6 h-6 object-contain"
            />
            {isRegister ? 'Crear Cuenta de Empresa' : 'Portal de Empresa'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-50 transition-colors cursor-pointer p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-6 h-6" />
          </button>
        </header>

        {/* PESTAÑAS DE NAVEGACIÓN */}
        <nav className="flex gap-2 p-1.5 bg-[#090D16] rounded-xl border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${!isRegister
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
              : 'text-slate-400 hover:text-slate-50'
              }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${isRegister
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
              : 'text-slate-400 hover:text-slate-50'
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
                <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5 mb-1">
                  <User className="w-3.5 h-3.5 text-cyan-400" /> Nombre Completo
                </span>
                <input
                  type="text"
                  required
                  placeholder="Ej. David Rocha"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className={inputClasses}
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5 mb-1">
                  <Building className="w-3.5 h-3.5 text-cyan-400" /> Nombre de tu Empresa / Marca
                </span>
                <input
                  type="text"
                  required
                  placeholder="Ej. Nova Brand Co."
                  value={formData.empresa}
                  onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                  className={inputClasses}
                />
              </label>
            </>
          )}

          <label className="block">
            <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5 mb-1">
              <Mail className="w-3.5 h-3.5 text-cyan-400" /> Correo o Usuario
            </span>
            <input
              type="text"
              required
              placeholder="contacto@tuempresa.com o Usuario"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={inputClasses}
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5 mb-1">
              <Lock className="w-3.5 h-3.5 text-cyan-400" /> Contraseña
            </span>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={inputClasses}
            />
          </label>

          <footer className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.45)] cursor-pointer active:scale-98 disabled:opacity-50"
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