import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../stores/useAppStore';
import { 
  Calendar as CalendarIcon, Clock, MapPin, Phone, 
  User, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, Plus 
} from 'lucide-react';
import { Appointment } from '../../types';

export const AdminCalendar: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { appointments, workOrders, providers, cities } = useAppStore();

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [providerFilter, setProviderFilter] = useState<string>('ALL');

  const filteredAppointments = appointments.filter((apt) => {
    const aptDate = apt.scheduledStart.split('T')[0];
    if (aptDate !== selectedDate) return false;
    if (providerFilter !== 'ALL' && apt.providerId !== providerFilter) return false;
    return true;
  });

  return (
    <div className="pb-24 pt-4 px-4 sm:px-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">
            Technician Dispatch & Capacity
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Dispatch Calendar
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time appointment schedule, routing, and double-booking prevention.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/orders')}
            className="px-4 py-2 bg-[#0F3966] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Manage Orders
          </button>
        </div>
      </div>

      {/* Control Bar: Date Picker & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs font-bold p-2.5 rounded-xl border border-slate-300 bg-white"
          />
          <button
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Today
          </button>
        </div>

        <div className="w-full sm:w-64">
          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
          >
            <option value="ALL">All Technicians ({providers.length})</option>
            {providers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.businessName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Appointments List for Selected Date */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Schedule for {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </h2>

        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-slate-900">No scheduled appointments</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No technician visits booked for this date yet. Open a work order to schedule a service visit.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAppointments.map((apt) => {
              const startTime = new Date(apt.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const endTime = new Date(apt.scheduledEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div
                  key={apt.id}
                  onClick={() => navigate(`/admin/orders/${apt.workOrderId}`)}
                  className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-[#0F3966]/40 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="p-2 rounded-xl bg-orange-50 text-orange-600 font-bold text-xs flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{startTime} - {endTime}</span>
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {apt.workOrderNumber}
                      </span>
                    </div>

                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase">
                      {apt.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-blue-600" />
                      <span>{apt.providerName}</span>
                    </div>
                    <div className="text-slate-600 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>Customer: {apt.customerName} ({apt.customerPhone})</span>
                    </div>
                    <div className="text-slate-600 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-orange-600" />
                      <span>{apt.addressText}</span>
                    </div>
                  </div>

                  {apt.notes && (
                    <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-600 border border-slate-100">
                      {apt.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
