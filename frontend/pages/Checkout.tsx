import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import confetti from "canvas-confetti";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import API from "../config";

/* ---------------- TYPES ---------------- */

type Address = {
  _id: string;
  label?: string;
  name?: string;
  phone?: string;

  addressLine1: string;
  addressLine2?: string;
  landmark: string;

  city: string;
  state: string;
  postalCode: string;

  isDefault?: boolean;
};

const Checkout: React.FC = () => {
  const navigate = useNavigate();

  const { items, clearCart, specialRequest, setSpecialRequest } = useCart();
  const { user, token } = useAuth();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );

  const [deliveryTime, setDeliveryTime] = useState<"day" | "night">("day");

  const [isGift, setIsGift] = useState(false);

  const [giftName, setGiftName] = useState("");
  const [giftPhone, setGiftPhone] = useState("");
  const [giftAddress, setGiftAddress] = useState("");
  const [giftFrom, setGiftFrom] = useState("");

  const [loading, setLoading] = useState(false);

  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);

  /* ---------------- FETCH ADDRESSES ---------------- */

  useEffect(() => {
    if (!token) return;

    axios
      .get(`${API}/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const list = res.data.addresses || [];
        setAddresses(list);

        const def = list.find((a: Address) => a.isDefault);
        if (def) setSelectedAddressId(def._id);
      });
  }, [token]);

  const selectedAddress = addresses.find((a) => a._id === selectedAddressId);

  /* ---------------- PRICE ---------------- */

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items],
  );

  const deliveryCharge = useMemo(() => {
    if (subtotal >= 2500) return 0;
    return deliveryTime === "day" ? 150 : 300;
  }, [subtotal, deliveryTime]);

  const totalAmount = subtotal + deliveryCharge;

  /* ---------------- CONFETTI ---------------- */

  const fireConfetti = () => {
    confetti({
      particleCount: 120,
      angle: 60,
      spread: 70,
      origin: { x: 0 },
    });

    confetti({
      particleCount: 120,
      angle: 120,
      spread: 70,
      origin: { x: 1 },
    });
  };

  /* ---------------- PLACE ORDER ---------------- */

  const handlePay = async () => {
    if (!user) return;

    if (!isGift && !selectedAddress) {
      toast.error("Select delivery address");
      return;
    }

    if (isGift && (!giftName || !giftPhone || !giftAddress)) {
      toast.error("Fill recipient details for gift 🎁");
      return;
    }

    try {
      setLoading(true);

      const finalName = isGift ? giftName : selectedAddress?.name || user.name;

      const finalPhone = isGift
        ? giftPhone
        : selectedAddress?.phone || user.phone || "";

      const finalAddress = isGift
        ? {
            line1: giftAddress,
            city: "Delhi",
            state: "Delhi",
            zip: "110001",
          }
        : {
            line1: selectedAddress!.addressLine1,
            line2: selectedAddress!.addressLine2 || "",
            landmark: selectedAddress!.landmark,
            city: selectedAddress!.city,
            state: selectedAddress!.state,
            zip: selectedAddress!.postalCode,
          };

      const payload = {
        customerName: finalName,
        phone: finalPhone,
        address: finalAddress,

        deliverySlot: deliveryTime,

        isGift,

        specialRequest,

        gift: isGift
          ? {
              name: giftName,
              phone: giftPhone,
              address: giftAddress,
              from: giftFrom || null,
            }
          : null,

        items: items.map((i) => ({
          productId: i.custom ? null : i._id,
          isCustom: Boolean(i.custom),

          name: i.name,
          price: i.price,
          quantity: i.quantity,
          image: i.image,

          custom: i.custom || null,
        })),

        subtotal,
        deliveryCharge,
        totalAmount,

        paymentMethod: "cod",
      };

      const { data } = await axios.post(`${API}/orders`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      /* 🎉 SUCCESS */
      setSuccessOrderId(data.orderId);
      fireConfetti();
      clearCart();

      setTimeout(() => {
        navigate("/explore");
      }, 2800);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.msg || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <>
      <div className="bg-[#FAF9F6] min-h-screen py-32">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-[1.4fr_0.6fr] gap-14">
          {/* LEFT */}
          <div className="space-y-12">
            {/* ADDRESS */}
            {!isGift && (
              <section className="bg-white rounded-[2.8rem] shadow-xl p-10">
                <h2 className="font-serif text-2xl mb-8">Delivery Address</h2>

                {addresses.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-3xl">
                    <p className="text-gray-400 mb-4">
                      No saved addresses found
                    </p>
                    <button
                      onClick={() => navigate("/profile")}
                      className="bg-[#F8BBD0] text-white px-6 py-3 rounded-full hover:bg-[#f797b9] transition text-sm font-semibold"
                    >
                      Add Address in Profile
                    </button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {addresses.map((addr) => (
                      <button
                        key={addr._id}
                        onClick={() => setSelectedAddressId(addr._id)}
                        className={`text-left rounded-3xl border-2 p-6 transition-all ${
                          selectedAddressId === addr._id
                            ? "border-pink-400 bg-pink-50 shadow-lg"
                            : "hover:border-pink-200 hover:bg-[#FFF7FA]"
                        }`}
                      >
                        <p className="font-semibold text-sm">{addr.name}</p>

                        <p className="text-xs text-gray-500">{addr.phone}</p>

                        <p className="mt-2 text-sm text-gray-600">
                          {addr.addressLine1}
                          {addr.addressLine2 && `, ${addr.addressLine2}`}
                          <br />
                          {addr.landmark}, {addr.city}, {addr.state} —{" "}
                          {addr.postalCode}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* DELIVERY SLOT */}
            <section className="bg-white rounded-[2.8rem] shadow-xl p-10">
              <h2 className="font-serif text-2xl mb-8">Delivery Slot</h2>

              <div className="flex gap-6 flex-wrap">
                {["day", "night"].map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setDeliveryTime(slot as any)}
                    className={`px-10 py-4 rounded-full border text-sm ${
                      deliveryTime === slot
                        ? "bg-black text-white"
                        : "hover:border-black"
                    }`}
                  >
                    {slot === "day"
                      ? "Day Delivery · ₹150"
                      : "Night Delivery · ₹300"}
                  </button>
                ))}
              </div>
            </section>

            {/* GIFT */}
            <section className="bg-gradient-to-br from-[#FFF5F9] to-white rounded-[2.8rem] shadow-xl p-10 border">
              <label className="flex items-center gap-4 mb-8">
                <input
                  type="checkbox"
                  checked={isGift}
                  onChange={(e) => setIsGift(e.target.checked)}
                />
                <span className="font-serif text-2xl">Send as a Gift</span>
              </label>

              {isGift && (
                <div className="grid md:grid-cols-2 gap-6">
                  <input
                    placeholder="Recipient Name"
                    value={giftName}
                    onChange={(e) => setGiftName(e.target.value)}
                    className="border rounded-2xl p-4"
                  />

                  <input
                    placeholder="Recipient Phone"
                    value={giftPhone}
                    onChange={(e) => setGiftPhone(e.target.value)}
                    className="border rounded-2xl p-4"
                  />

                  <textarea
                    placeholder="Recipient Address"
                    value={giftAddress}
                    onChange={(e) => setGiftAddress(e.target.value)}
                    className="border rounded-2xl p-4 md:col-span-2"
                  />

                  <input
                    placeholder="Gift From (optional)"
                    value={giftFrom}
                    onChange={(e) => setGiftFrom(e.target.value)}
                    className="border rounded-2xl p-4 md:col-span-2"
                  />
                </div>
              )}
            </section>

            {/* SPECIAL REQUEST */}
            <section className="bg-white rounded-[2.8rem] shadow-xl p-10">
              <h2 className="font-serif text-2xl mb-6">Special Request 💌</h2>

              <textarea
                rows={4}
                placeholder="Any special instructions for us? (delivery notes, flower preference, etc.)"
                value={specialRequest}
                onChange={(e) => setSpecialRequest(e.target.value)}
                className="w-full border rounded-2xl p-4 resize-none focus:outline-none focus:border-pink-400"
              />

              <p className="mt-3 text-xs text-gray-400 italic">
                This will be sent to the florist with your order.
              </p>
            </section>
          </div>

          {/* RIGHT */}
          <div className="bg-white rounded-[3rem] shadow-2xl border p-10 h-fit sticky top-32">
            <h2 className="font-serif text-2xl mb-8">Order Summary</h2>

            <div className="space-y-4 text-sm">
              {items.map((i) => (
                <div key={i._id} className="flex justify-between">
                  <p>
                    {i.name} × {i.quantity}
                  </p>
                  <span>₹{i.price * i.quantity}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handlePay}
              disabled={loading || items.length === 0}
              className="mt-10 w-full bg-black text-white py-5 rounded-2xl font-semibold disabled:opacity-60"
            >
              {loading ? "Placing Order…" : `Pay ₹${totalAmount}`}
            </button>
          </div>
        </div>
      </div>

      {/* ---------------- SUCCESS MODAL ---------------- */}

      {successOrderId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999] flex items-center justify-center">
          <div className="bg-white rounded-[3rem] p-14 shadow-2xl text-center max-w-md w-full">
            <h2 className="font-serif text-4xl mb-4">Order Placed 🎉</h2>

            <p className="text-gray-500 mb-6">Your flowers are on the way.</p>

            <p className="text-sm">
              Order ID:
              <span className="font-bold ml-2">{successOrderId}</span>
            </p>

            <p className="mt-6 text-xs text-gray-400">
              Redirecting you to shop…
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Checkout;
