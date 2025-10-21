import { MOTIVATIONAL_QUOTES } from './constants.js';

// --- Reusable Components ---

export const Logo = (className) => `
    <svg class="${className}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Nepali News Logo">
        <path d="M10 10H90V90H10V10Z" fill="currentColor" fill-opacity="0.1" stroke="currentColor" stroke-width="4" rx="15"/>
        <path d="M30 70V30L50 50L70 30V70" stroke="white" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M30 70V30L50 50L70 30V70" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

export const NewsCard = (item, isFavorited, index) => {
    const favorited = isFavorited(item.link);
    const cardId = `news-card-${index}`;
    const dateString = new Date(item.pubDate).toLocaleDateString('ne-NP', { month: 'short', day: 'numeric' });

    return `
        <div class="relative aspect-square w-full rounded-xl sm:rounded-2xl overflow-hidden shadow-lg group flex flex-col text-white">
            <div data-action="view-news" data-link="${item.link}" class="absolute inset-0 w-full h-full cursor-pointer">
            ${item.imageUrl ? `
                <img src="${item.imageUrl}" alt="${item.title}" class="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            ` : `
                <div class="absolute inset-0 w-full h-full bg-gradient-to-br from-primary-dark to-accent"></div>
            `}
            </div>
            <div id="${cardId}" class="relative z-10 p-2 sm:p-3 flex flex-col h-full justify-end">
                <div>
                    <span class="bg-white/20 backdrop-blur-md text-white px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded-full">${item.source}</span>
                    <h3 class="font-bold text-sm sm:text-base my-1 sm:my-2 leading-tight drop-shadow-lg">${item.title}</h3>
                    <div class="pt-1 sm:pt-2 flex justify-between items-center">
                        <div class="text-[10px] sm:text-xs text-white/80 flex items-center gap-1 drop-shadow-md">
                            <i class="far fa-clock"></i> ${dateString}
                        </div>
                        <div class="flex gap-1.5">
                            <button data-action="share-screenshot" data-element-id="${cardId}" data-title="${item.title}" class="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-colors bg-white/20 backdrop-blur-md text-white hover:bg-white/30" title="Share as Image">
                                <i class="fas fa-camera text-xs sm:text-sm"></i>
                            </button>
                            <button data-action="toggle-favorite" data-link="${item.link}" class="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-colors backdrop-blur-md ${favorited ? 'bg-accent text-white' : 'bg-white/20 text-white hover:bg-white/30'}" title="${favorited ? 'Remove from favorites' : 'Add to favorites'}">
                                <i class="fas fa-bookmark transition-transform text-xs sm:text-sm ${favorited ? 'scale-110' : ''}"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
};


const NewsCardSkeleton = () => `
    <div class="aspect-square bg-white rounded-2xl overflow-hidden shadow-md border border-slate-100 animate-pulse flex flex-col">
        <div class="flex-grow bg-slate-200"></div>
        <div class="p-4">
            <div class="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
            <div class="h-5 bg-slate-200 rounded w-full mb-2"></div>
            <div class="h-5 bg-slate-200 rounded w-3/4 mb-4"></div>
            <div class="pt-3 border-t border-slate-100 mt-auto flex justify-between items-center">
                <div class="h-4 bg-slate-200 rounded w-1/4"></div>
                <div class="flex gap-2">
                    <div class="w-9 h-9 rounded-full bg-slate-200"></div>
                    <div class="w-9 h-9 rounded-full bg-slate-200"></div>
                </div>
            </div>
        </div>
    </div>`;

const ScrollToTopButton = (isVisible) => `
    <button
        data-action="scroll-to-top"
        class="fixed bottom-24 right-5 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg transition-all duration-300 z-50 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}"
    >
        <i class="fas fa-arrow-up"></i>
    </button>`;


// --- Modals and Popups ---

