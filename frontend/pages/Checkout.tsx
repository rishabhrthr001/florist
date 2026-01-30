import React, { useMemo, useState } from "react";
import axios from "axios";
import { useCart } from "../context/CartContext";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import API from "../config";

type Address = {
  id: string;
  label: string;
  address: string;
};

const mockAddresses: Address[] = [
  {
    id: "1",
    label: "Home",
    address: "221B Baker Street, Delhi",
  },
  {
    id: "2",
    label: "Office",
    address: "DLF Cyber Hub, Gurgaon",
  },
];

const Checkout: React.FC = () => {
  const { items } = useCart();
  const { user, token } = useAuth();

  const [deliveryTime, setDeliveryTime] = useState<"day" | "night">("day");
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(
    mockAddresses[0],
  );

  const [isGift, setIsGift] = useState(false);
  const [giftName, setGiftName] = useState("");
  const [giftPhone, setGiftPhone] = useState("");
  const [giftAddress, setGiftAddress] = useState("");

  const [loading, setLoading] = useState(false);

  /* ---------------- PRICE CALC ---------------- */

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items],
  );

  const deliveryCharge = useMemo(() => {
    if (subtotal >= 2500) return 0;
    return deliveryTime === "day" ? 150 : 300;
  }, [subtotal, deliveryTime]);

  const totalAmount = subtotal + deliveryCharge;

  /* ---------------- PLACE ORDER ---------------- */

  const handlePay = async () => {
    if (!selectedAddress || !user) return;

    try {
      setLoading(true);

      const payload = {
        customerName: user.name,
        phone: giftPhone || user.phone || "",
        address: {
          line1: selectedAddress.address,
          city: "Delhi",
          state: "Delhi",
          zip: "110001",
          country: "India",
        },

        deliverySlot: deliveryTime,

        isGift,
        gift: isGift
          ? {
              name: giftName,
              phone: giftPhone,
              address: giftAddress,
            }
          : null,

        items: items.map((i) => ({
          productId: i._id,
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

      toast.success(`Order placed 🎉 Order ID: ${data.orderId}`);

      console.log("ORDER CREATED:", data);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-28 grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-12">
      {/* ---------------- LEFT ---------------- */}

      <div className="space-y-10">
        {/* ADDRESS */}

        <section>
          <h2 className="text-xl font-serif mb-4">Delivery Address</h2>

          <div className="space-y-3">
            {mockAddresses.map((addr) => (
              <label
                key={addr.id}
                className={`block border rounded-xl p-4 cursor-pointer ${
                  selectedAddress?.id === addr.id
                    ? "border-pink-400 bg-pink-50"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  className="mr-3"
                  checked={selectedAddress?.id === addr.id}
                  onChange={() => setSelectedAddress(addr)}
                />
                <strong>{addr.label}</strong>
                <p className="text-sm text-gray-600">{addr.address}</p>
              </label>
            ))}
          </div>
        </section>

        {/* DELIVERY TIME */}

        <section>
          <h2 className="text-xl font-serif mb-4">Delivery Slot</h2>

          <div className="flex gap-4">
            <button
              onClick={() => setDeliveryTime("day")}
              className={`px-4 py-2 rounded-full border ${
                deliveryTime === "day" ? "bg-pink-500 text-white" : ""
              }`}
            >
              Day (₹150)
            </button>

            <button
              onClick={() => setDeliveryTime("night")}
              className={`px-4 py-2 rounded-full border ${
                deliveryTime === "night" ? "bg-pink-500 text-white" : ""
              }`}
            >
              Night (₹300)
            </button>
          </div>

          {subtotal >= 2500 && (
            <p className="text-green-600 text-sm mt-2">
              🎉 Free delivery unlocked!
            </p>
          )}
        </section>

        {/* GIFT OPTION */}

        <section>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isGift}
              onChange={(e) => setIsGift(e.target.checked)}
            />
            <span className="font-semibold">This is a gift</span>
          </label>

          {isGift && (
            <div className="mt-4 grid gap-4">
              <input
                placeholder="Recipient Name"
                value={giftName}
                onChange={(e) => setGiftName(e.target.value)}
                className="border rounded-lg p-3"
              />

              <input
                placeholder="Recipient Phone"
                value={giftPhone}
                onChange={(e) => setGiftPhone(e.target.value)}
                className="border rounded-lg p-3"
              />

              <textarea
                placeholder="Gift Address"
                value={giftAddress}
                onChange={(e) => setGiftAddress(e.target.value)}
                className="border rounded-lg p-3"
              />
            </div>
          )}
        </section>
      </div>

      {/* ---------------- RIGHT SUMMARY ---------------- */}

      <div className="bg-white rounded-2xl shadow-sm border p-6 h-fit sticky top-32">
        <h2 className="text-xl font-serif mb-6">Order Summary</h2>

        <div className="space-y-3 text-sm">
          {items.map((i) => (
            <div key={i._id} className="flex justify-between">
              <span>
                {i.name} × {i.quantity}
              </span>
              <span>₹{i.price * i.quantity}</span>
            </div>
          ))}
        </div>

        <hr className="my-4" />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>

          <div className="flex justify-between">
            <span>Delivery</span>
            <span>{deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}</span>
          </div>
        </div>

        <hr className="my-4" />

        <div className="flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span>₹{totalAmount}</span>
        </div>

        <button
          onClick={handlePay}
          disabled={!selectedAddress || items.length === 0 || loading}
          className="mt-6 w-full bg-pink-500 text-white py-3 rounded-xl hover:bg-pink-600 transition disabled:opacity-60"
        >
          {loading ? "Placing order..." : `Pay ₹${totalAmount}`}
        </button>
      </div>
    </div>
  );
};

export default Checkout;
