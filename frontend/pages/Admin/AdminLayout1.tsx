
import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  Flame, 
  ShoppingCart, 
  MessageSquare, 
  Users, 
  LogOut,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  Clock,
  Star,
  Menu,
  X,
  Palette,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  PRODUCTS as INITIAL_PRODUCTS, 
  CATEGORIES as INITIAL_CATEGORIES, 
  ORDERS as INITIAL_ORDERS, 
  MESSAGES as INITIAL_MESSAGES, 
  CUSTOMERS,
  BOUQUET_ITEMS as INITIAL_BOUQUET_ITEMS
} from '../../constants';
import { Product, Category, Order, Message, ComponentItem } from '../../types';

interface AdminLayoutProps {
  onEnterAdmin: () => void;
  onExitAdmin: () => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ onEnterAdmin, onExitAdmin }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Management State
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [bouquetItems, setBouquetItems] = useState<ComponentItem[]>(INITIAL_BOUQUET_ITEMS);

  useEffect(() => {
    onEnterAdmin();
    return () => onExitAdmin();
  }, [onEnterAdmin, onExitAdmin]);

  const sidebarLinks = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Categories', path: '/admin/categories', icon: Layers },
    { name: 'Hot Picks', path: '/admin/hot-picks', icon: Flame },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Atelier Items', path: '/admin/atelier', icon: Palette },
    { name: 'Messages', path: '/admin/messages', icon: MessageSquare },
    { name: 'Customers', path: '/admin/customers', icon: Users },
  ];

  const handleNav = (path: string) => {
    navigate(path);
    setIsSidebarOpen(false);
  };

  const currentTitle = sidebarLinks.find(l => 
    location.pathname === l.path || (l.path !== '/admin' && location.pathname.startsWith(l.path))
  )?.name || 'Dashboard';

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col md:flex-row font-sans text-[#1A1A1A]">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-white border-b border-[#E5E5E5] px-6 py-4 flex items-center justify-between sticky top-0 z-[60]">
        <span className="font-serif italic font-bold text-lg">Mangalam Admin</span>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-gray-500 hover:text-black transition-colors"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden fixed inset-0 bg-black/40 z-[55] backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed md:sticky top-0 left-0 bottom-0 w-72 bg-white border-r border-[#E5E5E5] flex flex-col h-screen z-[60] transition-transform duration-300 md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 border-b border-[#E5E5E5] hidden md:block">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-serif text-xl italic font-bold">Mangalam Flowers</span>
            <span className="text-[10px] uppercase tracking-widest bg-[#1A1A1A] text-white px-2 py-0.5 rounded ml-2">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 py-6 md:py-8 px-4 overflow-y-auto">
          <ul className="space-y-1.5 md:space-y-2">
            {sidebarLinks.map((link) => {
              const isActive = location.pathname === link.path || (link.path !== '/admin' && location.pathname.startsWith(link.path));
              return (
                <li key={link.path}>
                  <button
                    onClick={() => handleNav(link.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive 
                        ? 'bg-[#1A1A1A] text-white shadow-lg shadow-black/10' 
                        : 'text-[#4A4A4A] hover:bg-[#FDF2F5] hover:text-[#1A1A1A]'
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

        <div className="p-6 border-t border-[#E5E5E5]">
          <button 
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut size={18} />
            Exit Admin
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-x-hidden">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 md:mb-12 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">{currentTitle}</h1>
            <p className="text-xs md:text-sm text-gray-500">Welcome back, Head Florist</p>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Dashboard orders={orders} />} />
          <Route path="/products" element={<ProductsPanel products={products} setProducts={setProducts} categories={categories} />} />
          <Route path="/categories" element={<CategoriesPanel categories={categories} setCategories={setCategories} />} />
          <Route path="/hot-picks" element={<HotPicksPanel products={products} />} />
          <Route path="/orders" element={<OrdersPanel orders={orders} setOrders={setOrders} />} />
          <Route path="/atelier" element={<AtelierPanel items={bouquetItems} setItems={setBouquetItems} />} />
          <Route path="/messages" element={<MessagesPanel messages={messages} setMessages={setMessages} />} />
          <Route path="/customers" element={<CustomersPanel />} />
        </Routes>
      </main>
    </div>
  );
};

// --- Modal Component ---
const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl relative z-10 overflow-hidden"
        >
          <div className="p-8 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-serif text-2xl font-bold">{title}</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
          <div className="p-8 max-h-[70vh] overflow-y-auto no-scrollbar">
            {children}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

// --- Admin Panels ---

const Dashboard: React.FC<{ orders: Order[] }> = ({ orders }) => {
  const stats = [
    { label: 'Today\'s Sales', value: '₹1,52,450', change: '+12%', icon: ShoppingCart },
    { label: 'Active Orders', value: orders.length.toString(), change: '+2', icon: Clock },
    { label: 'Total Customers', value: '1,240', change: '+84', icon: Users },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
        {stats.map((stat, i) => (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={stat.label} className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-[#E5E5E5]">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 md:p-3 rounded-xl md:rounded-2xl bg-[#FDF2F5] text-[#F8BBD0]"><stat.icon size={20} /></div>
              <span className={`text-[10px] md:text-xs font-bold font-sans px-2 py-1 rounded-full ${stat.change.startsWith('+') ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{stat.change}</span>
            </div>
            <h3 className="text-xs md:text-sm text-gray-500 mb-1">{stat.label}</h3>
            <p className="text-2xl md:text-3xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl border border-[#E5E5E5] shadow-sm">
          <h2 className="text-base md:text-lg font-bold mb-6">Recent Orders</h2>
          <div className="space-y-3">
            {orders.slice(0, 4).map(order => (
              <div key={order.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-[10px]">{order.customerName.charAt(0)}</div>
                  <div><p className="text-xs md:text-sm font-semibold truncate max-w-[120px]">{order.customerName}</p><p className="text-[10px] text-gray-400">{order.date}</p></div>
                </div>
                <div className="text-right"><p className="text-xs md:text-sm font-bold">₹{order.total.toLocaleString()}</p><p className="text-[9px] uppercase font-bold text-[#F8BBD0]">{order.status}</p></div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#1A1A1A] p-6 md:p-8 rounded-2xl md:rounded-3xl text-white shadow-xl relative overflow-hidden flex flex-col justify-center min-h-[160px]">
          <div className="relative z-10"><h2 className="text-lg md:text-xl font-bold mb-2">Inventory Alert</h2><p className="text-gray-400 text-xs md:text-sm mb-6">3 items are running low on stock.</p><button className="bg-white text-black px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-[#F8BBD0] hover:text-white transition-all">Manage Stock</button></div>
          <Flame className="absolute -bottom-10 -right-10 text-white/5" size={180} />
        </div>
      </div>
    </div>
  );
};

const AtelierPanel: React.FC<{ items: ComponentItem[]; setItems: React.Dispatch<React.SetStateAction<ComponentItem[]>> }> = ({ items, setItems }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', price: '', type: 'base' as ComponentItem['type'] });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: ComponentItem = {
      id: `ci${Date.now()}`,
      name: formData.name,
      price: parseInt(formData.price),
      type: formData.type,
      image: 'https://images.unsplash.com/photo-1596435033235-94770e28e08d?auto=format&fit=crop&q=80&w=400'
    };
    setItems([...items, newItem]);
    setIsModalOpen(false);
    setFormData({ name: '', price: '', type: 'base' });
  };

  const removeItem = (id: string) => setItems(items.filter(i => i.id !== id));

  return (
    <>
      <div className="bg-white rounded-2xl md:rounded-3xl border border-[#E5E5E5] shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-[#E5E5E5] flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div>
            <h2 className="text-base md:text-lg font-bold">Bouquet Customizer</h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Manage bases, flowers, and additions</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto bg-[#1A1A1A] text-white px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#F8BBD0] transition-all"><Plus size={16} /> Add Atelier Item</button>
        </div>
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {['base', 'flower', 'chocolate', 'ribbon'].map((type) => (
              <div key={type} className="space-y-4">
                <h3 className="text-xs uppercase tracking-widest font-bold text-[#F8BBD0] border-b pb-2">{type}s</h3>
                <div className="space-y-3">
                  {items.filter(i => i.type === type).map(item => (
                    <div key={item.id} className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl group">
                      <img src={item.image} className="w-10 h-10 rounded-lg object-cover" alt="" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate">{item.name}</p>
                        <p className="text-[10px] text-gray-400 font-medium">₹{item.price}</p>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Atelier Item">
        <form onSubmit={handleAddItem} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Component Name</label>
            <input required placeholder="e.g. Silk Box" className="w-full p-4 border rounded-xl text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Price (₹)</label>
              <input required type="number" placeholder="500" className="w-full p-4 border rounded-xl text-sm" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Type</label>
              <select className="w-full p-4 border rounded-xl text-sm appearance-none" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>
                <option value="base">Base</option>
                <option value="flower">Flower</option>
                <option value="chocolate">Chocolate</option>
                <option value="ribbon">Ribbon</option>
              </select>
            </div>
          </div>
          <button type="submit" className="w-full bg-[#1A1A1A] text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#F8BBD0] transition-colors mt-4">Add to Atelier</button>
        </form>
      </Modal>
    </>
  );
};

const ProductsPanel: React.FC<{ products: Product[]; setProducts: React.Dispatch<React.SetStateAction<Product[]>>; categories: Category[] }> = ({ products, setProducts, categories }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', price: '', description: '', category: categories[0]?.id || '', stock: '20' });

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct: Product = {
      id: `p${Date.now()}`,
      name: formData.name,
      price: parseInt(formData.price),
      description: formData.description,
      category: formData.category,
      stock: parseInt(formData.stock),
      images: ['https://images.unsplash.com/photo-1561181286-d3fea73e413f?auto=format&fit=crop&q=80&w=800']
    };
    setProducts([newProduct, ...products]);
    setIsModalOpen(false);
    setFormData({ name: '', price: '', description: '', category: categories[0]?.id || '', stock: '20' });
  };

  return (
    <>
      <div className="bg-white rounded-2xl md:rounded-3xl border border-[#E5E5E5] shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-[#E5E5E5] flex flex-col sm:flex-row gap-4 justify-between items-center text-center sm:text-left">
          <h2 className="text-base md:text-lg font-bold">Catalog Management</h2>
          <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto bg-[#1A1A1A] text-white px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#F8BBD0] transition-all"><Plus size={16} /> Add Product</button>
        </div>
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 text-[9px] md:text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                <th className="px-6 md:px-8 py-4">Product</th><th className="px-6 md:px-8 py-4">Category</th><th className="px-6 md:px-8 py-4">Price</th><th className="px-6 md:px-8 py-4">Stock</th><th className="px-6 md:px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 md:px-8 py-4"><div className="flex items-center gap-3"><img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" /><p className="text-xs md:text-sm font-semibold truncate max-w-[150px]">{p.name}</p></div></td>
                  <td className="px-6 md:px-8 py-4"><span className="text-[10px] font-medium text-[#F8BBD0] uppercase">{p.category}</span></td>
                  <td className="px-6 md:px-8 py-4 text-xs md:text-sm font-medium">₹{p.price.toLocaleString()}</td>
                  <td className="px-6 md:px-8 py-4"><div className="flex items-center gap-2"><div className={`w-1.5 h-1.5 rounded-full ${p.stock < 10 ? 'bg-orange-400' : 'bg-green-400'}`} /><span className="text-[10px] md:text-xs font-medium">{p.stock} units</span></div></td>
                  <td className="px-6 md:px-8 py-4 text-right"><div className="flex justify-end gap-1"><button className="p-1.5 text-gray-400 hover:text-black transition-colors"><Edit size={14} /></button><button onClick={() => setProducts(products.filter(item => item.id !== p.id))} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Product">
        <form onSubmit={handleAddProduct} className="space-y-4">
          <input required placeholder="Product Name" className="w-full p-4 border rounded-xl text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <input required type="number" placeholder="Price (₹)" className="p-4 border rounded-xl text-sm" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
            <input required type="number" placeholder="Initial Stock" className="p-4 border rounded-xl text-sm" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
          </div>
          <select className="w-full p-4 border rounded-xl text-sm" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <textarea placeholder="Description" className="w-full p-4 border rounded-xl text-sm h-32" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          <button type="submit" className="w-full bg-[#1A1A1A] text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#F8BBD0] transition-colors">Publish Product</button>
        </form>
      </Modal>
    </>
  );
};

const CategoriesPanel: React.FC<{ categories: Category[]; setCategories: React.Dispatch<React.SetStateAction<Category[]>> }> = ({ categories, setCategories }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const newCat: Category = {
      id: formData.name.toLowerCase().replace(/\s/g, '-'),
      name: formData.name,
      description: formData.description,
      image: 'https://images.unsplash.com/photo-1519225495810-751783d98ec3?auto=format&fit=crop&q=80&w=800'
    };
    setCategories([...categories, newCat]);
    setIsModalOpen(false);
    setFormData({ name: '', description: '' });
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(cat => (
          <div key={cat.id} className="bg-white rounded-2xl md:rounded-3xl border border-[#E5E5E5] overflow-hidden group">
            <div className="h-40 md:h-48 relative"><img src={cat.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" /><div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><button className="bg-white p-2.5 rounded-full shadow-lg mx-1.5"><Edit size={16} /></button><button onClick={() => setCategories(categories.filter(c => c.id !== cat.id))} className="bg-white p-2.5 rounded-full shadow-lg mx-1.5"><Trash2 size={16} className="text-red-500" /></button></div></div>
            <div className="p-5 md:p-6 text-center sm:text-left"><h3 className="text-base md:text-lg font-bold mb-1">{cat.name}</h3><p className="text-[11px] md:text-xs text-gray-500 mb-4 line-clamp-2">{cat.description}</p><div className="flex justify-between items-center pt-4 border-t border-gray-100"><span className="text-[9px] md:text-xs font-bold text-[#F8BBD0] uppercase tracking-wider">Active</span><span className="text-[8px] md:text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-400">ID: {cat.id}</span></div></div>
          </div>
        ))}
        <button onClick={() => setIsModalOpen(true)} className="border-2 border-dashed border-gray-200 rounded-2xl md:rounded-3xl flex flex-col items-center justify-center py-10 md:py-12 text-gray-400 hover:bg-white hover:border-[#F8BBD0] transition-all group">
           <Plus className="mb-2 group-hover:text-[#F8BBD0]" size={20} /><span className="text-[10px] md:text-sm font-bold uppercase tracking-widest group-hover:text-[#F8BBD0]">New Category</span>
        </button>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Category">
        <form onSubmit={handleAddCategory} className="space-y-4">
          <input required placeholder="Category Name" className="w-full p-4 border rounded-xl text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          <textarea placeholder="Tagline/Description" className="w-full p-4 border rounded-xl text-sm h-24" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          <button type="submit" className="w-full bg-[#1A1A1A] text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#F8BBD0] transition-colors">Add to Boutique</button>
        </form>
      </Modal>
    </>
  );
};

const HotPicksPanel: React.FC<{ products: Product[] }> = ({ products }) => (
  <div className="space-y-6">
    <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl border border-[#E5E5E5]">
      <p className="text-[11px] md:text-sm text-gray-500 mb-6">Manage visibility of featured products on the homepage.</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {products.filter(p => p.isHotPick).map((p, idx) => (
           <div key={p.id} className="relative aspect-[4/5] rounded-xl md:rounded-2xl overflow-hidden group cursor-move"><img src={p.images[0]} className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white p-3 text-center"><span className="text-2xl md:text-3xl font-serif font-bold mb-1">#{idx + 1}</span><p className="text-[9px] md:text-xs font-bold uppercase truncate w-full">{p.name}</p></div></div>
        ))}
      </div>
    </div>
  </div>
);

const OrdersPanel: React.FC<{ orders: Order[]; setOrders: React.Dispatch<React.SetStateAction<Order[]>> }> = ({ orders, setOrders }) => {
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter(o => filter === 'all' || o.status === filter);

  const updateStatus = (id: string, newStatus: Order['status']) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    setSelectedOrder(null);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2 -mx-2 px-2">
          {['all', 'pending', 'processing', 'delivered', 'cancelled'].map(status => (
            <button key={status} onClick={() => setFilter(status)} className={`flex-shrink-0 px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider border border-[#E5E5E5] transition-all ${filter === status ? 'bg-[#1A1A1A] text-white' : 'bg-white text-[#4A4A4A] hover:bg-[#FDF2F5]'}`}>
              {status}
            </button>
          ))}
        </div>
        <div className="bg-white rounded-2xl md:rounded-3xl border border-[#E5E5E5] shadow-sm overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-gray-50 border-b border-[#E5E5E5] text-[9px] md:text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                <tr><th className="px-6 md:px-8 py-4">ID</th><th className="px-6 md:px-8 py-4">Customer</th><th className="px-6 md:px-8 py-4">Status</th><th className="px-6 md:px-8 py-4">Total</th><th className="px-6 md:px-8 py-4 text-right">Details</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 md:px-8 py-5 font-mono text-[10px]">#{order.id.slice(0, 5).toUpperCase()}</td>
                    <td className="px-6 md:px-8 py-5"><p className="text-xs md:text-sm font-semibold">{order.customerName}</p><p className="text-[10px] text-gray-500">{order.email}</p></td>
                    <td className="px-6 md:px-8 py-5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-tighter ${
                        order.status === 'processing' ? 'bg-blue-50 text-blue-600' : 
                        order.status === 'delivered' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'
                      }`}>{order.status}</span>
                    </td>
                    <td className="px-6 md:px-8 py-5 font-bold text-xs md:text-sm">₹{order.total.toLocaleString()}</td>
                    <td className="px-6 md:px-8 py-5 text-right"><button onClick={() => setSelectedOrder(order)} className="text-[10px] font-bold text-[#F8BBD0] hover:underline uppercase tracking-widest">Manage</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title="Order Details">
        {selectedOrder && (
          <div className="space-y-6">
            <div className="flex justify-between items-start bg-[#FDF2F5] p-6 rounded-2xl">
              <div><p className="text-[10px] font-bold uppercase tracking-widest text-[#F8BBD0] mb-1">Customer Info</p><p className="text-sm font-bold">{selectedOrder.customerName}</p><p className="text-xs text-gray-500">{selectedOrder.email}</p></div>
              <div className="text-right"><p className="text-[10px] font-bold uppercase tracking-widest text-[#F8BBD0] mb-1">Status</p><p className="text-sm font-bold uppercase">{selectedOrder.status}</p></div>
            </div>
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Order Items</p>
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-sm">Product ID: {item.productId}</span>
                  <span className="text-sm font-bold">Qty: {item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="pt-6 border-t flex flex-wrap gap-2">
              <button onClick={() => updateStatus(selectedOrder.id, 'processing')} className="flex-1 bg-blue-500 text-white py-3 rounded-xl text-[10px] font-bold uppercase">Mark Processing</button>
              <button onClick={() => updateStatus(selectedOrder.id, 'delivered')} className="flex-1 bg-green-500 text-white py-3 rounded-xl text-[10px] font-bold uppercase">Mark Delivered</button>
              <button onClick={() => updateStatus(selectedOrder.id, 'cancelled')} className="w-full bg-red-50 text-red-500 py-3 rounded-xl text-[10px] font-bold uppercase">Cancel Order</button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

const MessagesPanel: React.FC<{ messages: Message[]; setMessages: React.Dispatch<React.SetStateAction<Message[]>> }> = ({ messages, setMessages }) => {
  const [selectedId, setSelectedId] = useState<string | null>(messages[0]?.id || null);
  const selectedMsg = messages.find(m => m.id === selectedId);

  const deleteMessage = (id: string) => {
    const newMessages = messages.filter(m => m.id !== id);
    setMessages(newMessages);
    if (selectedId === id) setSelectedId(newMessages[0]?.id || null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
      <div className="lg:col-span-1 bg-white rounded-2xl md:rounded-3xl border border-[#E5E5E5] p-5 space-y-3 max-h-[70vh] overflow-y-auto no-scrollbar">
        {messages.map(msg => (
          <div key={msg.id} onClick={() => setSelectedId(msg.id)} className={`relative p-4 rounded-xl cursor-pointer transition-all border group ${selectedId === msg.id ? 'bg-[#FDF2F5] border-[#F8BBD0]' : 'bg-white border-transparent hover:bg-gray-100'}`}>
            <button onClick={(e) => { e.stopPropagation(); deleteMessage(msg.id); }} className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all text-gray-400"><Trash2 size={14}/></button>
            <div className="flex justify-between items-start mb-1"><h4 className="text-xs font-bold truncate max-w-[120px]">{msg.sender}</h4><span className="text-[9px] text-gray-400">{msg.date}</span></div>
            <p className="text-[11px] font-semibold text-gray-700 truncate mb-1">{msg.subject}</p><p className="text-[10px] text-gray-500 line-clamp-1">{msg.content}</p>
          </div>
        ))}
        {messages.length === 0 && <div className="text-center py-12 text-gray-400 italic text-sm">No inquiries in your inbox.</div>}
      </div>
      <div className="lg:col-span-2 bg-white rounded-2xl md:rounded-3xl border border-[#E5E5E5] p-6 md:p-10 flex flex-col min-h-[300px]">
        {selectedMsg ? (
          <>
            <div className="border-b border-gray-100 pb-6 md:pb-8 mb-6 md:mb-8 flex justify-between items-start">
              <div><span className="text-[10px] font-bold text-[#F8BBD0] uppercase tracking-widest mb-1 block">Customer Inquiry</span><h2 className="text-xl md:text-2xl font-bold mb-1">{selectedMsg.subject}</h2><p className="text-[11px] md:text-sm text-gray-500">From: {selectedMsg.sender} ({selectedMsg.email})</p></div>
              <button onClick={() => deleteMessage(selectedMsg.id)} className="p-3 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 rounded-full"><Trash2 size={18} /></button>
            </div>
            <div className="flex-1 text-xs md:text-sm text-gray-600 leading-relaxed italic mb-8">"{selectedMsg.content}"</div>
            <div className="pt-6 md:pt-8 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
              <button className="w-full sm:flex-1 bg-[#1A1A1A] text-white px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-wider">Reply via Email</button>
              <button className="w-full sm:w-auto border border-gray-200 px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-500">Archive Thread</button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 italic text-sm"><MessageSquare size={48} className="mb-4 opacity-20" />Select a message to read the full inquiry</div>
        )}
      </div>
    </div>
  );
};

const CustomersPanel: React.FC = () => (
  <div className="space-y-6 md:space-y-8">
     <div className="bg-[#F8BBD0] p-6 md:p-8 rounded-2xl md:rounded-3xl text-white">
        <div className="flex justify-between items-center"><div><h2 className="text-xl md:text-2xl font-bold">VIP Inner Circle</h2><p className="text-white/80 text-xs md:text-sm">Our most loyal botanical enthusiasts.</p></div><Star size={36} className="text-white/20 hidden sm:block" /></div>
     </div>
     <div className="bg-white rounded-2xl md:rounded-3xl border border-[#E5E5E5] shadow-sm overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
           <table className="w-full text-left min-w-[700px]">
              <thead className="bg-gray-50 border-b border-[#E5E5E5] text-[9px] md:text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                 <tr><th className="px-6 md:px-8 py-4">Customer</th><th className="px-6 md:px-8 py-4">Spend</th><th className="px-6 md:px-8 py-4">Orders</th><th className="px-6 md:px-8 py-4">Status</th><th className="px-6 md:px-8 py-4 text-right">Action</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                 {CUSTOMERS.map(cust => (
                    <tr key={cust.id} className="hover:bg-gray-50">
                       <td className="px-6 md:px-8 py-5"><p className="text-xs md:text-sm font-semibold">{cust.name}</p><p className="text-[10px] text-gray-500">{cust.email}</p></td>
                       <td className="px-6 md:px-8 py-5 font-bold text-xs md:text-sm">₹{cust.totalSpent.toLocaleString()}</td>
                       <td className="px-6 md:px-8 py-5 text-xs md:text-sm">{cust.orderCount}</td>
                       <td className="px-6 md:px-8 py-5"><span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${cust.totalSpent > 100000 ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-600'}`}>{cust.totalSpent > 100000 ? 'Platinum' : 'Standard'}</span></td>
                       <td className="px-6 md:px-8 py-5 text-right"><button className="p-2 text-gray-400 hover:text-black"><Plus size={16} /></button></td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
     </div>
  </div>
);

export default AdminLayout;