const FavoritesModal = (favorites) => {
    const FavoriteItem = (item) => {
        const dateString = new Date(item.pubDate).toLocaleString('ne-NP', { year: 'numeric', month: 'short', day: 'numeric' });
        return `
            <div data-action="view-news" data-link="${item.link}" class="bg-white rounded-xl p-4 shadow-sm border border-slate-200 transition-shadow hover:shadow-md cursor-pointer flex items-center gap-4">
                <div class="flex-grow">
                    <span class="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full">${item.source}</span>
                    <h4 class="font-semibold my-2 text-slate-800">${item.title}</h4>
                    <div class="text-xs text-slate-500 flex items-center gap-1.5 mt-2">
                        <i class="far fa-clock"></i> ${dateString}
                    </div>
                </div>
                <button data-action="remove-favorite" data-link="${item.link}" class="w-10 h-10 rounded-full bg-red-100 text-red-500 flex items-center justify-center flex-shrink-0 ml-2 hover:bg-red-200 transition-colors">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>`;
    };

    return `
        <div class="fixed inset-0 bg-black/70 flex justify-center items-end sm:items-center z-[1000]" data-action="close-modal">
            <div class="bg-slate-50 rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col shadow-2xl w-full max-h-[90vh] h-full sm:h-[85%] sm:max-w-4xl animate-slideInUp" onclick="event.stopPropagation()">
                <header class="p-4 bg-white flex justify-between items-center border-b border-slate-200 flex-shrink-0">
                    <div class="text-lg font-bold text-slate-800 flex items-center gap-3">
                        <i class="fas fa-bookmark text-accent"></i> My Favorites
                    </div>
                    <button data-action="close-modal" class="w-9 h-9 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center transition-transform hover:rotate-90">
                        <i class="fas fa-times"></i>
                    </button>
                </header>
                <div class="flex-grow overflow-y-auto p-4 sm:p-6 scrollbar-hide">
                    ${favorites.length > 0 ? `
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            ${favorites.map(FavoriteItem).join('')}
                        </div>
                    ` : `
                        <div class="text-center text-slate-500 p-10 flex flex-col items-center justify-center h-full">
                            <i class="far fa-bookmark text-6xl text-slate-300 mb-5"></i>
                            <h3 class="font-semibold text-lg text-slate-700">No Favorited News Yet</h3>
                            <p class="mt-1">Use the <i class="far fa-bookmark"></i> icon to save articles you like.</p>
                        </div>
                    `}
                </div>
                ${favorites.length > 0 ? `
                    <footer class="p-4 bg-white/80 backdrop-blur-lg flex justify-between items-center border-t border-slate-200">
                        <button data-action="clear-favorites" class="bg-red-100 text-red-600 px-4 py-2 rounded-full font-semibold flex items-center gap-2 hover:bg-red-200 disabled:opacity-50 transition-colors">
                            <i class="fas fa-trash"></i> Clear All
                        </button>
                        <div class="font-semibold text-slate-700">
                           Total: <span class="text-primary">${favorites.length}</span>
                        </div>
                    </footer>
                ` : ''}
            </div>
        </div>`;
};

const LoginPrompt = () => `
    <div class="fixed inset-0 bg-black/60 flex justify-center items-center z-[1000]" data-action="close-modal">
        <div class="bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-sm m-4 text-center p-8 animate-slideInUp" onclick="event.stopPropagation()">
            <i class="fas fa-user-circle text-6xl text-primary mb-4"></i>
            <h2 class="text-2xl font-bold text-slate-800 mb-2">Sign In Required</h2>
            <p class="text-slate-600 mb-6">Please sign in to access your profile and other features.</p>
            <button data-action="sign-in" class="w-full bg-blue-500 text-white px-6 py-3 rounded-full font-bold text-lg transition-colors hover:bg-blue-600 flex items-center justify-center gap-3">
                <i class="fab fa-google"></i> Continue with Gmail
            </button>
            <button data-action="close-modal" class="mt-4 text-sm text-slate-500 hover:text-slate-700">Maybe Later</button>
        </div>
    </div>`;

