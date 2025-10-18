import React, { useState, useMemo, useRef, useCallback } from 'react';
import { NewsItem, User } from '../types';
import NewsCard from '../components/NewsCard';
import { NewsCardSkeleton } from '../components/Skeletons';
import ErrorMessage from '../components/ErrorMessage';
import { MOTIVATIONAL_QUOTES } from '../constants';

interface DashboardProps {
    allNewsItems: NewsItem[];
    uniqueSources: string[];
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date;
    user: User | null;
    isFavorited: (link: string) => boolean;
    onFavoriteToggle: (item: NewsItem) => void;
    onView: (url: string) => void;
    onRefresh: () => void;
}

const timeFilters = [
    { id: 'hour', label: '१ घण्टा' },
    { id: 'day', label: '२४ घण्टा' },
    { id: 'week', label: 'हप्ता' },
    { id: 'month', label: 'महिना' },
];

const QuoteSection: React.FC<{ quote: string }> = ({ quote }) => (
    <div className="bg-gradient-to-tr from-primary/5 to-blue-500/5 rounded-2xl p-6 my-6 border-l-4 border-primary shadow-sm relative">
        <i className="fas fa-quote-right absolute top-4 right-5 text-6xl text-primary/10"></i>
        <div className="font-semibold text-primary mb-2 flex items-center gap-2"><i className="fas fa-lightbulb"></i> आजको सुविचार</div>
        <p className="text-lg font-medium text-slate-700">{quote}</p>
    </div>
);

const Dashboard: React.FC<DashboardProps> = (props) => {
    const { allNewsItems, uniqueSources, isLoading, error, lastUpdated, user, onRefresh, ...cardProps } = props;
    const [activeSource, setActiveSource] = useState('all');
    const [activeTimeFilter, setActiveTimeFilter] = useState('day');
    const [displayCount, setDisplayCount] = useState(12);
    const [quote] = useState(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);

    const sourceTabs = useMemo(() => {
        const tabs = [{ id: 'all', label: 'सबै' }];
        if (user?.followedSources && user.followedSources.length > 0) {
            tabs.push({ id: 'followed', label: 'मनपर्ने' });
        }
        tabs.push(...uniqueSources.map(source => ({ id: source, label: source })));
        return tabs;
    }, [uniqueSources, user]);

    const filteredNews = useMemo(() => {
        let items = allNewsItems;

        const now = Date.now();
        const timeLimits = {
            hour: now - 3600 * 1000,
            day: now - 24 * 3600 * 1000,
            week: now - 7 * 24 * 3600 * 1000,
            month: now - 30 * 24 * 3600 * 1000,
        };
        const limit = timeLimits[activeTimeFilter as keyof typeof timeLimits];
        items = items.filter(item => new Date(item.pubDate).getTime() >= limit);

        if (activeSource === 'followed' && user?.followedSources) {
            items = items.filter(item => user.followedSources.includes(item.source));
        } else if (activeSource !== 'all') {
            items = items.filter(item => item.source === activeSource);
        }
        return items;
    }, [allNewsItems, activeSource, activeTimeFilter, user]);

    const displayedNews = useMemo(() => filteredNews.slice(0, displayCount), [filteredNews, displayCount]);
    
    const observer = useRef<IntersectionObserver | null>(null);
    const lastNewsElementRef = useCallback((node: HTMLDivElement | null) => {
        if (isLoading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && filteredNews.length > displayCount) {
                setDisplayCount(prev => prev + 8);
            }
        });
        if (node) observer.current.observe(node);
    }, [isLoading, displayCount, filteredNews.length]);

    const renderSkeletons = () => (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {Array.from({ length: 10 }).map((_, index) => <NewsCardSkeleton key={index} />)}
        </div>
    );

    return (
        <div>
            <div className="bg-white sticky top-0 z-40 border-b border-slate-200">
                <div className="max-w-7xl mx-auto flex overflow-x-auto px-4 sm:px-6 scrollbar-hide">
                    {sourceTabs.map(tab => (
                        <button key={tab.id} onClick={() => { setActiveSource(tab.id); setDisplayCount(12); }}
                            className={`py-4 px-4 font-semibold whitespace-nowrap transition-colors text-sm rounded-t-lg ${activeSource === tab.id ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-primary'}`}>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                <div className="bg-slate-100 p-1.5 rounded-full flex justify-center gap-1 my-5 flex-wrap">
                    {timeFilters.map(filter => (
                        <button key={filter.id} onClick={() => { setActiveTimeFilter(filter.id); setDisplayCount(12); }}
                            className={`px-5 py-2 text-sm rounded-full font-semibold transition-colors flex-grow text-center ${activeTimeFilter === filter.id ? 'bg-white text-primary shadow' : 'bg-transparent text-slate-600 hover:bg-white/60'}`}>
                            {filter.label}
                        </button>
                    ))}
                </div>

                <QuoteSection quote={quote} />
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center my-6">
                    <div className="bg-white p-3 rounded-xl shadow-sm"><span className="font-bold text-primary block text-lg">{allNewsItems.length}</span><span className="text-xs text-slate-500">कुल समाचार</span></div>
                    <div className="bg-white p-3 rounded-xl shadow-sm"><span className="font-bold text-primary block text-lg">{filteredNews.length}</span><span className="text-xs text-slate-500">देखाइएको</span></div>
                    <div className="bg-white p-3 rounded-xl shadow-sm col-span-2 md:col-span-1"><span className="font-bold text-primary block text-lg">{lastUpdated.toLocaleTimeString('ne-NP')}</span><span className="text-xs text-slate-500">अन्तिम अद्यावधिक</span></div>
                </div>

                {isLoading && allNewsItems.length === 0 && renderSkeletons()}
                {error && <ErrorMessage message={error} onRetry={onRefresh} />}
                
                {!isLoading && filteredNews.length === 0 && (
                    <div className="text-center py-10 bg-white rounded-2xl shadow-sm">
                         <i className="fas fa-inbox text-5xl text-slate-300 mb-4"></i>
                        <h3 className="font-bold text-slate-700 text-lg">No News Found</h3>
                        <p className="text-slate-500">Please try a different source or time filter.</p>
                    </div>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                    {displayedNews.map((item, index) => 
                        <NewsCard 
                            ref={displayedNews.length === index + 1 ? lastNewsElementRef : null}
                            key={item.link + index} 
                            item={item} 
                            {...cardProps} 
                        />
                    )}
                </div>

                {isLoading && allNewsItems.length > 0 && <div className="text-center py-8"><i className="fas fa-spinner text-primary text-2xl animate-spin"></i></div>}

            </div>
        </div>
    );
};

export default Dashboard;
