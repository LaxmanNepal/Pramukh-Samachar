
import React from 'react';
import Logo from './Logo';
import { User } from '../types';

interface HeaderProps {
    activeSection: string;
    onSearchClick: () => void;
    onNotificationsClick: () => void;
    onProfileClick: () => void;
    user: User | null;
    notificationCount: number;
}

const Header: React.FC<HeaderProps> = ({ activeSection, onSearchClick, onNotificationsClick, onProfileClick, user, notificationCount }) => {
    const sectionTitles: { [key: string]: string } = {
        dashboard: 'Nepali News Hub',
        story: 'News Stories',
        aiReader: 'AI News Reader',
        source: 'News Sources',
        search: 'Search News',
        profile: 'My Profile',
    };

    return (
        <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-50 h-[70px] border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Logo className="w-8 h-8 text-primary" />
                    <h1 className="text-lg font-extrabold text-slate-800 hidden sm:block">
                        {sectionTitles[activeSection] || 'Nepali News Hub'}
                    </h1>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                    <button onClick={onSearchClick} className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                        <i className="fas fa-search"></i>
                    </button>
                    <button onClick={onNotificationsClick} className="relative w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                        <i className="fas fa-bell"></i>
                        {notificationCount > 0 && (
                            <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                                {notificationCount}
                            </span>
                        )}
                    </button>
                    <button onClick={onProfileClick} className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors overflow-hidden">
                        {user ? (
                            <img src={user.picture} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <i className="fas fa-user-circle"></i>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
