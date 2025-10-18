import React, { useState, useEffect } from 'react';

interface NewsViewerModalProps {
    isOpen: boolean;
    url: string;
    onClose: () => void;
}

const NewsViewerModal: React.FC<NewsViewerModalProps> = ({ isOpen, url, onClose }) => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-end sm:items-center z-[1000]" onClick={onClose}>
            <div 
                className={`bg-white rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col shadow-2xl w-full max-h-[90vh] h-full sm:h-[85%] sm:max-w-3xl transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
                onClick={e => e.stopPropagation()}
            >
                <header className="p-4 bg-slate-50 flex justify-between items-center border-b border-slate-200 flex-shrink-0">
                    <div className="text-lg font-bold text-slate-800 flex items-center gap-3">
                        <i className="fas fa-newspaper text-primary"></i> 
                        <span>News Article</span>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center transition-transform hover:rotate-90">
                        <i className="fas fa-times"></i>
                    </button>
                </header>
                <div className="flex-grow overflow-hidden relative">
                    {isLoading && (
                        <div className="absolute inset-0 flex flex-col justify-center items-center gap-4 bg-white">
                             <i className="fas fa-spinner text-primary text-3xl animate-spin"></i>
                            <p className="font-medium text-slate-600">Loading article...</p>
                        </div>
                    )}
                    <iframe
                        src={url}
                        className={`w-full h-full border-none ${isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}`}
                        onLoad={() => setIsLoading(false)}
                        title="News Content"
                    ></iframe>
                </div>
            </div>
        </div>
    );
};

export default NewsViewerModal;