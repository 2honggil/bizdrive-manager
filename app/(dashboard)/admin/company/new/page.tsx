"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function NewCompanyPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        businessId: "",
        phone: "",
        address: "",
        manager: "",
        email: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await addDoc(collection(db, "companies"), {
                ...formData,
                createdAt: serverTimestamp()
            });

            alert("회사가 성공적으로 등록되었습니다.");
            router.push("/admin/company");
        } catch (error) {
            console.error(error);
            alert("회사 등록 중 오류가 발생했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/admin/company" className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">회사 추가</h1>
                    <p className="text-muted-foreground text-sm mt-1">새로운 회사를 시스템에 등록합니다.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="glass-card rounded-xl p-6 border border-border space-y-6">
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 border-b border-border pb-2">기본 정보</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">회사명 <span className="text-red-500">*</span></label>
                            <input
                                required
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="(주)망고슬래브"
                                className="w-full px-4 py-2 bg-secondary/30 border border-input rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">사업자 등록번호 <span className="text-red-500">*</span></label>
                            <input
                                required
                                name="businessId"
                                value={formData.businessId}
                                onChange={handleChange}
                                placeholder="000-00-00000"
                                className="w-full px-4 py-2 bg-secondary/30 border border-input rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">대표 전화 <span className="text-red-500">*</span></label>
                        <input
                            required
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="02-1234-5678"
                            className="w-full px-4 py-2 bg-secondary/30 border border-input rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">주소 <span className="text-red-500">*</span></label>
                        <input
                            required
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="서울시 강남구..."
                            className="w-full px-4 py-2 bg-secondary/30 border border-input rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                </div>

                <div className="space-y-4 pt-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 border-b border-border pb-2">담당자 정보 (선택)</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">담당자명</label>
                            <input
                                name="manager"
                                value={formData.manager}
                                onChange={handleChange}
                                placeholder="홍길동"
                                className="w-full px-4 py-2 bg-secondary/30 border border-input rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">이메일</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="manager@example.com"
                                className="w-full px-4 py-2 bg-secondary/30 border border-input rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-6 border-t border-border mt-6">
                    <Link
                        href="/admin/company"
                        className="px-6 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg text-sm font-medium transition-colors border border-border"
                    >
                        취소
                    </Link>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "처리 중..." : "회사 등록"}
                    </button>
                </div>
            </form>
        </div>
    );
}
