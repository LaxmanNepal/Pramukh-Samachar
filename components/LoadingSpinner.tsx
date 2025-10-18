
import React from 'react';

const LoadingSpinner: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-lg m-4">
            <i className="fas fa-spinner text-primary text-4xl animate-spin"></i>
            <p className="mt-4 text-gray-600 font-semibold">समाचार लोड गर्दै... कृपया प्रतीक्षा गर्नुहोस्</p>
        </div>
    );
};

export default LoadingSpinner;
