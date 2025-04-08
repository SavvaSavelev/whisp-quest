import { Spirit } from "../entities/types";

type Props = {
  spirit: Spirit;
  isNew?: boolean;
};

export const SpiritCard = ({ spirit, isNew = false }: Props) => {
  return (
    <div
      className={`p-4 rounded-2xl shadow-md transition-all duration-300 border
        ${isNew ? "animate-spirit" : ""}
      `}
      style={{ backgroundColor: spirit.color }}
    >
      <h2 className="text-xl font-semibold">{spirit.name}</h2>
      <p className="text-sm mt-1">Настроение: {spirit.mood}</p>
      <p className="text-sm opacity-80">Эссенция: {spirit.essence}</p>
    </div>
  );
};
