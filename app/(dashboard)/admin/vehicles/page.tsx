"use client";

import { Search, Plus, Car, Edit, Trash, ToggleRight, ToggleLeft } from "lucide-react";
import { useState, useEffect } from "react";
import Modal from "@/components/Modal";

import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, Timestamp } from "firebase/firestore";

// Mock Data
const vehicles = [
    { id: 1, model: "쏘렌토", plate: "195하4504", year: "2023", fuel: "가솔린", parkingRecord: true, department: "망고슬래브" },
];

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// ...

export default function VehicleManagement() {
    const { user, isLoading: authLoading } = useAuth(); // Rename isLoading to avoid conflict or use alias
    const router = useRouter();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [vehicleList, setVehicleList] = useState<any[]>(vehicles);
    const [isLoading, setIsLoading] = useState(true);

    // Route Protection
    useEffect(() => {
        if (!authLoading && user?.role !== "superadmin") {
            router.push("/"); // Redirect unauthorized users
        }
    }, [user, authLoading, router]);

    if (authLoading || (user?.role !== "superadmin")) return null; // Or unauthorized component

    // Sync from Firestore
    useEffect(() => {
        const q = query(collection(db, "vehicles"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data: any[] = [];
            snapshot.forEach((doc) => {
                data.push({ ...doc.data(), id: doc.id });
            });
            setVehicleList(data.length > 0 ? data : vehicles);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleDelete = async (id: string | number) => {
        if (typeof id === 'string') {
            await deleteDoc(doc(db, "vehicles", id));
        } else {
            setVehicleList(vehicleList.filter(v => v.id !== id));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">차량관리</h1>
                    <p className="text-muted-foreground text-sm mt-1">등록된 차량 정보를 수정하거나 새로운 차량을 등록합니다.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20"
                >
                    <Plus className="h-4 w-4" />
                    차량 등록
                </button>
            </div>

            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="새 차량 등록">
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsAddModalOpen(false); }}>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">차종</label>
                            <input type="text" required placeholder="예: 쏘렌토" className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">번호판</label>
                            <input type="text" required placeholder="예: 12가3456" className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">연식</label>
                            <input type="text" required placeholder="예: 2023" className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">연료</label>
                            <select required className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors">
                                <option value="">선택</option>
                                <option>가솔린</option>
                                <option>디젤</option>
                                <option>하이브리드</option>
                                <option>전기</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">부서/용도</label>
                        <input type="text" placeholder="예: 영업팀" className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors" />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg text-sm font-medium transition-colors border border-border">취소</button>
                        <button type="submit" className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20">등록하기</button>
                    </div>
                </form>
            </Modal>

            {/* Filter Bar */}
            <div className="glass-card rounded-xl p-4 flex items-center justify-between">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="차종, 번호판 검색..."
                        className="w-full pl-9 pr-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                </div>
                <div className="text-sm text-muted-foreground">
                    총 <span className="text-foreground font-bold">{vehicleList.length}</span>대 등록됨
                </div>
            </div>

            {/* Table */}
            <div className="glass-card rounded-xl overflow-hidden border border-border">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-secondary/50 text-muted-foreground uppercase text-xs font-medium">
                            <tr>
                                <th className="px-6 py-4 min-w-[200px]">차량정보</th>
                                <th className="px-6 py-4 min-w-[150px] whitespace-nowrap">연식/연료</th>
                                <th className="px-6 py-4 min-w-[120px] whitespace-nowrap">부서/용도</th>
                                <th className="px-6 py-4 text-center min-w-[120px] whitespace-nowrap">주차위치 기록</th>
                                <th className="px-6 py-4 text-right min-w-[80px]">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {vehicleList.map((v) => (
                                <tr key={v.id} className="hover:bg-secondary/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                <Car className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-foreground">{v.model}</div>
                                                <div className="text-xs text-muted-foreground">{v.plate}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                                        {v.year}년식 <span className="text-muted-foreground mx-1">|</span> {v.fuel}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded-full bg-secondary text-muted-foreground text-xs border border-border">
                                            {v.department}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button className={`flex items-center gap-2 mx-auto text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${v.parkingRecord ? 'bg-primary/10 text-primary border-primary/20' : 'bg-secondary text-muted-foreground border-border'
                                            }`}>
                                            {v.parkingRecord ? (
                                                <>
                                                    <ToggleRight className="h-4 w-4" /> 사용 중
                                                </>
                                            ) : (
                                                <>
                                                    <ToggleLeft className="h-4 w-4" /> 미사용
                                                </>
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-2 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors">
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(v.id)}
                                                className="p-2 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive transition-colors"
                                            >
                                                <Trash className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
