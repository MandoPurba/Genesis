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
    BookOpen,
    Wallet,
    Smartphone,
    ArrowRightLeft,
} from "lucide-react"
import React from "react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (amount: number | null, isPrivacyMode: boolean = false, currency: string = 'IDR') => {
  if (isPrivacyMode) {
    return 'Rp ***';
  }
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
    'Transfer': ArrowRightLeft,
    'Other': MoreHorizontal,
    'Uncategorized': MoreHorizontal,
};

export const accountIcons: { [key: string]: React.ElementType } = {
    'Bank Account': Landmark,
    'Cash': Wallet,
    'E-Wallet': Smartphone,
    'Other': MoreHorizontal,
};

export function IconForCategory({ categoryName, className }: { categoryName: string, className?: string }) {
    const Icon = categoryIcons[categoryName] || MoreHorizontal;
    return React.createElement(Icon, { className: cn("h-5 w-5", className) });
}

export function IconForAccountType({ accountType, className }: { accountType: string, className?: string }) {
    const Icon = accountIcons[accountType] || MoreHorizontal;
    return React.createElement(Icon, { className: cn("h-5 w-5", className) });
}
