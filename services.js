
import { FEEDS_URL } from './constants.js';

const PROXIES = [
    "https://api.allorigins.win/raw?url=",
    "https://corsproxy.io/?",
    "https://cors.eu.org/",
];

async function fetchWithFallbacks(url) {
    for (const proxy of PROXIES) {
        const fetchUrl = proxy.endsWith('=') || proxy.endsWith('?') ? `${proxy}${encodeURIComponent(url)}` : `${proxy}${url}`;
        try {
            const response = await fetch(fetchUrl, {
                 headers: { 'Origin': window.location.origin }
            });
            if (response.ok) return response;
            console.warn(`Proxy ${proxy} returned non-OK status: ${response.status} for ${url}`);
        } catch (error) {
            console.warn(`Fetch via proxy ${proxy} failed for ${url}:`, error);
        }
    }
    throw new Error(`Failed to fetch the feed for ${url} after trying all available proxies.`);
}

const extractImageUrl = (item, itemLink) => {
    const mediaContent = item.querySelector('media\\:content, content[medium="image"]');
    if (mediaContent && mediaContent.getAttribute('url')) {
        return mediaContent.getAttribute('url');
    }

    const enclosure = item.querySelector('enclosure');
    if (enclosure && enclosure.getAttribute('url') && enclosure.getAttribute('type')?.startsWith('image')) {
        return enclosure.getAttribute('url');
    }

    const contentEncoded = item.querySelector('content\\:encoded')?.innerHTML ?? '';
    const description = item.querySelector('description, summary, content')?.innerHTML ?? '';
    const htmlContent = contentEncoded || description;

    if (htmlContent) {
        const match = htmlContent.match(/<img[^>]+src="([^">]+)"/);
        const imgSrc = match ? match[1] : null;

        if (imgSrc) {
            try {
                return new URL(imgSrc, itemLink).href;
            } catch (e) {
                console.warn(`Invalid image src found: ${imgSrc}`);
                return undefined;
            }
        }
    }
    return undefined;
};

const parseRss = (rssText, source, category) => {
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

export const fetchAndParseFeeds = async () => {
    try {
        const feedsResponse = await fetch(FEEDS_URL);
        if (!feedsResponse.ok) throw new Error(`Failed to fetch feeds list: ${feedsResponse.statusText}`);
        const feeds = await feedsResponse.json();
        
        const allItems = [];
        const uniqueSources = new Set();

        const feedPromises = feeds.map(async (feed) => {
            try {
                const response = await fetchWithFallbacks(feed.url);
                const rssText = await response.text();
                const parsedItems = parseRss(rssText, feed.name, feed.category);
                
                allItems.push(...parsedItems);
                if (parsedItems.length > 0) uniqueSources.add(feed.name);
            } catch (error) {
                console.error(`Error processing feed ${feed.name}:`, error);
            }
        });

        await Promise.all(feedPromises);
        allItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
        return { items: allItems, sources: Array.from(uniqueSources) };
    } catch (error) {
        console.error("Error in fetchAndParseFeeds:", error);
        throw error;
    }
};
