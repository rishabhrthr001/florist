import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import axios from "axios";
import React from "react";
import { toast } from "sonner";
import API from "../../config";
import ConfirmDialog from "../../components/ConfirmDialog";

const TagPanel = () => {
  const [tags, setTags] = useState<any[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    tagId: string | null;
    tagName: string;
  }>({ isOpen: false, tagId: null, tagName: "" });
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTags = async () => {
    try {
      const { data } = await axios.get(`${API}/tag`);
      setTags(data);
    } catch (err) {
      toast.error("Failed to load tags");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    try {
      setIsSubmitting(true);
      const { data } = await axios.post(`${API}/tag/add`, { name: newTagName.trim() });
      setTags((prev) => [...prev, data].sort((a,b) => a.name.localeCompare(b.name)));
      setNewTagName("");
      toast.success("Tag added successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Failed to add tag");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteConfirm = (id: string, name: string) => {
    setDeleteConfirm({ isOpen: true, tagId: id, tagName: name });
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirm({ isOpen: false, tagId: null, tagName: "" });
  };

  const removeTag = async () => {
    if (!deleteConfirm.tagId) return;

    try {
      setIsDeleting(true);
      await axios.delete(`${API}/tag/${deleteConfirm.tagId}`);
      setTags((prev) => prev.filter((t) => t._id !== deleteConfirm.tagId));
      toast.success("Tag removed");
      closeDeleteConfirm();
    } catch (err) {
      toast.error("Delete failed");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm mb-10">
        <h2 className="text-lg font-bold mb-6">Create New Tag</h2>
        <form onSubmit={handleCreateTag} className="flex gap-4">
          <input 
            type="text" 
            placeholder="e.g. Wellness, Thank You, Baby Shower" 
            className="flex-1 p-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#EE1C47]"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            disabled={isSubmitting}
          />
          <button 
            type="submit"
            disabled={isSubmitting || !newTagName.trim()}
            className="bg-[#1A1A1A] text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-[#EE1C47] transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <Plus size={16} />
            Add Tag
          </button>
        </form>
      </div>

      <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-bold">Available Tags ({tags.length})</h2>
          {isLoading && <span className="text-xs text-gray-400 animate-pulse uppercase font-bold tracking-widest">Refreshing...</span>}
        </div>

        <div className="flex flex-wrap gap-3">
          {tags.map((tag) => (
            <div 
              key={tag._id} 
              className="bg-gray-50 border border-gray-100 px-4 py-2.5 rounded-full flex items-center gap-3 group hover:border-[#EE1C47]/30 transition-all hover:bg-white"
            >
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">{tag.name}</span>
              <button 
                onClick={() => openDeleteConfirm(tag._id, tag.name)}
                className="text-gray-300 hover:text-red-500 transition-colors"
                title="Delete Tag"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          {!isLoading && tags.length === 0 && (
            <p className="text-gray-400 italic text-sm py-10 w-full text-center">No tags found. Add one above.</p>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={closeDeleteConfirm}
        onConfirm={removeTag}
        title="Delete Tag"
        message={`Are you sure you want to delete "${deleteConfirm.tagName}"? This will not remove the tag from existing products, but it will no longer be available for selection.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        isDanger={true}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default TagPanel;
