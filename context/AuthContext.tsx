"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs, doc, setDoc } from "firebase/firestore";

// Define User Type
type User = {
    email: string;
    role: "superadmin" | "admin" | "user";
    name: string;
    uid?: string;
};

// Define Context Type
type AuthContextType = {
    user: User | null;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    // Fetch user details from Firestore to get role
                    const q = query(collection(db, "users"), where("email", "==", firebaseUser.email));
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        const userDoc = querySnapshot.docs[0].data();
                        setUser({
                            email: firebaseUser.email!,
                            role: userDoc.role || "user",
                            name: userDoc.name || firebaseUser.displayName || "Unknown",
                            uid: firebaseUser.uid
                        });
                    } else {
                        // Auto-create Super Admin if it's the specific email
                        if (firebaseUser.email === "hongilee@mangoslab.com") {
                            const newUser = {
                                email: firebaseUser.email,
                                role: "superadmin",
                                name: "이홍길",
                                department: "망고슬래브",
                                status: "active",
                                joinedAt: new Date().toISOString()
                            };
                            await setDoc(doc(db, "users", firebaseUser.uid), newUser);
                            setUser({
                                email: firebaseUser.email!,
                                role: "superadmin",
                                name: "이홍길",
                                uid: firebaseUser.uid
                            });
                        } else {
                            // Fallback for other users
                            setUser({
                                email: firebaseUser.email!,
                                role: "user",
                                name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || "User",
                                uid: firebaseUser.uid
                            });
                        }
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    // Fallback even on error
                    setUser({
                        email: firebaseUser.email!,
                        role: "user",
                        name: firebaseUser.displayName || "User",
                        uid: firebaseUser.uid
                    });
                }
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Route Protection
    useEffect(() => {
        if (!isLoading && !user && pathname !== "/login") {
            router.push("/login");
        }
        if (!isLoading && user && pathname === "/login") {
            router.push("/");
        }
    }, [isLoading, user, pathname, router]);

    const login = async (email: string, password: string) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            // Optimistically update user state for immediate feedback
            setUser({
                email: userCredential.user.email!,
                role: "user", // Will be updated by onAuthStateChanged listener
                name: userCredential.user.displayName || "User",
                uid: userCredential.user.uid
            });
            return { success: true };
        } catch (error: any) {
            console.error("Login failed:", error);
            const errorCode = error.code;
            const errorMessage = error.message;

            // Auto-create demo accounts if they don't exist
            if (errorCode === 'auth/user-not-found' || errorCode === 'auth/invalid-credential' || errorCode === 'auth/wrong-password') {
                if ((email === "hongilee@mangoslab.com" && password === "8493jis55&") ||
                    (email === "user@example.com" && password === "password")) {
                    try {
                        const newUserCredential = await createUserWithEmailAndPassword(auth, email, password);
                        setUser({
                            email: newUserCredential.user.email!,
                            role: "user",
                            name: newUserCredential.user.displayName || "User",
                            uid: newUserCredential.user.uid
                        });
                        return { success: true };
                    } catch (createError: any) {
                        console.error("Auto-creation failed:", createError);
                        return { success: false, error: `Auto-create failed: ${createError.code}` };
                    }
                }
            }
            return { success: false, error: `${errorCode}: ${errorMessage}` };
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            router.push("/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {isLoading ? (
                <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white">
                    <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
                    <p className="text-sm font-medium text-gray-400 animate-pulse">시스템 초기화 중...</p>
                </div>
            ) : (
                children
            )}
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
