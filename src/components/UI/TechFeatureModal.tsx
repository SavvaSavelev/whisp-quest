import { createPortal } from "react-dom";
import { TechFeatureVault } from "../TechFeatures/TechFeatureVault_cyber";

interface TechFeatureModalProps {
  show: boolean;
  onClose: () => void;
}

export function TechFeatureModal({ show }: TechFeatureModalProps) {
  if (!show) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] w-screen h-screen bg-black overflow-auto">
      <TechFeatureVault />
    </div>,
    document.body
  );
}
