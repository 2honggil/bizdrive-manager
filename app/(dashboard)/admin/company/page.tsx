"use client";

import { Building, Save, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";

export default function CompanyManagement() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [companyInfo, setCompanyInfo] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [editData, setEditData] = useState<any>(null);

    // Route Protection
    useEffect(() => {
        if (!authLoading && user?.role !== "superadmin") {
            router.push("/");
        }
    }, [user, authLoading, router]);

    // Sync from Firestore (assuming single company document for now)
    useEffect(() => {
        console.log("Listening to companies/main...");
        const unsubscribe = onSnapshot(doc(db, "companies", "main"), (docSnap) => {
            if (docSnap.exists()) {
                console.log("Company data found:", docSnap.data());
                setCompanyInfo({ ...docSnap.data(), id: docSnap.id });
                setEditData({ ...docSnap.data(), id: docSnap.id });
            } else {
                console.log("Company data NOT found at companies/main");
                setCompanyInfo({ name: "회사명 설정 필요", businessId: "-", phone: "-", address: "-" });
                setEditData({ name: "", businessId: "", phone: "", address: "" });
            }
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        console.log("Attempting to save company data:", editData);
        try {
            const companyRef = doc(db, "companies", "main");
            const { id, ...dataToSave } = editData;

            // Clean data (ensure no undefined)
            const cleanedData = Object.fromEntries(
                Object.entries(dataToSave).filter(([_, v]) => v !== undefined)
            );

            await setDoc(companyRef, {
                ...cleanedData,
                updatedAt: serverTimestamp()
            }, { merge: true });

            console.log("Company data saved successfully");
            setIsEditModalOpen(false);
            alert("회사 정보가 성공적으로 저장되었습니다.");
        } catch (error) {
            console.error("Error saving company data:", error);
            alert("회사 정보 저장 중 오류가 발생했습니다: " + (error as any).message);
        } finally {
            setIsProcessing(false);
        }
    };

    if (authLoading || (user?.role !== "superadmin")) return null;

    return (
        <div className="space-y-6 max-w-2xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">회사관리</h1>
                    <p className="text-muted-foreground text-sm mt-1">회사 기본 정보 및 정책을 설정합니다.</p>
                </div>
                {/* 
                <Link
                    href="/admin/company/new"
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20"
                >
                    <Plus className="h-4 w-4" />
                    회사추가
                </Link>
                */}
            </div>

            <div className="glass-card rounded-xl p-6 border border-border">
                {isLoading ? (
                    <div className="p-4 text-center text-muted-foreground">로딩 중...</div>
                ) : (
                    <>
                        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                            <div className="h-16 w-16 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground border border-border">
                                <Building className="h-8 w-8" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-lg font-bold text-foreground">{companyInfo?.name}</h2>
                                <p className="text-sm text-muted-foreground">엔터프라이즈 플랜 이용 중</p>
                            </div>
                            <button
                                onClick={() => { setEditData(companyInfo); setIsEditModalOpen(true); }}
                                className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20"
                            >
                                정보 수정
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">회사명</label>
                                <p className="text-foreground mt-1">{companyInfo?.name}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">사업자 등록번호</label>
                                    <p className="text-foreground mt-1">{companyInfo?.businessId}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">대표 전화</label>
                                    <p className="text-foreground mt-1">{companyInfo?.phone}</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">주소</label>
                                <p className="text-foreground mt-1">{companyInfo?.address}</p>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="회사 정보 수정">
                <form className="space-y-4" onSubmit={handleUpdate}>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">회사명</label>
                        <input
                            type="text"
                            required
                            value={editData?.name || ""}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">사업자 등록번호</label>
                            <input
                                type="text"
                                value={editData?.businessId || ""}
                                onChange={(e) => setEditData({ ...editData, businessId: e.target.value })}
                                className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">대표 전화</label>
                            <input
                                type="text"
                                value={editData?.phone || ""}
                                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">주소</label>
                        <input
                            type="text"
                            value={editData?.address || ""}
                            onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                            className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-6 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg text-sm font-medium transition-colors border border-border">취소</button>
                        <button type="submit" disabled={isProcessing} className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20 disabled:opacity-50">
                            {isProcessing ? "저장 중..." : "저장하기"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
