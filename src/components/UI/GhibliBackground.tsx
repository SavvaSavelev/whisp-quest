// src/components/UI/GhibliBackground.tsx
export const GhibliBackground = () => {
    return (
      <div
        className="fixed inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: "url(/images/ghibli-space.png)",
          filter: "brightness(1.05) saturate(1.05)",
        }}
      />
    );
  };
  