const NotificationsModal = (notifications) => {
    const unreadCount = notifications.filter(n => !n.read).length;

    const NotificationItem = (notification) => `
        <div class="p-4 border-l-4 ${notification.read ? 'border-slate-200 bg-slate-50' : 'border-primary bg-white'} rounded-r-lg mb-3 shadow-sm">
            <div class="flex justify-between items-start">
                <div>
                    <p class="font-bold ${notification.read ? 'text-slate-600' : 'text-primary'}">${notification.title}</p>
                    <p class="text-sm text-slate-700 mt-1">${notification.body}</p>
                    <p class="text-xs text-slate-400 mt-2">${new Date(notification.timestamp).toLocaleString('ne-NP')}</p>
                </div>
                ${!notification.read ? `
                    <button data-action="mark-notification-read" data-id="${notification.id}" class="w-8 h-8 rounded-full flex items-center justify-center text-primary hover:bg-primary/10 text-xs" title="Mark as read">
                        <i class="fas fa-check"></i>
                    </button>
                ` : ''}
            </div>
        </div>`;
    
    return `
        <div class="fixed inset-0 bg-black/70 flex justify-center items-end sm:items-center z-[1000]" data-action="close-modal">
            <div class="bg-slate-100 rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col shadow-2xl w-full max-h-[90vh] h-full sm:h-[85%] sm:max-w-md animate-slideInUp" onclick="event.stopPropagation()">
                <header class="p-4 bg-white flex justify-between items-center border-b border-slate-200 flex-shrink-0">
                    <div class="text-lg font-bold text-slate-800 flex items-center gap-3">
                        <i class="fas fa-bell text-primary"></i> Notifications ${unreadCount > 0 ? `<span class="text-sm bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center">${unreadCount}</span>` : ''}
                    </div>
                    <button data-action="close-modal" class="w-9 h-9 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center transition-transform hover:rotate-90"><i class="fas fa-times"></i></button>
                </header>
                <div class="flex-grow overflow-y-auto p-4 scrollbar-hide">
                    ${notifications.length > 0 ? notifications.map(NotificationItem).join('') : `
                        <div class="text-center text-slate-500 p-10 flex flex-col items-center justify-center h-full">
                            <i class="far fa-bell-slash text-6xl text-slate-300 mb-5"></i>
                            <h3 class="font-semibold text-lg text-slate-700">No Notifications</h3>
                            <p class="mt-1">You're all caught up!</p>
                        </div>
                    `}
                </div>
                ${notifications.length > 0 && unreadCount > 0 ? `
                    <footer class="p-4 bg-white/80 backdrop-blur-lg border-t border-slate-200">
                        <button data-action="mark-all-notifications-read" class="w-full bg-primary/10 text-primary px-4 py-2 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-primary/20 transition-colors">
                            <i class="fas fa-check-double"></i> Mark all as read
                        </button>
                    </footer>
                ` : ''}
            </div>
        </div>`;
};

const PermissionPrompt = () => `
    <div class="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm p-2 animate-slideInUp">
        <div class="bg-white rounded-2xl shadow-2xl p-6 text-center">
            <div class="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <i class="fas fa-bell text-3xl text-primary"></i>
            </div>
            <h3 class="text-lg font-bold text-slate-800">Stay Updated!</h3>
            <p class="text-sm text-slate-600 my-2">Allow notifications to receive alerts when new news is published.</p>
            <div class="flex gap-3 mt-5">
                <button data-action="close-modal" class="flex-1 bg-slate-100 text-slate-700 px-4 py-2.5 rounded-full font-bold transition hover:bg-slate-200">Maybe Later</button>
                <button data-action="request-notification-permission" class="flex-1 bg-primary text-white px-4 py-2.5 rounded-full font-bold transition hover:bg-primary-dark">Allow</button>
            </div>
        </div>
    </div>`;


// --- Main Layout ---

const Header = (activeSection, user, notificationCount) => {
    const sectionTitles = {
        dashboard: 'Nepali News Hub',
        story: 'News Stories',
        aiReader: 'AI News Reader',
        source: 'News Sources',
        search: 'Search News',
        profile: 'My Profile',
    };

    return `
        <header class="bg-white/80 backdrop-blur-lg sticky top-0 z-50 h-[70px] border-b border-slate-200">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 h-full flex justify-between items-center">
                <div class="flex items-center gap-3">
                    ${Logo('w-8 h-8 text-primary')}
                    <h1 class="text-lg font-extrabold text-slate-800 hidden sm:block">${sectionTitles[activeSection] || 'Nepali News Hub'}</h1>
                </div>
                <div class="flex items-center gap-2 sm:gap-3">
                    <button data-action="change-section" data-section="search" class="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                        <i class="fas fa-search"></i>
                    </button>
                    <button data-action="open-notifications" class="relative w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                        <i class="fas fa-bell"></i>
                        ${notificationCount > 0 ? `<span class="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">${notificationCount}</span>` : ''}
                    </button>
                    <button data-action="profile-click" class="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors overflow-hidden">
                        ${user ? `<img src="${user.picture}" alt="Profile" class="w-full h-full object-cover" />` : '<i class="fas fa-user-circle"></i>'}
                    </button>
                </div>
            </div>
        </header>`;
};

