
import React from 'react';

interface ErrorMessageProps {
    message: string;
    onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
    return (
        <div className="bg-red-100 text-red-700 p-6 rounded-xl text-center m-4 shadow-lg">
            <i className="fas fa-exclamation-triangle text-3xl mb-3"></i>
            <p className="font-semibold">{message}</p>
            {onRetry && (
                <button onClick={onRetry} className="mt-4 bg-primary text-white px-5 py-2 rounded-full font-semibold hover:bg-primary-dark transition">
                    <i className="fas fa-sync-alt mr-2"></i> पुन: प्रयास गर्नुहोस्
                </button>
            )}
        </div>
    );
};

export default ErrorMessage;
