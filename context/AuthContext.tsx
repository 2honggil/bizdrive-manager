"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Define User Type
type User = {
    email: string;
    role: "admin" | "user";
    name: string;
};

// Define Context Type
type AuthContextType = {
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check local storage for persisted session
        const storedUser = localStorage.getItem("bizdrive_user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        // Mock Authentication Logic
        return new Promise<boolean>((resolve) => {
            setTimeout(() => {
                if (email === "hongilee@mangoslab.com" && password === "8493jis55&") {
                    const adminUser: User = { email, role: "admin", name: "홍길동" };
                    setUser(adminUser);
                    localStorage.setItem("bizdrive_user", JSON.stringify(adminUser));
                    resolve(true);
                } else if (email === "user@example.com" && password === "password") {
                    const normalUser: User = { email, role: "user", name: "김철수" };
                    setUser(normalUser);
                    localStorage.setItem("bizdrive_user", JSON.stringify(normalUser));
                    resolve(true);
                } else {
                    resolve(false);
                }
            }, 800); // Simulate network delay
        });
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("bizdrive_user");
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