const NavBar = (activeTab) => {
    const navItems = [
        { id: 'dashboard', label: 'गृहपृष्ठ', icon: 'fa-home' },
        { id: 'story', label: 'कथा', icon: 'fa-bolt' },
        { id: 'aiReader', label: 'AI Reader', icon: 'fa-robot' },
        { id: 'source', label: 'स्रोत', icon: 'fa-newspaper' },
    ];
    
    return `
        <div class="fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-lg border-t border-slate-200 z-50 shadow-[0_-2px_20px_rgba(0,0,0,0.05)]">
            <div class="max-w-7xl mx-auto h-full flex justify-around items-start">
                ${navItems.map(item => `
                    <button data-action="change-section" data-section="${item.id}" class="flex-1 flex flex-col items-center justify-center p-2 transition-all duration-200 ${activeTab === item.id ? 'text-primary' : 'text-slate-500 hover:text-primary'}">
                        <i class="fas ${item.icon} text-xl mb-1 transition-transform ${activeTab === item.id ? 'scale-110' : ''}"></i>
                        <span class="text-[10px] font-bold transition-opacity ${activeTab === item.id ? 'opacity-100' : 'opacity-0'}">${item.label}</span>
                    </button>
                `).join('')}
            </div>
        </div>`;
};

// --- Page Sections ---

const FailedFeedsAlert = (failedFeeds, retryingFeeds) => {
    if (failedFeeds.length === 0) return '';
    return `
        <div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 my-6 rounded-r-lg shadow-md animate-slideInDown opacity-0" style="animation-fill-mode: forwards;" role="alert">
            <p class="font-bold flex items-center gap-2"><i class="fas fa-exclamation-triangle"></i>Some Feeds Failed to Load</p>
            <ul class="mt-2 text-sm space-y-2">
                ${failedFeeds.map(feed => {
                    const isRetrying = retryingFeeds.includes(feed.url);
                    return `
                        <li class="flex justify-between items-center py-1">
                            <span>${feed.name}</span>
                            <button
                                data-action="retry-feed"
                                data-url="${feed.url}"
                                ${isRetrying ? 'disabled' : ''}
                                class="bg-yellow-500 text-white px-3 py-1 text-xs font-bold rounded-full hover:bg-yellow-600 transition-colors w-16 text-center disabled:opacity-50 disabled:cursor-wait"
                            >
                                ${isRetrying ? `<i class="fas fa-spinner animate-spin"></i>` : `<i class="fas fa-sync-alt mr-1"></i> Retry`}
                            </button>
                        </li>
                    `}).join('')}
            </ul>
        </div>`;
};

