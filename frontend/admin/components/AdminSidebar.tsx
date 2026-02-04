import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  Layers,
  Flame,
  ShoppingCart,
  MessageSquare,
  MessageCircle,
  Users,
  LogOut,
  ChevronRight,
  Palette,
  Sparkles,
  Ticket,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

interface SidebarLink {
  name: string;
  path: string;
  icon: any;
}

interface AdminSidebarProps {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}

const sidebarLinks: SidebarLink[] = [
  { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { name: "Products", path: "/admin/products", icon: Package },
  { name: "Categories", path: "/admin/categories", icon: Layers },
  { name: "Hot Picks", path: "/admin/hot-picks", icon: Flame },
  {
    name: "Seasonal Highlights",
    path: "/admin/seasonal-highlights",
    icon: Sparkles,
  },
  { name: "Orders", path: "/admin/orders", icon: ShoppingCart },
  { name: "Atelier Items", path: "/admin/atelier", icon: Palette },

  // ✅ COMMENTS / REVIEWS PANEL
  {
    name: "Reviews",
    path: "/admin/comments",
    icon: MessageCircle,
  },

  { name: "Messages", path: "/admin/messages", icon: MessageSquare },
  { name: "Support Tickets", path: "/admin/tickets", icon: Ticket },
  { name: "Customers", path: "/admin/customers", icon: Users },
];

export default function AdminSidebar({ isOpen, setIsOpen }: AdminSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNav = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* ---------------- MOBILE OVERLAY ---------------- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="md:hidden fixed inset-0 bg-black/40 z-[55] backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* ---------------- SIDEBAR ---------------- */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 bottom-0 w-72 bg-white border-r border-[#E5E5E5]
          flex flex-col h-screen z-[60] transition-transform duration-300
          md:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* ---------------- LOGO ---------------- */}
        <div className="p-8 border-b border-[#E5E5E5] hidden md:block">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-serif text-xl italic font-bold">
              Mangalam Flowers
            </span>
            <span className="text-[10px] uppercase tracking-widest bg-[#1A1A1A] text-white px-2 py-0.5 rounded ml-2">
              Admin
            </span>
          </Link>
        </div>

        {/* ---------------- NAV ---------------- */}
        <nav className="flex-1 py-6 md:py-8 px-4 overflow-y-auto">
          <ul className="space-y-1.5 md:space-y-2">
            {sidebarLinks.map((link) => {
              const isActive =
                location.pathname === link.path ||
                (link.path !== "/admin" &&
                  location.pathname.startsWith(link.path));

              return (
                <li key={link.path}>
                  <button
                    onClick={() => handleNav(link.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                        ? "bg-[#1A1A1A] text-white shadow-lg shadow-black/10"
                        : "text-[#4A4A4A] hover:bg-[#FDF2F5] hover:text-[#1A1A1A]"
                      }`}
                  >
                    <link.icon size={18} />
                    {link.name}
                    {isActive && <ChevronRight size={14} className="ml-auto" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ---------------- EXIT ADMIN ---------------- */}
        <div className="p-6 border-t border-[#E5E5E5]">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut size={18} />
            Exit Admin
          </button>
        </div>
      </aside>
    </>
  );
}
