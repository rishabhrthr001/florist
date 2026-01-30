import { useState } from "react";
import { MessageSquare, Trash2 } from "lucide-react";
import React from "react";
import { Message } from "../../types";

interface MessagesPanelProps {
  messages?: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

/**
 * Defensive: messages default to []
 * so map/find never crash.
 */
const MessagesPanel = ({ messages = [], setMessages }: MessagesPanelProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(
    messages[0]?.id || null,
  );

  const selectedMsg = messages.find((m) => m.id === selectedId) || null;

  const deleteMessage = (id: string) => {
    const newMessages = messages.filter((m) => m.id !== id);
    setMessages(newMessages);

    if (selectedId === id) setSelectedId(newMessages[0]?.id || null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
      {/* Sidebar list */}
      <div className="lg:col-span-1 bg-white rounded-2xl md:rounded-3xl border border-[#E5E5E5] p-5 space-y-3 max-h-[70vh] overflow-y-auto no-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            onClick={() => setSelectedId(msg.id)}
            className={`relative p-4 rounded-xl cursor-pointer transition-all border group ${
              selectedId === msg.id
                ? "bg-[#FDF2F5] border-[#F8BBD0]"
                : "bg-white border-transparent hover:bg-gray-100"
            }`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteMessage(msg.id);
              }}
              className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all text-gray-400"
            >
              <Trash2 size={14} />
            </button>

            <div className="flex justify-between items-start mb-1">
              <h4 className="text-xs font-bold truncate max-w-[120px]">
                {msg.sender}
              </h4>
              <span className="text-[9px] text-gray-400">{msg.date}</span>
            </div>

            <p className="text-[11px] font-semibold text-gray-700 truncate mb-1">
              {msg.subject}
            </p>

            <p className="text-[10px] text-gray-500 line-clamp-1">
              {msg.content}
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
                  From: {selectedMsg.sender} ({selectedMsg.email})
                </p>
              </div>

              <button
                onClick={() => deleteMessage(selectedMsg.id)}
                className="p-3 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 rounded-full"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="flex-1 text-xs md:text-sm text-gray-600 leading-relaxed italic mb-8">
              "{selectedMsg.content}"
            </div>

            <div className="pt-6 md:pt-8 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
              <button className="w-full sm:flex-1 bg-[#1A1A1A] text-white px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-wider">
                Reply via Email
              </button>

              <button className="w-full sm:w-auto border border-gray-200 px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-500">
                Archive Thread
              </button>
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
  );
};

export default MessagesPanel;
