
import * as templates from './templates.js';
import { fetchAndParseFeeds } from './services.js';
import { MOTIVATIONAL_QUOTES } from './constants.js';

const app = {
    // Application State
    state: {
        allNewsItems: [],
        uniqueSources: [],
        isLoading: true,
        isRefreshing: false,
        error: null,
        lastUpdated: new Date(),
        showSplashScreen: true,
        activeSection: 'dashboard',
        favorites: [],
        user: null,
        notifications: [],
        permissionState: 'prompt',
        // Dashboard specific state
        dashboard: {
            activeSource: 'all',
            activeTimeFilter: 'day',
            displayCount: 12,
            quote: MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)],
        },
        // Search specific state
        search: {
            searchTerm: '',
        },
        // Story specific state
        story: {
            activeIndex: 0,
        },
        // Source specific state
        source: {
            selectedSource: null,
        },
        // AI Reader specific state
        aiReader: {
            currentPlayingIndex: null,
            currentProgress: 0,
            isPlayAllActive: false,
            status: 'Ready to play',
        },
        // UI component state
        ui: {
            isFavoritesModalOpen: false,
            isLoginPromptOpen: false,
            isNotificationsModalOpen: false,
        }
    },

    // DOM Elements
    elements: {
        appContainer: null,
    },

    // Initialization
    init() {
        this.elements.appContainer = document.getElementById('app-container');
        
        this.loadStateFromStorage();
        this.registerServiceWorker();
        this.attachEventListeners();
        this.loadNews();
        
        setTimeout(() => {
            this.setState({ showSplashScreen: false });
        }, 2000);

        this.render();
    },

    // State Management
    setState(newState) {
        // Deep merge for nested state objects
        for (const key in newState) {
            if (typeof newState[key] === 'object' && newState[key] !== null && !Array.isArray(newState[key])) {
                this.state[key] = { ...this.state[key], ...newState[key] };
            } else {
                this.state[key] = newState[key];
            }
        }
        this.render();
    },

    loadStateFromStorage() {
        try {
            const storedFavorites = localStorage.getItem('favorites');
            const storedUser = localStorage.getItem('user');
            const storedNotifications = localStorage.getItem('notifications');
            
            this.state.favorites = storedFavorites ? JSON.parse(storedFavorites) : [];
            this.state.user = storedUser ? JSON.parse(storedUser) : null;
            this.state.notifications = storedNotifications ? JSON.parse(storedNotifications) : [];
            this.state.permissionState = ('Notification' in window) ? Notification.permission : 'denied';

        } catch (error) {
            console.error("Failed to load state from localStorage", error);
        }
    },
    
    // Core App Logic
    async loadNews(isRefresh = false) {
        if (!isRefresh) this.setState({ isLoading: true });
        else this.setState({ isRefreshing: true });

        this.setState({ error: null });
        try {
            const { items, sources } = await fetchAndParseFeeds();
            this.setState({
                allNewsItems: items,
                uniqueSources: sources,
                lastUpdated: new Date(),
            });
            this.handleNewNews(items);
        } catch (err) {
            this.setState({ error: err.message || 'An unknown error occurred while fetching news.' });
        } finally {
            if (!isRefresh) this.setState({ isLoading: false });
            else this.setState({ isRefreshing: false });
        }
    },
    
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('sw.js')
                    .then(registration => console.log('Service Worker registered:', registration))
                    .catch(error => console.log('Service Worker registration failed:', error));
            });
        }
    },
    
    // Rendering
    render() {
        const { showSplashScreen, ...state } = this.state;
        
        if (showSplashScreen) {
            this.elements.appContainer.innerHTML = templates.SplashScreen();
            return;
        }

        this.elements.appContainer.innerHTML = templates.AppShell(state);
    },
    
    // Event Handling
    attachEventListeners() {
        this.elements.appContainer.addEventListener('click', this.handleAppClick.bind(this));
        
        // Delegated input handler for search
        this.elements.appContainer.addEventListener('input', e => {
            const target = e.target;
            if (target && target.dataset.action === 'search-input') {
                this.setState({ search: { searchTerm: target.value } });
            }
        });
        
        // Delegated scroll handler for story view
        this.elements.appContainer.addEventListener('scroll', e => {
            const target = e.target;
            if (target && target.id === 'story-container') {
                const { scrollTop, clientHeight } = target;
                const newIndex = Math.round(scrollTop / clientHeight);
                if (newIndex !== this.state.story.activeIndex) {
                     this.speech.stop();
                     this.setState({ story: { activeIndex: newIndex } });
                }
            }
        }, true); // Use capture phase to ensure it fires
    },
    
    handleAppClick(e) {
        const target = e.target;
        const actionTarget = target.closest('[data-action]');
        if (!actionTarget) return;

        const { action, ...data } = actionTarget.dataset;
        e.preventDefault();

        switch(action) {
            // Navigation
            case 'change-section':
                this.setState({ activeSection: data.section });
                break;
            case 'profile-click':
                if (this.state.user) this.setState({ activeSection: 'profile' });
                else this.setState({ ui: { isLoginPromptOpen: true } });
                break;

            // Modals
            case 'open-notifications':
                this.setState({ ui: { isNotificationsModalOpen: true }});
                break;
            case 'open-favorites':
                 this.setState({ ui: { isFavoritesModalOpen: true } });
                 break;
            case 'close-modal':
                this.setState({ ui: { 
                    isFavoritesModalOpen: false, 
                    isLoginPromptOpen: false, 
                    isNotificationsModalOpen: false
                }});
                break;

            // News Actions
            case 'toggle-favorite':
                this.handleFavoriteToggle(data.link);
                break;
            case 'view-news':
                window.open(data.link, '_blank', 'noopener,noreferrer');
                break;
            case 'share-screenshot':
                 this.handleScreenshotShare(data.elementId, data.title);
                 break;

            // Dashboard Actions
            case 'set-source-filter':
                this.setState({ dashboard: { activeSource: data.source, displayCount: 12 } });
                break;
            case 'set-time-filter':
                 this.setState({ dashboard: { activeTimeFilter: data.filter, displayCount: 12 } });
                 break;
                 
            // Source Actions
            case 'select-source':
                this.setState({ source: { selectedSource: data.source }});
                break;

            // Auth
            case 'sign-in':
                this.handleSignIn();
                break;
            case 'sign-out':
                this.handleSignOut();
                break;
            
            // Notifications
            case 'mark-notification-read':
                this.markAsRead(data.id);
                break;
            case 'mark-all-notifications-read':
                this.markAllAsRead();
                break;
            case 'request-notification-permission':
                this.requestNotificationPermission();
                break;
                
            // Favorites
            case 'remove-favorite':
                e.stopPropagation();
                this.removeFavorite(data.link);
                break;
            case 'clear-favorites':
                 if (window.confirm("के तपाईं सबै मनपराएका समाचारहरू हटाउन चाहनुहुन्छ?")) {
                    this.clearFavorites();
                 }
                 break;

            // AI Reader
            case 'ai-play':
                this.handleAiPlay(parseInt(data.index, 10));
                break;
            case 'ai-play-all':
                this.handleAiPlayAll();
                break;
            case 'ai-pause-resume':
                this.speech.isPaused ? this.speech.resume() : this.speech.pause();
                break;
            case 'ai-stop':
                this.speech.stop();
                break;
            case 'ai-next':
                this.handleAiNext();
                break;
            case 'ai-prev':
                this.handleAiPrev();
                break;
        }
    },
    
    // --- Specific Handlers ---
    
    // Favorites
    handleFavoriteToggle(link) {
        const isFavorited = this.state.favorites.some(fav => fav.link === link);
        if (isFavorited) {
            this.removeFavorite(link);
        } else {
            const item = this.state.allNewsItems.find(item => item.link === link);
            if (item) this.addFavorite(item);
        }
    },
    addFavorite(item) {
        const newFavorites = [...this.state.favorites, item];
        localStorage.setItem('favorites', JSON.stringify(newFavorites));
        this.setState({ favorites: newFavorites });
    },
    removeFavorite(link) {
        const newFavorites = this.state.favorites.filter(fav => fav.link !== link);
        localStorage.setItem('favorites', JSON.stringify(newFavorites));
        this.setState({ favorites: newFavorites });
    },
    clearFavorites() {
        localStorage.setItem('favorites', JSON.stringify([]));
        this.setState({ favorites: [] });
    },
    
    // Auth
    handleSignIn() {
         const mockUser = {
            name: 'Laxman Nepal',
            email: 'user@gmail.com',
            picture: 'https://lh3.googleusercontent.com/a/ACg8ocL-J8p-4a5E-d-q-ZT-p-Q-Y-j-A-L-s-Y-j-A-L-s=s96-c',
            followedSources: ['Onlinekhabar', 'Kantipur Daily'],
        };
        localStorage.setItem('user', JSON.stringify(mockUser));
        this.setState({ user: mockUser, ui: { isLoginPromptOpen: false }, activeSection: 'profile' });
    },
    handleSignOut() {
        localStorage.removeItem('user');
        this.setState({ user: null, activeSection: 'dashboard' });
    },

    // Screenshot
    async handleScreenshotShare(elementId, title) {
        const element = document.getElementById(elementId);
        if (!element || !window.htmlToImage) {
            console.error("Element to capture not found or html-to-image library not loaded.");
            return;
        }
        if (!navigator.share) {
            alert("Web Share API is not supported in your browser.");
            return;
        }
        try {
            const dataUrl = await window.htmlToImage.toPng(element, { cacheBust: true });
            const blob = await (await fetch(dataUrl)).blob();
            const file = new File([blob], `${title.replace(/ /g, '_')}.png`, { type: blob.type });

            await navigator.share({
                files: [file],
                title: title,
                text: `Check out this news: ${title}`,
            });
        } catch (error) {
            console.error('Oops, something went wrong with sharing!', error);
        }
    },
    
    // Notifications
    handleNewNews(newsItems) {
        if (!('Notification' in window) || Notification.permission !== 'granted') return;

        const storedSeenLinks = localStorage.getItem('seenNewsLinks');
        const seenNewsLinks = storedSeenLinks ? new Set(JSON.parse(storedSeenLinks)) : new Set(newsItems.map(i => i.link));
        
        const newItems = newsItems.filter(item => !seenNewsLinks.has(item.link));

        if (newItems.length > 0) {
            newItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

            const newNotifications = newItems.map(item => ({
                id: item.link,
                title: item.source,
                body: item.title,
                timestamp: new Date(item.pubDate).getTime(),
                read: false,
            }));
            
            const latestItem = newItems[0];
            if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
                navigator.serviceWorker.ready.then(registration => {
                    registration.showNotification(latestItem.source, {
                        body: latestItem.title,
                        icon: 'logo-192.png',
                        badge: 'logo.svg',
                        data: { url: latestItem.link }
                    });
                });
            }

            const allNotifications = [...newNotifications, ...this.state.notifications];
            localStorage.setItem('notifications', JSON.stringify(allNotifications));
            
            const updatedSeenLinks = new Set(seenNewsLinks);
            newItems.forEach(item => updatedSeenLinks.add(item.link));
            localStorage.setItem('seenNewsLinks', JSON.stringify(Array.from(updatedSeenLinks)));

            this.setState({ notifications: allNotifications });
        }
    },
    async requestNotificationPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            this.setState({ permissionState: permission });
        }
    },
    markAsRead(id) {
        const newNotifications = this.state.notifications.map(n => n.id === id ? { ...n, read: true } : n);
        localStorage.setItem('notifications', JSON.stringify(newNotifications));
        this.setState({ notifications: newNotifications });
    },
    markAllAsRead() {
        const newNotifications = this.state.notifications.map(n => ({ ...n, read: true }));
        localStorage.setItem('notifications', JSON.stringify(newNotifications));
        this.setState({ notifications: newNotifications });
    },
    
    // AI Reader & Speech Synthesis
    speech: {
        synth: window.speechSynthesis,
        isPlaying: false,
        isPaused: false,
        utterance: null,
        
        play(text, onEnd, onBoundary) {
            if (this.isPlaying) this.stop();
            
            this.utterance = new SpeechSynthesisUtterance(text);
            this.utterance.rate = 0.9;
            this.utterance.pitch = 1.1;
            
            this.utterance.onstart = () => { this.isPlaying = true; this.isPaused = false; };
            this.utterance.onend = () => { this.isPlaying = false; this.isPaused = false; this.utterance = null; onEnd(); };
            this.utterance.onerror = (e) => { console.error('Speech error:', e); this.isPlaying = false; this.isPaused = false; };
            this.utterance.onboundary = onBoundary;
            
            this.synth.speak(this.utterance);
        },
        pause() { if (this.isPlaying && !this.isPaused) { this.synth.pause(); this.isPaused = true; } },
        resume() { if (this.isPaused) { this.synth.resume(); this.isPaused = false; } },
        stop() { if (this.isPlaying) { this.synth.cancel(); this.isPlaying = false; this.isPaused = false; } }
    },

    handleAiPlay(index) {
        const item = this.state.allNewsItems.slice(0, 20)[index];
        if (!item) return;

        const { currentPlayingIndex } = this.state.aiReader;

        if (currentPlayingIndex === index) {
            if (this.speech.isPaused) this.speech.resume();
            else this.speech.pause();
        } else {
            this.speech.stop();
            const textToSpeak = `"${item.source}" बाट समाचार: ${item.title}`;
            
            this.speech.play(
                textToSpeak,
                () => { // onEnd
                    if (this.state.aiReader.isPlayAllActive) {
                        const nextIndex = index + 1;
                        if (nextIndex < 20) {
                            this.handleAiPlay(nextIndex);
                        } else {
                            this.setState({ aiReader: { isPlayAllActive: false, currentPlayingIndex: null } });
                        }
                    } else {
                        this.setState({ aiReader: { currentPlayingIndex: null } });
                    }
                },
                (e) => { // onBoundary
                    const progress = (e.charIndex / textToSpeak.length) * 100;
                    this.setState({ aiReader: { currentProgress: progress }});
                }
            );
        }
        this.setState({ aiReader: { currentPlayingIndex: index } });
    },
    handleAiPlayAll() {
        this.speech.stop();
        this.setState({ aiReader: { isPlayAllActive: true }});
        this.handleAiPlay(0);
    },
     handleAiNext() {
        const { currentPlayingIndex } = this.state.aiReader;
        if (currentPlayingIndex === null || currentPlayingIndex >= 19) return;
        const nextIndex = currentPlayingIndex + 1;
        this.speech.stop();
        setTimeout(() => this.handleAiPlay(nextIndex), 50);
    },
    handleAiPrev() {
        const { currentPlayingIndex } = this.state.aiReader;
        if (currentPlayingIndex === null || currentPlayingIndex === 0) return;
        const prevIndex = currentPlayingIndex - 1;
        this.speech.stop();
        setTimeout(() => this.handleAiPlay(prevIndex), 50);
    },

};

document.addEventListener('DOMContentLoaded', () => app.init());
