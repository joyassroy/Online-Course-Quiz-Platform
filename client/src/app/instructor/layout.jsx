import InstructorSidebar from '@/components/shared/InstructorSidebar'; // পাথ ঠিক করে নিও

export const metadata = {
    title: 'Instructor Dashboard | Creator Studio',
    description: 'Manage your courses, lessons, and quizzes.',
};

export default function InstructorLayout({ children }) {
    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
            {/* 🌟 Left: Fixed Sidebar */}
            <div className="hidden lg:block fixed inset-y-0 left-0 w-64 z-50">
                <InstructorSidebar />
            </div>

            {/* 🌟 Right: Dynamic Content Area */}
            <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
                
                {/* ঐচ্ছিক: এখানে একটা Top Navbar রাখতে পারো মোবাইল মেনু বা নোটিফিকেশনের জন্য */}
                
                {/* মূল পেজগুলো (Dashboard, Courses, etc.) এখানে লোড হবে */}
                <main className="flex-1">
                    {children}
                </main>

            </div>
        </div>
    );
}