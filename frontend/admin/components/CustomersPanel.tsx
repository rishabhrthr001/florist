import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Star } from "lucide-react";

import API from "@/config";
import { useAuth } from "@/context/AuthContext";

interface Customer {
  _id: string;
  name: string;
  email: string;
  totalSpent: number;
  orderCount: number;
}

const CustomersPanel = () => {
  const { token } = useAuth();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH CUSTOMERS ---------------- */

  useEffect(() => {
    if (!token) return;

    const fetchCustomers = async () => {
      try {
        const res = await axios.get(`${API}/user/customers`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setCustomers(res.data);
      } catch (err) {
        console.error("Failed to fetch customers", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [token]);

  const sortedCustomers = [...customers].sort(
    (a, b) => b.orderCount - a.orderCount,
  );

  return (
    <div className="space-y-6 md:space-y-8">
      {/* VIP Banner */}
      <div className="bg-[#F8BBD0] p-6 md:p-8 rounded-2xl md:rounded-3xl text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">VIP Inner Circle</h2>
            <p className="text-white/80 text-xs md:text-sm">
              Our most loyal botanical enthusiasts.
            </p>
          </div>

          <Star size={36} className="text-white/20 hidden sm:block" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl md:rounded-3xl border border-[#E5E5E5] shadow-sm overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-gray-50 border-b border-[#E5E5E5] text-[9px] md:text-[10px] uppercase tracking-widest text-gray-400 font-bold">
              <tr>
                <th className="px-6 md:px-8 py-4">Customer</th>
                <th className="px-6 md:px-8 py-4">Spend</th>
                <th className="px-6 md:px-8 py-4">Orders</th>
                <th className="px-6 md:px-8 py-4">Status</th>
                <th className="px-6 md:px-8 py-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-8 py-10 text-center text-sm text-gray-400"
                  >
                    Loading customers...
                  </td>
                </tr>
              )}

              {!loading && sortedCustomers.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-8 py-10 text-center text-sm text-gray-400"
                  >
                    No customers found.
                  </td>
                </tr>
              )}

              {!loading &&
                sortedCustomers.map((cust) => (
                  <tr key={cust._id} className="hover:bg-gray-50">
                    <td className="px-6 md:px-8 py-5">
                      <p className="text-xs md:text-sm font-semibold">
                        {cust.name}
                      </p>
                      <p className="text-[10px] text-gray-500">{cust.email}</p>
                    </td>

                    <td className="px-6 md:px-8 py-5 font-bold text-xs md:text-sm">
                      ₹{cust.totalSpent.toLocaleString()}
                    </td>

                    <td className="px-6 md:px-8 py-5 text-xs md:text-sm">
                      {cust.orderCount}
                    </td>

                    <td className="px-6 md:px-8 py-5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          cust.totalSpent > 100000
                            ? "bg-amber-100 text-amber-600"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {cust.totalSpent > 100000 ? "Platinum" : "Standard"}
                      </span>
                    </td>

                    <td className="px-6 md:px-8 py-5 text-right">
                      <button className="p-2 text-gray-400 hover:text-black">
                        <Plus size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomersPanel;
