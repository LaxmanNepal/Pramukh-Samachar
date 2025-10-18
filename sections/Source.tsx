import React, { useState, useMemo } from 'react';
import { NewsItem } from '../types';
import NewsCard from '../components/NewsCard';

interface SourceProps {
    allNewsItems: NewsItem[];
    uniqueSources: string[];
    isFavorited: (link: string) => boolean;
    onFavoriteToggle: (item: NewsItem) => void;
    onView: (url: string) => void;
}

const Source: React.FC<SourceProps> = (props) => {
    const { allNewsItems, uniqueSources, ...cardProps } = props;
    const [selectedSource, setSelectedSource] = useState<string | null>(null);

    const newsBySource = useMemo(() => {
        if (!selectedSource) return [];
        return allNewsItems.filter(item => item.source === selectedSource);
    }, [allNewsItems, selectedSource]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-slideInDown opacity-0">
            <h2 className="text-2xl font-bold text-slate-800 mb-5">स्रोत अनुसार ब्राउज गर्नुहोस्</h2>
            <div className="flex flex-wrap gap-3 mb-8">
                {uniqueSources.map(source => (
                    <button
                        key={source}
                        onClick={() => setSelectedSource(source)}
                        className={`px-4 py-2 rounded-full font-semibold transition-colors text-sm ${selectedSource === source ? 'bg-primary text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                    >
                        {source}
                    </button>
                ))}
            </div>

            {selectedSource && (
                <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-4">{selectedSource} ({newsBySource.length} लेख)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                        {newsBySource.map((item, index) => (
                            <NewsCard key={item.link + index} item={item} {...cardProps} />
                        ))}
                    </div>
                </div>
            )}
            
            {!selectedSource && (
                 <div className="text-center py-20 text-slate-500 flex flex-col items-center">
                    <i className="far fa-newspaper text-6xl text-slate-300 mb-5"></i>
                    <h2 className="font-semibold text-xl text-slate-700">एक स्रोत चयन गर्नुहोस्</h2>
                    <p>नवीनतम लेखहरू हेर्नको लागि माथिबाट एउटा समाचार स्रोत छान्नुहोस्।</p>
                </div>
            )}
        </div>
    );
};

export default Source;