import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {
    Briefcase,
    Car,
    FileText,
    Gift,
    HeartPulse,
    Home,
    Landmark,
    MoreHorizontal,
    ShoppingCart,
    Ticket,
    TrendingUp,
    Utensils,
    BookOpen
} from "lucide-react"
import React from "react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (amount: number | null, currency: string = 'IDR') => {
  if (amount === null || isNaN(amount)) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(0);
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const categoryIcons: { [key: string]: React.ElementType } = {
    'Food & Drinks': Utensils,
    'Transportation': Car,
    'Entertainment': Ticket,
    'Shopping': ShoppingCart,
    'Utility Bills': FileText,
    'Education': BookOpen,
    'Health': HeartPulse,
    'Rent': Home,
    'Salary': Briefcase,
    'Gifts': Gift,
    'Sales': TrendingUp,
    'Investments': Landmark,
    'Other': MoreHorizontal,
    'Uncategorized': MoreHorizontal,
};

export function IconForCategory({ categoryName, className }: { categoryName: string, className?: string }) {
    const Icon = categoryIcons[categoryName] || MoreHorizontal;
    return React.createElement(Icon, { className: cn("h-5 w-5", className) });
}
