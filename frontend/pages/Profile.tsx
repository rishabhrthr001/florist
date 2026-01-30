import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  Mail,
  Package,
  CreditCard,
  X,
  Pencil,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

import { useAuth } from "@/context/AuthContext";
import API from "../config";

/* ---------------- TYPES ---------------- */

interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

/* ---------------- COMPONENT ---------------- */

const Profile: React.FC = () => {
  const { user, token, login } = useAuth();

  const [openAddressModal, setOpenAddressModal] = useState(false);

  const [savingPhone, setSavingPhone] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  const [editingPhone, setEditingPhone] = useState(false);

  const [phone, setPhone] = useState(user?.phone || "");

  const [address, setAddress] = useState<Address>({
    line1: user?.address?.line1 || "",
    line2: user?.address?.line2 || "",
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    zip: user?.address?.zip || "",
    country: user?.address?.country || "",
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Not logged in.</p>
      </div>
    );
  }

  /* ---------------- SAVE PHONE ---------------- */

  const savePhone = async () => {
    try {
      setSavingPhone(true);

      const { data } = await axios.patch(
        `${API}/user/me`,
        { phone },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      login(token!, data);
      toast.success("Phone updated 📞");
      setEditingPhone(false);
    } catch {
      toast.error("Failed to update phone");
    } finally {
      setSavingPhone(false);
    }
  };

  /* ---------------- SAVE ADDRESS ---------------- */

  const saveAddress = async () => {
    try {
      setSavingAddress(true);

      const { data } = await axios.patch(
        `${API}/user/me`,
        { address },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      login(token!, data);
      toast.success("Address updated 📍");
      setOpenAddressModal(false);
    } catch {
      toast.error("Failed to update address");
    } finally {
      setSavingAddress(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#FAF9F6] pt-40 pb-24 px-6">
        <div className="max-w-5xl mx-auto space-y-14">
          {/* Header */}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] shadow-xl p-10 md:p-14"
          >
            <h1 className="font-serif text-4xl md:text-5xl mb-3">My Atelier</h1>
            <p className="text-gray-500 text-sm">
              Manage your account and deliveries.
            </p>

            <div className="mt-10 grid md:grid-cols-3 gap-6">
              <Stat
                label="Orders"
                value={user.totalOrders ?? 0}
                icon={<Package />}
              />
              <Stat
                label="Total Spent"
                value={`₹${user.totalSpent ?? 0}`}
                icon={<CreditCard />}
              />
              <Stat
                label="Member Since"
                value={new Date(user.createdAt).toLocaleDateString()}
                icon={<Package />}
              />
            </div>
          </motion.div>

          {/* Info + Address */}

          <div className="grid md:grid-cols-2 gap-8">
            {/* Personal */}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] shadow-lg p-10"
            >
              <h2 className="font-serif text-2xl mb-6">Personal Details</h2>

              {/* PHONE INLINE EDIT */}

              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-4">
                  <div className="text-[#F8BBD0]">
                    <Phone />
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400">
                      Phone
                    </p>

                    {!editingPhone ? (
                      <p className="text-sm">{user.phone || "-"}</p>
                    ) : (
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="mt-1 h-9 border rounded-lg px-3 text-sm"
                      />
                    )}
                  </div>
                </div>

                {!editingPhone ? (
                  <button onClick={() => setEditingPhone(true)}>
                    <Pencil size={16} />
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingPhone(false);
                        setPhone(user.phone || "");
                      }}
                    >
                      <X size={16} />
                    </button>

                    <button onClick={savePhone} disabled={savingPhone}>
                      <Check size={16} />
                    </button>
                  </div>
                )}
              </div>

              <InfoRow
                icon={<Mail />}
                label="Email"
                value={user.email || "-"}
              />
            </motion.div>

            {/* Address */}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] shadow-lg p-10"
            >
              <h2 className="font-serif text-2xl mb-6">Shipping Address</h2>

              {user.address ? (
                <div className="space-y-3 text-sm text-gray-600">
                  <p>{user.address.line1}</p>
                  {user.address.line2 && <p>{user.address.line2}</p>}
                  <p>
                    {user.address.city}, {user.address.state}
                  </p>
                  <p>
                    {user.address.zip}, {user.address.country}
                  </p>
                </div>
              ) : (
                <p className="text-gray-400 italic text-sm">
                  No address saved yet.
                </p>
              )}

              <button
                onClick={() => setOpenAddressModal(true)}
                className="mt-6 px-6 py-3 rounded-full border text-xs uppercase tracking-widest hover:border-[#F8BBD0] hover:text-[#F8BBD0]"
              >
                Edit Address
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ---------------- ADDRESS MODAL ---------------- */}

      <AnimatePresence>
        {openAddressModal && (
          <Modal
            title="Update Address"
            onClose={() => setOpenAddressModal(false)}
          >
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Line 1"
                value={address.line1}
                onChange={(v) => setAddress({ ...address, line1: v })}
              />
              <Input
                label="Line 2"
                value={address.line2 || ""}
                onChange={(v) => setAddress({ ...address, line2: v })}
              />
              <Input
                label="City"
                value={address.city}
                onChange={(v) => setAddress({ ...address, city: v })}
              />
              <Input
                label="State"
                value={address.state}
                onChange={(v) => setAddress({ ...address, state: v })}
              />
              <Input
                label="Zip"
                value={address.zip}
                onChange={(v) => setAddress({ ...address, zip: v })}
              />
              <Input
                label="Country"
                value={address.country}
                onChange={(v) => setAddress({ ...address, country: v })}
              />
            </div>

            <ModalActions
              saving={savingAddress}
              onCancel={() => setOpenAddressModal(false)}
              onSave={saveAddress}
            />
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
};

export default Profile;

/* ---------------- SMALL COMPONENTS ---------------- */

const Modal = ({ title, onClose, children }: any) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-6"
  >
    <motion.div
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0.9 }}
      className="bg-white rounded-[2.5rem] w-full max-w-xl p-10 relative"
    >
      <button onClick={onClose} className="absolute right-6 top-6">
        <X />
      </button>

      <h2 className="font-serif text-3xl mb-8">{title}</h2>

      {children}
    </motion.div>
  </motion.div>
);

