
import React from 'react';
import { Notification } from '../types';

interface NotificationsModalProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: Notification[];
    onMarkAsRead: (id: string) => void;
    onMarkAllAsRead: () => void;
}

const NotificationItem: React.FC<{ notification: Notification; onMarkAsRead: (id: string) => void }> = ({ notification, onMarkAsRead }) => (
    <div className={`p-4 border-l-4 ${notification.read ? 'border-slate-200 bg-slate-50' : 'border-primary bg-white'} rounded-r-lg mb-3 shadow-sm`}>
        <div className="flex justify-between items-start">
            <div>
                <p className={`font-bold ${notification.read ? 'text-slate-600' : 'text-primary'}`}>{notification.title}</p>
                <p className="text-sm text-slate-700 mt-1">{notification.body}</p>
                <p className="text-xs text-slate-400 mt-2">{new Date(notification.timestamp).toLocaleString('ne-NP')}</p>
            </div>
            {!notification.read && (
                <button 
                    onClick={() => onMarkAsRead(notification.id)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-primary hover:bg-primary/10 text-xs"
                    title="Mark as read"
                >
                    <i className="fas fa-check"></i>
                </button>
            )}
        </div>
    </div>
);

const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose, notifications, onMarkAsRead, onMarkAllAsRead }) => {
    if (!isOpen) return null;

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-end sm:items-center z-[1000]" onClick={onClose}>
            <div
                className={`bg-slate-100 rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col shadow-2xl w-full max-h-[90vh] h-full sm:h-[85%] sm:max-w-md transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
                onClick={e => e.stopPropagation()}
            >
                <header className="p-4 bg-white flex justify-between items-center border-b border-slate-200 flex-shrink-0">
                    <div className="text-lg font-bold text-slate-800 flex items-center gap-3">
                        <i className="fas fa-bell text-primary"></i> Notifications {unreadCount > 0 && <span className="text-sm bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center">{unreadCount}</span>}
                    </div>
                    <button onClick={onClose} className="w-9 h-9 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center transition-transform hover:rotate-90">
                        <i className="fas fa-times"></i>
                    </button>
                </header>
                <div className="flex-grow overflow-y-auto p-4 scrollbar-hide">
                    {notifications.length > 0 ? (
                        notifications.map(n => <NotificationItem key={n.id} notification={n} onMarkAsRead={onMarkAsRead} />)
                    ) : (
                        <div className="text-center text-slate-500 p-10 flex flex-col items-center justify-center h-full">
                            <i className="far fa-bell-slash text-6xl text-slate-300 mb-5"></i>
                            <h3 className="font-semibold text-lg text-slate-700">No Notifications</h3>
                            <p className="mt-1">You're all caught up!</p>
                        </div>
                    )}
                </div>
                {notifications.length > 0 && unreadCount > 0 && (
                     <footer className="p-4 bg-white/80 backdrop-blur-lg border-t border-slate-200">
                        <button 
                            onClick={onMarkAllAsRead} 
                            className="w-full bg-primary/10 text-primary px-4 py-2 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-primary/20 transition-colors"
                        >
                            <i className="fas fa-check-double"></i> Mark all as read
                        </button>
                    </footer>
                )}
            </div>
        </div>
    );
};

export default NotificationsModal;
