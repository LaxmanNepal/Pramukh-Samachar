import React, { useState, useEffect } from 'react';
import { ShareData } from '../types';

interface SharePopupProps {
    shareData: ShareData | null;
    onClose: () => void;
}

const ShareButton: React.FC<{ icon: string; network: string; color: string; onClick: () => void; }> = ({ icon, color, network, onClick }) => (
    <div className="flex flex-col items-center gap-2">
        <button onClick={onClick} className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl transition-transform hover:-translate-y-1 ${color}`}>
            <i className={icon}></i>
        </button>
        <span className="text-xs text-slate-600">{network}</span>
    </div>
);

const SharePopup: React.FC<SharePopupProps> = ({ shareData, onClose }) => {
    const [copied, setCopied] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    
    useEffect(() => {
        if(shareData) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [shareData]);


    if (!shareData) return null;

    const { url, title } = shareData;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const shareOptions = [
        { icon: 'fab fa-facebook-f', network: 'Facebook', color: 'bg-[#3b5998]', action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank') },
        { icon: 'fab fa-twitter', network: 'Twitter', color: 'bg-[#1da1f2]', action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank') },
        { icon: 'fab fa-whatsapp', network: 'WhatsApp', color: 'bg-[#25d366]', action: () => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`, '_blank') },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-end z-[1100]" onClick={onClose}>
            <div 
                className={`bg-white rounded-t-2xl p-5 w-full max-w-lg shadow-xl transition-transform duration-300 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-5">
                    <h3 className="font-bold text-slate-800 text-lg">Share News</h3>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <div className="flex justify-center gap-6 mb-6">
                    {shareOptions.map(opt => <ShareButton key={opt.network} {...opt} onClick={opt.action} />)}
                </div>
                <div className="relative flex items-center gap-2">
                    <i className="fas fa-link absolute left-4 text-slate-400"></i>
                    <input type="text" value={url} readOnly className="flex-grow pl-10 pr-24 p-3 border border-slate-300 rounded-full text-sm bg-slate-100 focus:outline-none" />
                    <button onClick={copyToClipboard} className="absolute right-2 bg-primary text-white px-4 py-1.5 rounded-full font-semibold text-sm">
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SharePopup;