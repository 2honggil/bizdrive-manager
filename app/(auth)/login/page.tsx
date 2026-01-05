"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2, Car } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("hongilee@mangoslab.com");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const success = await login(email, password);
            if (success) {
                router.push("/");
            } else {
                setError("이메일 또는 비밀번호가 올바르지 않습니다.");
            }
        } catch (err) {
            setError("로그인 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative z-10 w-full max-w-md p-4">
            <div className="glass-card rounded-2xl p-8 shadow-2xl">
                <div className="mb-8 text-center">
                    <div className="mx-auto h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground mb-4 shadow-lg shadow-primary/20">
                        <Car className="h-7 w-7" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">BizDrive Manager</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        차량 관리의 새로운 기준
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            이메일
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            className="w-full rounded-lg border border-input bg-secondary/50 px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                비밀번호
                            </label>
                        </div>
                        <input
                            id="password"
                            type="password"
                            required
                            className="w-full rounded-lg border border-input bg-secondary/50 px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div className="text-xs text-destructive bg-destructive/10 p-2 rounded border border-destructive/20">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "로그인"}
                    </button>
                </form>

                <div className="mt-6 text-center text-xs text-muted-foreground">
                    <p>Mock Credentials: 8493jis55&</p>
                </div>
            </div>
        </div>
    );
}
