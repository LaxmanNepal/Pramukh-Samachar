import { FEEDS_URL } from '../constants';
import { NewsItem, Feed } from '../types';

const PROXIES = [
    "https://api.allorigins.win/raw?url=",      // Primary
    "https://corsproxy.io/?",                  // Fallback 1
    "https://cors.eu.org/",                     // Fallback 2
    "https://proxy.cors.sh/",                   // Fallback 3 (requires x-cors-api-key header)
    "https://cors-anywhere.herokuapp.com/",     // Fallback 4
    "https://thingproxy.freeboard.io/fetch/",  // Fallback 5
    "https://api.codetabs.com/v1/proxy/?quest=",// Fallback 6
    "https://cors-proxy.fringe.zone/",          // Fallback 7
    "https://cors.bridged.cc/",                 // Fallback 8
    "https://yacdn.org/proxy/",                 // Fallback 9
    "https://api.consumet.org/utils/cors?url=", // Fallback 10 (New)
    "https://cors-proxy.fly.dev/",              // Fallback 11 (New)
    "https://proxy.link.raw.im/?url=",          // Fallback 12 (New)
];

async function fetchWithFallbacks(url: string): Promise<Response> {
    for (const proxy of PROXIES) {
        const fetchUrl = proxy.endsWith('=') || proxy.endsWith('?') ? `${proxy}${encodeURIComponent(url)}` : `${proxy}${url}`;
        try {
            const response = await fetch(fetchUrl, {
                 headers: {
                    'x-cors-api-key': 'temp_1234567890', // Required for proxy.cors.sh
                    'Origin': window.location.origin    // Some proxies require an Origin header
                 }
            });
            if (response.ok) return response;
            console.warn(`Proxy ${proxy} returned non-OK status: ${response.status} for ${url}`);
        } catch (error) {
            console.warn(`Fetch via proxy ${proxy} failed for ${url}:`, error);
        }
    }
    throw new Error(`Failed to fetch the feed for ${url} after trying all available proxies.`);
}

const extractImageUrl = (item: Element, itemLink: string): string | undefined => {
    // 1. Prioritize media:content
    const mediaContent = item.querySelector('media\\:content, content[medium="image"]');
    if (mediaContent && mediaContent.getAttribute('url')) {
        return mediaContent.getAttribute('url')!;
    }

    // 2. Check for enclosure tag with image type
    const enclosure = item.querySelector('enclosure');
    if (enclosure && enclosure.getAttribute('url') && enclosure.getAttribute('type')?.startsWith('image')) {
        return enclosure.getAttribute('url')!;
    }

    // 3. Fallback to parsing HTML content
    const contentEncoded = item.querySelector('content\\:encoded')?.innerHTML ?? '';
    const description = item.querySelector('description, summary, content')?.innerHTML ?? '';
    const htmlContent = contentEncoded || description;

    if (htmlContent) {
        // Use a more robust regex to find src attribute
        const match = htmlContent.match(/<img[^>]+src="([^">]+)"/);
        const imgSrc = match ? match[1] : null;

        if (imgSrc) {
            try {
                // Properly resolve relative URLs
                return new URL(imgSrc, itemLink).href;
            } catch (e) {
                console.warn(`Invalid image src found: ${imgSrc}`);
                return undefined;
            }
        }
    }
    return undefined;
};

const parseRss = (rssText: string, source: string, category: string): NewsItem[] => {
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(rssText, "text/xml");
        const items = Array.from(xmlDoc.querySelectorAll("item, entry"));

        return items.map(item => {
            const title = item.querySelector("title")?.textContent ?? '';
            const link = item.querySelector("link")?.textContent ?? item.querySelector("link")?.getAttribute('href') ?? '';
            const pubDate = item.querySelector("pubDate, published, updated")?.textContent ?? new Date().toISOString();
            const descriptionHtml = item.querySelector("description, summary, content")?.textContent ?? '';
            
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = descriptionHtml;
            const description = tempDiv.textContent || tempDiv.innerText || "";
            const imageUrl = extractImageUrl(item, link);

            return { title, link, pubDate, description: description.substring(0, 200), imageUrl, source, categories: [category] };
        }).filter(item => item.title && item.link);
    } catch (error) {
        console.error(`Error parsing RSS feed from ${source}:`, error);
        return [];
    }
};

export const fetchAndParseFeeds = async (): Promise<{ items: NewsItem[], sources: string[], failedFeeds: Feed[] }> => {
    try {
        const feedsResponse = await fetch(FEEDS_URL);
        if (!feedsResponse.ok) throw new Error(`Failed to fetch feeds list: ${feedsResponse.statusText}`);
        const feeds: Feed[] = await feedsResponse.json();
        
        const allItems: NewsItem[] = [];
        const uniqueSources = new Set<string>();
        const failedFeeds: Feed[] = [];

        const feedPromises = feeds.map(async (feed) => {
            try {
                const response = await fetchWithFallbacks(feed.url);
                const rssText = await response.text();
                const parsedItems = parseRss(rssText, feed.name, feed.category);
                
                allItems.push(...parsedItems);
                if (parsedItems.length > 0) uniqueSources.add(feed.name);
            } catch (error) {
                console.error(`Error processing feed ${feed.name}:`, error);
                failedFeeds.push(feed);
            }
        });

        await Promise.all(feedPromises);
        allItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
        return { items: allItems, sources: Array.from(uniqueSources), failedFeeds };
    } catch (error) {
        console.error("Error in fetchAndParseFeeds:", error);
        throw error;
    }
};

export const fetchAndParseSingleFeed = async (feed: Feed): Promise<NewsItem[]> => {
    try {
        const response = await fetchWithFallbacks(feed.url);
        const rssText = await response.text();
        return parseRss(rssText, feed.name, feed.category);
    } catch (error) {
        console.error(`Error retrying feed ${feed.name}:`, error);
        throw error; // Re-throw so the caller knows it failed
    }
};
