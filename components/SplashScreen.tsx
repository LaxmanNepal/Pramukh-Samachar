
import React from 'react';

const SplashScreen: React.FC = () => {
    return (
        <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-br from-primary to-primary-dark flex flex-col justify-center items-center z-[1000] transition-opacity duration-800 ease-in-out">
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-8 animate-pulse">
                <i className="fas fa-newspaper text-5xl text-primary"></i>
            </div>
            <h1 className="text-4xl font-bold text-white text-center text-shadow-lg leading-tight px-4">
                सबै समाचार एकै ठाँउमा
            </h1>
            <p className="text-lg text-white/85 mt-4 text-center max-w-md px-4">
                नेपालका प्रमुख समाचार स्रोतहरूबाट स्वतः अपडेट हुने समाचारहरू
            </p>
        </div>
    );
};

export default SplashScreen;