const DashboardSection = (state) => {
    const { allNewsItems, uniqueSources, isLoading, error, lastUpdated, user, favorites, dashboard, failedFeeds, retryingFeeds } = state;
    const { activeSource, activeTimeFilter, displayCount, quote } = dashboard;
    
    const isFavorited = (link) => favorites.some(fav => fav.link === link);

    const timeFilters = [
        { id: 'hour', label: '१ घण्टा' },
        { id: 'day', label: '२४ घण्टा' },
        { id: 'week', label: 'हप्ता' },
        { id: 'month', label: 'महिना' },
    ];

    const sourceTabs = (() => {
        const tabs = [{ id: 'all', label: 'सबै' }];
        if (user?.followedSources && user.followedSources.length > 0) {
            tabs.push({ id: 'followed', label: 'मनपर्ने' });
        }
        tabs.push(...uniqueSources.map(source => ({ id: source, label: source })));
        return tabs;
    })();

    const filteredNews = (() => {
        let items = allNewsItems;
        const now = Date.now();
        const timeLimits = { hour: 3600*1000, day: 24*3600*1000, week: 7*24*3600*1000, month: 30*24*3600*1000 };
        items = items.filter(item => new Date(item.pubDate).getTime() >= (now - timeLimits[activeTimeFilter]));

        if (activeSource === 'followed' && user?.followedSources) {
            items = items.filter(item => user.followedSources.includes(item.source));
        } else if (activeSource !== 'all') {
            items = items.filter(item => item.source === activeSource);
        }
        return items;
    })();

    const displayedNews = filteredNews.slice(0, displayCount);

    return `
        <div>
            <div class="bg-white sticky top-[70px] z-40 border-b border-slate-200">
                <div class="max-w-7xl mx-auto flex overflow-x-auto px-4 sm:px-6 scrollbar-hide">
                    ${sourceTabs.map(tab => `
                        <button data-action="set-source-filter" data-source="${tab.id}" class="py-4 px-4 font-semibold whitespace-nowrap transition-colors text-sm rounded-t-lg ${activeSource === tab.id ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-primary'}">
                            ${tab.label}
                        </button>
                    `).join('')}
                </div>
            </div>

            <div class="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                <div class="bg-slate-100 p-1.5 rounded-full flex justify-center gap-1 my-5 flex-wrap">
                    ${timeFilters.map(filter => `
                        <button data-action="set-time-filter" data-filter="${filter.id}" class="px-5 py-2 text-sm rounded-full font-semibold transition-colors flex-grow text-center ${activeTimeFilter === filter.id ? 'bg-white text-primary shadow' : 'bg-transparent text-slate-600 hover:bg-white/60'}">
                            ${filter.label}
                        </button>
                    `).join('')}
                </div>
                
                <div class="bg-gradient-to-tr from-primary/5 to-blue-500/5 rounded-2xl p-6 my-6 border-l-4 border-primary shadow-sm relative">
                    <i class="fas fa-quote-right absolute top-4 right-5 text-6xl text-primary/10"></i>
                    <div class="font-semibold text-primary mb-2 flex items-center gap-2"><i class="fas fa-lightbulb"></i> आजको सुविचार</div>
                    <p class="text-lg font-medium text-slate-700">${quote}</p>
                </div>

                ${FailedFeedsAlert(failedFeeds, retryingFeeds)}
                
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-center my-6">
                    <div class="bg-white p-3 rounded-xl shadow-sm"><span class="font-bold text-primary block text-lg">${allNewsItems.length}</span><span class="text-xs text-slate-500">कुल समाचार</span></div>
                    <div class="bg-white p-3 rounded-xl shadow-sm"><span class="font-bold text-primary block text-lg">${filteredNews.length}</span><span class="text-xs text-slate-500">देखाइएको</span></div>
                    <div class="bg-white p-3 rounded-xl shadow-sm col-span-2 md:col-span-1"><span class="font-bold text-primary block text-lg">${lastUpdated.toLocaleTimeString('ne-NP')}</span><span class="text-xs text-slate-500">अन्तिम अद्यावधिक</span></div>
                </div>

                ${isLoading && allNewsItems.length === 0 ? `
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                        ${Array.from({ length: 10 }).map(NewsCardSkeleton).join('')}
                    </div>` : ''
                }
                ${error ? `<div class="bg-red-100 text-red-700 p-6 rounded-xl text-center m-4 shadow-lg"><p>${error}</p></div>` : ''}
                
                ${!isLoading && filteredNews.length === 0 ? `
                    <div class="text-center py-10 bg-white rounded-2xl shadow-sm">
                        <i class="fas fa-inbox text-5xl text-slate-300 mb-4"></i>
                        <h3 class="font-bold text-slate-700 text-lg">No News Found</h3>
                        <p class="text-slate-500">Please try a different source or time filter.</p>
                    </div>` : ''
                }
                
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                    ${displayedNews.map((item, index) => NewsCard(item, isFavorited, `dashboard-${index}`)).join('')}
                </div>
            </div>
        </div>`;
};

const SearchSection = (state) => {
    const { allNewsItems, favorites, search } = state;
    const { searchTerm } = search;
    const isFavorited = (link) => favorites.some(fav => fav.link === link);
    
    const searchResults = searchTerm.trim() ? allNewsItems.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    return `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-slideInDown opacity-0" style="animation-fill-mode: forwards;">
            <div class="sticky top-[70px] z-40 bg-white/80 backdrop-blur-lg pt-4 pb-4">
                <div class="relative">
                    <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input type="text" data-action="search-input" placeholder="समाचार खोज्नुहोस्..." value="${searchTerm}" class="w-full pl-12 pr-4 py-3 bg-slate-100 border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition" />
                </div>
            </div>
            ${searchTerm ? `
                <div class="my-6">
                    <h2 class="text-xl font-bold text-slate-800 mb-4">"${searchTerm}" को लागि खोजी परिणाम (${searchResults.length})</h2>
                    ${searchResults.length > 0 ? `
                        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                            ${searchResults.map((item, index) => NewsCard(item, isFavorited, `search-${index}`)).join('')}
                        </div>
                    ` : `
                        <div class="text-center py-16 bg-white rounded-2xl shadow-sm">
                            <i class="fas fa-search text-5xl text-slate-300 mb-4"></i>
                            <h3 class="font-bold text-slate-700 text-lg">कुनै परिणाम फेला परेन</h3>
                            <p class="text-slate-500">तपाईंको खोजी कुनै पनि समाचार लेखसँग मेल खाएन।</p>
                        </div>
                    `}
                </div>
            ` : `
                <div class="text-center py-20 text-slate-500 flex flex-col items-center">
                    <i class="fas fa-search-plus text-6xl text-slate-300 mb-5"></i>
                    <h2 class="font-semibold text-xl text-slate-700">तपाईंको समाचार खोज्नुहोस्</h2>
                    <p>समाचार लेखहरू खोज्नको लागि एउटा शब्द टाइप गर्नुहोस्।</p>
                </div>
            `}
        </div>`;
};

