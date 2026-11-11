import React, { useState, useEffect, useRef } from 'react';
import AuthModal from './components/AuthModal';
import AdminPanel from './components/AdminPanel';
import { createIdea, getMyIdeas, deleteIdea } from './services/api';
import {
  Sparkles,
  Palette,
  Globe,
  Rocket,
  Layers,
  ArrowRight,
  Send,
  X,
  Menu,
  User,
  Building2,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  FolderKanban,
  FileText,
  Trash2,
  LogOut,
  AlertCircle,
  ShieldAlert
} from 'lucide-react';

export default function App() {
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false); // Estado para abrir el Panel Admin
  const [user, setUser] = useState(null);

  // Estado real conectado al Backend
  const [userIdeas, setUserIdeas] = useState([]);
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Formulario para guardar nueva idea en PostgreSQL
  const [newIdea, setNewIdea] = useState({
    titulo: '',
    servicio: 'Desarrollo Web & UI/UX',
    presupuesto: '$1,000 - $2,500 USD',
    tiempo: '2 a 4 semanas',
    detalles: ''
  });

  // Referencias separadas para el Modal de Creación y el Modal de Historial
  const createModalRef = useRef(null);
  const historyModalRef = useRef(null);
  const tituloRef = useRef(null);

  // 1. Cargar datos de la sesión guardada y sincronizar ideas de PostgreSQL
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      fetchUserIdeas();
    }
  }, []);

  // Función para obtener las ideas del backend Express + PostgreSQL
  const fetchUserIdeas = async () => {
    setLoadingIdeas(true);
    try {
      const data = await getMyIdeas();
      setUserIdeas(data);
    } catch (error) {
      console.error("Error al obtener las ideas de la BD:", error.message);
    } finally {
      setLoadingIdeas(false);
    }
  };

  // 2. Manejador de Inicio de Sesión o Registro Exitoso
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsAuthOpen(false);
    fetchUserIdeas();
    setTimeout(() => {
      // Si es admin, abre el panel admin; si es usuario normal, abre el historial
      if (userData.isAdmin) {
        setIsAdminOpen(true);
      } else {
        historyModalRef.current?.showModal();
      }
    }, 300);
  };

  // 3. Cerrar Sesión
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setUserIdeas([]);
    closeModals();
    setIsAdminOpen(false);
  };

  const services = [
    {
      icon: <Palette className="w-8 h-8 text-purple-400" />,
      title: "Identidad de Marca & Branding",
      desc: "Diseño conceptual único, manuales de marca y estética visual memorable."
    },
    {
      icon: <Globe className="w-8 h-8 text-cyan-400" />,
      title: "Desarrollo Web & UI/UX",
      desc: "Experiencias digitales intuitivas, rápidas y optimizadas sin sobrecarga de nodos."
    },
    {
      icon: <Rocket className="w-8 h-8 text-fuchsia-400" />,
      title: "Estrategia Digital & Ads",
      desc: "Campañas de alto impacto orientadas a conversión y posicionamiento de marca."
    },
    {
      icon: <Layers className="w-8 h-8 text-violet-400" />,
      title: "Producción Audiovisual",
      desc: "Contenido 3D, motion graphics y material gráfico publicitario de nivel internacional."
    }
  ];

  const projects = [
    { id: 1, title: "Neon Cyberpunk Brand", category: "Branding", image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=600" },
    { id: 2, title: "Fintech Web App UI", category: "Web", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600" },
    { id: 3, title: "3D Product Motion", category: "3D & Motion", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600" },
    { id: 4, title: "E-Commerce Luxury", category: "Web", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600" },
  ];

  const filteredProjects = activeFilter === 'Todos'
    ? projects
    : projects.filter(p => p.category === activeFilter);

  const openPortalEmpresa = () => {
    setIsAuthOpen(true);
  };

  // Abrir panel exclusivo de Creación (Botón Crear Idea)
  const openCreatePanel = () => {
    if (!user) {
      setIsAuthOpen(true);
    } else {
      createModalRef.current?.showModal();
    }
  };

  // Abrir panel exclusivo de Historial (Botón Mi idea / Mis ideas)
  const openHistoryPanel = () => {
    if (!user) {
      setIsAuthOpen(true);
    } else {
      historyModalRef.current?.showModal();
    }
  };

  const closeModals = () => {
    createModalRef.current?.close();
    historyModalRef.current?.close();
  };

  // 4. Guardar Idea con validación
  const handleSaveIdea = async (e) => {
    e.preventDefault();

    if (!user) {
      createModalRef.current?.close();
      setIsAuthOpen(true);
      return;
    }

    if (!newIdea.titulo.trim()) {
      alert("Falta completar el nombre de tu proyecto/idea.");
      tituloRef.current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      await createIdea(newIdea);
      await fetchUserIdeas();

      setNewIdea({
        titulo: '',
        servicio: 'Desarrollo Web & UI/UX',
        presupuesto: '$1,000 - $2,500 USD',
        tiempo: '2 a 4 semanas',
        detalles: ''
      });
      createModalRef.current?.close();
      alert(`¡Idea enviada exitosamente al panel de ${user.empresa || user.company}!`);
    } catch (error) {
      alert(`Error al guardar la idea: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // 5. Eliminar Idea
  const handleDeleteIdea = async (id) => {
    if (!confirm("¿Deseas eliminar esta cotización de la base de datos?")) return;

    try {
      await deleteIdea(id);
      setUserIdeas(userIdeas.filter(idea => idea.id !== id));
    } catch (error) {
      alert(`Error al eliminar: ${error.message}`);
    }
  };

  // Filtrado de ideas por categorías / estados actualizados
  const ideasEnRevision = userIdeas.filter(item => !item.estado || item.estado === 'en_revision' || item.estado === 'En revisión' || item.estado === 'revision');
  const ideasAceptadas = userIdeas.filter(item => item.estado === 'aceptada');
  const ideasRechazadas = userIdeas.filter(item => item.estado === 'rechazada');

  return (
    <>
      {/* NAVEGACIÓN PRINCIPAL */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-zinc-950/90 border-b border-purple-900/40">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2 text-2xl font-black text-white">
            <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            <span>NOVA<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-cyan-400">CREATIVA</span></span>
          </a>

          <ul className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-300">
            <li><a href="#servicios" className="hover:text-purple-400 transition-colors">Servicios</a></li>
            <li><a href="#portafolio" className="hover:text-purple-400 transition-colors">Portafolio</a></li>
          </ul>

          <nav className="flex items-center gap-3">
            {/* BOTÓN CREAR IDEA */}
            <button
              onClick={openCreatePanel}
              className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-[0_0_20px_rgba(168,85,247,0.5)] cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              Crear Idea
            </button>

            {/* BOTÓN DE ADMIN (Aparece si el usuario logueado es administrador) */}
            {user?.isAdmin && (
              <button
                onClick={() => setIsAdminOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-[0_0_20px_rgba(245,158,11,0.5)] cursor-pointer animate-pulse"
              >
                <ShieldAlert className="w-4 h-4" />
                Panel Admin
              </button>
            )}

            {/* ACCESO A EMPRESA / LOGIN */}
            <button
              onClick={openPortalEmpresa}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white px-5 py-2.5 rounded-full font-bold transition-all shadow-[0_0_20px_rgba(168,85,247,0.5)] cursor-pointer"
            >
              <User className="w-4 h-4" />
              {user ? `Panel: ${user.empresa || user.company}` : 'Acceso Empresa'}
            </button>

            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-zinc-300">
              <Menu className="w-6 h-6" />
            </button>
          </nav>
        </nav>
      </header>

      {/* HERO */}
      <main className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-purple-500 selection:text-white">
        <section className="relative max-w-7xl mx-auto px-6 pt-24 pb-20 flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/80 border border-purple-500/50 text-purple-300 text-xs font-semibold uppercase tracking-widest mb-8 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Estudio de Diseño & Desarrollo Digital
          </span>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight max-w-4xl leading-tight mb-8">
            <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(168,85,247,0.4)]">Diseñamos el futuro.</span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-10 leading-relaxed">
            Potencia tu marca con tecnología de vanguardia y diseño disruptivo.
          </p>

          <nav className="flex flex-col sm:flex-row gap-5">
            {/* BOTÓN HERO DINÁMICO: "Mi idea" si hay 1, "Mis ideas" si hay 2 o más */}
            <button
              onClick={openHistoryPanel}
              className="flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-cyan-500 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-[0_0_30px_rgba(168,85,247,0.6)] hover:scale-105 active:scale-95 border border-purple-400/30 cursor-pointer"
            >
              {userIdeas.length === 1 ? 'Mi idea' : 'Mis ideas'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </nav>
        </section>

        {/* SERVICIOS */}
        <section id="servicios" className="py-24 bg-zinc-900/40 border-y border-purple-900/40">
          <header className="max-w-7xl mx-auto px-6 text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Lo Que Hacemos</h2>
            <p className="text-zinc-400 max-w-xl mx-auto">Soluciones integrales para escalar tu negocio.</p>
          </header>

          <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((s, idx) => (
              <article key={idx} className="bg-zinc-900/80 border border-purple-900/40 p-8 rounded-2xl hover:border-purple-500/60 transition-all hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(168,85,247,0.2)]">
                <header className="mb-6 p-3 w-fit rounded-xl bg-purple-950/60 border border-purple-500/30">
                  {s.icon}
                </header>
                <h3 className="text-xl font-bold mb-3 text-white">{s.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{s.desc}</p>
              </article>
            ))}
          </section>
        </section>

        {/* PORTAFOLIO */}
        <section id="portafolio" className="py-24 max-w-7xl mx-auto px-6">
          <header className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <nav>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Proyectos Destacados</h2>
              <p className="text-zinc-400">Explora nuestro trabajo.</p>
            </nav>

            <nav className="flex gap-2 bg-zinc-900 p-1.5 rounded-xl border border-purple-900/40">
              {['Todos', 'Branding', 'Web', '3D & Motion'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeFilter === cat
                    ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]'
                    : 'text-zinc-400 hover:text-white'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </nav>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredProjects.map(proj => (
              <article key={proj.id} className="group relative overflow-hidden rounded-2xl border border-purple-900/40 bg-zinc-900/60 hover:border-purple-500/60 transition-all">
                <figure className="aspect-video overflow-hidden">
                  <img src={proj.image} alt={proj.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </figure>
                <footer className="p-6 flex items-center justify-between border-t border-purple-900/40 bg-zinc-900/90">
                  <nav>
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">{proj.category}</span>
                    <h3 className="text-xl font-bold text-white mt-1">{proj.title}</h3>
                  </nav>
                </footer>
              </article>
            ))}
          </section>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-zinc-950 border-t border-purple-900/40 py-12">
        <section className="max-w-7xl mx-auto px-6 text-center text-sm text-zinc-400">
          <p>© 2026 NovaCreativa. Todos los derechos reservados.</p>
        </section>
      </footer>

      {/* 1. MODAL DE HISTORIAL ("Mi idea" / "Mis ideas") */}
      <dialog
        ref={historyModalRef}
        className="backdrop:bg-black/85 bg-zinc-900/95 text-white p-6 sm:p-8 rounded-3xl border border-purple-500/50 max-w-2xl w-full shadow-[0_0_50px_rgba(168,85,247,0.4)] backdrop-blur-2xl"
      >
        <header className="flex justify-between items-center mb-6 border-b border-purple-900/40 pb-4">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-purple-400" />
            Historial de Ideas
          </h3>
          <button onClick={() => historyModalRef.current?.close()} className="text-zinc-400 hover:text-white cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </header>

        {/* DATOS DE LA EMPRESA */}
        {user && (
          <aside className="mb-6 p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-900/50 border border-purple-400/40 text-purple-300">
                <Building2 className="w-5 h-5" />
              </div>
              <nav>
                <span className="text-xs text-purple-300 font-semibold uppercase tracking-wider">Empresa Registrada</span>
                <h4 className="text-base font-bold text-white">{user.empresa || user.company}</h4>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs bg-purple-900/60 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30">
                {userIdeas.length} {userIdeas.length === 1 ? 'Idea' : 'Ideas'}
              </span>
              <button
                onClick={handleLogout}
                className="text-zinc-400 hover:text-red-400 transition"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </aside>
        )}

        {/* SECCIÓN 1: IDEAS EN REVISIÓN */}
        <section className="mb-6">
          <h4 className="text-sm font-bold text-zinc-300 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" /> Ideas en Revisión
          </h4>
          <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
            {loadingIdeas ? (
              <p className="text-xs text-zinc-400 py-3 text-center">Cargando...</p>
            ) : ideasEnRevision.length === 0 ? (
              <p className="text-xs text-zinc-500 py-2 italic">No hay ideas en proceso de revisión actualmente.</p>
            ) : (
              ideasEnRevision.map(item => (
                <article key={item.id} className="p-4 rounded-xl bg-zinc-950 border border-amber-900/40 flex items-center justify-between">
                  <nav>
                    <h5 className="font-bold text-white text-sm">{item.titulo}</h5>
                    <p className="text-xs text-zinc-400">{item.servicio} • <span className="text-purple-300">{item.presupuesto}</span></p>
                  </nav>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-950 text-amber-300 border border-amber-500/30">
                      En revisión
                    </span>
                    <button onClick={() => handleDeleteIdea(item.id)} className="text-zinc-500 hover:text-red-400 p-1 transition" title="Eliminar">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        {/* SECCIÓN 2: IDEAS ACEPTADAS */}
        <section className="mb-6">
          <h4 className="text-sm font-bold text-zinc-300 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Ideas Aceptadas
          </h4>
          <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
            {ideasAceptadas.length === 0 ? (
              <p className="text-xs text-zinc-500 py-2 italic">Aún no hay ideas aceptadas.</p>
            ) : (
              ideasAceptadas.map(item => (
                <article key={item.id} className="p-4 rounded-xl bg-zinc-950 border border-emerald-900/40 flex items-center justify-between">
                  <nav>
                    <h5 className="font-bold text-white text-sm">{item.titulo}</h5>
                    <p className="text-xs text-zinc-400">{item.servicio} • <span className="text-purple-300">{item.presupuesto}</span></p>
                  </nav>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                      ✨ Idea aceptada
                    </span>
                    <button onClick={() => handleDeleteIdea(item.id)} className="text-zinc-500 hover:text-red-400 p-1 transition" title="Eliminar">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        {/* SECCIÓN 3: IDEAS RECHAZADAS */}
        <section className="mb-2">
          <h4 className="text-sm font-bold text-zinc-300 mb-3 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-400" /> Ideas Rechazadas
          </h4>
          <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
            {ideasRechazadas.length === 0 ? (
              <p className="text-xs text-zinc-500 py-2 italic">No hay ideas rechazadas.</p>
            ) : (
              ideasRechazadas.map(item => (
                <article key={item.id} className="p-4 rounded-xl bg-zinc-950 border border-red-900/40 flex items-center justify-between">
                  <nav>
                    <h5 className="font-bold text-white text-sm">{item.titulo}</h5>
                    <p className="text-xs text-zinc-400">{item.servicio} • <span className="text-purple-300">{item.presupuesto}</span></p>
                  </nav>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-red-950 text-red-300 border border-red-500/30">
                      ❌ Idea rechazada
                    </span>
                    <button onClick={() => handleDeleteIdea(item.id)} className="text-zinc-500 hover:text-red-400 p-1 transition" title="Eliminar">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </dialog>

      {/* 2. MODAL EXCLUSIVO DE CREACIÓN ("Crear Idea" en el Navbar) */}
      <dialog
        ref={createModalRef}
        className="backdrop:bg-black/85 bg-zinc-900/95 text-white p-6 sm:p-8 rounded-3xl border border-purple-500/50 max-w-lg w-full shadow-[0_0_50px_rgba(168,85,247,0.4)] backdrop-blur-2xl"
      >
        <header className="flex justify-between items-center mb-6 border-b border-purple-900/40 pb-4">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <PlusCircle className="w-6 h-6 text-purple-400" />
            Crear Nueva Idea
          </h3>
          <button onClick={() => createModalRef.current?.close()} className="text-zinc-400 hover:text-white cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </header>

        <form onSubmit={handleSaveIdea} className="space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-zinc-300 mb-1 block">Nombre de tu proyecto/idea</span>
            <input
              ref={tituloRef}
              type="text"
              placeholder="Ej. Plataforma E-Commerce Neón"
              value={newIdea.titulo}
              onChange={(e) => setNewIdea({ ...newIdea, titulo: e.target.value })}
              className="w-full bg-zinc-950 border border-purple-900/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-400"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-zinc-300 mb-1 block">Servicio requerido</span>
            <select
              value={newIdea.servicio}
              onChange={(e) => setNewIdea({ ...newIdea, servicio: e.target.value })}
              className="w-full bg-zinc-950 border border-purple-900/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-400 cursor-pointer"
            >
              <option>Desarrollo Web & UI/UX</option>
              <option>Identidad de Marca & Branding</option>
              <option>Producción Audiovisual / 3D</option>
              <option>Estrategia Digital & Ads</option>
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-medium text-zinc-300 mb-1 block">Presupuesto estimado</span>
            <select
              value={newIdea.presupuesto}
              onChange={(e) => setNewIdea({ ...newIdea, presupuesto: e.target.value })}
              className="w-full bg-zinc-950 border border-purple-900/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-400 cursor-pointer"
            >
              <option>$500 - $1,000 USD</option>
              <option>$1,000 - $2,500 USD</option>
              <option>$2,500 - $5,000 USD</option>
              <option>Más de $5,000 USD</option>
            </select>
          </label>

          <footer className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.5)] cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Enviando...' : 'Enviar idea para revisión'}
              <Send className="w-4 h-4" />
            </button>
          </footer>
        </form>
      </dialog>

      {/* MODAL DE AUTENTICACIÓN */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* PANEL DE ADMINISTRADOR */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />
    </>
  );
}