
import React, { useState, useEffect } from 'react';

interface PermissionPromptProps {
    show: boolean;
    onAllow: () => void;
    onDeny: () => void;
}

const PermissionPrompt: React.FC<PermissionPromptProps> = ({ show, onAllow, onDeny }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (show) {
            // Delay showing for a smoother entry
            const timer = setTimeout(() => setIsVisible(true), 100);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
        }
    }, [show]);

    const handleAllow = () => {
        onAllow();
        setIsVisible(false);
    };
    
    const handleDeny = () => {
        onDeny();
        setIsVisible(false);
    };

    if (!show) return null;

    return (
        <div 
            className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm p-2 transition-all duration-300 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
            <div className="bg-white rounded-2xl shadow-2xl p-6 text-center">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <i className="fas fa-bell text-3xl text-primary"></i>
                </div>
                <h3 className="text-lg font-bold text-slate-800">Stay Updated!</h3>
                <p className="text-sm text-slate-600 my-2">
                    Allow notifications to receive alerts when new news is published.
                </p>
                <div className="flex gap-3 mt-5">
                    <button onClick={handleDeny} className="flex-1 bg-slate-100 text-slate-700 px-4 py-2.5 rounded-full font-bold transition hover:bg-slate-200">
                        Maybe Later
                    </button>
                    <button onClick={handleAllow} className="flex-1 bg-primary text-white px-4 py-2.5 rounded-full font-bold transition hover:bg-primary-dark">
                        Allow
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PermissionPrompt;
