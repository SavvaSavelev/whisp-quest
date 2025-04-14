// src/components/UI/GossipBubble.tsx
import { Html } from '@react-three/drei';

export const GossipBubble = ({ text, position }: { text: string; position: [number, number, number] }) => (
    <Html position={[position[0], position[1] + 1.2, position[2]]}>
      <div className="px-3 py-1 bg-black/70 text-white text-xs rounded-full shadow-lg max-w-[200px] text-center animate-fadeIn">
        {text}
      </div>
    </Html>
  );
  