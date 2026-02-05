import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
    MessageCircle,
    Send,
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2,
    User,
    Filter,
} from "lucide-react";
import API_BASE_URL from "@/config";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface Message {
    sender: "user" | "support";
    content: string;
    timestamp: string;
}

interface TicketUser {
    _id: string;
    name: string;
    email: string;
}

interface Ticket {
    _id: string;
    user: TicketUser;
    subject: string;
    category: string;
    status: "open" | "in-progress" | "resolved" | "closed";
    priority: string;
    messages: Message[];
    createdAt: string;
    updatedAt: string;
}

const statusColors = {
    open: "bg-yellow-100 text-yellow-700 border-yellow-200",
    "in-progress": "bg-blue-100 text-blue-700 border-blue-200",
    resolved: "bg-green-100 text-green-700 border-green-200",
    closed: "bg-gray-100 text-gray-500 border-gray-200",
};

const statusIcons = {
    open: <AlertCircle size={14} />,
    "in-progress": <Clock size={14} />,
    resolved: <CheckCircle2 size={14} />,
    closed: <CheckCircle2 size={14} />,
};

const priorityColors = {
    low: "text-gray-500",
    medium: "text-yellow-600",
    high: "text-red-600",
};

const TicketsPanel: React.FC = () => {
    const { token } = useAuth();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [loading, setLoading] = useState(true);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [replyStatus, setReplyStatus] = useState<string>("");

    useEffect(() => {
        fetchTickets();
    }, [statusFilter]);

    useEffect(() => {
        scrollToBottom();
    }, [selectedTicket?.messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const params = statusFilter ? `?status=${statusFilter}` : "";
            const res = await axios.get(`${API_BASE_URL}/tickets/admin/all${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTickets(res.data.tickets);
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch tickets");
        } finally {
            setLoading(false);
        }
    };

    const fetchTicketDetails = async (ticketId: string) => {
        try {
            // For admin, we need to get full ticket with messages
            // Using a workaround since we're admin
            const ticket = tickets.find((t) => t._id === ticketId);
            if (ticket) {
                // Fetch fresh data
                const res = await axios.get(`${API_BASE_URL}/tickets/admin/all`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const fullTicket = res.data.tickets.find((t: Ticket) => t._id === ticketId);
                setSelectedTicket(fullTicket || ticket);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSendReply = async () => {
        if (!newMessage.trim() || !selectedTicket) return;

        setSendingMessage(true);
        try {
            const res = await axios.post(
                `${API_BASE_URL}/tickets/admin/${selectedTicket._id}/reply`,
                {
                    content: newMessage,
                    status: replyStatus || undefined,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSelectedTicket(res.data);
            setNewMessage("");
            setReplyStatus("");
            fetchTickets(); // Refresh list
            toast.success("Reply sent!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to send reply");
        } finally {
            setSendingMessage(false);
        }
    };

    const handleUpdateStatus = async (ticketId: string, status: string) => {
        try {
            const res = await axios.patch(
                `${API_BASE_URL}/tickets/admin/${ticketId}/status`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (selectedTicket?._id === ticketId) {
                setSelectedTicket({ ...selectedTicket, status: status as Ticket["status"] });
            }
            fetchTickets();
            toast.success(`Status updated to ${status}`);
        } catch (err) {
            console.error(err);
            toast.error("Failed to update status");
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getTicketCounts = () => {
        const counts = { open: 0, "in-progress": 0, resolved: 0, closed: 0 };
        tickets.forEach((t) => counts[t.status]++);
        return counts;
    };

    const counts = getTicketCounts();

    return (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Stats Bar */}
            <div className="p-4 border-b border-gray-100 flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🎫</span>
                    <span className="font-semibold">Support Tickets</span>
                </div>
                <div className="flex gap-2 ml-auto">
                    <span className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium">
                        {counts.open} Open
                    </span>
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                        {counts["in-progress"]} In Progress
                    </span>
                    <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                        {counts.resolved} Resolved
                    </span>
                </div>
            </div>

            <div className="flex min-h-[600px]">
                {/* Tickets List */}
                <div className="w-1/3 border-r border-gray-100">
                    {/* Filter */}
                    <div className="p-3 border-b border-gray-100 flex items-center gap-2">
                        <Filter size={16} className="text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="text-sm bg-transparent border-none focus:outline-none cursor-pointer"
                        >
                            <option value="">All Tickets</option>
                            <option value="open">Open</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="animate-spin text-[#F8BBD0]" size={32} />
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <MessageCircle size={48} strokeWidth={1} />
                            <p className="mt-4">No tickets found</p>
                        </div>
                    ) : (
                        <div className="overflow-y-auto max-h-[530px]">
                            {tickets.map((ticket) => (
                                <div
                                    key={ticket._id}
                                    onClick={() => {
                                        setSelectedTicket(ticket);
                                    }}
                                    className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${selectedTicket?._id === ticket._id ? "bg-pink-50" : ""
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-1">
                                        <h3 className="font-medium text-sm line-clamp-1">
                                            {ticket.subject}
                                        </h3>
                                        <span
                                            className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold flex items-center gap-1 border ${statusColors[ticket.status]
                                                }`}
                                        >
                                            {statusIcons[ticket.status]}
                                            {ticket.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <User size={12} />
                                        <span>{ticket.user?.name || "Unknown"}</span>
                                        <span>•</span>
                                        <span className={priorityColors[ticket.priority as keyof typeof priorityColors]}>
                                            {ticket.priority}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">
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
                            <div className="p-4 border-b border-gray-100">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-semibold">{selectedTicket.subject}</h3>
                                        <p className="text-xs text-gray-500">
                                            {selectedTicket.user?.name} ({selectedTicket.user?.email})
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {selectedTicket.category} • {formatDate(selectedTicket.createdAt)}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <select
                                            value={selectedTicket.status}
                                            onChange={(e) => handleUpdateStatus(selectedTicket._id, e.target.value)}
                                            className={`text-xs px-3 py-1 rounded-full border font-medium cursor-pointer ${statusColors[selectedTicket.status]
                                                }`}
                                        >
                                            <option value="open">Open</option>
                                            <option value="in-progress">In Progress</option>
                                            <option value="resolved">Resolved</option>
                                            <option value="closed">Closed</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                                {selectedTicket.messages?.map((msg, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex ${msg.sender === "support" ? "justify-end" : "justify-start"
                                            }`}
                                    >
                                        <div
                                            className={`max-w-[70%] rounded-2xl px-4 py-3 ${msg.sender === "support"
                                                    ? "bg-[#F8BBD0] text-white"
                                                    : "bg-white text-gray-700 shadow-sm"
                                                }`}
                                        >
                                            <p className="text-xs font-medium mb-1 opacity-70">
                                                {msg.sender === "support" ? "Support Team" : "Customer"}
                                            </p>
                                            <p className="text-sm">{msg.content}</p>
                                            <p
                                                className={`text-[10px] mt-1 ${msg.sender === "support"
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

                            {/* Reply Area */}
                            {selectedTicket.status !== "closed" && (
                                <div className="p-4 border-t border-gray-100 bg-white">
                                    <div className="flex gap-2 mb-2">
                                        <select
                                            value={replyStatus}
                                            onChange={(e) => setReplyStatus(e.target.value)}
                                            className="text-xs px-3 py-1 rounded-full border border-gray-200 bg-gray-50 cursor-pointer"
                                        >
                                            <option value="">Keep Status</option>
                                            <option value="in-progress">Mark In Progress</option>
                                            <option value="resolved">Mark Resolved</option>
                                            <option value="closed">Close Ticket</option>
                                        </select>
                                    </div>
                                    <div className="flex gap-2">
                                        <textarea
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Type your reply..."
                                            rows={2}
                                            className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#F8BBD0] focus:ring-1 focus:ring-[#F8BBD0] resize-none"
                                        />
                                        <button
                                            onClick={handleSendReply}
                                            disabled={sendingMessage || !newMessage.trim()}
                                            className="h-auto w-12 bg-[#F8BBD0] rounded-xl flex items-center justify-center text-white hover:bg-[#F48FB1] transition-colors disabled:opacity-50"
                                        >
                                            {sendingMessage ? (
                                                <Loader2 className="animate-spin" size={20} />
                                            ) : (
                                                <Send size={20} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <MessageCircle size={64} strokeWidth={1} />
                            <p className="mt-4">Select a ticket to view and reply</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TicketsPanel;
