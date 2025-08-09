import { createPortal } from "react-dom";
import { SpiritArchiveBar } from "./SpiritArchiveBar";

interface SpiritStorageModalProps {
  show: boolean;
  onClose: () => void;
}

export function SpiritStorageModal({ show, onClose }: SpiritStorageModalProps) {
  if (!show) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-40 w-screen h-screen"
      style={{ cursor: "pointer" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[24px] z-0 pointer-events-none" />

      <button
        className="absolute bottom-8 right-8 px-7 py-3 rounded-full bg-indigo-600 text-white text-lg font-bold shadow-lg hover:bg-indigo-700 transition z-50"
        onClick={onClose}
        aria-label="Выйти из хранилища"
      >
        Выйти
      </button>
      <h2 className="absolute top-8 left-1/2 -translate-x-1/2 text-2xl font-bold text-indigo-300 drop-shadow z-50">
        Хранилище духов
      </h2>
      <SpiritArchiveBar floating={true} onSpiritSelect={onClose} />
    </div>,
    document.body
  );
}
