import React, { useState, useEffect } from 'react';

const ScrollToTopButton: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
        if (window.pageYOffset > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility, { passive: true });
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    return (
        <button
            onClick={scrollToTop}
            className={`fixed bottom-24 right-5 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg transition-all duration-300 z-50 ${
                isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
            }`}
        >
            <i className="fas fa-arrow-up"></i>
        </button>
    );
};

export default ScrollToTopButton;