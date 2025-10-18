
import { useState, useEffect, useCallback } from 'react';
import { NewsItem } from '../types';

const useFavorites = () => {
    const [favorites, setFavorites] = useState<NewsItem[]>([]);

    useEffect(() => {
        try {
            const storedFavorites = localStorage.getItem('favorites');
            if (storedFavorites) {
                setFavorites(JSON.parse(storedFavorites));
            }
        } catch (error) {
            console.error("Failed to parse favorites from localStorage", error);
        }
    }, []);

    const saveFavorites = (newFavorites: NewsItem[]) => {
        setFavorites(newFavorites);
        localStorage.setItem('favorites', JSON.stringify(newFavorites));
    };

    const addFavorite = useCallback((item: NewsItem) => {
        saveFavorites([...favorites, item]);
    }, [favorites]);

    const removeFavorite = useCallback((link: string) => {
        saveFavorites(favorites.filter(fav => fav.link !== link));
    }, [favorites]);

    const isFavorited = useCallback((link: string) => {
        return favorites.some(fav => fav.link === link);
    }, [favorites]);

    const clearFavorites = useCallback(() => {
        if (window.confirm("के तपाईं सबै मनपराएका समाचारहरू हटाउन चाहनुहुन्छ?")) {
            saveFavorites([]);
        }
    }, []);

    return { favorites, addFavorite, removeFavorite, isFavorited, clearFavorites };
};

export default useFavorites;
