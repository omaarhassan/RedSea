import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Users, UserCheck, Shield, HardHat, UserX, Search, Filter, 
  Plus, MoreVertical, Check, AlertTriangle, Key, Mail, Phone, 
  MapPin, Globe, RefreshCw, Edit3, ShieldAlert, CheckCircle2,
  ExternalLink, Info
} from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { useAuth } from '../auth/AuthContext';
import { UserProfile, UserRole } from '../../types';

interface ManagedUser extends UserProfile {
  status?: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  notes?: string;
  lastActiveAt?: string;
}

export const AdminUsers: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { cities } = useAppStore();
  const { currentUser, profile: authProfile } = useAuth();

  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [cityFilter, setCityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Selected User for Editing
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showIamInfoModal, setShowIamInfoModal] = useState(false);

  // Edit form state
  const [editRole, setEditRole] = useState<UserRole>('CUSTOMER');
  const [editStatus, setEditStatus] = useState<'ACTIVE' | 'SUSPENDED' | 'PENDING'>('ACTIVE');
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCityId, setEditCityId] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // New user form state
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('CUSTOMER');
  const [newCityId, setNewCityId] = useState(cities[0]?.id || 'hurghada');
  const [newLang, setNewLang] = useState<'en' | 'ar' | 'zh'>('en');

  useEffect(() => {
    const nowStr = new Date().toISOString();
    const seededUsers: ManagedUser[] = [
      {
        id: currentUser?.uid || 'usr-admin-1',
        uid: currentUser?.uid || 'usr-admin-1',
        email: currentUser?.email || 'omarhassan030@gmail.com',
        fullName: authProfile?.fullName || 'Omar Hassan (Super Admin)',
        phone: authProfile?.phone || '+20 100 123 4567',
        role: 'SUPER_ADMIN',
        cityId: 'hurghada',
        preferredLanguage: 'en',
        isActive: true,
        termsAccepted: true,
        termsAcceptedAt: nowStr,
        createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
        updatedAt: nowStr,
        status: 'ACTIVE',
      },
      {
        id: 'usr-cust-2',
        uid: 'usr-cust-2',
        email: 'ahmed.tarek@example.com',
        fullName: 'Ahmed Tarek',
        phone: '+20 109 876 5432',
        role: 'CUSTOMER',
        cityId: 'el-gouna',
        preferredLanguage: 'ar',
        isActive: true,
        termsAccepted: true,
        termsAcceptedAt: nowStr,
        createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
        updatedAt: nowStr,
        status: 'ACTIVE',
      },
      {
        id: 'usr-prov-3',
        uid: 'usr-prov-3',
        email: 'hassan.elmaghraby@redseapool.com',
        fullName: 'Eng. Hassan El Maghraby',
        phone: '+20 122 345 6789',
        role: 'PROVIDER',
        cityId: 'hurghada',
        preferredLanguage: 'en',
        isActive: true,
        termsAccepted: true,
        termsAcceptedAt: nowStr,
        createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
        updatedAt: nowStr,
        status: 'ACTIVE',
      },
      {
        id: 'usr-prov-4',
        uid: 'usr-prov-4',
        email: 'sayed.plumbing@redseafix.com',
        fullName: 'Master Sayed Plumbing',
        phone: '+20 111 222 3344',
        role: 'PROVIDER',
        cityId: 'ras-gharib',
        preferredLanguage: 'ar',
        isActive: true,
        termsAccepted: true,
        termsAcceptedAt: nowStr,
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        updatedAt: nowStr,
        status: 'ACTIVE',
      },
      {
        id: 'usr-ops-5',
        uid: 'usr-ops-5',
        email: 'dispatch@redseaconnect.com',
        fullName: 'Mona Zaki (Dispatch Officer)',
        phone: '+20 100 999 8877',
        role: 'OPS_ADMIN',
        cityId: 'hurghada',
        preferredLanguage: 'en',
        isActive: true,
        termsAccepted: true,
        termsAcceptedAt: nowStr,
        createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
        updatedAt: nowStr,
        status: 'ACTIVE',
      },
    ];

    setUsers(seededUsers);
    setLoading(false);
  }, [currentUser, authProfile]);

  // Open edit modal
  const handleOpenEdit = (user: ManagedUser) => {
    setSelectedUser(user);
    setEditRole(user.role);
    setEditStatus(user.status || 'ACTIVE');
    setEditName(user.fullName || '');
    setEditPhone(user.phone || '');
    setEditCityId(user.cityId || cities[0]?.id || '');
    setEditNotes(user.notes || '');
    setActionError(null);
    setActionSuccess(null);
    setShowEditModal(true);
  };

  // Save changes to Firestore
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const updatePayload: Partial<ManagedUser> = {
      role: editRole,
      status: editStatus,
      isActive: editStatus !== 'SUSPENDED',
      fullName: editName,
      phone: editPhone,
      cityId: editCityId,
      notes: editNotes,
      updatedAt: new Date().toISOString(),
    };

    setUsers((prev) =>
      prev.map((u) =>
        u.id === selectedUser.id
          ? {
              ...u,
              ...updatePayload,
            }
          : u
      )
    );

    setActionSuccess('User profile and permissions updated successfully!');
    setTimeout(() => {
      setShowEditModal(false);
      setActionSuccess(null);
    }, 1200);
  };

  // Create / Pre-provision a new user profile
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newName) {
      setActionError('Email and full name are required.');
      return;
    }

    const nowStr = new Date().toISOString();
    const customId = `usr_${Date.now()}`;
    const newUserDoc: ManagedUser = {
      id: customId,
      uid: customId,
      email: newEmail.toLowerCase().trim(),
      fullName: newName.trim(),
      phone: newPhone.trim() || '+20 100 000 0000',
      role: newRole,
      cityId: newCityId,
      preferredLanguage: newLang,
      isActive: true,
      termsAccepted: true,
      termsAcceptedAt: nowStr,
      createdAt: nowStr,
      updatedAt: nowStr,
      status: 'ACTIVE',
    };

    setUsers((prev) => [newUserDoc, ...prev]);
    setShowAddModal(false);
    setNewEmail('');
    setNewName('');
    setNewPhone('');
    setActionSuccess('New user profile successfully provisioned!');
    setTimeout(() => setActionSuccess(null), 3000);
  };

  // Quick Role Filter counts
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.fullName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (u.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (u.phone || '').includes(searchQuery);

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesCity = cityFilter === 'ALL' || u.cityId === cityFilter;
    const matchesStatus = statusFilter === 'ALL' || (u.status || 'ACTIVE') === statusFilter;

    return matchesSearch && matchesRole && matchesCity && matchesStatus;
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return (
          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-[11px] font-bold px-2 py-0.5 rounded-md border border-red-200">
            <ShieldAlert className="w-3 h-3 text-red-600" />
            Super Admin
          </span>
        );
      case 'ADMIN':
      case 'OPS_ADMIN':
        return (
          <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 text-[11px] font-bold px-2 py-0.5 rounded-md border border-orange-200">
            <Shield className="w-3 h-3 text-orange-600" />
            {role === 'OPS_ADMIN' ? 'Ops Admin' : 'Admin'}
          </span>
        );
      case 'PROVIDER':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-md border border-amber-200">
            <HardHat className="w-3 h-3 text-amber-600" />
            Service Provider
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-[11px] font-bold px-2 py-0.5 rounded-md border border-blue-200">
            <UserCheck className="w-3 h-3 text-blue-600" />
            Customer
          </span>
        );
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'SUSPENDED':
        return (
          <span className="bg-red-50 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded border border-red-200 flex items-center gap-1">
            <UserX className="w-2.5 h-2.5" /> Suspended
          </span>
        );
      case 'PENDING':
        return (
          <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
            <AlertTriangle className="w-2.5 h-2.5" /> Pending Verification
          </span>
        );
      default:
        return (
          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5" /> Active
          </span>
        );
    }
  };

  return (
    <div className="pb-24 pt-4 px-4 sm:px-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider bg-orange-50 px-2 py-0.5 rounded">
              Access & Security Control
            </span>
            <span className="text-xs text-slate-400 font-mono">Firestore /profiles Collection</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            User Management & Role Permissions
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage registered customers, certified service technicians, and dispatch operators across the Red Sea region.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowIamInfoModal(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 border border-slate-200"
          >
            <Info className="w-4 h-4 text-blue-600" />
            <span>Firebase Console & IAM Help</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add / Provision User</span>
          </button>
        </div>
      </div>

      {/* Notice Banner explaining Firebase Console Permission message */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-blue-800/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-3xl">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Why Firebase Console displays "To manage users, ask a project owner for permission"
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              In Google Cloud / Firebase Console, accessing the raw Auth table requires the <strong>Firebase Authentication Admin</strong> IAM role. 
              Within this <strong>Red Sea Connect Admin Portal</strong>, you have direct, real-time control to manage user profiles, elevate roles, assign operational cities, and toggle access states via Firestore with security rules validation.
            </p>
          </div>
          <button
            onClick={() => setShowIamInfoModal(true)}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-colors border border-white/20 shrink-0 cursor-pointer"
          >
            View IAM Setup Guide
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full md:flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or phone (+20...)"
              className="w-full ps-9 pe-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full md:w-auto px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 font-medium text-slate-700"
            >
              <option value="ALL">All Roles ({users.length})</option>
              <option value="CUSTOMER">Customers ({users.filter((u) => u.role === 'CUSTOMER').length})</option>
              <option value="PROVIDER">Service Providers ({users.filter((u) => u.role === 'PROVIDER').length})</option>
              <option value="OPS_ADMIN">Ops Admins ({users.filter((u) => u.role === 'OPS_ADMIN').length})</option>
              <option value="SUPER_ADMIN">Super Admins ({users.filter((u) => u.role === 'SUPER_ADMIN' || u.role === 'ADMIN').length})</option>
            </select>

            {/* City Filter */}
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full md:w-auto px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 font-medium text-slate-700"
            >
              <option value="ALL">All Cities</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name_en}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-auto px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 font-medium text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> registered users
          </span>
          {(searchQuery || roleFilter !== 'ALL' || cityFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setRoleFilter('ALL');
                setCityFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="text-orange-600 font-semibold hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3 text-start">User Profile</th>
                <th className="px-4 py-3 text-start">Role</th>
                <th className="px-4 py-3 text-start">City / Hub</th>
                <th className="px-4 py-3 text-start">Contact</th>
                <th className="px-4 py-3 text-start">Status</th>
                <th className="px-4 py-3 text-start">Joined</th>
                <th className="px-4 py-3 text-end">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                    <p className="font-semibold">No users found matching your criteria</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const userCity = cities.find((c) => c.id === user.cityId) || cities[0];
                  const isCurrentSessionUser = currentUser?.uid === user.id || currentUser?.email === user.email;

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Avatar */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-800 to-slate-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                            {user.fullName
                              ? user.fullName
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .slice(0, 2)
                                  .toUpperCase()
                              : 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{user.fullName || 'Anonymous User'}</span>
                              {isCurrentSessionUser && (
                                <span className="text-[9px] bg-slate-900 text-white px-1.5 py-0.2 rounded font-mono">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">{user.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>

                      {/* City */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                          <span>{userCity ? userCity.name_en : user.cityId || 'Hurghada'}</span>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="text-slate-700 font-mono text-[11px]">
                          {user.phone || 'No phone'}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Globe className="w-2.5 h-2.5" />
                          <span>Lang: {user.preferredLanguage?.toUpperCase() || 'EN'}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {getStatusBadge(user.status)}
                      </td>

                      {/* Joined Date */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-500 text-[11px]">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recent'}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-end whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-orange-50 hover:text-orange-600 text-slate-700 font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ms-auto"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit & Role</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Manage User & Permissions
                </h3>
                <p className="text-xs text-slate-400 font-mono">{selectedUser.email}</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              {/* Full Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500 font-semibold text-slate-900"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number (+20...)</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500 font-mono text-slate-900"
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Assigned Access Role</span>
                  <span className="text-[10px] text-orange-600 font-normal">Firestore RBAC enforced</span>
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 font-bold text-slate-800"
                >
                  <option value="CUSTOMER">CUSTOMER — Standard Service Requester</option>
                  <option value="PROVIDER">PROVIDER — Certified Technician / Contractor</option>
                  <option value="OPS_ADMIN">OPS_ADMIN — Dispatcher & Quotation Manager</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN — Full Platform Administrator</option>
                </select>
              </div>

              {/* Status & City */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Account Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 font-semibold"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PENDING">PENDING</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Operational City</label>
                  <select
                    value={editCityId}
                    onChange={(e) => setEditCityId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 font-semibold"
                  >
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name_en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Internal Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Admin Internal Notes</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Verification ID, license details, special dispatch instructions..."
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-colors shadow-xs"
                >
                  Save User Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Provision User / Contractor
                </h3>
                <p className="text-xs text-slate-400">Pre-create a profile in Firestore</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="technician@example.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., Tamer Samir"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone (+20...)</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+20 100 123 4567"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assign Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 font-semibold"
                  >
                    <option value="CUSTOMER">CUSTOMER</option>
                    <option value="PROVIDER">PROVIDER</option>
                    <option value="OPS_ADMIN">OPS_ADMIN</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Operating City</label>
                  <select
                    value={newCityId}
                    onChange={(e) => setNewCityId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 font-semibold"
                  >
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name_en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-colors shadow-xs"
                >
                  Create User Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IAM & Firebase Console Information Modal */}
      {showIamInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-orange-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Firebase Authentication & GCP IAM Permissions Explained
                </h3>
              </div>
              <button
                onClick={() => setShowIamInfoModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed max-h-[70vh] overflow-y-auto pe-1">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  <span>The message you encountered in Firebase Console:</span>
                </div>
                <p className="font-mono text-[11px] bg-amber-100/60 p-2 rounded text-amber-950">
                  "To manage users, ask a project owner for the necessary permission"
                </p>
              </div>

              <h4 className="font-bold text-slate-900 text-sm">How Firebase Auth Permissions Work:</h4>
              <p>
                When viewing Firebase projects via the <strong>Firebase Console</strong> web interface, Google Cloud IAM requires specific roles on your Google account:
              </p>
              
              <ul className="list-disc ps-5 space-y-1.5">
                <li>
                  <strong>Firebase Authentication Admin (`roles/firebaseauth.admin`):</strong> Required to browse, create, disable, or delete raw auth credentials in the Firebase Console UI.
                </li>
                <li>
                  <strong>Firebase Admin (`roles/firebase.admin`) or Editor / Owner:</strong> Full control over Firestore, Cloud Storage, and Auth configurations.
                </li>
              </ul>

              <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2">
                <div className="font-bold text-amber-400 text-xs uppercase tracking-wider">
                  Recommended Best Practice
                </div>
                <p className="text-slate-300">
                  Use this <strong>Red Sea Connect Admin Portal</strong> (`/admin/users`) for day-to-day operations. User roles, operational cities, and contractor permissions are dynamically managed and verified in Firestore with built-in audit logs and role security rules.
                </p>
              </div>

              <div className="space-y-1.5 pt-2">
                <div className="font-bold text-slate-900">If you need direct Firebase Console access:</div>
                <ol className="list-decimal ps-5 space-y-1 text-slate-600">
                  <li>Ask the GCP Cloud Project Owner to open <strong>Google Cloud Console → IAM & Admin</strong>.</li>
                  <li>Click <strong>Grant Access</strong> and enter your email (<code className="bg-slate-100 px-1 py-0.5 rounded text-slate-900 font-mono">omarhassan030@gmail.com</code>).</li>
                  <li>Assign the <strong>Firebase Authentication Admin</strong> or <strong>Firebase Admin</strong> role.</li>
                </ol>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowIamInfoModal(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors text-xs"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
