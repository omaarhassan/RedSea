import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Wifi, 
  WifiOff, 
  HardDrive, 
  Database, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Compass, 
  RefreshCw, 
  X, 
  ShieldCheck, 
  Clock, 
  FileText, 
  MapPin, 
  Layers, 
  Check, 
  Smartphone 
} from 'lucide-react';
import { useCoastalPersistence } from '../../hooks/useCoastalPersistence';
import confetti from 'canvas-confetti';

interface CoastalTravelCacheModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CoastalTravelCacheModal: React.FC<CoastalTravelCacheModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const {
    isOnline,
    isSimulatedOffline,
    effectiveOffline,
    hasPersistence,
    cachedOrdersCount,
    cachedQuotesCount,
    cachedProvidersCount,
    cachedCitiesCount,
    lastPrecachedAt,
    isPrecaching,
    precacheResult,
    precacheForTravel,
    toggleSimulateOffline,
    reconnectCloud,
  } = useCoastalPersistence();

  const [copiedSuccess, setCopiedSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePrecache = async () => {
    const res = await precacheForTravel();
    if (res?.success) {
      try {
        confetti({
          particleCount: 50,
          spread: 50,
          origin: { y: 0.6 },
          colors: ['#0F3966', '#EA580C', '#10B981'],
        });
      } catch (e) {}
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-[#0A2544] via-[#0F3966] to-[#1A5494] text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-orange-400 shrink-0">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  Coastal Travel & Offline Persistence
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full border border-orange-400/30">
                  Firestore Cache
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Reliable access along the Red Sea highway & remote dead zones
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-slate-800 text-xs sm:text-sm">
          {/* Active Connection & Cache Status Card */}
          <div className={`p-4 rounded-2xl border transition-all ${
            effectiveOffline 
              ? 'bg-amber-50/80 border-amber-200 text-amber-950' 
              : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  effectiveOffline ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
                }`}>
                  {effectiveOffline ? <WifiOff className="w-5 h-5" /> : <Wifi className="w-5 h-5" />}
                </div>
                <div>
                  <div className="font-extrabold text-sm flex items-center gap-1.5">
                    <span>
                      {effectiveOffline 
                        ? (isSimulatedOffline ? 'Simulated Coastal Offline Mode' : 'Offline / Low Coastal Signal') 
                        : 'Connected to Cloud'}
                    </span>
                  </div>
                  <div className="text-xs opacity-90 mt-0.5">
                    {effectiveOffline 
                      ? 'Serving work orders & requests directly from Firestore IndexedDB cache.' 
                      : 'Live sync active with Cloud Firestore database.'}
                  </div>
                </div>
              </div>

              {isSimulatedOffline && (
                <button
                  onClick={reconnectCloud}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  Reconnect
                </button>
              )}
            </div>
          </div>

          {/* Regional Context Info */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start gap-3 text-xs text-slate-600">
            <MapPin className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold text-slate-800">Red Sea Coastal Coverage: </span>
              Between Ras Gharib, Zaafarana, Safaga, Marsa Alam, and Hamata, cellular reception can be intermittent. 
              Firestore offline persistence keeps your existing service requests, quotes, and provider info available offline.
            </div>
          </div>

          {/* Cached Data Inventory Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>Offline Cache Inventory</span>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 lowercase">
                <HardDrive className="w-3.5 h-3.5" />
                IndexedDB Persistent
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-xs">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Service Requests</span>
                  </span>
                  <span className="font-black text-slate-900 text-sm">{cachedOrdersCount}</span>
                </div>
                <div className="text-[10px] text-slate-400">Available without internet</div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-xs">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Quotes & Offers</span>
                  </span>
                  <span className="font-black text-slate-900 text-sm">{cachedQuotesCount}</span>
                </div>
                <div className="text-[10px] text-slate-400">Cost breakdowns & SLA</div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-xs">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-amber-600" />
                    <span>Field Technicians</span>
                  </span>
                  <span className="font-black text-slate-900 text-sm">{cachedProvidersCount}</span>
                </div>
                <div className="text-[10px] text-slate-400">Verified emergency contacts</div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-xs">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-orange-600" />
                    <span>Coastal Sectors</span>
                  </span>
                  <span className="font-black text-slate-900 text-sm">{cachedCitiesCount}</span>
                </div>
                <div className="text-[10px] text-slate-400">Sectors & service hubs</div>
              </div>
            </div>
          </div>

          {/* Last Precached Status */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Last Travel Pre-Cache:</span>
            </div>
            <span className="font-mono font-medium text-slate-800">
              {lastPrecachedAt 
                ? new Date(lastPrecachedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                : 'Not yet primed'}
            </span>
          </div>

          {precacheResult && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{precacheResult.message}</span>
            </div>
          )}

          {/* Action Buttons: Pre-cache for Travel & Simulate Offline */}
          <div className="space-y-2 pt-1">
            <button
              onClick={handlePrecache}
              disabled={isPrecaching}
              className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 active:scale-98 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-orange-900/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isPrecaching ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Downloading & Pre-caching Coastal Data...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Pre-cache All Data for Coastal Journey</span>
                </>
              )}
            </button>

            {/* Offline Simulation Toggle */}
            <button
              onClick={toggleSimulateOffline}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
            >
              {isSimulatedOffline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Disable Simulation & Reconnect to Cloud</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                  <span>Simulate Remote Coastal Highway (Test Offline Mode)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Automatic IndexedDB Multi-Tab Sync</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 font-bold text-slate-700 transition-colors cursor-pointer"
          >
            {t('common.close', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
};
