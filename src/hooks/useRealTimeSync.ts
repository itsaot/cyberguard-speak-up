import { useState, useEffect, useCallback } from 'react';

export const useRealTimeSync = (interval: number = 10000) => {
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  const triggerUpdate = useCallback(() => {
    setLastUpdate(Date.now());
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdate(Date.now());
    }, interval);

    return () => clearInterval(timer);
  }, [interval]);

  return { lastUpdate, triggerUpdate };
};