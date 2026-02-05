import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
    MessageCircle,
    Plus,
    ChevronLeft,
    Send,
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2,
    X
} from "lucide-react";
import API_BASE_URL from "../config.js";
import { useAuth } from "@/context/AuthContext.js";
import { toast } from "sonner";
import Button from "../components/Button";

interface Message {
    sender: "user" | "support";
    content: string;
    timestamp: string;
}

interface Ticket {
    _id: string;
    subject: string;
    category: string;
    status: "open" | "in-progress" | "resolved" | "closed";
    priority: string;
    messages: Message[];
    createdAt: string;
    updatedAt: string;
}

const statusColors = {
    open: "bg-yellow-100 text-yellow-700",
    "in-progress": "bg-blue-100 text-blue-700",
    resolved: "bg-green-100 text-green-700",
    closed: "bg-gray-100 text-gray-500",
};

const statusIcons = {
    open: <AlertCircle size={14} />,
    "in-progress": <Clock size={14} />,
    resolved: <CheckCircle2 size={14} />,
    closed: <CheckCircle2 size={14} />,
};

const SupportTickets: React.FC = () => {
    const navigate = useNavigate();
    const { token } = useAuth();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [loading, setLoading] = useState(true);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTicket, setNewTicket] = useState({
        subject: "",
        category: "other",
        message: "",
    });

    useEffect(() => {
        fetchTickets();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [selectedTicket?.messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchTickets = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/tickets/my-tickets`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTickets(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch tickets");
        } finally {
            setLoading(false);
        }
    };

    const fetchTicketDetails = async (ticketId: string) => {
        try {
            const res = await axios.get(`${API_BASE_URL}/tickets/${ticketId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSelectedTicket(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch ticket details");
        }
    };

    const handleCreateTicket = async () => {
        if (!newTicket.subject || !newTicket.message) {
            toast.error("Subject and message are required");
            return;
        }

        try {
            const res = await axios.post(
                `${API_BASE_URL}/tickets`,
                newTicket,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setTickets([res.data, ...tickets]);
            setShowCreateModal(false);
            setNewTicket({ subject: "", category: "other", message: "" });
            toast.success("Ticket created successfully!");
            fetchTicketDetails(res.data._id);
        } catch (err) {
            console.error(err);
            toast.error("Failed to create ticket");
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedTicket) return;

        setSendingMessage(true);
        try {
            const res = await axios.post(
                `${API_BASE_URL}/tickets/${selectedTicket._id}/message`,
                { content: newMessage },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSelectedTicket(res.data);
            setNewMessage("");
        } catch (err) {
            console.error(err);
            toast.error("Failed to send message");
        } finally {
            setSendingMessage(false);
        }
    };

    const handleCloseTicket = async () => {
        if (!selectedTicket) return;

        try {
            await axios.patch(
                `${API_BASE_URL}/tickets/${selectedTicket._id}/close`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSelectedTicket({ ...selectedTicket, status: "closed" });
            fetchTickets();
            toast.success("Ticket closed");
        } catch (err) {
            console.error(err);
            toast.error("Failed to close ticket");
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="min-h-screen bg-[#FAF9F6] py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/profile")}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <div>
                            <h1 className="font-serif text-3xl font-bold text-[#1A1A1A]">
                                Support Tickets
                            </h1>
                            <p className="text-gray-500 text-sm">
                                Get help from our support team
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2"
                    >
                        <Plus size={18} />
                        New Ticket
                    </Button>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-3xl shadow-lg overflow-hidden min-h-[600px] flex">
                    {/* Tickets List */}
                    <div className="w-1/3 border-r border-gray-100">
                        <div className="p-4 border-b border-gray-100">
                            <h2 className="font-semibold text-gray-700">Your Tickets</h2>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <Loader2 className="animate-spin text-[#F8BBD0]" size={32} />
                            </div>
                        ) : tickets.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                <MessageCircle size={48} strokeWidth={1} />
                                <p className="mt-4">No tickets yet</p>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="mt-2 text-[#F8BBD0] hover:underline text-sm"
                                >
                                    Create your first ticket
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-y-auto max-h-[530px]">
                                {tickets.map((ticket) => (
                                    <div
                                        key={ticket._id}
                                        onClick={() => fetchTicketDetails(ticket._id)}
                                        className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${selectedTicket?._id === ticket._id ? "bg-pink-50" : ""
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="font-medium text-sm line-clamp-1">
                                                {ticket.subject}
                                            </h3>
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold flex items-center gap-1 ${statusColors[ticket.status]
                                                    }`}
                                            >
                                                {statusIcons[ticket.status]}
                                                {ticket.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400">
                                            {formatDate(ticket.createdAt)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col">
                        {selectedTicket ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold">{selectedTicket.subject}</h3>
                                        <p className="text-xs text-gray-400">
                                            {selectedTicket.category} • Created {formatDate(selectedTicket.createdAt)}
                                        </p>
                                    </div>
                                    {selectedTicket.status !== "closed" && (
                                        <button
                                            onClick={handleCloseTicket}
                                            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            Close Ticket
                                        </button>
                                    )}
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {selectedTicket.messages.map((msg, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"
                                                }`}
                                        >
                                            <div
                                                className={`max-w-[70%] rounded-2xl px-4 py-3 ${msg.sender === "user"
                                                        ? "bg-[#F8BBD0] text-white"
                                                        : "bg-gray-100 text-gray-700"
                                                    }`}
                                            >
                                                <p className="text-sm">{msg.content}</p>
                                                <p
                                                    className={`text-[10px] mt-1 ${msg.sender === "user"
                                                            ? "text-white/70"
                                                            : "text-gray-400"
                                                        }`}
                                                >
                                                    {formatDate(msg.timestamp)}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                {selectedTicket.status !== "closed" ? (
                                    <div className="p-4 border-t border-gray-100">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                                                placeholder="Type your message..."
                                                className="flex-1 h-12 bg-gray-50 border border-gray-100 rounded-2xl px-4 text-sm focus:outline-none focus:border-[#F8BBD0] focus:ring-1 focus:ring-[#F8BBD0]"
                                            />
                                            <button
                                                onClick={handleSendMessage}
                                                disabled={sendingMessage || !newMessage.trim()}
                                                className="h-12 w-12 bg-[#F8BBD0] rounded-2xl flex items-center justify-center text-white hover:bg-[#F48FB1] transition-colors disabled:opacity-50"
                                            >
                                                {sendingMessage ? (
                                                    <Loader2 className="animate-spin" size={20} />
                                                ) : (
                                                    <Send size={20} />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 border-t border-gray-100 text-center text-gray-400 text-sm">
                                        This ticket is closed
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                                <MessageCircle size={64} strokeWidth={1} />
                                <p className="mt-4">Select a ticket to view conversation</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Ticket Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowCreateModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-3xl p-8 w-full max-w-md"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="font-serif text-2xl font-bold">Create Ticket</h2>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-2">
                                        Subject
                                    </label>
                                    <input
                                        type="text"
                                        value={newTicket.subject}
                                        onChange={(e) =>
                                            setNewTicket({ ...newTicket, subject: e.target.value })
                                        }
                                        placeholder="Brief description of your issue"
                                        className="w-full h-12 bg-gray-50 border border-gray-100 rounded-2xl px-4 text-sm focus:outline-none focus:border-[#F8BBD0] focus:ring-1 focus:ring-[#F8BBD0]"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={newTicket.category}
                                        onChange={(e) =>
                                            setNewTicket({ ...newTicket, category: e.target.value })
                                        }
                                        className="w-full h-12 bg-gray-50 border border-gray-100 rounded-2xl px-4 text-sm focus:outline-none focus:border-[#F8BBD0] focus:ring-1 focus:ring-[#F8BBD0]"
                                    >
                                        <option value="order">Order Issue</option>
                                        <option value="product">Product Question</option>
                                        <option value="payment">Payment Issue</option>
                                        <option value="delivery">Delivery Issue</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-2">
                                        Message
                                    </label>
                                    <textarea
                                        value={newTicket.message}
                                        onChange={(e) =>
                                            setNewTicket({ ...newTicket, message: e.target.value })
                                        }
                                        placeholder="Describe your issue in detail..."
                                        rows={4}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm focus:outline-none focus:border-[#F8BBD0] focus:ring-1 focus:ring-[#F8BBD0] resize-none"
                                    />
                                </div>

                                <Button
                                    variant="primary"
                                    onClick={handleCreateTicket}
                                    className="w-full h-12"
                                >
                                    Create Ticket
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SupportTickets;
