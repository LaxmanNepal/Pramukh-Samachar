
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchAndParseFeeds } from './services/newsService';
import { NewsItem, ShareData } from './types';
import useFavorites from './hooks/useFavorites';
import useAuth from './hooks/useAuth';
import useNewsNotifier from './hooks/useNewsNotifier';

import SplashScreen from './components/SplashScreen';
import Header from './components/Header';
import NavBar from './components/NavBar';
import Dashboard from './sections/Dashboard';
import Search from './sections/Search';
import Story from './sections/Story';
import Source from './sections/Source';
import AiReader from './sections/AiReader';
import Profile from './sections/Profile';
import NewsViewerModal from './components/NewsViewerModal';
import FavoritesModal from './components/FavoritesModal';
import SharePopup from './components/SharePopup';
import LoginPrompt from './components/LoginPrompt';
import ScrollToTopButton from './components/ScrollToTopButton';
import NotificationsModal from './components/NotificationsModal';
import PermissionPrompt from './components/PermissionPrompt';
import PullToRefresh from './components/PullToRefresh';

type Section = 'dashboard' | 'search' | 'story' | 'source' | 'aiReader' | 'profile';

const App: React.FC = () => {
    // Core App State
    const [allNewsItems, setAllNewsItems] = useState<NewsItem[]>([]);
    const [uniqueSources, setUniqueSources] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [showSplashScreen, setShowSplashScreen] = useState(true);
    
    // UI State
    const [activeSection, setActiveSection] = useState<Section>('dashboard');
    const [viewerUrl, setViewerUrl] = useState<string | null>(null);
    const [isFavoritesModalOpen, setIsFavoritesModalOpen] = useState(false);
    const [shareData, setShareData] = useState<ShareData | null>(null);
    const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
    const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);

    // Custom Hooks
    const { favorites, addFavorite, removeFavorite, isFavorited, clearFavorites } = useFavorites();
    const { user, isAuthenticated, signIn, signOut } = useAuth();
    const { notifications, markAsRead, markAllAsRead, permissionState, requestNotificationPermission } = useNewsNotifier(allNewsItems);
    
    // Service Worker Registration
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => console.log('Service Worker registered:', registration))
                    .catch(error => console.log('Service Worker registration failed:', error));
            });
        }
    }, []);

    // Data Fetching
    const loadNews = useCallback(async (isRefresh = false) => {
        if (!isRefresh) setIsLoading(true);
        else setIsRefreshing(true);
        
        setError(null);
        try {
            const { items, sources } = await fetchAndParseFeeds();
            setAllNewsItems(items);
            setUniqueSources(sources);
            setLastUpdated(new Date());
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching news.');
        } finally {
            if (!isRefresh) setIsLoading(false);
            else setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadNews();
        const splashTimer = setTimeout(() => setShowSplashScreen(false), 2000);
        return () => clearTimeout(splashTimer);
    }, [loadNews]);

    // Handlers
    const handleFavoriteToggle = (item: NewsItem) => {
        if (isFavorited(item.link)) removeFavorite(item.link);
        else addFavorite(item);
    };

    const handleView = (url: string) => window.open(url, '_blank', 'noopener,noreferrer');
    const handleCloseViewer = () => setViewerUrl(null);
    
    const handleProfileClick = () => {
        if (isAuthenticated) setActiveSection('profile');
        else setIsLoginPromptOpen(true);
    };

    const handleSignIn = () => {
        signIn();
        setIsLoginPromptOpen(false);
        setActiveSection('profile');
    };
    
    const handleRefresh = () => {
        loadNews(true);
    }
    
    const unreadNotifications = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

    const renderSection = () => {
        const commonCardProps = { isFavorited, onFavoriteToggle: handleFavoriteToggle, onView: handleView };
        switch (activeSection) {
            case 'dashboard': return <Dashboard allNewsItems={allNewsItems} uniqueSources={uniqueSources} isLoading={isLoading} error={error} lastUpdated={lastUpdated} user={user} onRefresh={() => loadNews(true)} {...commonCardProps} />;
            case 'search': return <Search allNewsItems={allNewsItems} {...commonCardProps} />;
            case 'story': return <Story newsItems={allNewsItems} onView={handleView} />;
            case 'source': return <Source allNewsItems={allNewsItems} uniqueSources={uniqueSources} {...commonCardProps} />;
            case 'aiReader': return <AiReader newsItems={allNewsItems.slice(0, 20)} />;
            case 'profile': return <Profile user={user} onSignOut={signOut} />;
            default: return null;
        }
    };

    if (showSplashScreen) {
        return <SplashScreen />;
    }

    return (
        <div className="min-h-screen bg-slate-100 font-sans">
            <Header
                activeSection={activeSection}
                onSearchClick={() => setActiveSection('search')}
                onNotificationsClick={() => setIsNotificationsModalOpen(true)}
                onProfileClick={handleProfileClick}
                user={user}
                notificationCount={unreadNotifications}
            />

            <main className="pb-20">
                 {/* Special layout for story view */}
                 {activeSection === 'story' ? (
                     <div className="fixed top-[70px] left-0 right-0 bottom-20">
                         {renderSection()}
                     </div>
                 ) : (
                    <PullToRefresh onRefresh={handleRefresh} isRefreshing={isRefreshing}>
                        <div className="min-h-[calc(100vh-150px)]">
                            {renderSection()}
                        </div>
                    </PullToRefresh>
                 )}
            </main>
            
            {activeSection !== 'story' && <ScrollToTopButton />}

            <NavBar activeTab={activeSection} onTabChange={(tab) => setActiveSection(tab as Section)} />

            {/* Modals & Popups */}
            <NewsViewerModal isOpen={!!viewerUrl} url={viewerUrl || ''} onClose={handleCloseViewer} />
            <FavoritesModal 
                isOpen={isFavoritesModalOpen} 
                onClose={() => setIsFavoritesModalOpen(false)} 
                favorites={favorites} 
                onView={handleView} 
                onRemove={removeFavorite} 
                onClearAll={clearFavorites}
            />
            <SharePopup shareData={shareData} onClose={() => setShareData(null)} />
            <LoginPrompt isOpen={isLoginPromptOpen} onClose={() => setIsLoginPromptOpen(false)} onSignIn={handleSignIn} />
            <NotificationsModal
                isOpen={isNotificationsModalOpen}
                onClose={() => setIsNotificationsModalOpen(false)}
                notifications={notifications}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
            />

            {/* Permission Prompt */}
            <PermissionPrompt 
                show={permissionState === 'prompt'} 
                onAllow={requestNotificationPermission}
                onDeny={() => { /* User denied, maybe store this choice */ }}
            />
        </div>
    );
};

export default App;
