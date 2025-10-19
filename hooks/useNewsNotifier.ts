import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { NewsItem, Notification } from '../types';

const useNewsNotifier = (newsItems: NewsItem[]) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [permissionState, setPermissionState] = useState<NotificationPermission | null>(null);
    const [seenNewsLinks, setSeenNewsLinks] = useState<Set<string>>(new Set());
    const isInitialMount = useRef(true);

    // This effect runs once to initialize state from localStorage and check permission
    useEffect(() => {
        // Ensure this runs only in the browser
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setPermissionState(Notification.permission);
        }
        
        try {
            const storedNotifications = localStorage.getItem('notifications');
            if (storedNotifications) {
                setNotifications(JSON.parse(storedNotifications));
            }
            const storedSeenLinks = localStorage.getItem('seenNewsLinks');
            if (storedSeenLinks) {
                setSeenNewsLinks(new Set(JSON.parse(storedSeenLinks)));
            }
        } catch (error) {
            console.error("Failed to load data from localStorage", error);
        }
    }, []);

    const saveNotifications = useCallback((newNotifications: Notification[]) => {
        setNotifications(newNotifications);
        localStorage.setItem('notifications', JSON.stringify(newNotifications));
    }, []);

    const saveSeenLinks = useCallback((newSeenLinks: Set<string>) => {
        setSeenNewsLinks(newSeenLinks);
        localStorage.setItem('seenNewsLinks', JSON.stringify(Array.from(newSeenLinks)));
    }, []);

    // This effect handles new news items
    useEffect(() => {
        if (newsItems.length === 0) {
            return;
        }

        // On first render cycle with news, if no seen links are stored,
        // populate seen links without creating notifications. This prevents a storm of
        // notifications on first load.
        if (isInitialMount.current) {
            isInitialMount.current = false;
            const storedSeenLinks = localStorage.getItem('seenNewsLinks');
            if (!storedSeenLinks) {
                saveSeenLinks(new Set(newsItems.map(item => item.link)));
                return;
            }
        }
        
        if (permissionState !== 'granted') {
            return;
        }

        const newItems = newsItems.filter(item => !seenNewsLinks.has(item.link));

        if (newItems.length > 0) {
            // Sort new items by date to show the latest one in system notification
            newItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

            const newNotifications: Notification[] = newItems.map(item => ({
                id: item.link,
                title: item.source,
                body: item.title,
                timestamp: new Date(item.pubDate).getTime(),
                read: false,
            }));

            // Show a system notification for the very latest item
            const latestItem = newItems[0];
            if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
                navigator.serviceWorker.ready.then(registration => {
                    registration.showNotification(latestItem.source, {
                        body: latestItem.title,
                        icon: 'logo-192.png',
                        badge: 'logo.svg',
                        data: { url: latestItem.link }
                    });
                });
            }

            // Prepend new notifications and update seen links
            const updatedNotifications = [...newNotifications, ...notifications];
            saveNotifications(updatedNotifications);
            
            const updatedSeenLinks = new Set(seenNewsLinks);
            newItems.forEach(item => updatedSeenLinks.add(item.link));
            saveSeenLinks(updatedSeenLinks);
        }
    }, [newsItems, permissionState, seenNewsLinks, saveNotifications, saveSeenLinks, notifications]);

    const requestNotificationPermission = useCallback(async () => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            try {
                const permission = await Notification.requestPermission();
                setPermissionState(permission);
            } catch (error) {
                console.error('Error requesting notification permission:', error);
            }
        }
    }, []);

    const markAsRead = useCallback((id: string) => {
        saveNotifications(
            notifications.map(n =>
                n.id === id ? { ...n, read: true } : n
            )
        );
    }, [notifications, saveNotifications]);

    const markAllAsRead = useCallback(() => {
        saveNotifications(
            notifications.map(n => ({ ...n, read: true }))
        );
    }, [notifications, saveNotifications]);
    
    // Sort notifications once before returning for display
    const sortedNotifications = useMemo(() => 
        [...notifications].sort((a, b) => b.timestamp - a.timestamp), 
    [notifications]);

    return {
        notifications: sortedNotifications,
        markAsRead,
        markAllAsRead,
        permissionState: permissionState ?? 'prompt',
        requestNotificationPermission,
    };
};

export default useNewsNotifier;