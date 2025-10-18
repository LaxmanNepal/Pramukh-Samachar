import React, { useState, useCallback, ReactNode, forwardRef } from 'react';

interface PullToRefreshProps {
    onRefresh: () => void;
    isRefreshing: boolean;
    children: ReactNode;
    className?: string;
}

const PULL_THRESHOLD = 80;

const PullToRefresh = forwardRef<HTMLDivElement, PullToRefreshProps>(({ onRefresh, isRefreshing, children, className }, ref) => {
    const [pullStart, setPullStart] = useState<number | null>(null);
    const [pullDistance, setPullDistance] = useState(0);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        const target = e.currentTarget;
        if (target && target.scrollTop === 0) {
            setPullStart(e.touches[0].clientY);
        } else {
            setPullStart(null);
        }
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (pullStart === null) return;
        const currentY = e.touches[0].clientY;
        const distance = currentY - pullStart;

        if (distance > 0) {
            e.preventDefault();
            setPullDistance(Math.pow(distance, 0.85));
        } else {
            setPullStart(null);
            setPullDistance(0);
        }
    }, [pullStart]);

    const handleTouchEnd = useCallback(() => {
        if (pullStart === null) return;

        if (pullDistance > PULL_THRESHOLD) {
            onRefresh();
        }
        
        setPullStart(null);
        setPullDistance(0);
    }, [pullStart, pullDistance, onRefresh]);

    const containerStyle: React.CSSProperties = {
        transform: isRefreshing ? `translateY(${PULL_THRESHOLD}px)` : `translateY(${pullDistance}px)`,
        transition: pullStart === null ? 'transform 0.3s ease' : 'none',
        height: '100%',
        overflowY: 'auto',
        position: 'relative',
    };
    
    const indicatorOpacity = Math.min(pullDistance / PULL_THRESHOLD, 1);
    const indicatorRotation = Math.min(pullDistance / PULL_THRESHOLD, 1) * 360;

    return (
        <div 
            ref={ref}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            style={containerStyle}
            className={`${className || ''} scrollbar-hide`}
        >
            <div 
                className="absolute top-0 left-0 right-0 flex justify-center items-center pointer-events-none"
                style={{
                    height: `${PULL_THRESHOLD}px`,
                    transform: `translateY(-100%)`,
                    opacity: isRefreshing ? 1 : indicatorOpacity,
                    transition: 'opacity 0.3s'
                }}
            >
                <div className="text-white text-2xl">
                    {isRefreshing ? (
                        <i className="fas fa-spinner animate-spin"></i>
                    ) : (
                        <i 
                            className="fas fa-arrow-down"
                            style={{ 
                                transform: `rotate(${indicatorRotation}deg)`,
                                transition: 'transform 0.1s' 
                            }}
                        ></i>
                    )}
                </div>
            </div>
            {children}
        </div>
    );
});

export default PullToRefresh;