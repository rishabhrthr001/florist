import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Phone,
  Mail,
  Package,
  CreditCard,
  X,
  Pencil,
  Check,
  Trash2,
  Star,
  Headphones,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

import { useAuth } from "@/context/AuthContext";
import API from "../config";

/* ---------------- TYPES ---------------- */

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  image?: string;
  custom?: {
    base?: any;
    ribbon?: any;
    additions?: any[];
    message?: string;
  };
}

interface Order {
  _id: string;
  totalAmount: number;
  orderStatus: "placed" | "confirmed" | "preparing" | "delivered" | "cancelled";
  createdAt: string;
  items: OrderItem[];
}

interface Address {
  _id?: string;

  label: string;
  name: string;
  phone: string;

  addressLine1: string;
  addressLine2: string;
  landmark: string;

  city: string;
  state: string;
  postalCode: string;

  isDefault?: boolean;
}

/* ---------------- CONSTANTS ---------------- */

const DELHI_PIN_REGEX = /^1100\d{2}$/;

/* ---------------- COMPONENT ---------------- */

const Profile: React.FC = () => {
  const { user, token, login } = useAuth();
  const navigate = useNavigate();

  const [openAddressModal, setOpenAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  const [savingPhone, setSavingPhone] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  const [editingPhone, setEditingPhone] = useState(false);

  const [phone, setPhone] = useState(user?.phone || "");

  const [address, setAddress] = useState<Address>({
    label: "",
    name: "",
    phone: "",

    addressLine1: "",
    addressLine2: "",
    landmark: "",

    city: "Delhi",
    state: "Delhi",
    postalCode: "",
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    axios
      .get(`${API}/orders/my`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const fetchedOrders = res.data;
        const sorted = fetchedOrders.sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        setOrders(sorted);
        setTotalOrders(fetchedOrders.length);
        
        const spent = fetchedOrders.reduce((sum: number, order: any) => {
           // only count if not cancelled
           if (order.orderStatus !== 'cancelled') return sum + order.totalAmount;
           return sum;
        }, 0);
        setTotalSpent(spent);
      })
      .catch((err) => console.error("Could not fetch orders", err))
      .finally(() => setOrdersLoading(false));
  }, [token]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Not logged in.</p>
      </div>
    );
  }

  /* ---------------- PHONE ---------------- */

  const savePhone = async () => {
    try {
      setSavingPhone(true);

      const { data } = await axios.patch(
        `${API}/user/me`,
        { phone },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      login(token!, data);
      toast.success("Phone updated 📞");
      setEditingPhone(false);
    } finally {
      setSavingPhone(false);
    }
  };

  /* ---------------- VALIDATION ---------------- */

  const validateAddress = () => {
    const required = [
      address.label,
      address.name,
      address.phone,
      address.addressLine1,
      address.landmark,
      address.city,
      address.state,
      address.postalCode,
    ];

    if (required.some((v) => !v.trim())) {
      toast.error("All address fields are required");
      return false;
    }

    if (!DELHI_PIN_REGEX.test(address.postalCode)) {
      toast.error("We only deliver inside Delhi 📍");
      return false;
    }

    return true;
  };

  /* ---------------- ADDRESS CRUD ---------------- */

  const saveAddress = async () => {
    if (!validateAddress()) return;

    try {
      setSavingAddress(true);

      const url = editingAddressId
        ? `${API}/user/addresses/${editingAddressId}`
        : `${API}/user/addresses`;

      const method = editingAddressId ? "patch" : "post";

      const { data } = await axios[method](url, address, {
        headers: { Authorization: `Bearer ${token}` },
      });

      login(token!, data);

      toast.success(
        editingAddressId ? "Address updated 📍" : "Address added 📍",
      );

      setOpenAddressModal(false);
      setEditingAddressId(null);
    } finally {
      setSavingAddress(false);
    }
  };

  const deleteAddress = async (id: string) => {
    const { data } = await axios.delete(`${API}/user/addresses/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    login(token!, data);
    toast.success("Address removed");
  };

  const makeDefault = async (id: string) => {
    const { data } = await axios.patch(
      `${API}/user/addresses/${id}/default`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );

    login(token!, data);
    toast.success("Default address updated ⭐");
  };

  /* ---------------- UI ---------------- */

  return (
    <>
      <div className="min-h-screen bg-[#FAF9F6] pt-40 pb-24 px-6">
        <div className="max-w-5xl mx-auto space-y-14">
          {/* HEADER */}
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
                label="Total Orders"
                value={ordersLoading ? "..." : totalOrders}
                icon={<Package />}
              />
              <Stat
                label="Amount Spent"
                value={ordersLoading ? "..." : `₹${totalSpent.toLocaleString()}`}
                icon={<CreditCard />}
              />
              <Stat
                label="Member Since"
                value={new Date(user.createdAt).toLocaleDateString()}
                icon={<Star />}
              />
            </div>

            {/* Quick Actions */}
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => navigate("/orders")}
                className="flex items-center gap-3 px-6 py-3 bg-[#EE1C47] text-white hover:bg-black rounded-2xl transition-all group font-bold font-sans tracking-wide text-sm shadow-[0_4px_15px_rgba(238,28,71,0.2)] hover:shadow-lg"
              >
                <Package size={18} />
                <span>View All Orders</span>
              </button>
              <button
                onClick={() => navigate("/support")}
                className="flex items-center gap-3 px-6 py-3 bg-[#FDFBF9] hover:bg-gray-100 text-gray-900 border border-gray-200 rounded-2xl transition-all group font-bold font-sans tracking-wide text-sm"
              >
                <Headphones size={18} />
                <span>Need Support?</span>
              </button>
            </div>
            
            {/* RECENT ORDERS MINI VIEW */}
            {orders.length > 0 && (
              <div className="mt-12 pt-10 border-t border-gray-100">
                 <div className="flex justify-between items-end mb-6">
                    <h3 className="font-serif italic text-2xl text-gray-900">Recent Orders</h3>
                 </div>
                 <div className="space-y-4">
                    {orders.slice(0, 2).map((order) => (
                       <div key={order._id} className="bg-[#FDFBF9] border border-gray-100 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:shadow-[0_10px_30px_rgba(0,0,0,0.03)] transition-all">
                          <div className="flex items-center gap-4">
                             <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shadow-sm shrink-0 relative flex items-center justify-center p-2">
                               {order.items[0]?.image ? (
                                  <img src={order.items[0].image} className="w-full h-full object-cover rounded-lg" alt="" />
                               ) : (
                                  <Package className="text-gray-300" size={24} />
                               )}
                               {order.items.length > 1 && (
                                  <div className="absolute top-1 right-1 w-5 h-5 bg-black text-white text-[9px] font-bold flex items-center justify-center rounded-full shadow-md">
                                     +{order.items.length - 1}
                                  </div>
                               )}
                             </div>
                             <div>
                                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">
                                  {new Date(order.createdAt).toLocaleDateString()} &middot; {order._id.substring(order._id.length - 6).toUpperCase()}
                                </p>
                                <p className="text-sm font-bold text-gray-900">
                                   ₹{order.totalAmount.toLocaleString()}
                                </p>
                             </div>
                          </div>
                          
                          <div className="flex items-center justify-between md:justify-end w-full md:w-auto mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
                             <div className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-gray-100 text-gray-600 mr-4">
                                {order.orderStatus}
                             </div>
                             <button
                               onClick={() => navigate('/orders')} 
                               className="text-[#EE1C47] text-xs font-bold uppercase tracking-widest hover:text-black transition-colors flex items-center gap-1"
                             >
                               Details <ChevronRight size={14} />
                             </button>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
            )}

          </motion.div>

          {/* PERSONAL + ADDRESS */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* PERSONAL */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] shadow-lg p-10 h-fit self-start"
            >
              <h2 className="font-serif text-2xl mb-6">Personal Details</h2>

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
                        inputMode="numeric"
                        onChange={(e) =>
                          setPhone(e.target.value.replace(/\D/g, ""))
                        }
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
                    <button onClick={() => setEditingPhone(false)}>
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

            {/* ADDRESSES */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] shadow-lg p-10"
            >
              <h2 className="font-serif text-2xl mb-6">Saved Addresses</h2>

              <div className="space-y-5">
                {user.addresses?.map((addr: Address) => (
                  <div
                    key={addr._id}
                    className="border rounded-2xl p-5 relative bg-[#FAF9F6]/40 hover:bg-white transition shadow-sm"
                  >
                    {addr.isDefault && (
                      <span className="absolute right-3 top-3 text-[10px] bg-green-100 text-green-700 px-3 py-1 rounded-full">
                        Default
                      </span>
                    )}

                    <p className="uppercase tracking-widest text-[10px] text-gray-400">
                      {addr.label}
                    </p>

                    <p className="font-semibold text-sm">{addr.name}</p>

                    <p className="text-sm text-gray-600 mt-1">
                      {addr.addressLine1}
                      {addr.addressLine2 && `, ${addr.addressLine2}`}
                      <br />
                      {addr.city}, {addr.state}
                    </p>

                    <div className="flex justify-between text-xs text-gray-500 mt-3">
                      <span>📍 {addr.postalCode}</span>
                      <span>📞 {addr.phone}</span>
                    </div>

                    <div className="flex gap-5 mt-4 text-xs">
                      <button
                        onClick={() => {
                          setEditingAddressId(addr._id!);
                          setAddress(addr);
                          setOpenAddressModal(true);
                        }}
                        className="flex items-center gap-1 hover:text-pink-500"
                      >
                        <Pencil size={12} /> Edit
                      </button>

                      <button
                        onClick={() => deleteAddress(addr._id!)}
                        className="text-red-500 flex items-center gap-1"
                      >
                        <Trash2 size={12} /> Delete
                      </button>

                      {!addr.isDefault && (
                        <button
                          onClick={() => makeDefault(addr._id!)}
                          className="flex items-center gap-1 hover:text-yellow-500"
                        >
                          <Star size={12} /> Make Default
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setEditingAddressId(null);
                  setAddress({
                    label: "",
                    name: "",
                    phone: "",
                    addressLine1: "",
                    addressLine2: "",
                    landmark: "",
                    city: "Delhi",
                    state: "Delhi",
                    postalCode: "",
                  });
                  setOpenAddressModal(true);
                }}
                className="mt-8 px-6 py-3 rounded-full border text-xs uppercase tracking-widest hover:border-[#F8BBD0]"
              >
                Add Address
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ---------------- MODAL ---------------- */}

      <AnimatePresence>
        {openAddressModal && (
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
              <button
                onClick={() => setOpenAddressModal(false)}
                className="absolute right-6 top-6"
              >
                <X />
              </button>

              <h2 className="font-serif text-3xl mb-8">
                {editingAddressId ? "Edit Address" : "Add Address"}
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Label"
                  value={address.label}
                  onChange={(v) => setAddress({ ...address, label: v })}
                />

                <Input
                  label="Recipient Name"
                  value={address.name}
                  onChange={(v) => setAddress({ ...address, name: v })}
                />

                <Input
                  label="Phone"
                  numeric
                  value={address.phone}
                  onChange={(v) => setAddress({ ...address, phone: v })}
                />

                <Input
                  label="Address Line 1"
                  value={address.addressLine1}
                  onChange={(v) =>
                    setAddress({
                      ...address,
                      addressLine1: v,
                    })
                  }
                />

                <Input
                  label="Address Line 2"
                  value={address.addressLine2}
                  onChange={(v) =>
                    setAddress({
                      ...address,
                      addressLine2: v,
                    })
                  }
                />

                <Input
                  label="Landmark"
                  value={address.landmark}
                  onChange={(v) =>
                    setAddress({
                      ...address,
                      landmark: v,
                    })
                  }
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
                  label="Pincode"
                  numeric
                  value={address.postalCode}
                  onChange={(v) =>
                    setAddress({
                      ...address,
                      postalCode: v,
                    })
                  }
                />
              </div>

              <div className="flex justify-end gap-3 pt-10">
                <button
                  onClick={() => setOpenAddressModal(false)}
                  className="px-6 py-3 rounded-full border text-xs uppercase"
                >
                  Cancel
                </button>

                <button
                  onClick={saveAddress}
                  disabled={savingAddress}
                  className="px-6 py-3 rounded-full bg-[#F8BBD0] text-white text-xs uppercase disabled:opacity-50"
                >
                  {savingAddress ? "Saving..." : "Save Address"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Profile;

/* ---------------- SMALL COMPONENTS ---------------- */

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

const Input = ({ label, value, onChange, numeric = false }: any) => (
  <div>
    <label className="text-[10px] uppercase tracking-widest text-gray-400">
      {label}
    </label>

    <input
      value={value}
      inputMode={numeric ? "numeric" : "text"}
      pattern={numeric ? "[0-9]*" : undefined}
      onChange={(e) => {
        const val = numeric
          ? e.target.value.replace(/\D/g, "")
          : e.target.value;

        onChange(val);
      }}
      className="mt-2 w-full h-11 border rounded-xl px-4"
    />
  </div>
);
