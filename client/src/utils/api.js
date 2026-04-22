import axios from 'axios';

// আমাদের ব্যাকএন্ডের বেইস ইউআরএল
const api = axios.create({
    baseURL:process.env.NEXT_PUBLIC_API_URL, 
});

// Request Interceptor: এটি এমন এক দারোয়ান যে প্রতিটি রিকোয়েস্ট যাওয়ার আগে চেক করবে টোকেন আছে কি না। 
// থাকলে অটোমেটিক হেডারে বসিয়ে দেবে, তাই তোমাকে বারবার টোকেন লিখতে হবে না।
api.interceptors.request.use(
    (config) => {
        // লোকাল স্টোরেজ থেকে টোকেন নিচ্ছি
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;