import React, { useState, useEffect, useRef } from 'react';
import AuthModal from './components/AuthModal';
import AdminPanel from './components/AdminPanel';
import { createIdea, getMyIdeas, deleteIdea, sendUserMessage } from './services/api';
import {
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
  Clock,
  CheckCircle2,
  XCircle,
  FolderKanban,
  FileText,
  Trash2,
  LogOut,
  ShieldAlert,
  MessageSquare,
  Lightbulb,
  PenTool,
  Code2
} from 'lucide-react';

export default function App() {
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [user, setUser] = useState(null);

  const [userIdeas, setUserIdeas] = useState([]);
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Estados para el chat de cada idea en el modal del usuario
  const [replyTexts, setReplyTexts] = useState({});
  const [sendingReplyId, setSendingReplyId] = useState(null);

  const [newIdea, setNewIdea] = useState({
    titulo: '',
    servicio: 'Desarrollo Web & UI/UX',
    presupuesto: '$1,000 - $2,500 USD',
    tiempo: '1 - 3 Meses',
    detalles: ''
  });

  const createModalRef = useRef(null);
  const historyModalRef = useRef(null);
  const tituloRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      fetchUserIdeas();
    }
  }, []);

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

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsAuthOpen(false);
    fetchUserIdeas();
    setTimeout(() => {
      if (userData.isAdmin) {
        setIsAdminOpen(true);
      } else {
        historyModalRef.current?.showModal();
      }
    }, 300);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setUserIdeas([]);
    closeModals();
    setIsAdminOpen(false);
  };

  // Enviar respuesta del usuario hacia el Admin
  const handleSendReply = async (e, ideaId) => {
    e.preventDefault();
    const content = replyTexts[ideaId]?.trim();
    if (!content) return;

    setSendingReplyId(ideaId);
    try {
      const savedMsg = await sendUserMessage(ideaId, content);

      setUserIdeas(prevIdeas =>
        prevIdeas.map(idea =>
          idea.id === ideaId
            ? { ...idea, messages: [...(idea.messages || []), savedMsg] }
            : idea
        )
      );

      setReplyTexts(prev => ({ ...prev, [ideaId]: '' }));
    } catch (error) {
      alert(`Error al enviar respuesta: ${error.message}`);
    } finally {
      setSendingReplyId(null);
    }
  };

  const services = [
    {
      icon: <Palette className="w-8 h-8 text-cyan-400" />,
      title: "Identidad de Marca & Branding",
      desc: "Diseño conceptual único, manuales de marca y estética visual memorable."
    },
    {
      icon: <Globe className="w-8 h-8 text-cyan-400" />,
      title: "Desarrollo Web & UI/UX",
      desc: "Experiencias digitales intuitivas, rápidas y optimizadas sin sobrecarga de nodos."
    },
    {
      icon: <Rocket className="w-8 h-8 text-cyan-400" />,
      title: "Estrategia Digital & Ads",
      desc: "Campañas de alto impacto orientadas a conversión y posicionamiento de marca."
    },
    {
      icon: <Layers className="w-8 h-8 text-cyan-400" />,
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

  const openCreatePanel = () => {
    if (!user) {
      setIsAuthOpen(true);
    } else {
      createModalRef.current?.showModal();
    }
  };

  const openHistoryPanel = () => {
    if (!user) {
      setIsAuthOpen(true);
    } else {
      fetchUserIdeas();
      historyModalRef.current?.showModal();
    }
  };

  const closeModals = () => {
    createModalRef.current?.close();
    historyModalRef.current?.close();
  };

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
        tiempo: '1 - 3 Meses',
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

  const handleDeleteIdea = async (id) => {
    if (!confirm("¿Deseas eliminar esta cotización de la base de datos?")) return;

    try {
      await deleteIdea(id);
      setUserIdeas(userIdeas.filter(idea => idea.id !== id));
    } catch (error) {
      alert(`Error al eliminar: ${error.message}`);
    }
  };

  const ideasEnRevision = userIdeas.filter(item => !item.estado || item.estado === 'en_revision' || item.estado === 'En revisión' || item.estado === 'revision');
  const ideasAceptadas = userIdeas.filter(item => item.estado === 'aceptada');
  const ideasRechazadas = userIdeas.filter(item => item.estado === 'rechazada');

  // Renderizador reutilizable de tarjeta con historial de chat y caja de respuesta
  const renderIdeaCard = (item, borderColor, badgeElement) => {
    const messages = item.messages || [];
    const fallbackAdminMsg = item.mensajeAdmin || item.respuestaAdmin || item.comentarioAdmin;

    return (
      <article key={item.id} className={`p-4 rounded-xl bg-[#090D16] border ${borderColor} flex flex-col gap-3`}>
        <div className="flex items-center justify-between">
          <nav>
            <h5 className="font-bold text-slate-50 text-sm">{item.titulo}</h5>
            <p className="text-xs text-slate-400">
              {item.servicio} • <span className="text-cyan-400 font-medium">{item.presupuesto}</span>
            </p>
          </nav>
          <div className="flex items-center gap-2">
            {badgeElement}
            <button
              onClick={() => handleDeleteIdea(item.id)}
              className="text-slate-500 hover:text-red-400 p-1 transition cursor-pointer"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* SECCIÓN DE CHAT BIDIRECCIONAL */}
        <div className="mt-1 pt-3 border-t border-slate-800 flex flex-col gap-2">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
            Chat directo con NovaCreativa
          </span>

          {/* Lista de mensajes */}
          <div className="space-y-2 max-h-36 overflow-y-auto pr-1 flex flex-col">
            {messages.length === 0 && fallbackAdminMsg && (
              <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-xs self-start max-w-[85%]">
                <span className="font-bold text-cyan-300 block text-[10px]">NovaCreativa</span>
                <p className="text-slate-200">{fallbackAdminMsg}</p>
              </div>
            )}

            {messages.length === 0 && !fallbackAdminMsg ? (
              <p className="text-[11px] text-slate-500 italic py-1">
                Aún no hay mensajes. Escribe si deseas agregar detalles o consultar sobre tu proyecto.
              </p>
            ) : (
              messages.map(msg => {
                const isMine = msg.senderId === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={`p-2.5 rounded-xl text-xs max-w-[85%] ${isMine
                      ? 'bg-cyan-600/20 border border-cyan-500/40 text-slate-50 self-end text-right'
                      : 'bg-slate-900 border border-slate-700 text-slate-200 self-start'
                      }`}
                  >
                    <span className={`block text-[10px] font-bold mb-0.5 ${isMine ? 'text-cyan-300' : 'text-blue-400'}`}>
                      {isMine ? 'Tú' : 'NovaCreativa Admin'}
                    </span>
                    <p className="leading-relaxed break-words">{msg.content}</p>
                  </div>
                );
              })
            )}
          </div>

          {/* Input para responder al Admin */}
          <form onSubmit={(e) => handleSendReply(e, item.id)} className="flex gap-2 mt-1">
            <input
              type="text"
              placeholder="Escribe un mensaje al administrador..."
              value={replyTexts[item.id] || ''}
              onChange={(e) => setReplyTexts(prev => ({ ...prev, [item.id]: e.target.value }))}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={sendingReplyId === item.id || !(replyTexts[item.id]?.trim())}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1 transition disabled:opacity-40 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </article>
    );
  };

  return (
    <>
      {/* NAVEGACIÓN PRINCIPAL CON LOGO OFICIAL */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#090D16]/90 border-b border-slate-800/80">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="#" className="flex items-center gap-3 group">
            <img
              src="/images/nova-logo.png"
              alt="Isotipo NovaCreativa"
              className="h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <img
              src="/images/nova-letras.png"
              alt="NovaCreativa"
              className="h-7 w-auto object-contain brightness-0 invert"
            />
          </a>

          <ul className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <li><a href="#servicios" className="hover:text-cyan-400 transition-colors">Servicios</a></li>
            <li><a href="#proceso" className="hover:text-cyan-400 transition-colors">Proceso</a></li>
            <li><a href="#portafolio" className="hover:text-cyan-400 transition-colors">Portafolio</a></li>
          </ul>

          <nav className="flex items-center gap-3">
            <button
              onClick={openCreatePanel}
              className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              Crear Idea
            </button>

            {user?.isAdmin && (
              <button
                onClick={() => setIsAdminOpen(true)}
                className="flex items-center gap-2 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-slate-200 px-5 py-2.5 rounded-full font-semibold text-sm transition-all cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                Panel Admin
              </button>
            )}

            <button
              onClick={openPortalEmpresa}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] cursor-pointer"
            >
              <User className="w-4 h-4" />
              {user ? `Panel: ${user.empresa || user.company}` : 'Acceso Empresa'}
            </button>

            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-slate-300 cursor-pointer">
              <Menu className="w-6 h-6" />
            </button>
          </nav>
        </nav>

        {/* Menú desplegable móvil */}
        {isMenuOpen && (
          <div className="md:hidden bg-[#111827] border-b border-slate-800 px-6 py-4 space-y-3">
            <a href="#servicios" onClick={() => setIsMenuOpen(false)} className="block text-sm text-slate-300 hover:text-cyan-400">Servicios</a>
            <a href="#proceso" onClick={() => setIsMenuOpen(false)} className="block text-sm text-slate-300 hover:text-cyan-400">Proceso</a>
            <a href="#portafolio" onClick={() => setIsMenuOpen(false)} className="block text-sm text-slate-300 hover:text-cyan-400">Portafolio</a>
            <button
              onClick={() => { setIsMenuOpen(false); openCreatePanel(); }}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm"
            >
              <FileText className="w-4 h-4" /> Crear Idea
            </button>
          </div>
        )}
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="min-h-screen bg-[#090D16] text-slate-50 selection:bg-cyan-500 selection:text-slate-950">
        {/* HERO CON FONDO ATMOSFÉRICO */}
        <section className="relative overflow-hidden border-b border-slate-800/60">
          {/* Cuadrícula tecnológica tenue */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25 pointer-events-none" />
          {/* Resplandor central Cian */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-500/15 blur-[120px] rounded-full pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-6 pt-28 pb-24 flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-widest mb-8 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
              <img src="/images/nova-logo.png" alt="" className="w-4 h-4 object-contain" />
              Estudio de Diseño & Desarrollo Digital
            </span>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight max-w-4xl leading-tight mb-8 text-slate-50">
              Diseñamos el{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                futuro.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
              Potencia tu marca con tecnología de vanguardia y diseño disruptivo.
            </p>

            <nav className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={openHistoryPanel}
                className="flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-[0_0_30px_rgba(6,182,212,0.35)] hover:scale-105 active:scale-95 border border-cyan-400/30 cursor-pointer"
              >
                {userIdeas.length === 1 ? 'Mi idea' : 'Mis ideas'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </nav>
          </div>
        </section>

        {/* SERVICIOS */}
        <section id="servicios" className="py-24 bg-[#111827]/40 border-b border-slate-800/80">
          <header className="max-w-7xl mx-auto px-6 text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-slate-50">Lo Que Hacemos</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Soluciones integrales para escalar tu negocio.</p>
          </header>

          <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((s, idx) => (
              <article key={idx} className="bg-[#111827] border border-slate-800 p-8 rounded-2xl hover:border-cyan-500/50 transition-all hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(6,182,212,0.12)]">
                <header className="mb-6 p-3 w-fit rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
                  {s.icon}
                </header>
                <h3 className="text-xl font-bold mb-3 text-slate-50">{s.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
              </article>
            ))}
          </section>
        </section>

        {/* PROCESO DE TRABAJO (SOLO LOS 4 PASOS) */}
        <section id="proceso" className="py-24 max-w-7xl mx-auto px-6 border-b border-slate-800/80">
          <header className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-widest mb-4">
              Nuestro Proceso de Trabajo
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-slate-50">
              Cómo Transformamos Ideas en Realidad
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Un flujo de trabajo claro, eficiente y colaborativo para materializar tus proyectos.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                num: "01",
                icon: <Lightbulb className="w-5 h-5 text-cyan-400" />,
                title: "1. Descubrimiento y Estrategia",
                desc: "Entendemos tu visión, analizamos el mercado y definimos el camino para el éxito."
              },
              {
                num: "02",
                icon: <PenTool className="w-5 h-5 text-cyan-400" />,
                title: "2. Diseño y Conceptualización",
                desc: "Creamos mockups, interfaces de usuario y experiencias atractivas y modernas."
              },
              {
                num: "03",
                icon: <Code2 className="w-5 h-5 text-cyan-400" />,
                title: "3. Desarrollo y Pruebas",
                desc: "Programamos y refinamos el código de tu sitio usando tecnología de punta."
              },
              {
                num: "04",
                icon: <Rocket className="w-5 h-5 text-cyan-400" />,
                title: "4. Entrega y Soporte",
                desc: "Lanzamos el producto final y brindamos optimización continua con soporte constante."
              }
            ].map((step) => (
              <article
                key={step.num}
                className="group bg-[#111827] border border-slate-800 p-7 rounded-2xl hover:border-cyan-500/60 transition-all hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-black text-base shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                      {step.num}
                    </span>
                    <div className="p-2.5 rounded-xl bg-[#090D16] border border-slate-800 group-hover:border-cyan-500/40 transition-colors">
                      {step.icon}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-50 mb-3 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* PORTAFOLIO */}
        <section id="portafolio" className="py-24 max-w-7xl mx-auto px-6">
          <header className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <nav>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-slate-50">Proyectos Destacados</h2>
              <p className="text-slate-400">Explora nuestro trabajo.</p>
            </nav>

            <nav className="flex gap-2 bg-[#111827] p-1.5 rounded-xl border border-slate-800">
              {['Todos', 'Branding', 'Web', '3D & Motion'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeFilter === cat
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.35)]'
                    : 'text-slate-400 hover:text-slate-50'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </nav>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredProjects.map(proj => (
              <article key={proj.id} className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-[#111827] hover:border-cyan-500/50 transition-all">
                <figure className="aspect-video overflow-hidden">
                  <img src={proj.image} alt={proj.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </figure>
                <footer className="p-6 flex items-center justify-between border-t border-slate-800 bg-[#111827]">
                  <nav>
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">{proj.category}</span>
                    <h3 className="text-xl font-bold text-slate-50 mt-1">{proj.title}</h3>
                  </nav>
                </footer>
              </article>
            ))}
          </section>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#090D16] border-t border-slate-800/80 py-12">
        <section className="max-w-7xl mx-auto px-6 text-center text-sm text-slate-400">
          <p>© 2026 NovaCreativa. Todos los derechos reservados.</p>
        </section>
      </footer>

      {/* 1. MODAL DE HISTORIAL CON CHAT BIDIRECCIONAL */}
      <dialog
        ref={historyModalRef}
        className="backdrop:bg-black/80 bg-[#111827] text-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-800 max-w-2xl w-full shadow-[0_0_50px_rgba(6,182,212,0.15)] backdrop-blur-2xl"
      >
        <header className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-cyan-400" />
            Historial de Ideas
          </h3>
          <button onClick={() => historyModalRef.current?.close()} className="text-slate-400 hover:text-slate-50 cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </header>

        {user && (
          <aside className="mb-6 p-4 rounded-2xl bg-[#090D16] border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
                <Building2 className="w-5 h-5" />
              </div>
              <nav>
                <span className="text-xs text-cyan-400 font-semibold uppercase tracking-wider">Empresa Registrada</span>
                <h4 className="text-base font-bold text-slate-50">{user.empresa || user.company}</h4>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs bg-cyan-950/60 text-cyan-300 px-3 py-1 rounded-full border border-cyan-500/30">
                {userIdeas.length} {userIdeas.length === 1 ? 'Idea' : 'Ideas'}
              </span>
              <button
                onClick={handleLogout}
                className="text-slate-400 hover:text-red-400 transition cursor-pointer"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </aside>
        )}

        {/* SECCIÓN 1: IDEAS EN REVISIÓN */}
        <section className="mb-6">
          <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" /> Ideas en Revisión
          </h4>
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {loadingIdeas ? (
              <p className="text-xs text-slate-400 py-3 text-center">Cargando...</p>
            ) : ideasEnRevision.length === 0 ? (
              <p className="text-xs text-slate-500 py-2 italic">No hay ideas en proceso de revisión actualmente.</p>
            ) : (
              ideasEnRevision.map(item =>
                renderIdeaCard(
                  item,
                  'border-amber-500/30',
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-950/60 text-amber-300 border border-amber-500/30">
                    En revisión
                  </span>
                )
              )
            )}
          </div>
        </section>

        {/* SECCIÓN 2: IDEAS ACEPTADAS */}
        <section className="mb-6">
          <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Ideas Aceptadas
          </h4>
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {ideasAceptadas.length === 0 ? (
              <p className="text-xs text-slate-500 py-2 italic">Aún no hay ideas aceptadas.</p>
            ) : (
              ideasAceptadas.map(item =>
                renderIdeaCard(
                  item,
                  'border-emerald-500/30',
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                    ✨ Idea aceptada
                  </span>
                )
              )
            )}
          </div>
        </section>

        {/* SECCIÓN 3: IDEAS RECHAZADAS */}
        <section className="mb-2">
          <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-400" /> Ideas Rechazadas
          </h4>
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {ideasRechazadas.length === 0 ? (
              <p className="text-xs text-slate-500 py-2 italic">No hay ideas rechazadas.</p>
            ) : (
              ideasRechazadas.map(item =>
                renderIdeaCard(
                  item,
                  'border-red-500/30',
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-red-950/60 text-red-300 border border-red-500/30">
                    ❌ Idea rechazada
                  </span>
                )
              )
            )}
          </div>
        </section>
      </dialog>

      {/* 2. MODAL DE CREACIÓN AMPLIADO */}
      <dialog
        ref={createModalRef}
        className="backdrop:bg-black/80 bg-transparent p-0 m-auto max-w-md w-full overflow-visible"
      >
        <div className="relative bg-[#0B1221] text-slate-50 p-6 sm:p-7 rounded-2xl border border-cyan-500/60 shadow-[0_0_45px_rgba(6,182,212,0.35)]">

          {/* Decoración de matriz de puntos cian */}
          <div className="hidden sm:grid grid-cols-3 gap-1.5 absolute -top-6 right-8 pointer-events-none opacity-60">
            {[...Array(6)].map((_, i) => (
              <span key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            ))}
          </div>
          <div className="hidden sm:grid grid-cols-3 gap-1.5 absolute -bottom-6 left-8 pointer-events-none opacity-60">
            {[...Array(6)].map((_, i) => (
              <span key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            ))}
          </div>

          {/* Cabecera del Modal */}
          <header className="flex justify-between items-center mb-5 pb-3 border-b border-slate-800/80">
            <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2.5 text-slate-50">
              <span className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
                <FileText className="w-4 h-4" />
              </span>
              Crear Nueva Idea
            </h3>
            <button
              type="button"
              onClick={() => createModalRef.current?.close()}
              className="text-slate-400 hover:text-slate-50 transition-colors cursor-pointer p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </header>

          {/* Formulario apilado de 5 campos */}
          <form onSubmit={handleSaveIdea} className="space-y-3.5">
            <label className="block">
              <span className="text-xs font-medium text-slate-300 mb-1.5 block">
                Nombre de tu proyecto/idea
              </span>
              <input
                ref={tituloRef}
                type="text"
                placeholder="Ej. Plataforma E-Commerce Neón"
                value={newIdea.titulo}
                onChange={(e) => setNewIdea({ ...newIdea, titulo: e.target.value })}
                className="w-full bg-[#070B14] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium text-slate-300 mb-1.5 block">
                Servicio requerido
              </span>
              <select
                value={newIdea.servicio}
                onChange={(e) => setNewIdea({ ...newIdea, servicio: e.target.value })}
                className="w-full bg-[#070B14] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-50 focus:outline-none focus:border-cyan-400 cursor-pointer transition-colors"
              >
                <option>Desarrollo Web & UI/UX</option>
                <option>Identidad de Marca & Branding</option>
                <option>Producción Audiovisual / 3D</option>
                <option>Estrategia Digital & Ads</option>
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-medium text-slate-300 mb-1.5 block">
                Presupuesto estimado
              </span>
              <select
                value={newIdea.presupuesto}
                onChange={(e) => setNewIdea({ ...newIdea, presupuesto: e.target.value })}
                className="w-full bg-[#070B14] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-50 focus:outline-none focus:border-cyan-400 cursor-pointer transition-colors"
              >
                <option>$500 - $1,000 USD</option>
                <option>$1,000 - $2,500 USD</option>
                <option>$2,500 - $5,000 USD</option>
                <option>Más de $5,000 USD</option>
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-medium text-slate-300 mb-1.5 block">
                Plazo estimado
              </span>
              <select
                value={newIdea.tiempo}
                onChange={(e) => setNewIdea({ ...newIdea, tiempo: e.target.value })}
                className="w-full bg-[#070B14] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-50 focus:outline-none focus:border-cyan-400 cursor-pointer transition-colors"
              >
                <option>1 - 3 Meses</option>
                <option>2 a 4 semanas</option>
                <option>1 a 2 semanas</option>
                <option>Flexible / Por definir</option>
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-medium text-slate-300 mb-1.5 block">
                Detalles del proyecto
              </span>
              <textarea
                rows={3}
                placeholder="Describe tu idea, objetivos y cualquier detalle importante..."
                value={newIdea.detalles}
                onChange={(e) => setNewIdea({ ...newIdea, detalles: e.target.value })}
                className="w-full bg-[#070B14] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 resize-none transition-colors"
              />
            </label>

            <footer className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-bold py-3 rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.45)] transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Enviando...' : 'Enviar idea para revisión'}
                <Send className="w-4 h-4" />
              </button>
            </footer>
          </form>
        </div>
      </dialog>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />
    </>
  );
}