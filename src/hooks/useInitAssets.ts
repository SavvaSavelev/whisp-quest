import { useState, useEffect } from 'react';

export function useInitAssets() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Симуляция загрузки ресурсов
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return isLoaded;
}

export default useInitAssets;