const StorySection = (state) => {
    const { allNewsItems, story } = state;
    const { activeIndex } = story;
    const storyItems = allNewsItems.filter(item => item.imageUrl);

    const StoryViewer = (item, index, isActive) => `
        <div id="story-viewer-${index}" class="h-full w-full scroll-snap-start relative overflow-hidden flex flex-col justify-end items-center p-6 text-white text-center">
            <img src="${item.imageUrl}" alt="${item.title}" class="absolute inset-0 w-full h-full object-cover filter blur-sm scale-105" loading="lazy" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
            <div class="relative z-10 max-w-3xl flex flex-col items-center w-full transition-all duration-500 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}">
                <span class="bg-white/20 backdrop-blur-md px-4 py-1 text-sm font-bold rounded-full mb-4">${item.source}</span>
                <h1 class="text-2xl sm:text-3xl font-bold leading-tight drop-shadow-lg mb-4">${item.title}</h1>
                <p class="text-sm text-white/80 mb-8">${new Date(item.pubDate).toLocaleString('ne-NP', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                <div class="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md">
                    <button data-action="view-news" data-link="${item.link}" class="bg-primary hover:bg-primary-dark font-bold py-3 px-6 rounded-full transition-colors flex-1 flex items-center justify-center gap-2"><i class="fas fa-book-open"></i> Read Article</button>
                    <button class="bg-white/20 hover:bg-white/30 backdrop-blur-md font-bold py-3 px-6 rounded-full transition-colors flex-1 flex items-center justify-center gap-2" disabled><i class="fas fa-play-circle"></i> Listen</button>
                    <button data-action="share-screenshot" data-element-id="story-viewer-${index}" data-title="${item.title}" class="bg-white/20 hover:bg-white/30 backdrop-blur-md font-bold py-3 px-6 rounded-full transition-colors flex-1 flex items-center justify-center gap-2"><i class="fas fa-share-alt"></i> Share</button>
                </div>
            </div>
        </div>`;

    if (storyItems.length === 0) {
        return `<div class="h-full flex flex-col items-center justify-center text-center text-slate-500 p-8 bg-slate-100">
                    <i class="far fa-image text-6xl text-slate-300 mb-5"></i>
                    <h2 class="font-semibold text-xl text-slate-700">No Stories Available</h2>
                    <p>Stories require news with images. Please check back later.</p>
                </div>`;
    }
    
    return `
        <div id="story-container" class="h-full w-full overflow-y-auto snap-y snap-mandatory scrollbar-hide">
            ${storyItems.map((item, index) => StoryViewer(item, index, index === activeIndex)).join('')}
        </div>`;
};


const SourceSection = (state) => {
    const { allNewsItems, uniqueSources, favorites, source } = state;
    const { selectedSource } = source;
    const isFavorited = (link) => favorites.some(fav => fav.link === link);

    const newsBySource = selectedSource ? allNewsItems.filter(item => item.source === selectedSource) : [];

    return `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-slideInDown opacity-0" style="animation-fill-mode: forwards;">
            <h2 class="text-2xl font-bold text-slate-800 mb-5">स्रोत अनुसार ब्राउज गर्नुहोस्</h2>
            <div class="flex flex-wrap gap-3 mb-8">
                ${uniqueSources.map(sourceName => `
                    <button data-action="select-source" data-source="${sourceName}" class="px-4 py-2 rounded-full font-semibold transition-colors text-sm ${selectedSource === sourceName ? 'bg-primary text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
                        ${sourceName}
                    </button>
                `).join('')}
            </div>
            ${selectedSource ? `
                <div>
                    <h3 class="text-xl font-bold text-slate-800 mb-4">${selectedSource} (${newsBySource.length} लेख)</h3>
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                        ${newsBySource.map((item, index) => NewsCard(item, isFavorited, `source-${index}`)).join('')}
                    </div>
                </div>
            ` : `
                <div class="text-center py-20 text-slate-500 flex flex-col items-center">
                    <i class="far fa-newspaper text-6xl text-slate-300 mb-5"></i>
                    <h2 class="font-semibold text-xl text-slate-700">एक स्रोत चयन गर्नुहोस्</h2>
                    <p>नवीनतम लेखहरू हेर्नको लागि माथिबाट एउटा समाचार स्रोत छान्नुहोस्।</p>
                </div>
            `}
        </div>`;
};

