import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import Navbar from '@/components/shared/Navbar'; // এইটা ইমপোর্ট করো

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
                        {children}
                    </main>

                </ThemeProvider>
            </body>
        </html>
    );
}