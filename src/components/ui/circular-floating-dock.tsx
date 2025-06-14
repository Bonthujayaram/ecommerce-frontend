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

interface FloatingMenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isActive: boolean;
}

const FloatingMenuItem: React.FC<FloatingMenuItemProps> = ({
  icon,
  label,
  onClick,
  isActive
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${
        isActive 
          ? 'bg-white/10 text-white' 
          : 'text-gray-300 hover:bg-white/5 hover:text-white'
      }`}
    >
      <span className="w-5 h-5 flex items-center justify-center">
        {icon}
      </span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
};

interface CircularFloatingDockProps {
  items: Array<{
    title: string;
    icon: React.ReactNode;
    onClick: () => void;
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
        {isOpen && (
          <div className="absolute bottom-16 right-0 flex flex-col gap-4">
            {items.map((item, index) => (
              <FloatingMenuItem
                key={index}
                icon={item.icon}
                label={item.title}
                onClick={item.onClick}
                isActive={window.location.pathname === (item.title.toLowerCase() === 'home' ? '/' : `/${item.title.toLowerCase()}`)}
              />
            ))}
          </div>
        )}
        <button
          onClick={toggleMenu}
          className="h-14 w-14 rounded-full bg-gradient-to-br from-fuchsia-500 to-blue-600 text-white shadow-lg flex items-center justify-center hover:from-fuchsia-600 hover:to-blue-700 transition-all duration-200"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
    </div>
  );
}; 
