import { icons } from 'lucide-react';

interface IconProps {
  name: string;
  color?: string;
  size?: number | string;
  className?: string;
}

export const DynamicIcon = ({ name, color, size, className }: IconProps) => {
  const LucideIcon = (icons as any)[name];

  if (!LucideIcon) {
    // Render a fallback icon if not found
    const Fallback = icons.Box;
    return <Fallback color={color} size={size} className={className} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />;
  }

  return <LucideIcon color={color} size={size} className={className} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />;
};
