"use client";

import { Building, Save, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function CompanyManagement() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Route Protection
    useEffect(() => {
        if (!authLoading && user?.role !== "superadmin") {
            router.push("/");
        }
    }, [user, authLoading, router]);

    if (authLoading || (user?.role !== "superadmin")) return null;

    return (
        <div className="space-y-6 max-w-2xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">회사관리</h1>
                    <p className="text-muted-foreground text-sm mt-1">회사 기본 정보 및 정책을 설정합니다.</p>
                </div>
                <Link
                    href="/admin/company/new"
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20"
                >
                    <Plus className="h-4 w-4" />
                    회사추가
                </Link>
            </div>

            <div className="glass-card rounded-xl p-6 border border-border">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                    <div className="h-16 w-16 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground border border-border">
                        <Building className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-lg font-bold text-foreground">망고슬래브</h2>
                        <p className="text-sm text-muted-foreground">엔터프라이즈 플랜 이용 중</p>
                    </div>
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20"
                    >
                        정보 수정
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">회사명</label>
                        <p className="text-foreground mt-1">망고슬래브</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">사업자 등록번호</label>
                            <p className="text-foreground mt-1">123-45-67890</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">대표 전화</label>
                            <p className="text-foreground mt-1">02-1234-5678</p>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">주소</label>
                        <p className="text-foreground mt-1">서울시 강남구 테헤란로...</p>
                    </div>
                </div>
            </div>

            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="회사 정보 수정">
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsEditModalOpen(false); }}>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">회사명</label>
                        <input
                            type="text"
                            defaultValue="망고슬래브"
                            className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">사업자 등록번호</label>
                            <input
                                type="text"
                                defaultValue="123-45-67890"
                                className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">대표 전화</label>
                            <input
                                type="text"
                                defaultValue="02-1234-5678"
                                className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">주소</label>
                        <input
                            type="text"
                            defaultValue="서울시 강남구 테헤란로..."
                            className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-6 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg text-sm font-medium transition-colors border border-border">취소</button>
                        <button type="submit" className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20">저장하기</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
