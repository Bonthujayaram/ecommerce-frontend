import React, { useState, useRef, useEffect } from "react";
import { 
  Home, 
  ShoppingBag,
  Heart,
  Info,
  Grid,
  Menu,
  Plus,
  LogOut
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/hooks/useWishlist";

const radius = 80;

export const CircularFloatingDock = () => {
  const navigate = useNavigate();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const { logout } = useAuth();
  const [showMore, setShowMore] = useState(false);
  
  const items = [
    { 
      title: "Home", 
      icon: <Home size={18} />,
      onClick: () => navigate('/home')
    },
    { 
      title: "Products", 
      icon: <ShoppingBag size={18} />,
      onClick: () => navigate('/products')
    },
    { 
      title: "Cart", 
      icon: (
        <div className="relative">
          <ShoppingBag size={18} />
          {cart.length > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 rounded-full w-4 h-4 flex items-center justify-center">
              <span className="text-[10px] text-white font-bold">{cart.length}</span>
            </div>
          )}
        </div>
      ),
      onClick: () => navigate('/cart')
    },
    { 
      title: "Wishlist", 
      icon: (
        <div className="relative">
          <Heart size={18} />
          {wishlist?.length > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 rounded-full w-4 h-4 flex items-center justify-center">
              <span className="text-[10px] text-white font-bold">{wishlist.length}</span>
            </div>
          )}
        </div>
      ),
      onClick: () => navigate('/wishlist')
    },
    { 
      title: "Categories", 
      icon: <Grid size={18} />,
      onClick: () => navigate('/categories')
    },
    { 
      title: "About", 
      icon: <Info size={18} />,
      onClick: () => navigate('/about')
    },
    {
      title: "Logout",
      icon: <LogOut size={18} />,
      onClick: () => {
        logout();
        navigate('/login');
      }
    }
  ];

  // Initialize rotation to position "Home" at the top (270 degrees)
  const initialRotation = 270;
  const [rotation, setRotation] = useState(initialRotation);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastTouchX, setLastTouchX] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [isHidden, setIsHidden] = useState(false);
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  const [lastSelectedIndex, setLastSelectedIndex] = useState(0);
  
  const animationRef = useRef<number>();
  const hideTimeoutRef = useRef<NodeJS.Timeout>();

  // Effect to navigate when selected icon changes
  useEffect(() => {
    if (selectedIndex !== lastSelectedIndex) {
      items[selectedIndex].onClick();
      setLastSelectedIndex(selectedIndex);
    }
  }, [selectedIndex]);

  const resetActivityTimer = () => {
    setLastActivityTime(Date.now());
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    
    hideTimeoutRef.current = setTimeout(() => {
      setIsHidden(true);
    }, 5000);
  };

  useEffect(() => {
    resetActivityTimer();
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  const getSelectedIcon = (currentRotation) => {
    const normalizedRotation = ((currentRotation % 360) + 360) % 360;
    const anglePerIcon = 360 / items.length;
    
    let closestIndex = 0;
    let minDistance = Infinity;
    
    for (let i = 0; i < items.length; i++) {
      const iconAngle = (i / items.length) * 360 + normalizedRotation;
      const normalizedIconAngle = ((iconAngle % 360) + 360) % 360;
      
      let distance = Math.abs(normalizedIconAngle - 270);
      if (distance > 180) distance = 360 - distance;
      
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }
    
    return closestIndex;
  };

  const snapToNearestIcon = () => {
    const selectedIdx = getSelectedIcon(rotation);
    const anglePerIcon = 360 / items.length;
    const targetRotation = 270 - (selectedIdx * anglePerIcon);
    
    const snapAnimation = () => {
      setRotation(current => {
        const diff = targetRotation - current;
        const normalizedDiff = ((diff + 180) % 360) - 180;
        
        if (Math.abs(normalizedDiff) < 0.5) {
          setSelectedIndex(selectedIdx);
          return targetRotation;
        }
        
        const newRotation = current + normalizedDiff * 0.15;
        animationRef.current = requestAnimationFrame(snapAnimation);
        return newRotation;
      });
    };
    
    snapAnimation();
  };

  const handleTouchStart = (e) => {
    if (isHidden) return;
    e.preventDefault();
    setIsDragging(true);
    setLastTouchX(e.touches[0].clientX);
    setVelocity(0);
    resetActivityTimer();
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || isHidden) return;
    e.preventDefault();
    
    const currentTouchX = e.touches[0].clientX;
    const deltaX = currentTouchX - lastTouchX;
    
    const rotationDelta = deltaX * 0.8;
    setRotation(prev => prev + rotationDelta);
    setVelocity(deltaX);
    setLastTouchX(currentTouchX);
    resetActivityTimer();
  };

  const handleTouchEnd = (e) => {
    if (isHidden) return;
    e.preventDefault();
    setIsDragging(false);
    resetActivityTimer();
    
    if (Math.abs(velocity) > 2) {
      const decelerate = () => {
        setVelocity(prev => {
          const newVelocity = prev * 0.95;
          if (Math.abs(newVelocity) > 0.1) {
            setRotation(current => current + newVelocity * 0.8);
            animationRef.current = requestAnimationFrame(decelerate);
            return newVelocity;
          } else {
            snapToNearestIcon();
            return 0;
          }
        });
      };
      decelerate();
    } else {
      snapToNearestIcon();
    }
  };

  const handleMouseDown = (e) => {
    if (isHidden) return;
    setIsDragging(true);
    setLastTouchX(e.clientX);
    setVelocity(0);
    resetActivityTimer();
  };

  const handleMouseMove = (e) => {
    if (!isDragging || isHidden) return;
    
    const deltaX = e.clientX - lastTouchX;
    const rotationDelta = deltaX * 0.8;
    setRotation(prev => prev + rotationDelta);
    setLastTouchX(e.clientX);
    resetActivityTimer();
  };

  const handleMouseUp = () => {
    if (isHidden) return;
    setIsDragging(false);
    resetActivityTimer();
    snapToNearestIcon();
  };

  const handleCenterClick = (e) => {
    e.stopPropagation();
    if (isHidden) {
      setIsHidden(false);
      resetActivityTimer();
    }
  };

  const handleIconInteraction = () => {
    resetActivityTimer();
  };

  return (
    <>
      {/* Mobile Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden z-50 overflow-hidden">
        {/* Dark Glass Effect Background */}
        <div className="absolute inset-0 bg-black/95 backdrop-blur-lg"></div>
        
        {/* Subtle Pattern Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-grid-white/10 bg-[length:20px_20px]"></div>
        </div>

        {/* Soft Glow Effects */}
        <div className="absolute -inset-1 bg-gradient-to-r from-white/5 via-white/10 to-white/5 blur-xl"></div>

        <div className="relative flex justify-between items-center px-2 h-16">
          {items.map((item, index) => {
            const isActive = window.location.pathname === (item.title.toLowerCase() === 'home' ? '/' : `/${item.title.toLowerCase()}`);
            return (
              <button
                key={item.title}
                className={`flex flex-col items-center justify-center w-full h-full py-1 space-y-1.5 transition-all duration-300 group relative`}
                onClick={item.onClick}
              >
                {/* Hover Glow Effect */}
                <div className={`absolute inset-0 rounded-xl transition-all duration-300 opacity-0 group-hover:opacity-100
                  ${isActive ? 'bg-white/10 blur-md' : ''}`}>
                </div>

                {/* Icon Container */}
                <div className={`relative z-10 transition-all duration-300 transform
                  ${isActive 
                    ? 'scale-110 text-white' 
                    : 'text-gray-400 group-hover:text-white group-hover:scale-105'
                  }`}
                >
                  {/* Icon Background Light Effect */}
                  {isActive && (
                    <div className="absolute inset-0 bg-white/20 blur-lg opacity-50"></div>
                  )}
                  
                  {item.icon}

                  {/* Animated Badges */}
                  {(item.title === 'Cart' && cart.length > 0) && (
                    <div className="absolute -top-2 -right-2 bg-red-500 rounded-full w-4 h-4 flex items-center justify-center animate-pulse ring-1 ring-white/20">
                      <span className="text-[10px] text-white font-bold">{cart.length}</span>
                    </div>
                  )}
                  {(item.title === 'Wishlist' && wishlist?.length > 0) && (
                    <div className="absolute -top-2 -right-2 bg-red-500 rounded-full w-4 h-4 flex items-center justify-center animate-pulse ring-1 ring-white/20">
                      <span className="text-[10px] text-white font-bold">{wishlist.length}</span>
                    </div>
                  )}
                </div>

                {/* Label */}
                <span className={`text-[10px] font-medium truncate max-w-[4rem] transition-all duration-300 relative z-10
                  ${isActive 
                    ? 'text-white font-semibold' 
                    : 'text-gray-400 group-hover:text-white'
                  }`}
                >
                  {item.title}
                </span>

                {/* Active Indicator */}
                {isActive && (
                  <>
                    <div className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-white"></div>
                    <div className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-white/30 blur-sm animate-pulse"></div>
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Border Glow Effects */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      </div>

      {/* Circular Floating Dock (Hidden on Mobile) */}
      <div 
        className={`fixed bottom-8 right-8 z-50 transition-opacity duration-300 hidden md:block ${
          isHidden ? 'opacity-0' : 'opacity-100'
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="relative w-[180px] h-[180px]">
          {/* Center button */}
          <button
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center z-10 hover:bg-gray-50 transition-colors"
            onClick={handleCenterClick}
          >
            <Menu size={24} />
          </button>

          {/* Icons */}
          {items.slice(0, -1).map((item, index) => {
            const angle = (index / (items.length - 1)) * 360 + rotation;
            const x = Math.cos((angle * Math.PI) / 180) * radius;
            const y = Math.sin((angle * Math.PI) / 180) * radius;
            
            return (
              <button
                key={item.title}
                className={`absolute top-1/2 left-1/2 w-10 h-10 -mt-5 -ml-5 rounded-full shadow-md flex items-center justify-center transition-all duration-200 ${
                  selectedIndex === index ? 'bg-blue-500 text-white scale-110' : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
                style={{
                  transform: `translate(${x}px, ${y}px)`
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => {
                  handleIconInteraction();
                  item.onClick();
                }}
              >
                {item.icon}
                {(hoveredIndex === index || selectedIndex === index) && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
                    {item.title}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}; 