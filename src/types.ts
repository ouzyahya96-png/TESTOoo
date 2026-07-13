import React from 'react';

/**
 * ALPHA MAN Design System - TypeScript Types
 */

export type AlphaButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold';
export type AlphaCardVariant = 'default' | 'elevated' | 'alert' | 'success' | 'premium';
export type AlphaBadgeVariant = 'level' | 'streak' | 'status' | 'premium';
export type AlphaToastType = 'success' | 'warning' | 'error' | 'info';

export interface AlphaButtonProps {
  id?: string;
  variant?: AlphaButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export interface AlphaCardProps {
  id?: string;
  variant?: AlphaCardVariant;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  isHoverable?: boolean;
  animateShake?: boolean;
}

export interface AlphaProgressProps {
  id?: string;
  value: number; // 0 to 100
  max?: number;
  type?: 'linear' | 'circular';
  size?: 'sm' | 'md' | 'lg'; // circular size or linear thickness
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'error';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export interface AlphaInputProps {
  id?: string;
  type: 'text' | 'number' | 'select' | 'toggle' | 'slider';
  label?: string;
  placeholder?: string;
  value: any;
  onChange: (val: any) => void;
  options?: { label: string; value: string | number }[]; // for select
  min?: number; // for slider / number
  max?: number; // for slider / number
  step?: number; // for slider
  error?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export interface AlphaBadgeProps {
  id?: string;
  variant: AlphaBadgeVariant;
  label: string;
  icon?: React.ReactNode;
  className?: string;
}

export interface AlphaAvatarProps {
  id?: string;
  imageUrl?: string;
  level: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLevel?: boolean;
  className?: string;
}

export interface AlphaChartProps {
  id?: string;
  type: 'line' | 'bar' | 'radar';
  data: { label: string; value: number; value2?: number }[];
  height?: number;
  className?: string;
}

export interface AlphaModalProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  type: 'center' | 'bottom-sheet';
  title?: string;
  children: React.ReactNode;
}

export interface AlphaToastProps {
  id: string;
  type: AlphaToastType;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

export interface AlphaSkeletonProps {
  id?: string;
  variant?: 'text' | 'circle' | 'rectangle';
  width?: string | number;
  height?: string | number;
  className?: string;
}

export interface AlphaTimerProps {
  id?: string;
  type: 'countdown' | 'stopwatch' | 'interval';
  initialSeconds?: number;
  onComplete?: () => void;
  className?: string;
}

export interface AlphaSliderProps {
  id?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
  label?: string;
  icon?: React.ReactNode;
  className?: string;
}
