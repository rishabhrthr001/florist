
import { Product, Category, Customer, Message, Order, ComponentItem } from './types';

export const CATEGORIES: Category[] = [
  {
    id: 'bouquets',
    name: 'Artisanal Bouquets',
    description: 'Hand-tied arrangements for life\'s beautiful moments.',
    image: 'https://images.unsplash.com/photo-1519225495810-751783d98ec3?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'chocolates',
    name: 'Luxury Confections',
    description: 'Handcrafted truffles and dark cocoa masterpieces.',
    image: 'https://images.unsplash.com/photo-1549007994-cb92ca972694?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'cakes',
    name: 'Signature Patisserie',
    description: 'Exquisite cakes for your most celebrated events.',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'weddings',
    name: 'Wedding Collection',
    description: 'Bespoke designs for your special day.',
    image: 'https://images.unsplash.com/photo-1522673607200-1648832cee98?auto=format&fit=crop&q=80&w=800'
  }
];

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Blushing Peony Symphony',
    price: 9999,
    description: 'A delicate arrangement of Sarah Bernhardt peonies, accented with silver dollar eucalyptus and spray roses.',
    category: 'bouquets',
    images: [
      'https://images.unsplash.com/photo-1562690868-60bbe7293e94?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1533616688419-b7a585564566?auto=format&fit=crop&q=80&w=800'
    ],
    isHotPick: true,
    stock: 12
  },
  {
    id: 'p2',
    name: 'Midnight Gardenia',
    price: 11500,
    description: 'Exotic dark calla lilies paired with white gardenias and lush ferns for a dramatic, premium look.',
    category: 'bouquets',
    images: [
      'https://images.unsplash.com/photo-1561181286-d3fea73e413f?auto=format&fit=crop&q=80&w=800'
    ],
    isHotPick: true,
    stock: 8
  },
  {
    id: 'p3',
    name: 'Dark Cocoa Truffles',
    price: 3500,
    description: 'A box of 12 handcrafted 70% dark chocolate truffles infused with sea salt and lavender.',
    category: 'chocolates',
    images: [
      'https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&q=80&w=800'
    ],
    isHotPick: true,
    stock: 50
  },
  {
    id: 'p4',
    name: 'Velvet Rose Layer Cake',
    price: 6500,
    description: 'Four layers of Madagascan vanilla sponge with rose-infused buttercream and fresh berry filling.',
    category: 'cakes',
    images: [
      'https://images.unsplash.com/photo-1535141192574-5d4897c12636?auto=format&fit=crop&q=80&w=800'
    ],
    isHotPick: true,
    stock: 5
  },
  {
    id: 'p5',
    name: 'Hazelnut Praline Collection',
    price: 2800,
    description: 'Crunchy hazelnut centers coated in premium Belgian milk chocolate.',
    category: 'chocolates',
    images: [
      'https://images.unsplash.com/photo-1582176511224-3e9882ffc87e?auto=format&fit=crop&q=80&w=800'
    ],
    stock: 30
  },
  {
    id: 'p6',
    name: 'Belgian Dark Ganache',
    price: 3200,
    description: 'Intense 85% cocoa dark chocolate with a silky smooth ganache center.',
    category: 'chocolates',
    images: [
      'https://images.unsplash.com/photo-1481391319762-47dff72954d9?auto=format&fit=crop&q=80&w=800'
    ],
    stock: 25
  },
  {
    id: 'p7',
    name: 'Tiramisu Dream Cake',
    price: 7200,
    description: 'Espresso-soaked ladyfingers with rich mascarpone cream and dusted with premium cocoa.',
    category: 'cakes',
    images: [
      'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&q=80&w=800'
    ],
    stock: 10
  },
  {
    id: 'p8',
    name: 'Ethereal White Lily',
    price: 8500,
    description: 'Pure white lilies represent purity and rebirth. Elegant and long-lasting.',
    category: 'bouquets',
    images: [
      'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=800'
    ],
    isHotPick: true,
    stock: 15
  }
];

export const BOUQUET_ITEMS: ComponentItem[] = [
  // Bases
  { id: 'b1', name: 'Kraft Wrap', price: 500, type: 'base', image: 'https://images.unsplash.com/photo-1591880911020-d3496078216e?auto=format&fit=crop&q=80&w=400' },
  { id: 'b2', name: 'Velvet Hat Box', price: 1500, type: 'base', image: 'https://images.unsplash.com/photo-1596435033235-94770e28e08d?auto=format&fit=crop&q=80&w=400' },
  { id: 'b3', name: 'Crystal Vase', price: 2500, type: 'base', image: 'https://images.unsplash.com/photo-1521404063674-681997931c80?auto=format&fit=crop&q=80&w=400' },
  // Flowers
  { id: 'f1', name: 'Red Roses', price: 1200, type: 'flower', image: 'https://images.unsplash.com/photo-1562690868-60bbe7293e94?auto=format&fit=crop&q=80&w=400' },
  { id: 'f2', name: 'White Lilies', price: 1800, type: 'flower', image: 'https://images.unsplash.com/photo-1561181286-d3fea73e413f?auto=format&fit=crop&q=80&w=400' },
  { id: 'f3', name: 'Peonies', price: 2500, type: 'flower', image: 'https://images.unsplash.com/photo-1533616688419-b7a585564566?auto=format&fit=crop&q=80&w=400' },
  // Chocolates
  { id: 'c1', name: 'Truffles', price: 1000, type: 'chocolate', image: 'https://images.unsplash.com/photo-1549007994-cb92ca972694?auto=format&fit=crop&q=80&w=400' },
  { id: 'c2', name: 'Pralines', price: 1200, type: 'chocolate', image: 'https://images.unsplash.com/photo-1582176511224-3e9882ffc87e?auto=format&fit=crop&q=80&w=400' },
  // Ribbons
  { id: 'r1', name: 'Pink Ribbon', price: 200, type: 'ribbon', image: 'https://images.unsplash.com/photo-1583209814683-c023dd293cc6?auto=format&fit=crop&q=80&w=400' },
  { id: 'r2', name: 'Gold Ribbon', price: 350, type: 'ribbon', image: 'https://images.unsplash.com/photo-1552531280-79ba5188737a?auto=format&fit=crop&q=80&w=400' },
];

export const CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'Isabella Vane', email: 'isabella@example.com', totalSpent: 125000, orderCount: 12, joinDate: '2023-01-15' },
  { id: 'c2', name: 'Julian Thorne', email: 'j.thorne@example.com', totalSpent: 98000, orderCount: 5, joinDate: '2023-03-22' }
];

export const MESSAGES: Message[] = [
  { id: 'm1', sender: 'Eleanor Riggs', email: 'eleanor@example.com', subject: 'Wedding Inquiry', content: 'We are planning a July wedding and love your aesthetic.', date: '2024-05-10', read: false }
];

export const ORDERS: Order[] = [
  { id: 'ord1', customerName: 'Isabella Vane', email: 'isabella@example.com', status: 'processing', total: 18500, date: '2024-05-12', items: [{ productId: 'p1', quantity: 2 }] }
];
