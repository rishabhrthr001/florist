import React from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Clock, Users, Flame } from "lucide-react";
import { Order } from "../../types";

interface DashboardProps {
  orders: Order[];
}

const Dashboard: React.FC<DashboardProps> = ({ orders = [] }) => {
  const stats = [
    {
      label: "Today's Sales",
      value: "₹1,52,450",
      change: "+12%",
      icon: ShoppingCart,
    },
    {
      label: "Active Orders",
      value: orders.length.toString(),
      change: "+2",
      icon: Clock,
    },
    {
      label: "Total Customers",
      value: "1,240",
      change: "+84",
      icon: Users,
    },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-[#E5E5E5]"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 md:p-3 rounded-xl md:rounded-2xl bg-[#FDF2F5] text-[#F8BBD0]">
                <stat.icon size={20} />
              </div>
              <span
                className={`text-[10px] md:text-xs font-bold font-sans px-2 py-1 rounded-full ${
                  stat.change.startsWith("+")
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {stat.change}
              </span>
            </div>
            <h3 className="text-xs md:text-sm text-gray-500 mb-1">
              {stat.label}
            </h3>
            <p className="text-2xl md:text-3xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        {/* Recent Orders */}
        <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl border border-[#E5E5E5] shadow-sm">
          <h2 className="text-base md:text-lg font-bold mb-6">Recent Orders</h2>
          <div className="space-y-3">
            {orders.slice(0, 4).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-[10px]">
                    {order.customerName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs md:text-sm font-semibold truncate max-w-[120px]">
                      {order.customerName}
                    </p>
                    <p className="text-[10px] text-gray-400">{order.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs md:text-sm font-bold">
                    ₹{order.total.toLocaleString()}
                  </p>
                  <p className="text-[9px] uppercase font-bold text-[#F8BBD0]">
                    {order.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Alert */}
        <div className="bg-[#1A1A1A] p-6 md:p-8 rounded-2xl md:rounded-3xl text-white shadow-xl relative overflow-hidden flex flex-col justify-center min-h-[160px]">
          <div className="relative z-10">
            <h2 className="text-lg md:text-xl font-bold mb-2">
              Inventory Alert
            </h2>
            <p className="text-gray-400 text-xs md:text-sm mb-6">
              3 items are running low on stock.
            </p>
            <button className="bg-white text-black px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-[#F8BBD0] hover:text-white transition-all">
              Manage Stock
            </button>
          </div>
          <Flame
            className="absolute -bottom-10 -right-10 text-white/5"
            size={180}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
