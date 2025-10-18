import React from 'react';

export const NewsCardSkeleton: React.FC = () => (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-slate-100 animate-pulse">
        <div className="aspect-[16/10] w-full bg-slate-200"></div>
        <div className="p-4">
            <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
            <div className="h-5 bg-slate-200 rounded w-full mb-2"></div>
            <div className="h-5 bg-slate-200 rounded w-3/4 mb-4"></div>
            <div className="pt-3 border-t border-slate-100 mt-auto flex justify-between items-center">
                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                <div className="flex gap-2">
                    <div className="w-9 h-9 rounded-full bg-slate-200"></div>
                    <div className="w-9 h-9 rounded-full bg-slate-200"></div>
                </div>
            </div>
        </div>
    </div>
);


export const StoryCardSkeleton: React.FC = () => (
    <div className="h-full w-full scroll-snap-start relative overflow-hidden flex flex-col justify-end items-center p-6 text-white text-center bg-gradient-to-br from-slate-800 to-slate-900 animate-pulse">
        <div className="relative z-10 max-w-3xl flex flex-col items-center w-full">
            <div className="h-8 w-32 bg-slate-700 rounded-full mb-4"></div>
            <div className="h-10 w-full max-w-lg bg-slate-700 rounded mb-4"></div>
            <div className="h-10 w-full max-w-md bg-slate-700 rounded mb-6"></div>
            <div className="h-5 w-40 bg-slate-700 rounded mb-8"></div>
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md">
                <div className="h-12 w-full bg-slate-700 rounded-full"></div>
                <div className="h-12 w-full bg-slate-700 rounded-full"></div>
                 <div className="h-12 w-full bg-slate-700 rounded-full"></div>
            </div>
        </div>
    </div>
);
