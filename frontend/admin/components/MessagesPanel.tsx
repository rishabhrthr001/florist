import { useState, useEffect } from "react";
import { MessageSquare, Trash2, Check } from "lucide-react";
import React from "react";
import axios from "axios";
import { toast } from "sonner";
import API from "../../config";
import { useAuth } from "../../context/AuthContext";
import ConfirmDialog from "../../components/ConfirmDialog";

interface Message {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const MessagesPanel = () => {
  const { token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    messageId: string | null;
  }>({ isOpen: false, messageId: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const selectedMsg = messages.find((m) => m._id === selectedId) || null;

  const fetchMessages = async () => {
    try {
      const { data } = await axios.get(`${API}/contact`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(data);
      if (data.length > 0 && !selectedId) {
        setSelectedId(data[0]._id);
      }
    } catch (err) {
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await axios.put(
        `${API}/contact/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages((prev) =>
        prev.map((m) => (m._id === id ? { ...m, isRead: true } : m))
      );
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const openDeleteConfirm = (id: string) => {
    setDeleteConfirm({ isOpen: true, messageId: id });
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirm({ isOpen: false, messageId: null });
  };

  const deleteMessage = async () => {
    if (!deleteConfirm.messageId) return;

    try {
      setIsDeleting(true);
      await axios.delete(`${API}/contact/${deleteConfirm.messageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const newMessages = messages.filter(
        (m) => m._id !== deleteConfirm.messageId
      );
      setMessages(newMessages);

      if (selectedId === deleteConfirm.messageId) {
        setSelectedId(newMessages[0]?._id || null);
      }

      toast.success("Message deleted");
      closeDeleteConfirm();
    } catch {
      toast.error("Delete failed");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return <p className="text-sm text-gray-400">Loading messages...</p>;
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Sidebar list */}
        <div className="lg:col-span-1 bg-white rounded-2xl md:rounded-3xl border border-[#E5E5E5] p-5 space-y-3 max-h-[70vh] overflow-y-auto no-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg._id}
              onClick={() => {
                setSelectedId(msg._id);
                if (!msg.isRead) markAsRead(msg._id);
              }}
              className={`relative p-4 rounded-xl cursor-pointer transition-all border group ${selectedId === msg._id
                  ? "bg-[#FDF2F5] border-[#F8BBD0]"
                  : "bg-white border-transparent hover:bg-gray-100"
                }`}
            >
              {!msg.isRead && (
                <div className="absolute top-3 left-3 w-2 h-2 bg-[#F8BBD0] rounded-full" />
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openDeleteConfirm(msg._id);
                }}
                className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all text-gray-400"
              >
                <Trash2 size={14} />
              </button>

              <div className="flex justify-between items-start mb-1">
                <h4 className="text-xs font-bold truncate max-w-[120px]">
                  {msg.name}
                </h4>
                <span className="text-[9px] text-gray-400">
                  {formatDate(msg.createdAt)}
                </span>
              </div>

              <p className="text-[11px] font-semibold text-gray-700 truncate mb-1">
                {msg.subject}
              </p>

              <p className="text-[10px] text-gray-500 line-clamp-1">
                {msg.message}
              </p>
            </div>
          ))}

          {messages.length === 0 && (
            <div className="text-center py-12 text-gray-400 italic text-sm">
              No inquiries in your inbox.
            </div>
          )}
        </div>

        {/* Message View */}
        <div className="lg:col-span-2 bg-white rounded-2xl md:rounded-3xl border border-[#E5E5E5] p-6 md:p-10 flex flex-col min-h-[300px]">
          {selectedMsg ? (
            <>
              <div className="border-b border-gray-100 pb-6 md:pb-8 mb-6 md:mb-8 flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-[#F8BBD0] uppercase tracking-widest mb-1 block">
                    Customer Inquiry
                  </span>

                  <h2 className="text-xl md:text-2xl font-bold mb-1">
                    {selectedMsg.subject}
                  </h2>

                  <p className="text-[11px] md:text-sm text-gray-500">
                    From: {selectedMsg.name} ({selectedMsg.email})
                  </p>
                  <p className="text-[10px] text-gray-400">
                    Phone: {selectedMsg.phone}
                  </p>
                </div>

                <div className="flex gap-2">
                  {!selectedMsg.isRead && (
                    <button
                      onClick={() => markAsRead(selectedMsg._id)}
                      className="p-3 text-gray-400 hover:text-green-500 transition-colors bg-gray-50 rounded-full"
                    >
                      <Check size={18} />
                    </button>
                  )}

                  <button
                    onClick={() => openDeleteConfirm(selectedMsg._id)}
                    className="p-3 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 rounded-full"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="flex-1 text-xs md:text-sm text-gray-600 leading-relaxed italic mb-8">
                "{selectedMsg.message}"
              </div>

              <div className="pt-6 md:pt-8 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
                <a
                  href={`mailto:${selectedMsg.email}?subject=Re: ${selectedMsg.subject}`}
                  className="w-full sm:flex-1 bg-[#1A1A1A] text-white px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-wider text-center"
                >
                  Reply via Email
                </a>

                <a
                  href={`tel:${selectedMsg.phone}`}
                  className="w-full sm:w-auto border border-gray-200 px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-500 text-center"
                >
                  Call Customer
                </a>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 italic text-sm">
              <MessageSquare size={48} className="mb-4 opacity-20" />
              Select a message to read the full inquiry
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={closeDeleteConfirm}
        onConfirm={deleteMessage}
        title="Delete Message"
        message="Are you sure you want to delete this message? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        isDanger={true}
        isLoading={isDeleting}
      />
    </>
  );
};

export default MessagesPanel;

