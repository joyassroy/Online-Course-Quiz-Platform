import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import Navbar from '@/components/shared/Navbar'; // এইটা ইমপোর্ট করো
import Footer from '@/components/shared/Footer';
import { Toaster } from 'react-hot-toast';
const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body suppressHydrationWarning className={inter.className}>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                    
                    {/* 🌟 এখানে নেভবারটা বসাও যাতে সব পেজে এটা দেখা যায় */}
                    <Navbar />

                    {/* মেইন কন্টেন্ট যাতে নেভবারের নিচে না ঢাকা পড়ে তাই pt-16 (padding-top) দাও */}
                    <main className="pt-16 min-h-screen bg-slate-50 dark:bg-gray-950 transition-colors duration-300">
                         <Toaster 
                    position="top-center" 
                    toastOptions={{
                        duration: 3000,
                        style: {
                            background: '#333',
                            color: '#fff',
                            fontWeight: 'bold',
                            borderRadius: '10px'
                        },
                        success: {
                            iconTheme: { primary: '#10B981', secondary: '#fff' },
                        },
                        error: {
                            iconTheme: { primary: '#EF4444', secondary: '#fff' },
                        },
                    }} 
                />
                        {children}
                    </main>
                    <Footer />
                </ThemeProvider>
            </body>
        </html>
    );
}