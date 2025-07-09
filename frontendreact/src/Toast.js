import { useEffect } from 'react';
// at the top of ChatPage.jsx

export default function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, );

  return (
    <div
      className="toast show position-fixed bottom-0 end-0 m-3"
      style={{ zIndex: 2000 }}
    >
      <div className="toast-header">
        <strong className="me-auto">Notification</strong>
        
      </div>
      <div className="toast-body">
        {message}
      </div>
    </div>
  );
}
