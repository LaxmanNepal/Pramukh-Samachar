
import { useState, useEffect, useCallback } from 'react';
import { User } from '../types';

const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const isAuthenticated = !!user;

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
        }
    }, []);

    const updateUser = (updatedUser: User | null) => {
        if (updatedUser) {
            localStorage.setItem('user', JSON.stringify(updatedUser));
        } else {
            localStorage.removeItem('user');
        }
        setUser(updatedUser);
    };

    const signIn = useCallback(() => {
        const mockUser: User = {
            name: 'Laxman Nepal',
            email: 'user@gmail.com',
            picture: 'https://lh3.googleusercontent.com/a/ACg8ocL-J8p-4a5E-d-q-ZT-p-Q-Y-j-A-L-s-Y-j-A-L-s=s96-c', // Generic avatar
            // FIX: Add mock followed sources to demonstrate the 'followed' filter feature.
            followedSources: ['Onlinekhabar', 'Kantipur Daily'],
        };
        updateUser(mockUser);
    }, []);

    const signOut = useCallback(() => {
        updateUser(null);
    }, []);

    return { user, isAuthenticated, signIn, signOut };
};

export default useAuth;