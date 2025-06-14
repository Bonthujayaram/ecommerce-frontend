import React, { useState } from "react";
import {
  Home,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

interface FloatingMenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isActive: boolean;
  badgeCount?: number;
}

const FloatingMenuItem: React.FC<FloatingMenuItemProps> = ({
  icon,
  label,
  onClick,
  isActive,
  badgeCount
}) => {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200 ${
        isActive 
          ? 'bg-black/20 text-white' 
          : 'text-gray-300 hover:bg-black/10 hover:text-white'
      }`}
    >
      <div className="relative">
        <span className="w-6 h-6 flex items-center justify-center">
          {icon}
        </span>
        {typeof badgeCount === 'number' && badgeCount > 0 && (
          <div className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-red-500" />
            <span className="relative text-[10px] font-bold text-white">
              {badgeCount}
            </span>
          </div>
        )}
      </div>
      <span className="text-xs font-medium">{label}</span>
    </motion.button>
  );
};

interface CircularFloatingDockProps {
  items: Array<{
    title: string;
    icon: React.ReactNode;
    onClick: () => void;
    badgeCount?: number;
  }>;
}

export const CircularFloatingDock: React.FC<CircularFloatingDockProps> = ({ items }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 md:hidden">
      <div className="relative">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-16 -right-2 p-4 rounded-2xl bg-black/80 backdrop-blur-lg shadow-xl"
            >
              <div className="grid grid-cols-3 gap-2 min-w-[240px]">
                {items.map((item, index) => (
                  <FloatingMenuItem
                    key={index}
                    icon={item.icon}
                    label={item.title}
                    onClick={() => {
                      item.onClick();
                      setIsOpen(false);
                    }}
                    isActive={window.location.pathname === (item.title.toLowerCase() === 'home' ? '/' : `/${item.title.toLowerCase()}`)}
                    badgeCount={item.badgeCount}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={toggleMenu}
          className="h-14 w-14 rounded-full bg-black text-white shadow-lg flex items-center justify-center hover:bg-neutral-900 transition-all duration-200"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </motion.button>
      </div>
    </div>
  );
}; 
