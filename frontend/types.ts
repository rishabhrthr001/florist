import React from "react";
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  images: string[];
  isHotPick?: boolean;
  stock: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
}

interface ProductsProps {
  products?: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories?: Category[];
}

export interface Order {
  id: string;
  customerName: string;
  email: string;
  status: "pending" | "processing" | "delivered" | "cancelled";
  total: number;
  date: string;
  items: { productId: string; quantity: number }[];
}

interface DashboardProps {
  orders?: Order[];
}

export interface Message {
  id: string;
  sender: string;
  email: string;
  subject: string;
  content: string;
  date: string;
  read: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  totalSpent: number;
  orderCount: number;
  joinDate: string;
}

export interface ComponentItem {
  id: string;
  name: string;
  price: number;
  image: string;
  type: "base" | "flower" | "chocolate" | "ribbon";
}
