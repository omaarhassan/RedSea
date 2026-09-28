import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Bell, 
  Check, 
  Copy, 
  Volume2, 
  Smartphone, 
  Radio, 
  ShieldCheck, 
  Zap, 
  X, 
  Sliders, 
  AlertTriangle,
  Play
} from 'lucide-react';
import { useFCMNotifications } from '../../hooks/useFCMNotifications';
import { useAppStore } from '../../stores/useAppStore';
import { WorkOrderStatus } from '../../types';

interface PushNotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PushNotificationSettingsModal: React.FC<PushNotificationSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const { 
    permission, 
    isPermissionGranted, 
    deviceToken, 
    isLoading, 
    preferences, 
    updatePreferences, 
    requestPermission, 
    triggerTestPush,
    recentPushes 
  } = useFCMNotifications();

  const { workOrders } = useAppStore();
  const [selectedOrderId, setSelectedOrderId] = useState<string>(workOrders[0]?.id || '');
  const [testStatus, setTestStatus] = useState<WorkOrderStatus>('EN_ROUTE');
  const [copied, setCopied] = useState(false);
  const [testSuccessMessage, setTestSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyToken = () => {
    if (!deviceToken) return;
    navigator.clipboard.writeText(deviceToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendTest = async () => {
    const targetOrder = workOrders.find((w) => w.id === selectedOrderId) || workOrders[0];
    if (!targetOrder) return;

    setTestSuccessMessage(null);
    const result = await triggerTestPush(targetOrder, testStatus);
    setTestSuccessMessage(`Push notification dispatched for ${targetOrder.workOrderNumber} (${testStatus})`);
    setTimeout(() => setTestSuccessMessage(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#0A2544] to-[#1A5494] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-400/30 flex items-center justify-center text-orange-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">
                Firebase Push Notifications
              </h3>
              <p className="text-xs text-blue-200">
                Cloud Messaging service status & alerts
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Permission Status Banner */}
          <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${
            isPermissionGranted 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
              : permission === 'denied'
              ? 'bg-red-50 border-red-200 text-red-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <div className="shrink-0 mt-0.5">
              {isPermissionGranted ? (
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              ) : (
                <Radio className="w-5 h-5 text-amber-600 animate-pulse" />
              )}
            </div>

            <div className="flex-1 text-xs">
              <div className="font-bold text-sm mb-0.5 flex items-center justify-between">
                <span>Push Status: {isPermissionGranted ? 'Active & Receiving' : permission.toUpperCase()}</span>
                {isPermissionGranted && (
                  <span className="bg-emerald-200 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                    Live
                  </span>
                )}
              </div>
              <p className="text-slate-600 leading-relaxed">
                {isPermissionGranted
                  ? 'Your browser is subscribed to Firebase Cloud Messaging for real-time work order status updates.'
                  : permission === 'denied'
                  ? 'Notifications are blocked in your browser settings. To receive push alerts, please enable notifications in your browser URL bar.'
                  : 'Grant browser permission to receive immediate push alerts when technicians dispatch, quotes arrive, or jobs finish.'}
              </p>

              {!isPermissionGranted && permission !== 'denied' && (
                <button
                  onClick={requestPermission}
                  disabled={isLoading}
                  className="mt-2.5 inline-flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{isLoading ? 'Connecting FCM...' : 'Enable FCM Push Alerts'}</span>
                </button>
              )}
            </div>
          </div>

          {/* FCM Device Token Card */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Device FCM Token
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Sender ID: 271591409004
              </span>
            </div>

            {deviceToken ? (
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono text-[11px] text-slate-600 truncate select-all">
                  {deviceToken}
                </div>
                <button
                  onClick={handleCopyToken}
                  className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-lg text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                  title="Copy token to clipboard"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic">
                Device token will generate upon granting notification permission.
              </div>
            )}
          </div>

          {/* Notification Preferences */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wide">
              <Sliders className="w-4 h-4 text-orange-600" />
              <span>Service Notification Preferences</span>
            </div>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 cursor-pointer transition-colors">
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    Work Order Status Updates
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Alert whenever status shifts (Under Review, Approved, etc.)
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.statusChanges}
                  onChange={(e) => updatePreferences({ statusChanges: e.target.checked })}
                  className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 cursor-pointer transition-colors">
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    Technician En Route & On Site
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Urgent dispatch push when provider starts traveling to your location
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.enRouteAlerts}
                  onChange={(e) => updatePreferences({ enRouteAlerts: e.target.checked })}
                  className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 cursor-pointer transition-colors">
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    Quotations & Invoices
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Instant alert when an official transparent offer is ready
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.quoteAlerts}
                  onChange={(e) => updatePreferences({ quoteAlerts: e.target.checked })}
                  className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 cursor-pointer transition-colors">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-slate-500" />
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      Harmonic Audio Chime
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Play acoustic notification chime on service updates
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.sound}
                  onChange={(e) => updatePreferences({ sound: e.target.checked })}
                  className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Test Push Notification Trigger */}
          <div className="bg-orange-50/60 rounded-xl p-4 border border-orange-200/80">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-orange-950 uppercase tracking-wide">
              <Zap className="w-4 h-4 text-orange-600" />
              <span>Simulate Work Order Status Push</span>
            </div>
            <p className="text-xs text-orange-800/80 mb-3">
              Trigger a live push alert for any active work order to test FCM notifications, sound chime, and in-app display.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Target Work Order:
                </label>
                <select
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg p-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  {workOrders.map((wo) => (
                    <option key={wo.id} value={wo.id}>
                      {wo.workOrderNumber} - {wo.serviceTypeName || 'Service'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Status Transition:
                </label>
                <select
                  value={testStatus}
                  onChange={(e) => setTestStatus(e.target.value as WorkOrderStatus)}
                  className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg p-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="EN_ROUTE">EN_ROUTE (Technician on the way)</option>
                  <option value="IN_PROGRESS">IN_PROGRESS (Work started)</option>
                  <option value="QUOTE_SENT">QUOTE_SENT (Quote ready)</option>
                  <option value="SCHEDULED">SCHEDULED (Date confirmed)</option>
                  <option value="COMPLETED">COMPLETED (Job finished)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleSendTest}
              disabled={isLoading || workOrders.length === 0}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Trigger Test Push Notification</span>
            </button>

            {testSuccessMessage && (
              <div className="mt-2 text-xs font-bold text-emerald-700 bg-emerald-100/70 p-2 rounded-lg flex items-center gap-1.5 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{testSuccessMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
