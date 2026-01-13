"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard, FileText, Calendar, Fuel, MapPin, Wrench,
    Map, ParkingCircle, MessageSquare, BookOpen, Car, Users, Building, LogOut
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useMobileMenu } from "@/context/MobileMenuContext";

const userNavigation = [
    { name: "대시보드", href: "/", icon: LayoutDashboard },
    { name: "차량운행기록", href: "/logs", icon: FileText },
    { name: "차량예약", href: "/reservations", icon: Calendar },
    { name: "주유 및 톨비기록", href: "/fueling", icon: Fuel },
    { name: "차량주차위치", href: "/parking", icon: MapPin },
    { name: "정비기록", href: "/maintenance", icon: Wrench },
    { name: "자주가는곳", href: "/spots", icon: Map },
    { name: "피드백 및 요청", href: "/feedback", icon: MessageSquare },
    { name: "사용설명서", href: "/manual", icon: BookOpen },
];

const adminNavigation = [
    { name: "차량관리", href: "/admin/vehicles", icon: Car },
    { name: "사용자관리", href: "/admin/users", icon: Users },
    { name: "회사관리", href: "/admin/company", icon: Building },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const { isMobileMenuOpen, closeMobileMenu } = useMobileMenu();

    // Safety check for active path
    const isActive = (path: string) => pathname === path || pathname?.startsWith(path + "/");

    return (
        <>
            {/* Mobile Overlay Backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={closeMobileMenu}
                />
            )}

            {/* Sidebar */}
            <div className={`flex flex-col w-64 h-screen fixed left-0 top-0 border-r bg-background z-50 transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                }`}>
                {/* Header / Logo */}
                <div className="h-16 flex items-center px-6 border-b">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                            <Car className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">BizDrive</span>
                    </div>
                </div>

                {/* Scroll Area */}
                <div className="flex-1 overflow-y-auto py-6 px-3 space-y-8">
                    {/* Main Menu */}
                    <div className="space-y-1">
                        <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            사용자 메뉴
                        </h3>
                        {userNavigation.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={closeMobileMenu}
                                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 group ${isActive(item.href)
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                                    }`}
                            >
                                <item.icon className="w-4 h-4" />
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* Admin Section */}
                    {(user?.role === "admin" || user?.role === "superadmin") && (
                        <div className="space-y-1">
                            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                관리자 메뉴
                            </h3>
                            {adminNavigation.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={closeMobileMenu}
                                    className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 group ${isActive(item.href)
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                                        }`}
                                >
                                    <item.icon className="w-4 h-4" />
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* User Footer */}
                <div className="p-4 border-t bg-background">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-sm font-bold border border-border">
                            {user?.name?.[0] || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user?.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="flex w-full items-center justify-center gap-2 rounded-md border bg-card px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-colors"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        로그아웃
                    </button>
                </div>
            </div>
        </>
    );
}
