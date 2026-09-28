import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../stores/useAppStore';
import { 
  HardHat, MapPin, Phone, Clock, CheckCircle2, 
  Truck, Camera, Star, ArrowRight, Play, Check 
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../../components/common/StatusBadge';
import { WorkOrderStatus } from '../../types';

export const ProviderHome: React.FC = () => {
  const { t } = useTranslation();
  const { 
    workOrders, 
    providers, 
    providerUpdateStatus, 
    providerUploadPhotos,
    quotes 
  } = useAppStore();

  const currentProvider = providers[0]; // Ahmed Al-Sharif (demo active technician)
  const providerOrders = workOrders.filter((w) => w.assignedProviderId === currentProvider.id);

  const [activePhotoUploadOrderId, setActivePhotoUploadOrderId] = useState<string | null>(null);

  const handleStatusChange = (orderId: string, nextStatus: WorkOrderStatus) => {
    providerUpdateStatus(orderId, nextStatus);
  };

  const handleSimulateCompletionPhoto = (orderId: string) => {
    const sampleUrls = [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
    ];
    providerUploadPhotos(orderId, sampleUrls);
    providerUpdateStatus(orderId, 'COMPLETED', 'Work finished and tested according to Red Sea Connect specs.');
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-3xl mx-auto space-y-6">
      {/* Technician Profile Banner */}
      <div className="bg-gradient-to-br from-amber-600 to-orange-700 rounded-3xl p-6 text-white shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src={currentProvider.avatarUrl || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150'}
            alt={currentProvider.businessName}
            className="w-14 h-14 rounded-full object-cover border-2 border-white/40 shadow-md"
          />
          <div>
            <div className="flex items-center gap-1 text-xs text-amber-200 font-bold uppercase tracking-wider">
              <HardHat className="w-3.5 h-3.5" />
              <span>Certified Field Specialist</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold mt-0.5">{currentProvider.businessName}</h1>
            <div className="flex items-center gap-2 text-xs text-white/90 mt-1">
              <span className="flex items-center gap-0.5 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                {currentProvider.rating}
              </span>
              <span>•</span>
              <span>{currentProvider.completedJobs} Jobs Finalized</span>
            </div>
          </div>
        </div>
      </div>

      {/* Field Jobs Stream */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center justify-between">
          <span>Assigned Field Orders</span>
          <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-mono">
            {providerOrders.length}
          </span>
        </h2>

        {providerOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-xs text-slate-400">
            No work orders currently assigned to your schedule.
          </div>
        ) : (
          providerOrders.map((order) => {
            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {order.workOrderNumber}
                      </span>
                      <PriorityBadge priority={order.priority} />
                    </div>
                    <h3 className="font-bold text-base text-slate-900 mt-1">
                      {order.serviceTypeName}
                    </h3>
                  </div>
                  <StatusBadge status={order.status} size="md" />
                </div>

                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                  {order.description}
                </p>

                {/* Location & Customer */}
                <div className="space-y-2 text-xs border-t border-slate-100 pt-3 text-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
                      <span className="font-medium">{order.addressText} ({order.cityName})</span>
                    </div>

                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(order.addressText)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <span>Navigate</span>
                      <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                    </a>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>{order.customerName} ({order.customerPhone})</span>
                    </div>
                    <a
                      href={`tel:${order.customerPhone}`}
                      className="px-2.5 py-1 bg-green-50 text-green-700 rounded-lg font-bold text-xs hover:bg-green-100"
                    >
                      Call Customer
                    </a>
                  </div>
                </div>

                {/* Technician Action Buttons based on status */}
                <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                    <span>Status changes automatically dispatch instant FCM push alerts to the customer</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(order.status === 'ASSIGNED' || order.status === 'SCHEDULED' || order.status === 'QUOTE_ACCEPTED') && (
                    <button
                      onClick={() => handleStatusChange(order.id, 'EN_ROUTE')}
                      className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Truck className="w-4 h-4" />
                      <span>I am En Route</span>
                    </button>
                  )}

                  {order.status === 'EN_ROUTE' && (
                    <button
                      onClick={() => handleStatusChange(order.id, 'IN_PROGRESS')}
                      className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Play className="w-4 h-4" />
                      <span>Start On-Site Work</span>
                    </button>
                  )}

                  {order.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => handleSimulateCompletionPhoto(order.id)}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Upload Proof & Mark Complete</span>
                    </button>
                  )}

                  {order.status === 'COMPLETED' && (
                    <div className="w-full py-2 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Job Completed & Verified</span>
                    </div>
                  )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
