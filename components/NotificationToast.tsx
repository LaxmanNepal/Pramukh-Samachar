import React, { useEffect, useState } from 'react';

interface NotificationToastProps {
    count: number;
    onClose: () => void;
    onRefresh: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ count, onClose, onRefresh }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (count > 0) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                // After the animation out, call the close handler
                setTimeout(onClose, 300);
            }, 5000); // Auto-dismiss after 5 seconds

            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
        }
    }, [count, onClose]);

    if (!isVisible) return null;

    return (
        <div 
            className={`fixed top-[80px] left-1/2 -translate-x-1/2 z-[100] w-full max-w-md p-2 transition-transform duration-300 ease-out ${isVisible ? 'translate-y-0' : '-translate-y-20'}`}
        >
            <div className="bg-primary text-white rounded-xl shadow-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <i className="fas fa-bell animate-bounceY"></i>
                    <span className="font-semibold">{count} नयाँ समाचार प्रकाशित भयो!</span>
                </div>
                <div className="flex items-center gap-2">
                     <button
                        onClick={onRefresh}
                        className="bg-white/20 px-3 py-1 text-sm font-bold rounded-full hover:bg-white/30"
                    >
                        हेर्नुहोस्
                    </button>
                    <button onClick={onClose} className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/20">
                        <i className="fas fa-times text-xs"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationToast;
