import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { NewsItem } from '../types';
import useSpeechSynthesis from '../hooks/useSpeechSynthesis';

interface AiReaderProps {
    newsItems: NewsItem[];
}

const AiNewsCard: React.FC<{
    item: NewsItem;
    index: number;
    onPlay: () => void;
    isPlaying: boolean;
    isPaused: boolean;
    progress: number;
    isDimmed: boolean;
}> = ({ item, index, onPlay, isPlaying, isPaused, progress, isDimmed }) => {
    return (
        <div 
            className={`bg-white rounded-2xl shadow-md overflow-hidden border-2 transition-all duration-300 animate-slideInDown opacity-0 flex flex-col 
                ${isPlaying ? 'border-primary shadow-xl scale-105' : 'border-transparent'}
                ${isDimmed ? 'opacity-60 grayscale-[50%]' : ''}
            `}
            style={{ animationDelay: `${index * 0.05}s` }}
        >
            <div className="p-5 flex flex-col flex-grow h-full">
                {/* Header: Source and Date */}
                <div className="flex justify-between items-center mb-3">
                    <span className="bg-primary/10 text-primary px-3 py-1 text-xs font-bold rounded-full flex-shrink-0">{item.source}</span>
                    <span className="text-xs text-slate-500 text-right pl-2">{new Date(item.pubDate).toLocaleTimeString('ne-NP', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                {/* Title: Takes up remaining space */}
                <h3 className="font-bold text-slate-800 my-2 text-base leading-relaxed flex-grow">
                    {item.title}
                </h3>

                {/* Player Controls: Aligned at the bottom */}
                <div className="mt-auto pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={onPlay} 
                            className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 flex-shrink-0 text-xl shadow-lg 
                                ${isPlaying && !isPaused ? 'bg-accent animate-pulse' : 'bg-primary'}
                            `}
                            aria-label={isPlaying && !isPaused ? "Pause" : "Play"}
                        >
                            <i className={`fas ${isPlaying && !isPaused ? 'fa-pause' : 'fa-play'}`}></i>
                        </button>
                        <div className="w-full bg-slate-200 rounded-full h-2.5 relative overflow-hidden">
                            <div className="bg-primary h-2.5 rounded-full transition-all duration-100" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AiReader: React.FC<AiReaderProps> = ({ newsItems }) => {
    const { voices, selectedVoice, setSelectedVoice, play, pause, resume, stop, isPlaying, isPaused, status } = useSpeechSynthesis();
    const [currentPlayingIndex, setCurrentPlayingIndex] = useState<number | null>(null);
    const [currentProgress, setCurrentProgress] = useState(0);
    const [isPlayAllActive, setIsPlayAllActive] = useState(false);
    
    const aiNews = useMemo(() => newsItems, [newsItems]);

    useEffect(() => {
        if (!isPlaying) {
            setCurrentPlayingIndex(null);
            setCurrentProgress(0); // Reset global progress when not playing
            setIsPlayAllActive(false); 
        }
    }, [isPlaying]);

    const handlePlay = useCallback((item: NewsItem, index: number) => {
        if (currentPlayingIndex === index) {
            if (isPaused) resume();
            else pause();
        } else {
            stop();
            const textToSpeak = `"${item.source}" बाट समाचार: ${item.title}`;
            setCurrentPlayingIndex(index);
            setCurrentProgress(0); // Reset for new item
            play(
                textToSpeak,
                () => { // onEnd
                    if (isPlayAllActive) {
                        const nextIndex = index + 1;
                        if (nextIndex < aiNews.length) {
                            handlePlay(aiNews[nextIndex], nextIndex);
                        } else {
                            setIsPlayAllActive(false); // Playlist finished
                        }
                    }
                },
                (e) => { // onBoundary
                    const progressPercent = (e.charIndex / textToSpeak.length) * 100;
                    setCurrentProgress(progressPercent); // Update global progress state
                }
            );
        }
    }, [currentPlayingIndex, isPaused, stop, play, isPlayAllActive, aiNews, pause, resume]);

    const playAll = useCallback(() => {
        stop();
        if (aiNews.length > 0) {
            setIsPlayAllActive(true);
            handlePlay(aiNews[0], 0);
        }
    }, [stop, aiNews, handlePlay]);

    const handleStop = useCallback(() => {
        setIsPlayAllActive(false);
        stop();
    }, [stop]);
    
    const handleNext = useCallback(() => {
        if (currentPlayingIndex === null) return;
        const nextIndex = currentPlayingIndex + 1;
        if (nextIndex < aiNews.length) {
            stop(); 
            setTimeout(() => handlePlay(aiNews[nextIndex], nextIndex), 50);
        }
    }, [currentPlayingIndex, aiNews, stop, handlePlay]);

    const handlePrevious = useCallback(() => {
        if (currentPlayingIndex === null) return;
        const prevIndex = currentPlayingIndex - 1;
        if (prevIndex >= 0) {
            stop(); 
            setTimeout(() => handlePlay(aiNews[prevIndex], prevIndex), 50);
        }
    }, [currentPlayingIndex, aiNews, stop, handlePlay]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-slideInDown opacity-0">
            <header className="text-center mb-8">
                <h2 className="text-3xl font-extrabold text-slate-800 mb-2">AI News Reader</h2>
                <p className="text-slate-600">Listen to today's top headlines in a natural voice.</p>
            </header>

            <div className="p-4 bg-white rounded-2xl shadow-lg sticky top-[80px] z-30">
                <div className="flex justify-center items-center flex-wrap gap-4 mb-4">
                    <button onClick={handlePrevious} disabled={!isPlaying || currentPlayingIndex === 0} className="w-16 h-16 rounded-full font-semibold flex items-center justify-center bg-slate-200 text-slate-600 text-2xl hover:-translate-y-0.5 transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                        <i className="fas fa-step-backward"></i>
                    </button>
                    <button onClick={playAll} className="w-16 h-16 rounded-full font-semibold flex items-center justify-center bg-primary text-white text-2xl hover:-translate-y-0.5 transition-transform shadow-lg"><i className="fas fa-play"></i></button>
                    <button onClick={isPaused ? resume : pause} disabled={!isPlaying} className="w-16 h-16 rounded-full font-semibold flex items-center justify-center bg-yellow-500 text-white text-2xl hover:-translate-y-0.5 transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"><i className={`fas ${isPaused ? 'fa-play' : 'fa-pause'}`}></i></button>
                    <button onClick={handleStop} disabled={!isPlaying} className="w-16 h-16 rounded-full font-semibold flex items-center justify-center bg-red-500 text-white text-2xl hover:-translate-y-0.5 transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"><i className="fas fa-stop"></i></button>
                    <button onClick={handleNext} disabled={!isPlaying || currentPlayingIndex === aiNews.length - 1} className="w-16 h-16 rounded-full font-semibold flex items-center justify-center bg-slate-200 text-slate-600 text-2xl hover:-translate-y-0.5 transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                        <i className="fas fa-step-forward"></i>
                    </button>
                </div>
                 <div className="w-full bg-slate-200 rounded-full h-3 my-2 overflow-hidden">
                    <div className="bg-primary h-3 rounded-full transition-all duration-150 ease-linear" style={{ width: `${currentProgress}%` }}></div>
                </div>
            </div>
            
             <div className="bg-slate-100 p-1.5 rounded-full flex justify-center gap-1 my-5 flex-wrap">
                {voices.map((voice, index) => (
                    <button key={index} onClick={() => setSelectedVoice(voice)}
                        className={`px-4 py-1.5 text-xs rounded-full font-semibold transition-colors flex-grow text-center ${selectedVoice?.name === voice.name ? 'bg-white text-primary shadow' : 'bg-transparent text-slate-600 hover:bg-white/60'}`}>
                        {voice.name}
                    </button>
                ))}
            </div>

            <p className="text-center font-semibold text-primary h-6 mb-4">{status || 'Ready to play'}</p>

            {aiNews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {aiNews.map((item, index) => (
                        <AiNewsCard
                            key={item.link + index}
                            item={item}
                            index={index}
                            onPlay={() => handlePlay(item, index)}
                            isPlaying={currentPlayingIndex === index}
                            isPaused={currentPlayingIndex === index && isPaused}
                            progress={currentPlayingIndex === index ? currentProgress : 0}
                            isDimmed={currentPlayingIndex !== null && currentPlayingIndex !== index}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                    <i className="fas fa-headphones-alt text-5xl text-slate-300 mb-4"></i>
                    <h3 className="font-bold text-slate-700 text-lg">No Recent News for AI Reader</h3>
                    <p className="text-slate-500">Please check back later for today's headlines.</p>
                </div>
            )}
        </div>
    );
};

export default AiReader;