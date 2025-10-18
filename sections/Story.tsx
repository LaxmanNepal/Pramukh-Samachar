import React, { useState, useEffect, useCallback } from 'react';
import { NewsItem } from '../types';
import useSpeechSynthesis from '../hooks/useSpeechSynthesis';
import useScreenshotShare from '../hooks/useScreenshotShare';
import { StoryCardSkeleton } from '../components/Skeletons';

interface StoryProps {
    newsItems: NewsItem[];
    onView: (url: string) => void;
}

// Sub-component for displaying a single story
interface StoryViewerProps {
    item: NewsItem;
    isActive: boolean;
    onView: (url: string) => void;
    onPlaySpeech: (text: string, onEnd: () => void, onBoundary: (e: any) => void) => void;
    onStopSpeech: () => void;
    isPlayingSpeech: boolean;
}

const StoryViewer: React.FC<StoryViewerProps> = ({ item, isActive, onView, onPlaySpeech, onStopSpeech, isPlayingSpeech }) => {
    const { elementRef, takeScreenshotAndShare } = useScreenshotShare(item.title);

    const handlePlayPauseSpeech = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (isPlayingSpeech) {
            onStopSpeech();
        } else {
            const textToSpeak = `"${item.source}" बाट: ${item.title}`;
            onPlaySpeech(textToSpeak, () => {}, () => {});
        }
    }, [isPlayingSpeech, onStopSpeech, onPlaySpeech, item.source, item.title]);

    return (
        <div ref={elementRef} className="h-full w-full scroll-snap-start relative overflow-hidden flex flex-col justify-end items-center p-6 text-white text-center">
            {/* Background Image */}
            <img src={item.imageUrl} alt={item.title} className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-105" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
            
            <div className={`relative z-10 max-w-3xl flex flex-col items-center w-full transition-all duration-500 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <span className="bg-white/20 backdrop-blur-md px-4 py-1 text-sm font-bold rounded-full mb-4">{item.source}</span>
                <h1 className="text-2xl sm:text-3xl font-bold leading-tight drop-shadow-lg mb-4">{item.title}</h1>
                <p className="text-sm text-white/80 mb-8">{new Date(item.pubDate).toLocaleString('ne-NP', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md">
                    <button onClick={() => onView(item.link)} className="bg-primary hover:bg-primary-dark font-bold py-3 px-6 rounded-full transition-colors flex-1 flex items-center justify-center gap-2">
                        <i className="fas fa-book-open"></i> Read Article
                    </button>
                    <button onClick={handlePlayPauseSpeech} className="bg-white/20 hover:bg-white/30 backdrop-blur-md font-bold py-3 px-6 rounded-full transition-colors flex-1 flex items-center justify-center gap-2">
                        <i className={`fas ${isPlayingSpeech ? 'fa-pause-circle' : 'fa-play-circle'}`}></i> {isPlayingSpeech ? 'Pause' : 'Listen'}
                    </button>
                     <button onClick={takeScreenshotAndShare} className="bg-white/20 hover:bg-white/30 backdrop-blur-md font-bold py-3 px-6 rounded-full transition-colors flex-1 flex items-center justify-center gap-2">
                        <i className="fas fa-share-alt"></i> Share
                    </button>
                </div>
            </div>
        </div>
    );
};


const Story: React.FC<StoryProps> = ({ newsItems, onView }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const { play, stop, isPlaying } = useSpeechSynthesis();
    const storyItems = newsItems.filter(item => item.imageUrl);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        // Simulating a load time for the story section
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, clientHeight } = e.currentTarget;
        const newIndex = Math.round(scrollTop / clientHeight);
        if (newIndex !== activeIndex) {
            setActiveIndex(newIndex);
            stop(); // Stop speech when story changes
        }
    };

    if (isLoading) {
        return <StoryCardSkeleton />;
    }

    if (storyItems.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 p-8 bg-slate-100">
                <i className="far fa-image text-6xl text-slate-300 mb-5"></i>
                <h2 className="font-semibold text-xl text-slate-700">No Stories Available</h2>
                <p>Stories require news with images. Please check back later.</p>
            </div>
        );
    }

    return (
        <div 
            onScroll={handleScroll}
            className="h-full w-full overflow-y-auto snap-y snap-mandatory scrollbar-hide"
        >
            {storyItems.map((item, index) => (
                <StoryViewer
                    key={item.link + index}
                    item={item}
                    isActive={index === activeIndex}
                    onView={onView}
                    onPlaySpeech={play}
                    onStopSpeech={stop}
                    isPlayingSpeech={index === activeIndex && isPlaying}
                />
            ))}
        </div>
    );
};

export default Story;