const AiReaderSection = (state) => {
    const { allNewsItems, aiReader } = state;
    const { currentPlayingIndex, currentProgress, status } = aiReader;
    const newsForReader = allNewsItems.slice(0, 20);

    const AiNewsCard = (item, index) => {
        const isPlaying = currentPlayingIndex === index;
        const isDimmed = currentPlayingIndex !== null && currentPlayingIndex !== index;
        return `
            <div class="bg-white rounded-2xl shadow-md overflow-hidden border-2 transition-all duration-300 flex flex-col ${isPlaying ? 'border-primary shadow-xl scale-105' : 'border-transparent'} ${isDimmed ? 'opacity-60 grayscale-[50%]' : ''}">
                <div class="p-5 flex flex-col flex-grow h-full">
                    <div class="flex justify-between items-center mb-3">
                        <span class="bg-primary/10 text-primary px-3 py-1 text-xs font-bold rounded-full flex-shrink-0">${item.source}</span>
                        <span class="text-xs text-slate-500 text-right pl-2">${new Date(item.pubDate).toLocaleTimeString('ne-NP', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <h3 class="font-bold text-slate-800 my-2 text-base leading-relaxed flex-grow">${item.title}</h3>
                    <div class="mt-auto pt-4 border-t border-slate-100">
                        <div class="flex items-center gap-4">
                            <button data-action="ai-play" data-index="${index}" class="w-12 h-12 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 flex-shrink-0 text-xl shadow-lg ${isPlaying ? 'bg-accent animate-pulse' : 'bg-primary'}">
                                <i class="fas ${isPlaying ? 'fa-pause' : 'fa-play'}"></i>
                            </button>
                            <div class="w-full bg-slate-200 rounded-full h-2.5 relative overflow-hidden">
                                <div class="bg-primary h-2.5 rounded-full transition-all duration-100" style="width: ${isPlaying ? currentProgress : 0}%;"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
    };
    
    return `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-slideInDown opacity-0" style="animation-fill-mode: forwards;">
            <header class="text-center mb-8">
                <h2 class="text-3xl font-extrabold text-slate-800 mb-2">AI News Reader</h2>
                <p class="text-slate-600">Listen to today's top headlines.</p>
            </header>
             <div class="p-4 bg-white rounded-2xl shadow-lg sticky top-[80px] z-30">
                <div class="flex justify-center items-center flex-wrap gap-4 mb-4">
                    <button data-action="ai-prev" class="w-16 h-16 rounded-full font-semibold flex items-center justify-center bg-slate-200 text-slate-600 text-2xl hover:-translate-y-0.5 transition-transform shadow-lg disabled:opacity-50" ${currentPlayingIndex === null || currentPlayingIndex === 0 ? 'disabled' : ''}><i class="fas fa-step-backward"></i></button>
                    <button data-action="ai-play-all" class="w-16 h-16 rounded-full font-semibold flex items-center justify-center bg-primary text-white text-2xl hover:-translate-y-0.5 transition-transform shadow-lg"><i class="fas fa-play"></i></button>
                    <button data-action="ai-pause-resume" class="w-16 h-16 rounded-full font-semibold flex items-center justify-center bg-yellow-500 text-white text-2xl hover:-translate-y-0.5 transition-transform shadow-lg disabled:opacity-50" ${currentPlayingIndex === null ? 'disabled' : ''}><i class="fas fa-pause"></i></button>
                    <button data-action="ai-stop" class="w-16 h-16 rounded-full font-semibold flex items-center justify-center bg-red-500 text-white text-2xl hover:-translate-y-0.5 transition-transform shadow-lg disabled:opacity-50" ${currentPlayingIndex === null ? 'disabled' : ''}><i class="fas fa-stop"></i></button>
                    <button data-action="ai-next" class="w-16 h-16 rounded-full font-semibold flex items-center justify-center bg-slate-200 text-slate-600 text-2xl hover:-translate-y-0.5 transition-transform shadow-lg disabled:opacity-50" ${currentPlayingIndex === null || currentPlayingIndex >= 19 ? 'disabled' : ''}><i class="fas fa-step-forward"></i></button>
                </div>
                <div class="w-full bg-slate-200 rounded-full h-3 my-2 overflow-hidden">
                    <div class="bg-primary h-3 rounded-full transition-all duration-150 ease-linear" style="width: ${currentProgress}%;"></div>
                </div>
            </div>
            <p class="text-center font-semibold text-primary h-6 my-4">${status}</p>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                ${newsForReader.map((item, index) => AiNewsCard(item, index)).join('')}
            </div>
        </div>`;
};

const ProfileSection = (state) => {
    const { user } = state;
    if (!user) return `<div class="p-8 text-center">Please sign in to view your profile.</div>`;
    
    return `
        <div class="max-w-4xl mx-auto px-4 sm:px-6 py-10 animate-slideInDown opacity-0 space-y-8" style="animation-fill-mode: forwards;">
            <div class="bg-white rounded-2xl shadow-xl p-8 text-center flex flex-col items-center">
                <img src="${user.picture}" alt="Profile" class="w-28 h-28 rounded-full mb-4 border-4 border-primary shadow-lg" />
                <h2 class="text-3xl font-bold text-slate-800">${user.name}</h2>
                <p class="text-slate-500 mt-1 mb-6">${user.email}</p>
                <button data-action="sign-out" class="w-full max-w-xs bg-red-500 text-white px-6 py-3 rounded-full font-bold text-lg transition-colors hover:bg-red-600 flex items-center justify-center gap-3">
                    <i class="fas fa-sign-out-alt"></i> Sign Out
                </button>
            </div>
        </div>`;
};


// --- App Structure ---
export const SplashScreen = () => `
    <div class="fixed top-0 left-0 w-full h-full bg-gradient-to-br from-primary to-primary-dark flex flex-col justify-center items-center z-[1000]">
        <div class="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-8 animate-pulse">
            <i class="fas fa-newspaper text-5xl text-primary"></i>
        </div>
        <h1 class="text-4xl font-bold text-white text-center text-shadow-lg leading-tight px-4">सबै समाचार एकै ठाँउमा</h1>
        <p class="text-lg text-white/85 mt-4 text-center max-w-md px-4">नेपालका प्रमुख समाचार स्रोतहरूबाट स्वतः अपडेट हुने समाचारहरू</p>
    </div>`;

export const AppShell = (state) => {
    const { activeSection, user, favorites, notifications, permissionState, ui } = state;
    const { isFavoritesModalOpen, isLoginPromptOpen, isNotificationsModalOpen, isScrollToTopVisible } = ui;
    
    const unreadNotifications = notifications.filter(n => !n.read).length;

    const renderSection = () => {
        switch (activeSection) {
            case 'dashboard': return DashboardSection(state);
            case 'search': return SearchSection(state);
            case 'story': return StorySection(state);
            case 'source': return SourceSection(state);
            case 'aiReader': return AiReaderSection(state);
            case 'profile': return ProfileSection(state);
            default: return '<div>Section not found</div>';
        }
    };

    return `
        <div class="min-h-screen bg-slate-100 font-sans">
            ${Header(activeSection, user, unreadNotifications)}
            
            <main class="pb-20">
                ${activeSection === 'story' ? `
                    <div class="fixed top-[70px] left-0 right-0 bottom-20">
                        ${renderSection()}
                    </div>
                ` : `
                    <div class="min-h-[calc(100vh-150px)]">
                        ${renderSection()}
                    </div>
                `}
            </main>
            
            ${activeSection !== 'story' ? ScrollToTopButton(isScrollToTopVisible) : ''}
            
            ${NavBar(activeSection)}
            
            ${isFavoritesModalOpen ? FavoritesModal(favorites) : ''}
            ${isLoginPromptOpen ? LoginPrompt() : ''}
            ${isNotificationsModalOpen ? NotificationsModal(notifications) : ''}
            ${permissionState === 'prompt' && !isLoginPromptOpen ? PermissionPrompt() : ''}
        </div>`;
};