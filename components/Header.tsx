"use client";

import { Bell, Search, Menu } from "lucide-react";

export default function Header() {
    return (
        <header className="sticky top-0 z-40 w-full h-16 border-b glass flex items-center justify-between px-6">
            {/* Mobile Menu Trigger (Hidden on Desktop) */}
            <button className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground">
                <Menu className="w-6 h-6" />
            </button>

            {/* Breadcrumb / Context */}
            <div className="hidden md:flex items-center gap-2 text-sm">
                <span className="text-muted-foreground font-medium">Workspace</span>
                <span className="text-muted-foreground">/</span>
                <span className="text-foreground font-semibold">망고슬래브</span>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
                <div className="relative hidden sm:block">
                    <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="검색..."
                        className="h-9 w-64 rounded-md border bg-secondary/50 pl-9 pr-4 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-muted-foreground"
                    />
                </div>

                <button className="relative w-9 h-9 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                    <Bell className="w-4 h-4" />
                    <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ring-background"></span>
                </button>
            </div>
        </header>
    );
}
