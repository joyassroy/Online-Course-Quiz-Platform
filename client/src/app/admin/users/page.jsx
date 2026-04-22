"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import GlassCard from '@/components/ui/GlassCard';
import { 
    Users, Search, CheckCircle, XCircle, UserMinus, 
    UserCheck, ChevronLeft, ChevronRight, Edit, X, AlertTriangle 
} from 'lucide-react';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [roleFilter, setRoleFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState(null);
    const [updateLoading, setUpdateLoading] = useState(false);

    // 🌟 Custom Confirmation Modal State
    const [confirmDialog, setConfirmDialog] = useState({ 
        isOpen: false, 
        title: '', 
        message: '', 
        action: null, 
        confirmText: 'Confirm', 
        colorClass: 'bg-sky-500 hover:bg-sky-600' 
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/users');
            if (response.data.success) {
                setUsers(response.data.data);
            }
        } catch (error) {
            toast.error("Failed to fetch users.");
        } finally {
            setLoading(false);
        }
    };

    // 🌟 Actual Status Update Function
    const executeStatusUpdate = async (id, newStatus) => {
        const toastId = toast.loading(`Updating status to ${newStatus}...`);
        try {
            const response = await api.put(`/admin/users/${id}/status`, { status: newStatus });
            if (response.data.success) {
                setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));
                toast.success(`User is now ${newStatus}!`, { id: toastId });
            }
        } catch (error) {
            toast.error("Failed to update status. Check backend connectivity.", { id: toastId });
        } finally {
            setConfirmDialog({ ...confirmDialog, isOpen: false }); // Close modal
        }
    };

    // 🌟 Trigger Confirmation Modal
    const handleStatusUpdateClick = (id, newStatus, userName) => {
        setConfirmDialog({
            isOpen: true,
            title: newStatus === 'Suspended' ? 'Suspend User?' : 'Activate User?',
            message: `Are you sure you want to change the status of ${userName} to ${newStatus}?`,
            action: () => executeStatusUpdate(id, newStatus),
            confirmText: newStatus === 'Suspended' ? 'Yes, Suspend' : 'Yes, Activate',
            colorClass: newStatus === 'Suspended' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-emerald-500 hover:bg-emerald-600'
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setUpdateLoading(true);
        const toastId = toast.loading('Updating user profile...');
        
        try {
            const payload = {
                full_name: editForm.full_name,
                email: editForm.email,
                role_id: Number(editForm.role_id) 
            };

            const response = await api.put(`/admin/users/${editForm.id}`, payload);
            
            if (response.data.success) {
                const newRoleName = payload.role_id === 1 ? 'Admin' : payload.role_id === 2 ? 'Instructor' : 'Student';
                
                setUsers(users.map(u => u.id === editForm.id ? { 
                    ...u, full_name: payload.full_name, email: payload.email, role_name: newRoleName 
                } : u));
                setIsEditModalOpen(false);
                toast.success("Profile updated successfully!", { id: toastId });
            }
        } catch (error) {
            toast.error("Failed to update profile.", { id: toastId });
        } finally {
            setUpdateLoading(false);
        }
    };

    const getRoleBadgeColors = (roleName) => {
        if (roleName === 'Admin') return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
        if (roleName === 'Instructor') return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
        if (roleName === 'Student') return 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400';
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800';
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = (u.full_name || '').toLowerCase().includes(search.toLowerCase()) || 
                              (u.email || '').toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'All' || u.status === statusFilter;
        const matchesRole = roleFilter === 'All' || u.role_name === roleFilter;
        return matchesSearch && matchesStatus && matchesRole;
    });

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
            
            {/* Header & Advanced Filters */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black dark:text-white flex items-center tracking-tight">
                        <Users className="mr-3 text-sky-500 shrink-0" size={32} /> User Management
                    </h1>
                </div>
                
                <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full xl:w-auto">
                    <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" placeholder="Search users..."
                            className="pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-sky-500 w-full md:w-64 text-sm transition-all"
                            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <select 
                            className="flex-1 sm:flex-none px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 outline-none cursor-pointer"
                            onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
                        >
                            <option value="All">All Roles</option>
                            <option value="Admin">Admin</option>
                            <option value="Instructor">Instructor</option>
                            <option value="Student">Student</option>
                        </select>
                        <select 
                            className="flex-1 sm:flex-none px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 outline-none cursor-pointer"
                            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                        >
                            <option value="All">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Pending">Pending</option>
                            <option value="Suspended">Suspended</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* User Data Section */}
            <GlassCard className="overflow-hidden border-none shadow-xl bg-white/50 dark:bg-gray-900/50">
                
                {/* 📱 Mobile View */}
                <div className="md:hidden flex flex-col p-4 gap-4">
                    {loading ? (
                        <div className="text-center p-8 text-sky-500 font-bold animate-pulse">Loading users...</div>
                    ) : currentUsers.length === 0 ? (
                        <div className="text-center p-8 text-gray-500 text-sm border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">No users found.</div>
                    ) : currentUsers.map(user => (
                        <div key={user.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm relative">
                            <div className="flex items-start gap-3 mb-3 pr-16">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold shrink-0">
                                    {(user.full_name || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold dark:text-white text-sm truncate">{user.full_name}</p>
                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                </div>
                            </div>
                            
                            <span className={`absolute top-4 right-4 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${user.status === 'Active' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : user.status === 'Pending' ? 'bg-amber-100 text-amber-600 animate-pulse dark:bg-amber-500/20 dark:text-amber-400' : 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'}`}>
                                {user.status}
                            </span>

                            <div className="flex justify-between items-center text-sm border-t border-gray-50 dark:border-gray-700 pt-3">
                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${getRoleBadgeColors(user.role_name)}`}>
                                    {user.role_name}
                                </span>
                                
                                <div className="flex gap-2">
                                    {user.status === 'Pending' && (
                                        <button onClick={() => handleStatusUpdateClick(user.id, 'Active', user.full_name)} className="p-1.5 bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-md hover:bg-emerald-500 hover:text-white transition-all"><CheckCircle size={14} /></button>
                                    )}
                                    {user.status === 'Active' && (
                                        <button onClick={() => handleStatusUpdateClick(user.id, 'Suspended', user.full_name)} className="p-1.5 bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400 rounded-md hover:bg-orange-500 hover:text-white transition-all"><UserMinus size={14} /></button>
                                    )}
                                    <button onClick={() => { const roleMap = { 'Admin': 1, 'Instructor': 2, 'Student': 3 }; setEditForm({ ...user, role_id: roleMap[user.role_name] || 3 }); setIsEditModalOpen(true); }} className="p-1.5 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-md hover:bg-sky-500 hover:text-white transition-all">
                                        <Edit size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 💻 Desktop View */}
                <div className="hidden md:block overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left min-w-[800px]">
                        <thead className="bg-gray-100/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                            <tr>
                                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">User Profile</th>
                                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Role</th>
                                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Status</th>
                                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                            {loading ? (
                                <tr><td colSpan="4" className="p-10 text-center text-sky-500 font-bold animate-pulse">Loading users...</td></tr>
                            ) : currentUsers.length === 0 ? (
                                <tr><td colSpan="4" className="p-10 text-center text-gray-500">No users found.</td></tr>
                            ) : currentUsers.map(user => (
                                <tr key={user.id} className="hover:bg-white dark:hover:bg-gray-800/50 transition-all">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold shadow-sm shrink-0">
                                                {(user.full_name || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold dark:text-white text-sm">{user.full_name}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getRoleBadgeColors(user.role_name)}`}>{user.role_name}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                            user.status === 'Active' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 
                                            user.status === 'Pending' ? 'bg-amber-100 text-amber-600 animate-pulse dark:bg-amber-500/20 dark:text-amber-400' : 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                                        }`}>{user.status}</span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            {/* 🌟 Buttons trigger Custom Confirmation */}
                                            {user.status === 'Pending' && (
                                                <button onClick={() => handleStatusUpdateClick(user.id, 'Active', user.full_name)} className="p-2 bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"><CheckCircle size={16} /></button>
                                            )}
                                            {user.status === 'Active' && (
                                                <button onClick={() => handleStatusUpdateClick(user.id, 'Suspended', user.full_name)} className="p-2 bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400 rounded-lg hover:bg-orange-500 hover:text-white transition-all"><UserMinus size={16} /></button>
                                            )}
                                            <button onClick={() => { const roleMap = { 'Admin': 1, 'Instructor': 2, 'Student': 3 }; setEditForm({ ...user, role_id: roleMap[user.role_name] || 3 }); setIsEditModalOpen(true); }} className="p-2 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 rounded-lg hover:bg-sky-500 hover:text-white transition-all ml-2">
                                                <Edit size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-center items-center gap-4 bg-gray-50/50 dark:bg-gray-900/50">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1 rounded-md text-gray-400 hover:text-sky-500 disabled:opacity-30"><ChevronLeft size={20}/></button>
                        <span className="text-xs font-black text-gray-500">PAGE {currentPage} OF {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1 rounded-md text-gray-400 hover:text-sky-500 disabled:opacity-30"><ChevronRight size={20}/></button>
                    </div>
                )}
            </GlassCard>

            {/* 🌟 Edit Profile Modal */}
            <AnimatePresence>
                {isEditModalOpen && editForm && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
                            <div className="p-5 md:p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                                <h3 className="text-lg font-black dark:text-white flex items-center"><Edit className="mr-2 text-sky-500" size={20} /> Edit User</h3>
                                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-red-500"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleEditSubmit} className="p-5 md:p-6 space-y-4 md:space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                                    <input type="text" required value={editForm.full_name || ''} onChange={(e) => setEditForm({...editForm, full_name: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-transparent focus:border-sky-500 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/30 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                                    <input type="email" required value={editForm.email || ''} onChange={(e) => setEditForm({...editForm, email: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-transparent focus:border-sky-500 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/30 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Assign Role</label>
                                    <select value={editForm.role_id} onChange={(e) => setEditForm({...editForm, role_id: Number(e.target.value)})} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-transparent focus:border-sky-500 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/30 transition-all cursor-pointer">
                                        <option value={1}>Admin</option>
                                        <option value={2}>Instructor</option>
                                        <option value={3}>Student</option>
                                    </select>
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                                    <button type="submit" disabled={updateLoading} className="flex-1 py-3 bg-sky-500 text-white font-bold rounded-xl shadow-lg shadow-sky-500/30 disabled:opacity-50 hover:bg-sky-600 transition-colors">Save Changes</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* 🌟 Gorgeous Confirmation Modal (Replaces Native Alert) */}
            <AnimatePresence>
                {confirmDialog.isOpen && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-6 md:p-8 text-center border border-gray-200 dark:border-gray-800"
                        >
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle size={32} />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">{confirmDialog.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-8 leading-relaxed">
                                {confirmDialog.message}
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button 
                                    onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })} 
                                    className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={confirmDialog.action} 
                                    className={`flex-1 py-3 text-white font-bold rounded-xl shadow-lg transition-colors ${confirmDialog.colorClass}`}
                                >
                                    {confirmDialog.confirmText}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}