import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Bell, Send } from "lucide-react";
import { toast } from "sonner";


import API from "@/config";
import { useAuth } from "@/context/AuthContext";

/* ---------------- TYPES ---------------- */

interface Reply {
  _id: string;
  comment: string;
  createdAt: string;

  user: {
    name: string;
  };
}

interface Comment {
  _id: string;

  product: {
    _id: string;
    name: string;
    slug: string;
  };

  user: {
    name: string;
  };

  rating: number;

  comment: string;

  replies: Reply[];

  createdAt: string;
}

/* ---------------- COMPONENT ---------------- */

const CommentPanel: React.FC = () => {
  const { token } = useAuth();

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const [replyText, setReplyText] = useState<Record<string, string>>({});

  const [notifications, setNotifications] = useState<Comment[]>([]);
  const [bellOpen, setBellOpen] = useState(false);

  /* ---------------- FETCH ALL (ADMIN) ---------------- */

  const fetchComments = async () => {
    try {
      const { data } = await axios.get(`${API}/reviews/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setComments(data);
    } catch (err) {
      toast.error("Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchComments();
  }, [token]);

  /* ---------------- POLLING REVIEWS (60s) ---------------- */
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
        fetchComments();
    }, 60000);

    return () => clearInterval(interval);
  }, [token]);

  /* ---------------- DELETE ---------------- */

  const deleteComment = async (id: string) => {
    try {
      await axios.delete(`${API}/reviews/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setComments((prev) => prev.filter((c) => c._id !== id));

      toast.success("Review deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  /* ---------------- REPLY ---------------- */

  const sendReply = async (reviewId: string) => {
    if (!replyText[reviewId]) return;

    try {
      const { data } = await axios.post(
        `${API}/reviews/${reviewId}/reply`,
        { comment: replyText[reviewId] },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setComments((prev) => prev.map((c) => (c._id === reviewId ? data : c)));

      setReplyText((prev) => ({ ...prev, [reviewId]: "" }));
    } catch {
      toast.error("Reply failed");
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="max-w-6xl mx-auto px-6 py-24">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-12">
        <h1 className="font-serif text-4xl">Product Reviews</h1>

        {/* 🔔 NOTIFICATION */}
        <div className="relative">
          <button
            onClick={() => setBellOpen((p) => !p)}
            className="relative p-3 rounded-full bg-white shadow hover:bg-gray-50"
          >
            <Bell size={20} />

            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 text-white rounded-full text-[10px] flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>

          <AnimatePresence>
            {bellOpen && notifications.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-4 w-80 bg-white rounded-3xl shadow-xl border p-4 z-50"
              >
                {notifications.map((n) => (
                  <div
                    key={n._id}
                    className="border-b last:border-none pb-3 mb-3"
                  >
                    <p className="font-semibold text-sm">{n.product.name}</p>

                    <p className="text-xs text-gray-500">{n.comment}</p>
                  </div>
                ))}

                <button
                  onClick={() => setNotifications([])}
                  className="text-xs text-pink-500 mt-2"
                >
                  Clear notifications
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* BODY */}
      {loading ? (
        <p className="text-center text-gray-400">Loading…</p>
      ) : (
        <div className="space-y-6">
          {comments.map((c) => (
            <motion.div
              key={c._id}
              layout
              className="bg-white rounded-3xl shadow p-8"
            >
              {/* TOP */}
              <div className="flex justify-between gap-6">
                <div>
                  <p className="font-semibold">{c.user.name}</p>

                  <p className="text-xs text-gray-400">
                    {c.product.name} • ⭐ {c.rating}
                  </p>

                  <p className="mt-2 text-sm text-gray-600">{c.comment}</p>
                </div>

                <button
                  onClick={() => deleteComment(c._id)}
                  className="text-red-400 hover:text-red-600"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* REPLIES */}
              {c.replies?.length > 0 && (
                <div className="mt-5 pl-6 border-l space-y-3">
                  {c.replies.map((r) => (
                    <div key={r._id}>
                      <p className="text-xs text-gray-400">
                        {r.user.name} •{" "}
                        {new Date(r.createdAt).toLocaleDateString()}
                      </p>

                      <p className="text-sm">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* REPLY BOX */}
              <div className="mt-6 flex gap-3">
                <input
                  placeholder="Write reply…"
                  value={replyText[c._id] || ""}
                  onChange={(e) =>
                    setReplyText((p) => ({
                      ...p,
                      [c._id]: e.target.value,
                    }))
                  }
                  className="flex-1 border rounded-xl px-4 py-2 text-sm"
                />

                <button
                  onClick={() => sendReply(c._id)}
                  className="bg-black text-white px-4 rounded-xl hover:bg-gray-800"
                >
                  <Send size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentPanel;
