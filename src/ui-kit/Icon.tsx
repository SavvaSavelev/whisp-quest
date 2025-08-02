import React from 'react';

interface IconProps {
  name: 'archive' | 'gossip' | 'close';
  size?: number;
  color?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 24, color = 'currentColor' }) => {
  switch (name) {
    case 'archive':
      return <svg width={size} height={size} fill={color} viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" /><path d="M8 12h8M8 16h8" stroke="#fff" strokeWidth="2"/></svg>;
    case 'gossip':
      return <svg width={size} height={size} fill={color} viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="10" ry="8" /><circle cx="12" cy="12" r="3" fill="#fff"/></svg>;
    case 'close':
      return <svg width={size} height={size} fill={color} viewBox="0 0 24 24"><line x1="6" y1="6" x2="18" y2="18" stroke={color} strokeWidth="2"/><line x1="18" y1="6" x2="6" y2="18" stroke={color} strokeWidth="2"/></svg>;
    default:
      return null;
  }
};
