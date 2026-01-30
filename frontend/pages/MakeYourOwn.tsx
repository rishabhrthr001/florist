import React, { useState } from "react";
import { motion } from "framer-motion";
import Button from "../components/Button";
import { Plus, Minus, ShoppingBag, ChevronUp, ChevronDown } from "lucide-react";
import { ComponentItem } from "../types";
import { BOUQUET_ITEMS as ITEMS } from "../constants";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

const MakeYourOwn: React.FC = () => {
  const { addToCart } = useCart();

  const [selectedBase, setSelectedBase] = useState<ComponentItem | null>(null);
  const [selectedRibbon, setSelectedRibbon] = useState<ComponentItem | null>(
    null,
  );

  const [additions, setAdditions] = useState<
    { item: ComponentItem; qty: number }[]
  >([]);

  const [instructions, setInstructions] = useState("");
  const [isSummaryMobileOpen, setIsSummaryMobileOpen] = useState(false);

  /* ---------------- ADD / REMOVE ---------------- */

  const handleAdd = (item: ComponentItem) => {
    if (item.type === "base") setSelectedBase(item);
    else if (item.type === "ribbon") setSelectedRibbon(item);
    else {
      setAdditions((prev) => {
        const existing = prev.find((a) => a.item.id === item.id);
        if (existing)
          return prev.map((a) =>
            a.item.id === item.id ? { ...a, qty: a.qty + 1 } : a,
          );
        return [...prev, { item, qty: 1 }];
      });
    }
  };

  const handleRemove = (id: string) => {
    setAdditions((prev) => {
      const existing = prev.find((a) => a.item.id === id);
      if (existing && existing.qty > 1)
        return prev.map((a) =>
          a.item.id === id ? { ...a, qty: a.qty - 1 } : a,
        );
      return prev.filter((a) => a.item.id !== id);
    });
  };

  /* ---------------- PRICE ---------------- */

  const totalPrice =
    (selectedBase?.price || 0) +
    (selectedRibbon?.price || 0) +
    additions.reduce((acc, curr) => acc + curr.item.price * curr.qty, 0);

  /* ---------------- FINALIZE ---------------- */

  const finalizeBouquet = () => {
    if (!selectedBase) {
      toast.error("Select a bouquet base first 🌸");
      return;
    }

    addToCart({
      _id: `custom-${Date.now()}`,
      name: "Customized Bouquet",
      price: totalPrice,
      image: selectedBase.image,
      quantity: 1,
      custom: {
        base: selectedBase,
        ribbon: selectedRibbon,
        additions,
        instructions,
      },
    } as any);

    toast.success("Custom bouquet added to cart 💐");

    setSelectedBase(null);
    setSelectedRibbon(null);
    setAdditions([]);
    setInstructions("");
  };

  const steps = [
    { title: "1. Select Your Base", type: "base" },
    { title: "2. Choose Your Flowers", type: "flower" },
    { title: "3. Add Sweetness", type: "chocolate" },
    { title: "4. The Final Ribbon", type: "ribbon" },
  ];

  return (
    <div className="bg-[#FAF9F6] min-h-screen">
      {/* ---------- MAIN GRID ---------- */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto px-6 pt-28 pb-12 grid lg:grid-cols-3 gap-12 h-[calc(100vh-80px)]"
      >
        {/* ---------------- LEFT BUILDER (SCROLLABLE) ---------------- */}
        <div className="lg:col-span-2 space-y-16 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-[#F8BBD0]/40 scrollbar-track-transparent">
          <header>
            <span className="text-[10px] uppercase tracking-widest text-[#F8BBD0] font-bold">
              The Artisan Builder
            </span>
            <h1 className="font-serif text-5xl mt-4">
              Create Your Masterpiece
            </h1>
          </header>

          {steps.map((step, idx) => (
            <section key={idx} className="space-y-8">
              <h2 className="font-serif text-xl font-bold flex gap-4">
                <span className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-xs">
                  {idx + 1}
                </span>
                {step.title}
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {ITEMS.filter((i) => i.type === step.type).map((item) => {
                  const isSelected =
                    selectedBase?.id === item.id ||
                    selectedRibbon?.id === item.id;

                  return (
                    <motion.div
                      whileHover={{ y: -5 }}
                      key={item.id}
                      className={`bg-white p-4 rounded-2xl border-2 ${
                        isSelected ? "border-[#F8BBD0]" : "border-transparent"
                      }`}
                    >
                      <img
                        src={item.image}
                        className="aspect-square rounded-xl mb-4 object-cover"
                      />

                      <h3 className="font-bold text-sm">{item.name}</h3>
                      <p className="text-xs text-[#F8BBD0]">₹{item.price}</p>

                      <button
                        onClick={() => handleAdd(item)}
                        className="w-full mt-4 py-2 rounded-full bg-[#FDF2F5] text-[#F8BBD0] hover:bg-[#F8BBD0] hover:text-white text-[10px] uppercase tracking-widest font-bold"
                      >
                        {isSelected ? "Selected" : "Select"}
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          ))}

          {/* ---------------- INSTRUCTIONS ---------------- */}
          <section className="bg-white rounded-3xl p-8 shadow">
            <h3 className="font-serif text-xl mb-4">Bouquet Instructions 🌷</h3>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Any wrapping style, flower arrangement, color preference, note message..."
              rows={4}
              className="w-full border rounded-2xl p-4 text-sm resize-none focus:ring-[#F8BBD0]"
            />
          </section>
        </div>

        {/* ---------------- DESKTOP SUMMARY ---------------- */}
        <div className="hidden lg:block sticky top-32">
          <Summary
            {...{
              selectedBase,
              selectedRibbon,
              additions,
              handleAdd,
              handleRemove,
              totalPrice,
              finalizeBouquet,
            }}
          />
        </div>
      </motion.div>

      {/* ---------------- MOBILE SUMMARY ---------------- */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-50">
        <div
          className={`bg-white rounded-t-3xl shadow-xl ${
            isSummaryMobileOpen ? "h-[60vh]" : ""
          }`}
        >
          <div
            onClick={() => setIsSummaryMobileOpen(!isSummaryMobileOpen)}
            className="flex justify-between px-8 py-4 border-b cursor-pointer"
          >
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#F8BBD0]">
                Total
              </p>
              <p className="font-serif text-xl">₹{totalPrice}</p>
            </div>
            {isSummaryMobileOpen ? <ChevronDown /> : <ChevronUp />}
          </div>

          {isSummaryMobileOpen && (
            <div className="p-8 overflow-y-auto">
              <SummaryContent
                {...{
                  selectedBase,
                  selectedRibbon,
                  additions,
                  handleAdd,
                  handleRemove,
                }}
              />
            </div>
          )}

          <div className="p-6">
            <Button
              variant="primary"
              className="w-full"
              onClick={finalizeBouquet}
            >
              Add To Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------------- SUMMARY COMPONENTS ---------------- */

const Summary = ({
  selectedBase,
  selectedRibbon,
  additions,
  handleAdd,
  handleRemove,
  totalPrice,
  finalizeBouquet,
}: any) => (
  <div className="glass-nav rounded-3xl p-8 shadow-xl">
    <h2 className="font-serif text-2xl mb-8">Bouquet Summary</h2>

    <SummaryContent
      {...{ selectedBase, selectedRibbon, additions, handleAdd, handleRemove }}
    />

    <div className="border-t pt-6 mt-8">
      <div className="flex justify-between mb-6">
        <span>Subtotal</span>
        <span className="font-serif text-xl">₹{totalPrice}</span>
      </div>

      <Button variant="primary" className="w-full" onClick={finalizeBouquet}>
        <ShoppingBag size={16} />
        Finalize & Add to Cart
      </Button>
    </div>
  </div>
);

const SummaryContent = ({
  selectedBase,
  selectedRibbon,
  additions,
  handleAdd,
  handleRemove,
}: any) => (
  <div className="space-y-6">
    {selectedBase && (
      <p className="text-sm">
        <strong>Base:</strong> {selectedBase.name}
      </p>
    )}

    {additions.map((a: any) => (
      <div key={a.item.id} className="flex justify-between">
        <span>
          {a.item.name} × {a.qty}
        </span>
        <div className="flex gap-3">
          <button onClick={() => handleRemove(a.item.id)}>
            <Minus size={14} />
          </button>
          <span>₹{a.item.price * a.qty}</span>
          <button onClick={() => handleAdd(a.item)}>
            <Plus size={14} />
          </button>
        </div>
      </div>
    ))}

    {selectedRibbon && (
      <p className="text-sm border-t pt-4">
        <strong>Ribbon:</strong> {selectedRibbon.name}
      </p>
    )}
  </div>
);

export default MakeYourOwn;
