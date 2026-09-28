import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../stores/useAppStore';
import { 
  MapPin, Plus, Edit3, Check, X, ShieldAlert, 
  Clock, ShieldCheck, CheckCircle2 
} from 'lucide-react';
import { City } from '../../types';

export const AdminCities: React.FC = () => {
  const { t } = useTranslation();
  const { cities, addCity, updateCity, toggleCity } = useAppStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [nameZh, setNameZh] = useState('');
  const [operatingHours, setOperatingHours] = useState('08:00 - 22:00');
  const [emergencyAvailable, setEmergencyAvailable] = useState(true);
  const [areasInput, setAreasInput] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const serviceAreas = areasInput.split(',').map((a) => a.trim()).filter(Boolean);

    addCity({
      name_en: nameEn,
      name_ar: nameAr,
      name_zh: nameZh,
      slug: nameEn.toLowerCase().replace(/\s+/g, '-'),
      isActive: true,
      timezone: 'Africa/Cairo',
      operatingHours,
      emergencyAvailable,
      serviceAreas: serviceAreas.length > 0 ? serviceAreas : ['Metropolitan Area'],
    });

    setShowAddModal(false);
    setNameEn('');
    setNameAr('');
    setNameZh('');
    setAreasInput('');
  };

  return (
    <div className="pb-24 pt-4 px-4 sm:px-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">
            Multi-City Platform Infrastructure
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Cities & Operational Hubs
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ras Gharib launch city + multi-city expansion across Egypt's Red Sea coast.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New City / Hub</span>
        </button>
      </div>

      {/* Grid of Cities */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cities.map((city) => (
          <div
            key={city.id}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-base text-slate-900">{city.name_en}</h3>
                  {city.slug === 'ras-gharib' && (
                    <span className="bg-orange-100 text-orange-700 text-[10px] px-1.5 py-0.2 rounded font-bold">
                      Launch City
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 font-arabic font-medium">
                  {city.name_ar} • {city.name_zh}
                </div>
              </div>

              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                city.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {city.isActive ? 'Active' : 'Coming Soon'}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-2">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Hours: {city.operatingHours}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>24/7 Emergency: {city.emergencyAvailable ? 'Enabled' : 'Disabled'}</span>
              </div>
              <div className="flex items-start gap-1.5 pt-1">
                <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" />
                <span className="text-[11px] text-slate-500">
                  {city.serviceAreas?.join(' • ') || 'Full Coverage'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => toggleCity(city.id, !city.isActive)}
                className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  city.isActive ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-emerald-50 text-emerald-700'
                }`}
              >
                {city.isActive ? 'Deactivate' : 'Activate Hub'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add City Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAdd}
            className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-base text-slate-900">Add New City Hub</h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">City Name (English) *</label>
                <input
                  type="text"
                  required
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="e.g. El Gouna"
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Name (Arabic) *</label>
                  <input
                    type="text"
                    required
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    placeholder="الجونة"
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-arabic"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Name (Chinese) *</label>
                  <input
                    type="text"
                    required
                    value={nameZh}
                    onChange={(e) => setNameZh(e.target.value)}
                    placeholder="艾尔古纳"
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Operating Hours</label>
                <input
                  type="text"
                  value={operatingHours}
                  onChange={(e) => setOperatingHours(e.target.value)}
                  placeholder="08:00 - 22:00"
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Districts & Service Areas (Comma separated)</label>
                <input
                  type="text"
                  value={areasInput}
                  onChange={(e) => setAreasInput(e.target.value)}
                  placeholder="Downtown, Marina, North Sector..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Add City
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
