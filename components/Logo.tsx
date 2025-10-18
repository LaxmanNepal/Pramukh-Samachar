import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <svg
            className={className}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Nepali News Logo"
        >
            <path
                d="M10 10H90V90H10V10Z"
                fill="currentColor"
                fillOpacity="0.1"
                stroke="currentColor"
                strokeWidth="4"
                rx="15"
            />
            <path
                d="M30 70V30L50 50L70 30V70"
                stroke="white"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
             <path
                d="M30 70V30L50 50L70 30V70"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

export default Logo;
