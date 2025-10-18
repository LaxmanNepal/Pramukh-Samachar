
export interface NewsItem {
    title: string;
    link: string;
    pubDate: string;
    description: string;
    imageUrl?: string;
    source: string;
    categories: string[];
}

export interface User {
    name: string;
    email: string;
    picture: string;
    followedSources: string[];
}

export interface ShareData {
    url: string;
    title: string;
}

export interface LocationData {
    latitude: number;
    longitude: number;
}

export interface LocationError {
    error: string;
}

export interface SystemInfo {
    browser?: string;
    os?: string;
    deviceType?: string;
    screenResolution?: string;
    language?: string;
    isOnline?: boolean;
    location?: LocationData | LocationError;
    locationStatus: 'idle' | 'loading' | 'success' | 'denied';
}

export interface Notification {
    id: string;
    title: string;
    body: string;
    timestamp: number;
    read: boolean;
}
