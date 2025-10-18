
import React from 'react';

interface NavBarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

interface NavItemProps {
    id: string;
    label: string;
    icon: string;
    isActive: boolean;
    onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ id, label, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex-1 flex flex-col items-center justify-center p-2 transition-all duration-200 ${isActive ? 'text-primary' : 'text-slate-500 hover:text-primary'}`}
    >
        <i className={`fas ${icon} text-xl mb-1 transition-transform ${isActive ? 'scale-110' : ''}`}></i>
        <span className={`text-[10px] font-bold transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`}>{label}</span>
    </button>
);

const NavBar: React.FC<NavBarProps> = ({ activeTab, onTabChange }) => {
    const navItems = [
        { id: 'dashboard', label: 'गृहपृष्ठ', icon: 'fa-home' },
        { id: 'story', label: 'कथा', icon: 'fa-bolt' },
        { id: 'aiReader', label: 'AI Reader', icon: 'fa-robot' },
        { id: 'source', label: 'स्रोत', icon: 'fa-newspaper' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-lg border-t border-slate-200 z-50 shadow-[0_-2px_20px_rgba(0,0,0,0.05)]">
            <div className="max-w-7xl mx-auto h-full flex justify-around items-start">
                {navItems.map(item => (
                    <NavItem
                        key={item.id}
                        id={item.id}
                        label={item.label}
                        icon={item.icon}
                        isActive={activeTab === item.id}
                        onClick={() => onTabChange(item.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default NavBar;
