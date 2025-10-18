import React from 'react';

interface LoginPromptProps {
    isOpen: boolean;
    onClose: () => void;
    onSignIn: () => void;
}

const LoginPrompt: React.FC<LoginPromptProps> = ({ isOpen, onClose, onSignIn }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-[1000]" onClick={onClose}>
            <div 
                className="bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-sm m-4 text-center p-8 animate-slideInUp"
                onClick={e => e.stopPropagation()}
            >
                <i className="fas fa-user-circle text-6xl text-primary mb-4"></i>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Sign In Required</h2>
                <p className="text-slate-600 mb-6">Please sign in to access your profile and other features.</p>
                <button 
                    onClick={onSignIn}
                    className="w-full bg-blue-500 text-white px-6 py-3 rounded-full font-bold text-lg transition-colors hover:bg-blue-600 flex items-center justify-center gap-3"
                >
                    <i className="fab fa-google"></i>
                    Continue with Gmail
                </button>
                 <button 
                    onClick={onClose}
                    className="mt-4 text-sm text-slate-500 hover:text-slate-700"
                >
                    Maybe Later
                </button>
            </div>
        </div>
    );
};

export default LoginPrompt;
