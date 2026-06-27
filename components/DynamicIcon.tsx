import { icons } from 'lucide-react';

interface IconProps {
  name: string;
  color?: string;
  size?: number | string;
  className?: string;
}

const toPascalCase = (str: string) => {
  return str
    .match(/[a-z]+/gi)
    ?.map(word => word.charAt(0).toUpperCase() + word.substr(1).toLowerCase())
    .join('') || str;
};

export const DynamicIcon = ({ name, color, size, className }: IconProps) => {
  const formattedName = toPascalCase(name);
  const LucideIcon = (icons as any)[formattedName] || (icons as any)[name];

  if (!LucideIcon) {
    // Render a fallback icon if not found
    const Fallback = icons.User || icons.Circle;
    return <Fallback color={color} size={size} className={className} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />;
  }

  return <LucideIcon color={color} size={size} className={className} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />;
};
