import React, { useEffect } from 'react';
import './FlashBox.css';

const FlashBox = ({ type = 'info', message, onClose, duration = 3500, position = 'center' }) => {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => {
      onClose && onClose();
    }, duration);
    return () => clearTimeout(t);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className={`flashbox ${position} ${type}`} role="status">
      <div className="flashbox-inner">
        <span className="flashbox-message">{message}</span>
        <button className="flashbox-close" onClick={onClose} aria-label="Close">×</button>
      </div>
    </div>
  );
};

export default FlashBox;