const ModalActions = ({ saving, onCancel, onSave }: any) => (
  <div className="flex justify-end gap-3 pt-8">
    <button
      onClick={onCancel}
      className="px-6 py-3 rounded-full border text-xs uppercase"
    >
      Cancel
    </button>

    <button
      onClick={onSave}
      disabled={saving}
      className="px-6 py-3 rounded-full bg-[#F8BBD0] text-white text-xs uppercase disabled:opacity-50"
    >
      {saving ? "Saving..." : "Save"}
    </button>
  </div>
);

const Stat = ({ label, value, icon }: any) => (
  <div className="rounded-2xl bg-[#FDF2F5] p-6 flex items-center gap-4">
    <div className="w-12 h-12 rounded-full bg-white shadow flex items-center justify-center text-[#F8BBD0]">
      {icon}
    </div>
    <div>
      <p className="text-[10px] uppercase tracking-widest text-gray-400">
        {label}
      </p>
      <p className="font-serif text-xl">{value}</p>
    </div>
  </div>
);

const InfoRow = ({ icon, label, value }: any) => (
  <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
    <div className="text-[#F8BBD0]">{icon}</div>
    <div>
      <p className="text-[10px] uppercase tracking-widest text-gray-400">
        {label}
      </p>
      <p className="text-sm">{value}</p>
    </div>
  </div>
);

const Input = ({ label, value, onChange }: any) => (
  <div>
    <label className="text-[10px] uppercase tracking-widest text-gray-400">
      {label}
    </label>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-2 w-full h-11 border rounded-xl px-4"
    />
  </div>
);
