import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '../../stores/useAppStore';
import { 
  FileText, Search, Filter, Plus, Calendar, 
  MapPin, Clock, ChevronRight, User, ShieldAlert 
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../../components/common/StatusBadge';
import { WorkOrderStatus } from '../../types';

export const AdminWorkOrders: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialStatusFilter = searchParams.get('status') || 'ALL';

  const { workOrders, cities, currentLanguage } = useAppStore();
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter);
  const [cityFilter, setCityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = workOrders.filter((order) => {
    const matchesSearch = 
      order.workOrderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.serviceTypeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter !== 'ALL' && order.status !== statusFilter) return false;
    if (cityFilter !== 'ALL' && order.cityId !== cityFilter) return false;

    return true;
  });

  return (
    <div className="pb-24 pt-4 px-4 sm:px-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">
            Operations & Dispatch
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Work Orders Registry
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage lifecycle, quotations, scheduling, and technician dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/quote-builder')}
            className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Quotation</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by RSC number, customer, service..."
              className="w-full text-xs ps-10 pe-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#0F3966]"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs p-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#0F3966]"
          >
            <option value="ALL">All Statuses ({workOrders.length})</option>
            <option value="SUBMITTED">SUBMITTED (Needs Review)</option>
            <option value="UNDER_REVIEW">UNDER REVIEW</option>
            <option value="QUOTE_SENT">QUOTE SENT (Awaiting Customer)</option>
            <option value="QUOTE_ACCEPTED">QUOTE ACCEPTED</option>
            <option value="SCHEDULED">SCHEDULED</option>
            <option value="ASSIGNED">ASSIGNED</option>
            <option value="EN_ROUTE">EN ROUTE</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>

          {/* City Filter */}
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="text-xs p-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#0F3966]"
          >
            <option value="ALL">All Cities ({cities.length})</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name_en} {c.slug === 'ras-gharib' ? '(Launch City)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 text-start">Order Number</th>
                <th className="py-3 px-4 text-start">Service</th>
                <th className="py-3 px-4 text-start">Customer</th>
                <th className="py-3 px-4 text-start">City / Location</th>
                <th className="py-3 px-4 text-start">Preferred Date</th>
                <th className="py-3 px-4 text-start">Technician</th>
                <th className="py-3 px-4 text-start">Status</th>
                <th className="py-3 px-4 text-end">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No work orders found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    onClick={() => navigate(`/admin/orders/${order.id}`)}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {order.workOrderNumber}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      <div>{order.serviceTypeName}</div>
                      <div className="text-[10px] text-slate-400">{order.serviceCategoryName}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <div className="font-medium text-slate-900">{order.customerName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{order.customerPhone}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                      <div className="font-semibold text-slate-800">{order.cityName}</div>
                      <div className="text-[10px] text-slate-400 truncate">{order.addressText}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      <div>{order.preferredDate}</div>
                      <div className="text-[10px] text-slate-400">{order.preferredTime}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {order.assignedProviderName ? (
                        <span className="font-medium text-slate-900">{order.assignedProviderName}</span>
                      ) : (
                        <span className="text-amber-600 italic text-[11px]">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={order.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-end whitespace-nowrap">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/orders/${order.id}`);
                        }}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#0F3966] hover:text-white transition-colors cursor-pointer inline-flex items-center text-xs font-bold"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
