
import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({ children, onClick, variant = 'primary', className = '', type = 'button' }) => {
  const baseStyles = 'px-8 py-3 rounded-full text-sm font-medium tracking-widest uppercase transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2';
  
  const variants = {
    primary: 'bg-[#1A1A1A] text-white hover:bg-[#F8BBD0] hover:text-white',
    secondary: 'bg-[#F8BBD0] text-white hover:bg-[#F06292]',
    outline: 'border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white',
    ghost: 'text-[#4A4A4A] hover:text-[#F8BBD0]'
  };

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
};

export default Button;
