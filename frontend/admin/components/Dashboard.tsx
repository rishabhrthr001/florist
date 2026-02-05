import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Clock, Users } from "lucide-react";
import axios from "axios";

import API from "@/config";
import { Order } from "../../types";

interface DashboardProps {
  orders?: Order[];
}

const Dashboard: React.FC<DashboardProps> = () => {
  const [todaySales, setTodaySales] = useState<number>(0);
  const [activeOrders, setActiveOrders] = useState<number>(0);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  /* ---------------- FETCH DASHBOARD STATS ---------------- */

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [salesRes, activeRes, usersRes, recentRes] = await Promise.all([
          axios.get(`${API}/orders/today/delivered-total`, { headers }),
          axios.get(`${API}/orders/active`, { headers }),
          axios.get(`${API}/user/count`, { headers }),
          axios.get(`${API}/orders`, { headers }),
        ]);

        setTodaySales(salesRes.data.totalValue);
        setActiveOrders(activeRes.data.count);
        setTotalUsers(usersRes.data.totalUsers);
        setRecentOrders(recentRes.data.slice(0, 4));
      } catch (err) {
        console.error("Dashboard fetch failed", err);
      }
    };

    fetchStats();
  }, []);

  const stats = [
    {
      label: "Today's Sales",
      value: `₹${todaySales.toLocaleString()}`,
      change: "",
      icon: ShoppingCart,
    },
    {
      label: "Active Orders",
      value: activeOrders.toString(),
      change: "",
      icon: Clock,
    },
    {
      label: "Total Customers",
      value: totalUsers.toString(),
      change: "",
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
            </div>

            <h3 className="text-xs md:text-sm text-gray-500 mb-1">
              {stat.label}
            </h3>
            <p className="text-2xl md:text-3xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl border border-[#E5E5E5] shadow-sm">
        <h2 className="text-base md:text-lg font-bold mb-6">Recent Orders</h2>

        <div className="space-y-3">
          {recentOrders.map((order) => (
            <div
              key={order._id}
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
                  <p className="text-[10px] text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs md:text-sm font-bold">
                  ₹{order.totalAmount.toLocaleString()}
                </p>
                <p className="text-[9px] uppercase font-bold text-[#F8BBD0]">
                  {order.orderStatus}
                </p>
              </div>
            </div>
          ))}

          {!recentOrders.length && (
            <p className="text-sm text-gray-400">No recent orders.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
