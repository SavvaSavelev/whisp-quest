import { Spirit } from "../entities/types";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

type Props = {
  spirits: Spirit[];
};

export const SpiritMap = ({ spirits }: Props) => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-auto">
      {spirits.map((spirit) => (
        <Tippy
          key={spirit.id}
          content={
            <div className="text-sm text-white space-y-1">
              <div>🧠 <b>{spirit.mood}</b></div>
              <div>🔮 {spirit.essence}</div>
              <div>💠 <i>{spirit.rarity || "обычный"}</i></div>
              <div>📆 {new Date(spirit.createdAt).toLocaleString()}</div>
            </div>
          }
          animation="shift-away"
          theme="light-border"
          placement="top"
          delay={[0, 0]}
        >
          <div
            className={`
              absolute w-16 h-16 rounded-full flex items-center justify-center
              text-xs font-medium text-white animate-spirit-float
              hover:scale-110 transition-transform cursor-pointer
              ${spirit.rarity === "сияющий" ? "shadow-[0_0_16px_4px_rgba(255,255,255,0.8)] animate-pulse" : ""}
              ${spirit.rarity === "проклятый" ? "grayscale contrast-125 saturate-0 border border-black/40" : ""}
            `}
            style={{
              top: `${spirit.y}%`,
              left: `${spirit.x}%`,
              backgroundColor: spirit.color,
              transform: "translate(-50%, -50%)",
            }}
          >
            {spirit.name}
          </div>
        </Tippy>
      ))}
    </div>
  );
};
