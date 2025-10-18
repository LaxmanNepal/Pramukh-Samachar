
import React from 'react';
import { User } from '../types';
import useSystemInfo from '../hooks/useSystemInfo';

interface ProfileProps {
    user: User | null;
    onSignOut: () => void;
}

const InfoCard: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
            <i className={`fas ${icon} text-primary`}></i>
            {title}
        </h3>
        {children}
    </div>
);

const InfoItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="flex justify-between items-center py-2 border-b border-slate-100 last:border-b-0">
        <span className="font-medium text-slate-500">{label}</span>
        <span className="font-semibold text-slate-700 text-right">{value}</span>
    </div>
);

const Profile: React.FC<ProfileProps> = ({ user, onSignOut }) => {
    const { systemInfo, requestLocation } = useSystemInfo();

    if (!user) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-center">
                <p>You are not signed in.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 animate-slideInDown opacity-0 space-y-8">
            {/* User Details Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center flex flex-col items-center">
                <img src={user.picture} alt="Profile" className="w-28 h-28 rounded-full mb-4 border-4 border-primary shadow-lg" />
                <h2 className="text-3xl font-bold text-slate-800">{user.name}</h2>
                <p className="text-slate-500 mt-1 mb-6">{user.email}</p>
                <button 
                    onClick={onSignOut}
                    className="w-full max-w-xs bg-red-500 text-white px-6 py-3 rounded-full font-bold text-lg transition-colors hover:bg-red-600 flex items-center justify-center gap-3"
                >
                    <i className="fas fa-sign-out-alt"></i>
                    Sign Out
                </button>
            </div>
            
             {/* Device & System Card */}
             <InfoCard title="Device & System" icon="fa-desktop">
                <div className="space-y-1">
                    <InfoItem label="Browser" value={systemInfo.browser} />
                    <InfoItem label="Operating System" value={systemInfo.os} />
                    <InfoItem label="Device Type" value={systemInfo.deviceType} />
                    <InfoItem label="Screen Resolution" value={systemInfo.screenResolution} />
                    <InfoItem label="Language" value={systemInfo.language} />
                    <InfoItem label="Online Status" value={systemInfo.isOnline ? <span className="text-green-500 font-bold">Online</span> : <span className="text-red-500 font-bold">Offline</span>} />
                </div>
             </InfoCard>

            {/* Location Card */}
            <InfoCard title="Location" icon="fa-map-marker-alt">
                {systemInfo.locationStatus === 'loading' && <p className="text-slate-500">Fetching location...</p>}
                {systemInfo.locationStatus === 'idle' && (
                    <button onClick={requestLocation} className="w-full bg-primary text-white p-3 rounded-full font-bold hover:bg-primary-dark transition">
                        Share My Location
                    </button>
                )}
                {systemInfo.locationStatus === 'denied' && (
                    <p className="text-red-500 text-center">Location permission denied. You can enable it in your browser settings.</p>
                )}
                {systemInfo.locationStatus === 'success' && systemInfo.location && !('error' in systemInfo.location) && (
                     <div className="space-y-2">
                        <InfoItem label="Latitude" value={systemInfo.location.latitude.toFixed(4)} />
                        <InfoItem label="Longitude" value={systemInfo.location.longitude.toFixed(4)} />
                        <div className="pt-2">
                            <img 
                                src={`https://static-map.openstreetmap.de/staticmap.php?center=${systemInfo.location.latitude},${systemInfo.location.longitude}&zoom=14&size=800x200&maptype=mapnik`}
                                alt="Map location"
                                className="rounded-lg w-full"
                            />
                        </div>
                    </div>
                )}
            </InfoCard>
        </div>
    );
};

export default Profile;
