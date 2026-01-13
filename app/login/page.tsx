"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2 } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const result = await login(email, password);

            if (result.success) {
                router.push('/');
            } else {
                setError(result.error || "이메일 또는 비밀번호가 올바르지 않습니다.");
            }
        } catch (err) {
            setError("로그인 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse delay-1000" />
            </div>

            <div className="w-full max-w-md p-8 relative z-10 animate-in fade-in zoom-in duration-500">
                <div className="glass-card rounded-2xl border border-white/10 p-8 shadow-2xl backdrop-blur-xl bg-black/40">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20 shadow-lg shadow-primary/20">
                            <Lock className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">BizDrive Manager</h1>
                        <p className="text-sm text-gray-400">차량 관리 시스템에 오신 것을 환영합니다</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 text-center animate-shake">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-6 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    로그인 중...
                                </>
                            ) : (
                                "로그인"
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-500">
                            계정 문의: <span className="text-primary hover:underline cursor-pointer">IT 지원팀</span>
                        </p>
                    </div>
                </div>

                {/* Demo Credentials Hint */}
                <div className="mt-8 text-center space-y-2 opacity-50 hover:opacity-100 transition-opacity duration-300">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Demo Accounts</p>
                    <div className="flex justify-center gap-4 text-xs text-gray-400">
                        <div className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 cursor-pointer hover:bg-white/10" onClick={() => { setEmail('hongilee@mangoslab.com'); setPassword('8493jis55&'); }}>
                            <span className="font-bold text-primary">Admin:</span> hongilee / 8493jis55&
                        </div>
                        <div className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 cursor-pointer hover:bg-white/10" onClick={() => { setEmail('user@example.com'); setPassword('password'); }}>
                            <span className="font-bold text-blue-400">User:</span> user / password
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
