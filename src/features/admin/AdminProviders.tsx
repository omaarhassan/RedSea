import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../stores/useAppStore';
import { 
  Users, Plus, Star, ShieldCheck, Phone, 
  Mail, MapPin, Check, X, Edit3, Award 
} from 'lucide-react';
import { Provider } from '../../types';

export const AdminProviders: React.FC = () => {
  const { t } = useTranslation();
  const { providers, cities, services, addProvider, updateProvider } = useAppStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [cityId, setCityId] = useState(cities[0]?.id || '');
  const [baseHourlyRate, setBaseHourlyRate] = useState(200);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addProvider({
      profileId: `prof-${Date.now()}`,
      businessName,
      phone,
      email,
      description,
      cityId,
      baseHourlyRate: Number(baseHourlyRate),
      rating: 5.0,
      completedJobs: 0,
      isVerified: true,
      isAvailable: true,
      serviceCategoryIds: ['srv-ac', 'srv-electrical'],
      avatarUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150',
    });

    setShowAddModal(false);
    setBusinessName('');
    setPhone('');
    setEmail('');
    setDescription('');
  };

  return (
    <div className="pb-24 pt-4 px-4 sm:px-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">
            Contractor & Specialist Network
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Technicians & Field Providers
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified local professionals under Red Sea Connect quality standards.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard New Technician</span>
        </button>
      </div>

      {/* Grid of Providers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {providers.map((prov) => {
          const provCity = cities.find((c) => c.id === prov.cityId);

          return (
            <div
              key={prov.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={prov.avatarUrl || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150'}
                    alt={prov.businessName}
                    className="w-13 h-13 rounded-full object-cover border-2 border-blue-100 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-base text-slate-900">{prov.businessName}</h3>
                      {prov.isVerified && (
                        <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        {prov.rating}
                      </span>
                      <span>•</span>
                      <span>{prov.completedJobs} jobs completed</span>
                    </div>
                  </div>
                </div>

                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  prov.isAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {prov.isAvailable ? 'Available' : 'Busy'}
                </span>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {prov.description}
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-orange-600" />
                  <span>{provCity?.name_en || 'Ras Gharib'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono">{prov.phone}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Onboard Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAdd}
            className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-base text-slate-900">Onboard New Field Technician</h2>
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
                <label className="block font-bold text-slate-800 mb-1">Technician / Business Name *</label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Eng. Tarek (Plumbing & Fixtures)"
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+20 100 000 0000"
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">City Base</label>
                  <select
                    value={cityId}
                    onChange={(e) => setCityId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name_en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Specialty & Background</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Years of experience, certifications, and technical capabilities..."
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
                Save Technician
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
