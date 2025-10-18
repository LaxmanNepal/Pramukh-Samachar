
import React from 'react';
import { NewsItem } from '../types';

interface FavoriteItemProps {
    item: NewsItem;
    onView: (url: string) => void;
    onRemove: (link: string) => void;
}

const FavoriteItem: React.FC<FavoriteItemProps> = ({ item, onView, onRemove }) => {
    const date = new Date(item.pubDate);
    const dateString = date.toLocaleString('ne-NP', { year: 'numeric', month: 'short', day: 'numeric' });
    
    return (
        <div 
            className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 transition-shadow hover:shadow-md cursor-pointer flex items-center gap-4"
            onClick={() => onView(item.link)}
        >
            <div className="flex-grow">
                 <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full">{item.source}</span>
                 <h4 className="font-semibold my-2 text-slate-800">{item.title}</h4>
                 <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-2">
                    <i className="far fa-clock"></i> {dateString}
                </div>
            </div>
            <button 
                onClick={(e) => { e.stopPropagation(); onRemove(item.link); }}
                className="w-10 h-10 rounded-full bg-red-100 text-red-500 flex items-center justify-center flex-shrink-0 ml-2 hover:bg-red-200 transition-colors"
            >
                <i className="fas fa-trash-alt"></i>
            </button>
        </div>
    );
};

const MemoizedFavoriteItem = React.memo(FavoriteItem);


interface FavoritesModalProps {
    isOpen: boolean;
    onClose: () => void;
    favorites: NewsItem[];
    onView: (url: string) => void;
    onRemove: (link: string) => void;
    onClearAll: () => void;
}

const FavoritesModal: React.FC<FavoritesModalProps> = ({ isOpen, onClose, favorites, onView, onRemove, onClearAll }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-end sm:items-center z-[1000]" onClick={onClose}>
            <div 
                className={`bg-slate-50 rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col shadow-2xl w-full max-h-[90vh] h-full sm:h-[85%] sm:max-w-4xl transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
                onClick={e => e.stopPropagation()}
            >
                <header className="p-4 bg-white flex justify-between items-center border-b border-slate-200 flex-shrink-0">
                    <div className="text-lg font-bold text-slate-800 flex items-center gap-3">
                        <i className="fas fa-bookmark text-accent"></i> My Favorites
                    </div>
                    <button onClick={onClose} className="w-9 h-9 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center transition-transform hover:rotate-90">
                        <i className="fas fa-times"></i>
                    </button>
                </header>
                <div className="flex-grow overflow-y-auto p-4 sm:p-6 scrollbar-hide">
                    {favorites.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {favorites.map(item => (
                                <MemoizedFavoriteItem key={item.link} item={item} onView={onView} onRemove={onRemove} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-slate-500 p-10 flex flex-col items-center justify-center h-full">
                            <i className="far fa-bookmark text-6xl text-slate-300 mb-5"></i>
                            <h3 className="font-semibold text-lg text-slate-700">No Favorited News Yet</h3>
                            <p className="mt-1">Use the <i className="far fa-bookmark"></i> icon to save articles you like.</p>
                        </div>
                    )}
                </div>
                {favorites.length > 0 && (
                    <footer className="p-4 bg-white/80 backdrop-blur-lg flex justify-between items-center border-t border-slate-200">
                        <button 
                            onClick={onClearAll} 
                            className="bg-red-100 text-red-600 px-4 py-2 rounded-full font-semibold flex items-center gap-2 hover:bg-red-200 disabled:opacity-50 transition-colors"
                            disabled={favorites.length === 0}
                        >
                            <i className="fas fa-trash"></i> Clear All
                        </button>
                        <div className="font-semibold text-slate-700">
                           Total: <span className="text-primary">{favorites.length}</span>
                        </div>
                    </footer>
                )}
            </div>
        </div>
    );
};

export default FavoritesModal;
