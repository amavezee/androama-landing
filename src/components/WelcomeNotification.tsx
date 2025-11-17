import { useEffect, useState } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface WelcomeNotificationProps {
  message: string;
  onClose: () => void;
}

export default function WelcomeNotification({ message, onClose }: WelcomeNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, 5000); // Show for 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-32 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
      <div className="bg-gradient-to-r from-purple-600/95 to-pink-600/95 backdrop-blur-xl border border-purple-500/50 rounded-xl p-4 shadow-2xl flex items-center gap-3 min-w-[300px] max-w-md">
        <CheckCircle className="w-6 h-6 text-white flex-shrink-0" />
        <p className="text-white font-medium flex-1">{message}</p>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="text-white/80 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

