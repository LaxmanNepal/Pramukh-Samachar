import React, { useState, useMemo } from 'react';
import { NewsItem } from '../types';
import NewsCard from '../components/NewsCard';

interface SearchProps {
    allNewsItems: NewsItem[];
    isFavorited: (link: string) => boolean;
    onFavoriteToggle: (item: NewsItem) => void;
    onView: (url: string) => void;
}

const Search: React.FC<SearchProps> = (props) => {
    const { allNewsItems, ...cardProps } = props;
    const [searchTerm, setSearchTerm] = useState('');

    const searchResults = useMemo(() => {
        if (!searchTerm.trim()) {
            return [];
        }
        const lowercasedTerm = searchTerm.toLowerCase();
        return allNewsItems.filter(item =>
            item.title.toLowerCase().includes(lowercasedTerm) ||
            item.source.toLowerCase().includes(lowercasedTerm) ||
            item.description.toLowerCase().includes(lowercasedTerm)
        );
    }, [searchTerm, allNewsItems]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-slideInDown opacity-0">
            <div className="sticky top-[70px] z-40 bg-white/80 backdrop-blur-lg pt-4 pb-4">
                <div className="relative">
                    <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input
                        type="text"
                        placeholder="समाचार खोज्नुहोस्..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-100 border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                    />
                </div>
            </div>

            {searchTerm && (
                <div className="my-6">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">
                        "{searchTerm}" को लागि खोजी परिणाम ({searchResults.length})
                    </h2>
                    {searchResults.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                            {searchResults.map((item, index) => (
                                <NewsCard key={item.link + index} item={item} {...cardProps} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                            <i className="fas fa-search text-5xl text-slate-300 mb-4"></i>
                            <h3 className="font-bold text-slate-700 text-lg">कुनै परिणाम फेला परेन</h3>
                            <p className="text-slate-500">तपाईंको खोजी कुनै पनि समाचार लेखसँग मेल खाएन।</p>
                        </div>
                    )}
                </div>
            )}

            {!searchTerm && (
                <div className="text-center py-20 text-slate-500 flex flex-col items-center">
                    <i className="fas fa-search-plus text-6xl text-slate-300 mb-5"></i>
                    <h2 className="font-semibold text-xl text-slate-700">तपाईंको समाचार खोज्नुहोस्</h2>
                    <p>समाचार लेखहरू खोज्नको लागि एउटा शब्द टाइप गर्नुहोस्।</p>
                </div>
            )}
        </div>
    );
};

export default Search;