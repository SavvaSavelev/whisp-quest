import { motion } from "framer-motion";

// Простой компонент пролетающих духов/частиц для модального окна
const FloatingSpiritModal = ({ count = 5 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.img
          key={i}
          src={"/textures/face-happy.png"}
          alt="spirit"
          className="absolute w-10 h-10 drop-shadow-lg opacity-80"
          style={{ left: `${10 + i * 18}%`, top: 0 }}
          initial={{ y: -60, opacity: 0, scale: 0.7 }}
          animate={{ y: 60 + Math.random() * 40, opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 + Math.random(), delay: i * 0.15 }}
        />
      ))}
    </>
  );
};

export default FloatingSpiritModal;
