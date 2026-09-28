import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { WifiOff, HardDrive, Compass, ChevronRight, X, RefreshCw } from 'lucide-react';
import { useCoastalPersistence } from '../../hooks/useCoastalPersistence';
import { CoastalTravelCacheModal } from './CoastalTravelCacheModal';

export const CoastalOfflineBanner: React.FC = () => {
  const { t } = useTranslation();
  const { effectiveOffline, isSimulatedOffline, cachedOrdersCount, reconnectCloud } = useCoastalPersistence();
  const [showModal, setShowModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // If not offline, don't show the banner
  if (!effectiveOffline || isDismissed) {
    return (
      <CoastalTravelCacheModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    );
  }

  return (
    <>
      <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white text-xs px-3 sm:px-4 py-2 border-b border-amber-800 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="p-1 rounded-md bg-white/20 text-white shrink-0">
              <WifiOff className="w-3.5 h-3.5" />
            </span>
            <div className="truncate">
              <span className="font-extrabold uppercase tracking-wide text-[10px] bg-amber-900/40 px-1.5 py-0.5 rounded me-1.5">
                {isSimulatedOffline ? 'Simulated Offline' : 'Offline Transit Mode'}
              </span>
              <span className="font-medium">
                Internet disconnected. Your requests remain accessible from device storage.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowModal(true)}
              className="hidden xs:inline-flex items-center gap-1 bg-white text-amber-900 hover:bg-amber-50 px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
            >
              <HardDrive className="w-3 h-3" />
              <span>Cache Details</span>
            </button>

            {isSimulatedOffline && (
              <button
                onClick={reconnectCloud}
                className="bg-amber-900/60 hover:bg-amber-900 text-white px-2 py-1 rounded-lg font-semibold text-[11px] transition-colors cursor-pointer"
              >
                Reconnect
              </button>
            )}

            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 text-white/80 hover:text-white rounded-md hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <CoastalTravelCacheModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </>
  );
};
