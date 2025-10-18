import React, { forwardRef } from 'react';
import { NewsItem } from '../types';
import useScreenshotShare from '../hooks/useScreenshotShare';

interface NewsCardProps {
    item: NewsItem;
    isFavorited: (link: string) => boolean;
    onFavoriteToggle: (item: NewsItem) => void;
    onView: (url: string) => void;
}

const NewsCard = forwardRef<HTMLDivElement, NewsCardProps>(({ item, isFavorited, onFavoriteToggle, onView }, ref) => {
    const favorited = isFavorited(item.link);
    const { elementRef, takeScreenshotAndShare } = useScreenshotShare(item.title);
    
    const handleCardClick = (e: React.MouseEvent) => {
        // Prevent card click when clicking on any button inside it
        if ((e.target as HTMLElement).closest('button')) {
            return;
        }
        onView(item.link);
    };

    return (
        <div ref={ref}>
            <div
                ref={elementRef}
                onClick={handleCardClick}
                className="relative aspect-square w-full rounded-xl sm:rounded-2xl overflow-hidden shadow-lg group cursor-pointer flex flex-col text-white"
            >
                {item.imageUrl ? (
                    <>
                        {/* Card with Image */}
                        <img src={item.imageUrl} alt={item.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                        <div className="relative z-10 p-2 sm:p-3 flex flex-col h-full justify-end">
                            <div>
                                <span className="bg-white/20 backdrop-blur-md text-white px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded-full">{item.source}</span>
                                <h3 className="font-bold text-sm sm:text-base my-1 sm:my-2 leading-tight drop-shadow-lg">
                                    {item.title}
                                </h3>
                                <div className="pt-1 sm:pt-2 flex justify-between items-center">
                                     <div className="text-[10px] sm:text-xs text-white/80 flex items-center gap-1 drop-shadow-md">
                                        <i className="far fa-clock"></i> 
                                        {new Date(item.pubDate).toLocaleDateString('ne-NP', { month: 'short', day: 'numeric' })}
                                    </div>
                                    <div className="flex gap-1.5">
                                         <button
                                            onClick={takeScreenshotAndShare}
                                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-colors bg-white/20 backdrop-blur-md text-white hover:bg-white/30"
                                            title="Share as Image"
                                        >
                                            <i className="fas fa-camera text-xs sm:text-sm"></i>
                                        </button>
                                        <button
                                            onClick={() => onFavoriteToggle(item)}
                                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-colors backdrop-blur-md ${favorited ? 'bg-accent text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
                                            title={favorited ? 'Remove from favorites' : 'Add to favorites'}
                                        >
                                            <i className={`fas fa-bookmark transition-transform text-xs sm:text-sm ${favorited ? 'scale-110' : ''}`}></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Text-Only Card */}
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary-dark to-accent"></div>
                        <div className="relative z-10 p-3 sm:p-4 flex flex-col h-full">
                            <div className="flex-shrink-0">
                                <span className="bg-white/20 backdrop-blur-md text-white px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded-full">{item.source}</span>
                            </div>
                            <div className="flex-grow flex items-center justify-center text-center p-1">
                                <h3 className="font-bold text-sm md:text-base leading-tight drop-shadow-lg">
                                    {item.title}
                                </h3>
                            </div>
                            <div className="flex-shrink-0 pt-1 sm:pt-2 flex justify-between items-center">
                                 <div className="text-[10px] sm:text-xs text-white/80 flex items-center gap-1 drop-shadow-md">
                                    <i className="far fa-clock"></i> 
                                    {new Date(item.pubDate).toLocaleDateString('ne-NP', { month: 'short', day: 'numeric' })}
                                </div>
                                <div className="flex gap-1.5">
                                     <button
                                        onClick={takeScreenshotAndShare}
                                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-colors bg-white/20 backdrop-blur-md text-white hover:bg-white/30"
                                        title="Share as Image"
                                    >
                                        <i className="fas fa-camera text-xs sm:text-sm"></i>
                                    </button>
                                    <button
                                        onClick={() => onFavoriteToggle(item)}
                                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-colors backdrop-blur-md ${favorited ? 'bg-accent text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
                                        title={favorited ? 'Remove from favorites' : 'Add to favorites'}
                                    >
                                        <i className={`fas fa-bookmark transition-transform text-xs sm:text-sm ${favorited ? 'scale-110' : ''}`}></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
});

export default React.memo(NewsCard);