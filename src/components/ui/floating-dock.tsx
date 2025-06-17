/**
 * Note: Use position fixed according to your needs
 * Desktop navbar is better positioned at the bottom
 * Mobile navbar is better positioned at bottom right.
 **/

import { cn } from "@/lib/utils";
import { IconLayoutNavbarCollapse } from "@tabler/icons-react";
import {
  AnimatePresence,
  MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { useCart } from "@/hooks/useCart";
import { useRef, useState } from "react";
import { CircularFloatingDock } from "./circular-floating-dock";
import { useNavigate } from "react-router-dom";

export const FloatingDock = ({
  items,
  desktopClassName,
  mobileClassName,
}: {
  items: { 
    title: string; 
    icon: React.ReactNode; 
    href?: string; 
    onClick?: () => void; 
    showBadge?: boolean;
    badgeCount?: number;
  }[];
  desktopClassName?: string;
  mobileClassName?: string;
}) => {
  const { cart } = useCart();
  const navigate = useNavigate();
  
  const itemsWithBadge = items.map(item => {
    if (item.showBadge) {
      if (item.title === 'Cart') {
        const count = cart.reduce((total, cartItem) => total + cartItem.quantity, 0);
        return {
          ...item,
          badgeCount: count,
          onClick: item.onClick || (() => navigate(item.href || '/cart'))
        };
      }
      return {
        ...item,
        badgeCount: item.badgeCount || 0,
        onClick: item.onClick || (() => navigate(item.href || '/'))
      };
    }
    return {
      ...item,
      badgeCount: undefined,
      onClick: item.onClick || (item.href ? () => navigate(item.href) : undefined)
    };
  });

  return (
    <>
      <FloatingDockDesktop items={itemsWithBadge} className={desktopClassName} />
      <FloatingDockMobile items={itemsWithBadge} className={mobileClassName} />
    </>
  );
};

const FloatingDockMobile = ({
  items,
  className,
}: {
  items: { title: string; icon: React.ReactNode; href?: string; onClick?: () => void; badgeCount?: number }[];
  className?: string;
}) => {
  const navigate = useNavigate();

  return (
    <div className={cn("fixed bottom-0 left-0 right-0 z-50 block border-t border-neutral-800 bg-black md:hidden", className)}>
      <div className="flex items-center justify-around px-4 py-2">
        {items.map((item) => {
          const isActive = window.location.pathname === (item.title.toLowerCase() === 'home' ? '/' : `/${item.title.toLowerCase()}`);
          return (
            <button
              key={item.title}
              onClick={item.onClick || (() => item.href && navigate(item.href))}
              className={`relative flex flex-col items-center gap-1 p-2 transition-colors ${
                isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div className="relative">
                <div className="h-6 w-6">{item.icon}</div>
                {typeof item.badgeCount === 'number' && item.badgeCount > 0 && (
                  <div className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-red-500" />
                    <span className="relative text-[10px] font-bold text-white">
                      {item.badgeCount}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-xs font-medium">
                {item.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const FloatingDockDesktop = ({
  items,
  className,
}: {
  items: { title: string; icon: React.ReactNode; href?: string; onClick?: () => void; badgeCount?: number }[];
  className?: string;
}) => {
  let mouseX = useMotionValue(Infinity);
  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "mx-auto hidden h-16 items-end gap-4 rounded-2xl bg-[#232323]/95 px-4 pb-3 md:flex",
        className,
      )}
    >
      {items.map((item) => {
        if (item.onClick) {
          return <IconButtonContainer mouseX={mouseX} key={item.title} title={item.title} icon={item.icon} onClick={item.onClick} badgeCount={item.badgeCount} />;
        }
        return <IconContainer mouseX={mouseX} key={item.title} title={item.title} icon={item.icon} href={item.href} badgeCount={item.badgeCount} />;
      })}
    </motion.div>
  );
};

function IconContainer({
  mouseX,
  title,
  icon,
  href,
  badgeCount,
}: {
  mouseX: MotionValue;
  title: string;
  icon: React.ReactNode;
  href?: string;
  badgeCount?: number;
}) {
  let ref = useRef<HTMLDivElement>(null);
  let distance = useTransform(mouseX, (val) => {
    let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  let widthTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  let heightTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  let widthTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);
  let heightTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);

  let width = useSpring(widthTransform, { mass: 0.1, stiffness: 150, damping: 12 });
  let height = useSpring(heightTransform, { mass: 0.1, stiffness: 150, damping: 12 });
  let widthIcon = useSpring(widthTransformIcon, { mass: 0.1, stiffness: 150, damping: 12 });
  let heightIcon = useSpring(heightTransformIcon, { mass: 0.1, stiffness: 150, damping: 12 });

  const [hovered, setHovered] = useState(false);

  return (
    <a href={href} className="relative">
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex aspect-square items-center justify-center rounded-full bg-[#333]/90"
      >
        {typeof badgeCount === 'number' && badgeCount > 0 && (
          <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center z-50">
            <div className="absolute inset-0 rounded-full bg-red-500" />
            <span className="relative text-[12px] font-bold text-white">
              {badgeCount}
            </span>
          </div>
        )}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 2, x: "-50%" }}
              className="absolute -top-8 left-1/2 w-fit rounded-md border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-xs whitespace-pre text-white shadow-lg"
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          style={{ width: widthIcon, height: heightIcon }}
          className="flex items-center justify-center"
        >
          {icon}
        </motion.div>
      </motion.div>
    </a>
  );
}

function IconButtonContainer({
  mouseX,
  title,
  icon,
  onClick,
  badgeCount,
}: {
  mouseX: MotionValue;
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  badgeCount?: number;
}) {
  let ref = useRef<HTMLDivElement>(null);
  let distance = useTransform(mouseX, (val) => {
    let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });
  let widthTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  let heightTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  let widthTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);
  let heightTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);
  let width = useSpring(widthTransform, { mass: 0.1, stiffness: 150, damping: 12 });
  let height = useSpring(heightTransform, { mass: 0.1, stiffness: 150, damping: 12 });
  let widthIcon = useSpring(widthTransformIcon, { mass: 0.1, stiffness: 150, damping: 12 });
  let heightIcon = useSpring(heightTransformIcon, { mass: 0.1, stiffness: 150, damping: 12 });
  const [hovered, setHovered] = useState(false);
  return (
    <button onClick={onClick} type="button" className="relative">
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex aspect-square items-center justify-center rounded-full bg-[#333]/90"
      >
        {typeof badgeCount === 'number' && badgeCount > 0 && (
          <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center z-50">
            <div className="absolute inset-0 rounded-full bg-red-500" />
            <span className="relative text-[12px] font-bold text-white">
              {badgeCount}
            </span>
          </div>
        )}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 2, x: "-50%" }}
              className="absolute -top-8 left-1/2 w-fit rounded-md border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-xs whitespace-pre text-white shadow-lg"
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          style={{ width: widthIcon, height: heightIcon }}
          className="flex items-center justify-center"
        >
          {icon}
        </motion.div>
      </motion.div>
    </button>
  );
} 
