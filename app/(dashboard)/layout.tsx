import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { MobileMenuProvider } from "@/context/MobileMenuContext";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <MobileMenuProvider>
            <div className="min-h-screen bg-background text-foreground flex">
                <Sidebar />
                {/* Main Content Area - Shifted Right for Sidebar */}
                <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
                    <Header />
                    <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                        <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </MobileMenuProvider>
    );
}
