import { cn } from '@/lib/utils';
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

export default function Card({ children, className, hover = false, padding = 'md' }: CardProps) {
  const paddings = { sm: 'p-3', md: 'p-5', lg: 'p-7' };

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-100 shadow-sm',
        hover && 'hover:shadow-md hover:border-teal-100 transition-all duration-200',
        paddings[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mb-4', className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn('text-lg font-semibold text-gray-900', className)}>{children}</h3>;
}

export function CardDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn('text-sm text-gray-500 mt-1', className)}>{children}</p>;
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('', className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mt-4 pt-4 border-t border-gray-100', className)}>{children}</div>;
}
