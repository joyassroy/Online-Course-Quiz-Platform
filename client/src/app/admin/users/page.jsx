"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/utils/api';
import GlassCard from '@/components/ui/GlassCard';
import { 
    Users, Search, CheckCircle, XCircle, UserMinus, 
    UserCheck, ChevronLeft, ChevronRight, Edit, X 
} from 'lucide-react';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // 🌟 Filters & Pagination State
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [roleFilter, setRoleFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;

    // 🌟 Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState(null);
    const [updateLoading, setUpdateLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/users');
            if (response.data.success) {
                // তোমার নতুন JSON ফরম্যাট অনুযায়ী ডাটা সেট হচ্ছে
                setUsers(response.data.data);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    // 🌟 Status Update Logic
    const updateStatus = async (id, newStatus) => {
        if (!confirm(`Are you sure you want to change this user's status to ${newStatus}?`)) return;
        try {
            const response = await api.put(`/admin/users/${id}/status`, { status: newStatus });
            if (response.data.success) {
                setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));
            }
        } catch (error) {
            alert("Failed to update status. Check backend connectivity.");
        }
    };

    // 🌟 Edit Profile Submit Logic
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setUpdateLoading(true);
        
        try {
            const payload = {
                full_name: editForm.full_name,
                email: editForm.email,
                role_id: Number(editForm.role_id) 
            };

            const response = await api.put(`/admin/users/${editForm.id}`, payload);
            
            if (response.data.success) {
                // আপডেট হওয়ার পর UI তেও চেঞ্জ দেখানো (ID থেকে Name এ কনভার্ট করে)
                const newRoleName = payload.role_id === 1 ? 'Admin' : payload.role_id === 2 ? 'Instructor' : 'Student';
                
                setUsers(users.map(u => u.id === editForm.id ? { 
                    ...u, 
                    full_name: payload.full_name, 
                    email: payload.email, 
                    role_name: newRoleName 
                } : u));
                setIsEditModalOpen(false);
                alert("✅ Profile updated successfully!");
            }
        } catch (error) {
            alert("❌ Failed to update profile.");
        } finally {
            setUpdateLoading(false);
        }
    };

    // 🌟 role_name দিয়ে রং সেট করার সিম্পল ফাংশন
    const getRoleBadgeColors = (roleName) => {
        if (roleName === 'Admin') return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
        if (roleName === 'Instructor') return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
        if (roleName === 'Student') return 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400';
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800';
    };

    // 🌟 Filter Logic (এখন role_name দিয়ে ফিল্টার হবে)
    const filteredUsers = users.filter(u => {
        const matchesSearch = (u.full_name || '').toLowerCase().includes(search.toLowerCase()) || 
                              (u.email || '').toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'All' || u.status === statusFilter;
        const matchesRole = roleFilter === 'All' || u.role_name === roleFilter;
        return matchesSearch && matchesStatus && matchesRole;
    });

    // Pagination Logic
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
            
            {/* Header & Advanced Filters */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
                <div>
                    <h1 className="text-3xl font-black dark:text-white flex items-center tracking-tight">
                        <Users className="mr-3 text-sky-500" size={32} /> User Management
                    </h1>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input 
                            type="text" placeholder="Search users..."
                            className="pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 w-full md:w-64 text-sm transition-all"
                            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                    {/* 🌟 ফিল্টার এখন Role Name দিয়ে হচ্ছে */}
                    <select 
                        className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 outline-none cursor-pointer"
                        onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
                    >
                        <option value="All">All Roles</option>
                        <option value="Admin">Admin</option>
                        <option value="Instructor">Instructor</option>
                        <option value="Student">Student</option>
                    </select>
                    <select 
                        className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 outline-none cursor-pointer"
                        onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                    >
                        <option value="All">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Pending">Pending</option>
                        <option value="Suspended">Suspended</option>
                    </select>
                </div>
            </div>

            {/* User Data Table */}
            <GlassCard className="overflow-hidden border-none shadow-xl bg-white/50 dark:bg-gray-900/50">
                <div className="overflow-x-auto min-h-[400px]">
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
                                <tr><td colSpan="4" className="p-10 text-center animate-pulse">Loading...</td></tr>
                            ) : currentUsers.map(user => (
                                <tr key={user.id} className="hover:bg-white dark:hover:bg-gray-800/50 transition-all">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold shadow-sm">
                                                {(user.full_name || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold dark:text-white text-sm">{user.full_name}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {/* 🌟 সরাসরি role_name ব্যবহার করা হচ্ছে */}
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getRoleBadgeColors(user.role_name)}`}>
                                            {user.role_name}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                            user.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 
                                            user.status === 'Pending' ? 'bg-amber-100 text-amber-600 animate-pulse' : 'bg-red-100 text-red-600'
                                        }`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            {user.status === 'Pending' && (
                                                <button onClick={() => updateStatus(user.id, 'Active')} className="p-2 bg-emerald-50 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"><CheckCircle size={16} /></button>
                                            )}
                                            {user.status === 'Active' && (
                                                <button onClick={() => updateStatus(user.id, 'Suspended')} className="p-2 bg-orange-50 text-orange-500 rounded-lg hover:bg-orange-500 hover:text-white transition-all"><UserMinus size={16} /></button>
                                            )}
                                            
                                            {/* Edit Button */}
                                            <button 
                                                onClick={() => { 
                                                    // 🌟 role_name কে ID তে কনভার্ট করে ফর্মে পাঠানো হচ্ছে
                                                    const roleMap = { 'Admin': 1, 'Instructor': 2, 'Student': 3 };
                                                    setEditForm({ 
                                                        ...user, 
                                                        role_id: roleMap[user.role_name] || 3 
                                                    }); 
                                                    setIsEditModalOpen(true); 
                                                }} 
                                                className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-sky-500 hover:text-white transition-all ml-2"
                                            >
                                                <Edit size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            {/* 🌟 Edit Profile Modal */}
            <AnimatePresence>
                {isEditModalOpen && editForm && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800"
                        >
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                <h3 className="text-lg font-black dark:text-white flex items-center"><Edit className="mr-2 text-sky-500" size={20} /> Edit User</h3>
                                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-red-500"><X size={24} /></button>
                            </div>
                            
                            <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Full Name</label>
                                    <input type="text" required value={editForm.full_name || ''} onChange={(e) => setEditForm({...editForm, full_name: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Email Address</label>
                                    <input type="email" required value={editForm.email || ''} onChange={(e) => setEditForm({...editForm, email: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Assign Role</label>
                                    <select value={editForm.role_id} onChange={(e) => setEditForm({...editForm, role_id: Number(e.target.value)})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500">
                                        <option value={1}>Admin</option>
                                        <option value={2}>Instructor</option>
                                        <option value={3}>Student</option>
                                    </select>
                                </div>
                                
                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-3 bg-gray-100 font-bold rounded-xl hover:bg-gray-200">Cancel</button>
                                    <button type="submit" disabled={updateLoading} className="flex-1 py-3 bg-sky-500 text-white font-bold rounded-xl shadow-lg shadow-sky-500/30 disabled:opacity-50">Save Changes</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}