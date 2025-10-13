import { useState, useCallback } from 'react';
import FlashBox from '../components/FlashBox';

export default function useFlash() {
  const [flash, setFlash] = useState({ message: null, type: 'info', duration: 3500, position: 'center' });

  const show = useCallback((message, type = 'info', duration = 3500, position = 'center') => {
    setFlash({ message, type, duration, position });
  }, []);

  const clear = useCallback(() => setFlash({ message: null, type: 'info', duration: 3500, position: 'center' }), []);

  const Render = () => (
    <FlashBox
      message={flash.message}
      type={flash.type}
      duration={flash.duration || 3500}
      position={flash.position || 'center'}
      onClose={clear}
    />
  );

  return { show, clear, Render };
}
