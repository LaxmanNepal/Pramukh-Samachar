
import { useRef, useCallback } from 'react';
import { toPng } from 'html-to-image';

const useScreenshotShare = (fileName: string) => {
    const elementRef = useRef<HTMLDivElement>(null);

    const takeScreenshotAndShare = useCallback(async () => {
        if (!elementRef.current) {
            console.error("Element to capture not found.");
            return;
        }
        if (!navigator.share) {
            alert("Web Share API is not supported in your browser.");
            return;
        }

        try {
            const dataUrl = await toPng(elementRef.current, { cacheBust: true });
            const blob = await (await fetch(dataUrl)).blob();
            const file = new File([blob], `${fileName.replace(/ /g, '_')}.png`, { type: blob.type });

            navigator.share({
                files: [file],
                title: fileName,
                text: `Check out this news: ${fileName}`,
            }).catch((error) => console.log('Error sharing', error));

        } catch (error) {
            console.error('oops, something went wrong!', error);
        }
    }, [fileName]);

    return { elementRef, takeScreenshotAndShare };
};

export default useScreenshotShare;
