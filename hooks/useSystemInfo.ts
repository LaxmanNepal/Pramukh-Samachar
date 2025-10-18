import { useState, useEffect, useCallback } from 'react';
import { SystemInfo } from '../types';

// Simple User Agent Parser
const parseUserAgent = (ua: string): { browser: string; os: string; deviceType: string } => {
    let browser = 'Unknown Browser';
    let os = 'Unknown OS';
    const deviceType = /Mobi|Android|iPhone/i.test(ua) ? 'Mobile' : 'Desktop';

    // Browser
    if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('SamsungBrowser')) browser = 'Samsung Browser';
    else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
    else if (ua.includes('Trident')) browser = 'Internet Explorer';
    else if (ua.includes('Edge')) browser = 'Edge';
    else if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Safari')) browser = 'Safari';

    // OS
    if (/Windows/i.test(ua)) os = 'Windows';
    else if (/Mac/i.test(ua)) os = 'macOS';
    else if (/Linux/i.test(ua)) os = 'Linux';
    else if (/Android/i.test(ua)) os = 'Android';
    else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';

    return { browser, os, deviceType };
};


const useSystemInfo = () => {
    const [systemInfo, setSystemInfo] = useState<SystemInfo>({
        locationStatus: 'idle'
    });

    // Effect for non-permission based info
    useEffect(() => {
        const uaInfo = parseUserAgent(navigator.userAgent);
        setSystemInfo(prev => ({
            ...prev,
            ...uaInfo,
            screenResolution: `${window.screen.width} x ${window.screen.height}`,
            language: navigator.language,
            isOnline: navigator.onLine,
        }));

        const handleOnline = () => setSystemInfo(prev => ({ ...prev, isOnline: true }));
        const handleOffline = () => setSystemInfo(prev => ({ ...prev, isOnline: false }));

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);
    
    const requestLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setSystemInfo(prev => ({ ...prev, location: { error: "Geolocation is not supported by your browser." }, locationStatus: 'denied' }));
            return;
        }

        setSystemInfo(prev => ({...prev, locationStatus: 'loading'}));

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setSystemInfo(prev => ({
                    ...prev,
                    location: {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    },
                    locationStatus: 'success'
                }));
            },
            (error) => {
                setSystemInfo(prev => ({
                    ...prev,
                    location: { error: error.message },
                    locationStatus: 'denied'
                }));
            }
        );
    }, []);

    return { systemInfo, requestLocation };
};

export default useSystemInfo;