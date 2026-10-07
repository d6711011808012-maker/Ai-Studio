import React from 'react';
import {
  Utensils,
  Car,
  Home,
  ShoppingBag,
  Tv,
  HeartPulse,
  BookOpen,
  ShieldCheck,
  Users,
  MoreHorizontal,
  Briefcase,
  Award,
  Laptop,
  TrendingUp,
  PiggyBank,
  Gift,
  Coins,
  Tag,
  CircleDollarSign,
  type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Utensils,
  Car,
  Home,
  ShoppingBag,
  Tv,
  HeartPulse,
  BookOpen,
  ShieldCheck,
  Users,
  MoreHorizontal,
  Briefcase,
  Award,
  Laptop,
  TrendingUp,
  PiggyBank,
  Gift,
  Coins,
  Tag,
};

interface CategoryIconProps {
  iconName: string;
  color?: string;
  bgColor?: string;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  iconName,
  color = '#64748b',
  bgColor = '#f1f5f9',
  className = 'w-8 h-8 rounded-lg',
  size = 16,
}) => {
  const IconComponent = ICON_MAP[iconName] || Tag;

  return (
    <div
      className={`flex items-center justify-center shrink-0 ${className}`}
      style={{ backgroundColor: bgColor, color: color }}
    >
      <IconComponent size={size} strokeWidth={2.2} />
    </div>
  );
};
