import React, { useState, useEffect } from 'react';

export const OfflineBanner = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (isOnline) return null;

    return (
        <div className="fixed top-0 left-0 w-full z-50 p-2 flex justify-center">
            <div className="bg-amber-100/95 backdrop-blur-md border border-amber-300/80 text-amber-900 text-sm px-6 py-2 rounded-full shadow-md flex items-center gap-2">
                <span className="material-symbols-rounded text-lg">wifi_off</span>
                <span>Sin conexión a internet. Conéctate para continuar.</span>
            </div>
        </div>
    );
};
