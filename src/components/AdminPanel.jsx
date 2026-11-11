import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, XCircle, MessageSquare, Send, ShieldAlert, Building2 } from 'lucide-react';

export default function AdminPanel({ isOpen, onClose }) {
    const [ideas, setIdeas] = useState([]);
    const [selectedIdea, setSelectedIdea] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchAdminIdeas();
        }
    }, [isOpen]);

    // Cargar todas las ideas de los usuarios
    const fetchAdminIdeas = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/admin/ideas', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setIdeas(data);
            if (data.length > 0 && !selectedIdea) {
                setSelectedIdea(data[0]);
                fetchMessages(data[0].id);
            }
        } catch (error) {
            console.error("Error al cargar ideas de admin:", error);
        }
    };

    // Cargar mensajes de una idea específica
    const fetchMessages = async (ideaId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/admin/ideas/${ideaId}/messages`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setMessages(data);
        } catch (error) {
            console.error("Error al cargar mensajes:", error);
        }
    };

    // Enviar mensaje en el chat
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedIdea) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/admin/ideas/${selectedIdea.id}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ content: newMessage })
            });
            if (res.ok) {
                setNewMessage('');
                fetchMessages(selectedIdea.id);
            }
        } catch (error) {
            console.error("Error al enviar mensaje:", error);
        }
    };

    // Cambiar estado (Aceptar o Rechazar)
    const handleUpdateStatus = async (id, estado) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:5000/api/admin/ideas/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ estado })
            });
            fetchAdminIdeas();
            if (selectedIdea?.id === id) {
                setSelectedIdea({ ...selectedIdea, estado });
            }
            alert(`Idea marcada como ${estado} exitosamente.`);
        } catch (error) {
            alert("Error al actualizar estado");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
            <div className="bg-zinc-900 text-white p-6 rounded-3xl border border-purple-500/50 max-w-5xl w-full h-[85vh] flex flex-col shadow-2xl relative">
                <header className="flex justify-between items-center pb-4 border-b border-purple-900/40">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-purple-400">
                        <ShieldAlert className="w-6 h-6" /> Panel de Administración - NovaCreativa
                    </h3>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white cursor-pointer"><X className="w-6 h-6" /></button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 overflow-hidden mt-4">
                    {/* Columna 1: Lista de Ideas */}
                    <div className="md:col-span-1 space-y-3 overflow-y-auto pr-2 border-r border-zinc-800">
                        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Ideas Recibidas ({ideas.length})</h4>
                        {ideas.map(idea => (
                            <div
                                key={idea.id}
                                onClick={() => { setSelectedIdea(idea); fetchMessages(idea.id); }}
                                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${selectedIdea?.id === idea.id ? 'bg-purple-950/60 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'bg-zinc-950 border-purple-900/40 hover:border-purple-500/50'}`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <Building2 className="w-3.5 h-3.5 text-purple-400" />
                                    <span className="text-xs text-purple-300 font-semibold">{idea.user?.empresa || 'Empresa'}</span>
                                </div>
                                <h5 className="font-bold text-white text-sm line-clamp-1">{idea.titulo}</h5>
                                <p className="text-xs text-zinc-400 mt-1">{idea.servicio}</p>
                                <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-800/80">
                                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${idea.estado === 'aceptada' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : idea.estado === 'rechazada' ? 'bg-red-950 text-red-300 border border-red-500/30' : 'bg-amber-950 text-amber-300 border border-amber-500/30'}`}>
                                        {idea.estado}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Columna 2 y 3: Chat Estilo Messenger y Acciones */}
                    <div className="md:col-span-2 bg-zinc-950 rounded-2xl border border-purple-900/40 p-4 flex flex-col justify-between overflow-hidden">
                        {selectedIdea ? (
                            <>
                                {/* Cabecera de la idea seleccionada */}
                                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                                    <div>
                                        <h4 className="font-bold text-base text-white">{selectedIdea.titulo}</h4>
                                        <p className="text-xs text-zinc-400">Cliente: <span className="text-purple-300">{selectedIdea.user?.nombre} ({selectedIdea.user?.email})</span> • {selectedIdea.presupuesto}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleUpdateStatus(selectedIdea.id, 'aceptada')}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-xl text-xs font-bold transition border border-emerald-500/40 cursor-pointer"
                                        >
                                            <CheckCircle2 className="w-4 h-4" /> Aceptar
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(selectedIdea.id, 'rechazada')}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white rounded-xl text-xs font-bold transition border border-red-500/40 cursor-pointer"
                                        >
                                            <XCircle className="w-4 h-4" /> Rechazar
                                        </button>
                                    </div>
                                </div>

                                {/* Historial de Mensajes tipo Chat */}
                                <div className="flex-1 overflow-y-auto py-4 space-y-3 px-2">
                                    {messages.length === 0 ? (
                                        <div className="text-center text-zinc-500 my-auto pt-16">
                                            <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                            <p className="text-xs">No hay mensajes en esta conversación aún. Escribe el primer mensaje para coordinar detalles con el usuario.</p>
                                        </div>
                                    ) : (
                                        messages.map((msg, idx) => (
                                            <div key={idx} className={`flex ${msg.senderId === 'admin-master-id' ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[75%] p-3 rounded-2xl text-xs ${msg.senderId === 'admin-master-id' ? 'bg-purple-600 text-white rounded-br-none' : 'bg-zinc-800 text-zinc-200 rounded-bl-none'}`}>
                                                    <p>{msg.content}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Input de Enviar Mensaje */}
                                <form onSubmit={handleSendMessage} className="flex gap-2 pt-3 border-t border-zinc-800">
                                    <input
                                        type="text"
                                        placeholder="Escribe un mensaje al usuario..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        className="flex-1 bg-zinc-900 border border-purple-900/50 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-400"
                                    />
                                    <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 rounded-xl font-bold flex items-center justify-center transition cursor-pointer">
                                        <Send className="w-4 h-4" />
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="text-center text-zinc-500 my-auto">
                                <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-40" />
                                <p className="text-sm">Selecciona una idea de la izquierda para ver el chat y gestionarla.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}