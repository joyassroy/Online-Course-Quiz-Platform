"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '@/utils/api';
import toast from 'react-hot-toast'; // 🌟 Toast ইমপোর্ট করা হলো
import GlassCard from '@/components/ui/GlassCard';
import { ShieldCheck, Save, CheckSquare, Square, RefreshCw, AlertCircle } from 'lucide-react';

const MODULES = ['Courses', 'Lessons', 'Quizzes', 'Users', 'Enrollments', 'Reports'];

export default function RolePermissions() {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRole, setSelectedRole] = useState(null);
    const [permissionsState, setPermissionsState] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/roles');
            if (response.data.success) {
                setRoles(response.data.data);
                if (response.data.data.length > 0) {
                    handleSelectRole(response.data.data[0]);
                }
            }
        } catch (error) {
            toast.error("Failed to load roles.");
            console.error("Fetch Roles Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectRole = (role) => {
        setSelectedRole(role);
        
        const initialPermissions = MODULES.map(moduleName => {
            const existing = role.permissions?.find(p => p.module_name === moduleName);
            return {
                module_name: moduleName,
                can_view: existing ? existing.can_view === 1 : false,
                can_create: existing ? existing.can_create === 1 : false,
                can_edit: existing ? existing.can_edit === 1 : false,
                can_delete: existing ? existing.can_delete === 1 : false,
            };
        });
        
        setPermissionsState(initialPermissions);
    };

    const togglePermission = (moduleName, action) => {
        setPermissionsState(prev => prev.map(p => 
            p.module_name === moduleName 
                ? { ...p, [action]: !p[action] } 
                : p
        ));
    };

    const handleSavePermissions = async () => {
        if (!selectedRole) return;
        setIsSaving(true);
        const toastId = toast.loading(`Saving permissions for ${selectedRole.role_name}...`); // 🌟 Loading Toast
        
        try {
            const response = await api.put(`/admin/roles/${selectedRole.id}/permissions`, {
                role_name: selectedRole.role_name,
                permissions: permissionsState
            });
            
            if (response.data.success) {
                toast.success("Permissions Updated Successfully!", { id: toastId }); // 🌟 Success Toast
                fetchRoles(); 
            }
        } catch (error) {
            toast.error("Failed to update permissions.", { id: toastId }); // 🌟 Error Toast
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-[80vh]">
                <RefreshCw className="animate-spin text-sky-500 mb-4" size={40} />
                <p className="text-gray-500 font-bold tracking-widest uppercase text-sm animate-pulse">Loading Matrix...</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black dark:text-white flex items-center tracking-tight">
                        <ShieldCheck className="mr-3 text-sky-500 shrink-0" size={32} /> Role Matrix
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Configure dynamic access control for different roles.</p>
                </div>
                
                {selectedRole && (
                    <button 
                        onClick={handleSavePermissions} disabled={isSaving}
                        className="w-full md:w-auto justify-center px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-black rounded-xl shadow-lg shadow-sky-500/30 transition-all flex items-center disabled:opacity-50"
                    >
                        {isSaving ? <RefreshCw className="animate-spin mr-2" size={20} /> : <Save className="mr-2" size={20} />}
                        {isSaving ? 'Saving...' : 'Save Matrix'}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
                
                {/* 🌟 Left Sidebar: Roles List */}
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1 md:pl-2">Available Roles</h3>
                    {/* 📱 Mobile: Roles horizontal scrollable list, Desktop: Stacked list */}
                    <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-2 lg:gap-3 pb-2 lg:pb-0 custom-scrollbar">
                        {roles.map(role => (
                            <button
                                key={role.id}
                                onClick={() => handleSelectRole(role)}
                                className={`whitespace-nowrap lg:whitespace-normal text-left px-5 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold transition-all border ${
                                    selectedRole?.id === role.id 
                                        ? 'bg-sky-500 text-white border-sky-500 shadow-md shadow-sky-500/20' 
                                        : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-sky-300'
                                }`}
                            >
                                {role.role_name}
                            </button>
                        ))}
                    </div>
                    
                    <div className="hidden lg:flex p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-2xl items-start gap-3 mt-6">
                        <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                        <p className="text-xs font-medium text-amber-700 dark:text-amber-400 leading-relaxed">
                            Changes made here will instantly affect what users in this role can see and do. Please assign carefully.
                        </p>
                    </div>
                </div>

                {/* 🌟 Right Section: Permission Matrix */}
                <div className="lg:col-span-3">
                    <GlassCard className="overflow-hidden border-none shadow-xl bg-white/50 dark:bg-gray-900/50">
                        <div className="p-4 md:p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                            <h2 className="text-lg md:text-xl font-black dark:text-white">
                                Editing: <span className="text-sky-500">{selectedRole?.role_name}</span>
                            </h2>
                        </div>
                        
                        {/* 📱 Mobile View (Card Layout per Module) */}
                        <div className="md:hidden flex flex-col p-4 gap-4">
                            {permissionsState.map((perm, idx) => (
                                <div key={perm.module_name} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                    <h3 className="font-black text-gray-900 dark:text-white text-lg mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                                        {perm.module_name}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                                        {['can_view', 'can_create', 'can_edit', 'can_delete'].map(action => {
                                            const labels = { can_view: 'View', can_create: 'Create', can_edit: 'Edit', can_delete: 'Delete' };
                                            const colors = { can_view: 'text-sky-500', can_create: 'text-emerald-500', can_edit: 'text-amber-500', can_delete: 'text-red-500' };
                                            
                                            return (
                                                <button 
                                                    key={action}
                                                    onClick={() => togglePermission(perm.module_name, action)}
                                                    className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                                                        perm[action] 
                                                            ? `bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 ${colors[action]}` 
                                                            : 'bg-transparent border-transparent text-gray-400'
                                                    }`}
                                                >
                                                    <span className={`text-xs font-bold uppercase tracking-wide ${perm[action] ? 'opacity-100' : 'opacity-60'}`}>
                                                        {labels[action]}
                                                    </span>
                                                    {perm[action] ? <CheckSquare size={20} /> : <Square size={20} />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 💻 Desktop View (Table Layout) */}
                        <div className="hidden md:block overflow-x-auto min-h-[400px]">
                            <table className="w-full text-left">
                                <thead className="bg-gray-100/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                                    <tr>
                                        <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest w-1/3">Modules</th>
                                        <th className="p-4 text-xs font-black text-center text-sky-600 uppercase tracking-widest">View</th>
                                        <th className="p-4 text-xs font-black text-center text-emerald-600 uppercase tracking-widest">Create</th>
                                        <th className="p-4 text-xs font-black text-center text-amber-600 uppercase tracking-widest">Edit</th>
                                        <th className="p-4 text-xs font-black text-center text-red-600 uppercase tracking-widest">Delete</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                                    {permissionsState.map((perm, idx) => (
                                        <motion.tr 
                                            key={perm.module_name} 
                                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                                            className="hover:bg-white dark:hover:bg-gray-800/50 transition-all"
                                        >
                                            <td className="p-4 font-bold dark:text-white border-r border-gray-100 dark:border-gray-800/50">
                                                {perm.module_name}
                                            </td>
                                            
                                            {/* Columns for View, Create, Edit, Delete */}
                                            {['can_view', 'can_create', 'can_edit', 'can_delete'].map(action => {
                                                const colors = { can_view: 'text-sky-500', can_create: 'text-emerald-500', can_edit: 'text-amber-500', can_delete: 'text-red-500' };
                                                return (
                                                    <td key={action} className="p-4 text-center">
                                                        <button 
                                                            onClick={() => togglePermission(perm.module_name, action)}
                                                            className={`p-2 rounded-lg transition-all ${
                                                                perm[action] 
                                                                    ? `${colors[action]} hover:bg-gray-50 dark:hover:bg-gray-800` 
                                                                    : 'text-gray-300 dark:text-gray-600 hover:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                            }`}
                                                        >
                                                            {perm[action] ? <CheckSquare size={24} /> : <Square size={24} />}
                                                        </button>
                                                    </td>
                                                );
                                            })}
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}