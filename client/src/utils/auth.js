import api from './api';

// ইউজার লগইন ফাংশন
export const login = async (email, password) => {
    try {
        const response = await api.post('/auth/login', { email, password });
        
        // টোকেন এবং ইউজার ডেটা লোকাল স্টোরেজে সেভ করা
        if (response.data.success) {
            localStorage.setItem('token', response.data.token);
            // ইউজার কি অ্যাডমিন নাকি স্টুডেন্ট সেটা সেভ করে রাখছি
            localStorage.setItem('user', JSON.stringify(response.data.user)); 
        }
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Login failed' };
    }
};

// লগআউট ফাংশন
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login'; // লগআউট হলে লগইন পেজে পাঠিয়ে দেবে
};

// বর্তমান ইউজারকে পাওয়া
export const getCurrentUser = () => {
    if (typeof window !== 'undefined') {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
    return null;
};