"use client";

import { Search, Plus, Car, Edit, Trash, ToggleRight, ToggleLeft } from "lucide-react";
import { useState, useEffect } from "react";
import Modal from "@/components/Modal";

import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp, serverTimestamp, setDoc } from "firebase/firestore";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function VehicleManagement() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [vehicleList, setVehicleList] = useState<any[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const [newVehicle, setNewVehicle] = useState({
        model: "",
        plate: "",
        year: "",
        fuel: "",
        department: "",
        company: "",
        parkingRecord: true
    });

    // Route Protection
    useEffect(() => {
        if (!authLoading && user?.role !== "superadmin") {
            router.push("/");
        }
    }, [user, authLoading, router]);

    // Sync from Firestore
    useEffect(() => {
        const qv = query(collection(db, "vehicles"));
        const unsubVehicles = onSnapshot(qv, (snapshot) => {
            const data: any[] = [];
            snapshot.forEach((doc) => {
                data.push({ ...doc.data(), id: doc.id });
            });
            setVehicleList(data);
            setIsLoading(false);
        });

        const qc = query(collection(db, "companies"));
        const unsubCompanies = onSnapshot(qc, (snapshot) => {
            const data: any[] = [];
            snapshot.forEach((doc) => {
                data.push({ ...doc.data(), id: doc.id });
            });
            setCompanies(data);
            // Default company for new vehicle if not set
            if (data.length > 0) {
                setNewVehicle(prev => ({ ...prev, company: data[0].name }));
            }
        });

        return () => {
            unsubVehicles();
            unsubCompanies();
        };
    }, []);

    const handleAddVehicle = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        try {
            await addDoc(collection(db, "vehicles"), {
                ...newVehicle,
                createdAt: serverTimestamp()
            });
            console.log("Vehicle added successfully");
            setNewVehicle({ model: "", plate: "", year: "", fuel: "", department: "", company: companies[0]?.name || "", parkingRecord: true });
            setIsAddModalOpen(false);
            alert("차량이 성공적으로 등록되었습니다.");
        } catch (error) {
            console.error("Error adding vehicle:", error);
            alert("차량 등록 중 오류가 발생했습니다: " + (error as any).message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUpdateVehicle = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        console.log("Attempting to update vehicle:", selectedVehicle);
        try {
            const vehicleRef = doc(db, "vehicles", selectedVehicle.id);
            const { id, ...dataToSave } = selectedVehicle; // Remove id from data
            await setDoc(vehicleRef, {
                ...dataToSave,
                updatedAt: serverTimestamp()
            }, { merge: true });
            console.log("Vehicle updated successfully");
            setIsEditModalOpen(false);
            alert("차량 정보가 성공적으로 수정되었습니다.");
        } catch (error) {
            console.error("Error updating vehicle:", error);
            alert("차량 정보 수정 중 오류가 발생했습니다: " + (error as any).message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("정말 이 차량을 삭제하시겠습니까?")) return;
        try {
            await deleteDoc(doc(db, "vehicles", id));
        } catch (error) {
            console.error(error);
            alert("차량 삭제 중 오류가 발생했습니다.");
        }
    };

    const toggleParkingRecord = async (vehicle: any) => {
        try {
            const vehicleRef = doc(db, "vehicles", vehicle.id);
            await updateDoc(vehicleRef, {
                parkingRecord: !vehicle.parkingRecord
            });
        } catch (error) {
            console.error(error);
        }
    };

    if (authLoading || (user?.role !== "superadmin")) return null;

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

            {/* Add Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="새 차량 등록">
                <form className="space-y-4" onSubmit={handleAddVehicle}>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">차종</label>
                            <input
                                type="text"
                                required
                                placeholder="예: 쏘렌토"
                                value={newVehicle.model}
                                onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                                className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">번호판</label>
                            <input
                                type="text"
                                required
                                placeholder="예: 12가3456"
                                value={newVehicle.plate}
                                onChange={(e) => setNewVehicle({ ...newVehicle, plate: e.target.value })}
                                className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">연식</label>
                            <input
                                type="text"
                                required
                                placeholder="예: 2023"
                                value={newVehicle.year}
                                onChange={(e) => setNewVehicle({ ...newVehicle, year: e.target.value })}
                                className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">연료</label>
                            <select
                                required
                                value={newVehicle.fuel}
                                onChange={(e) => setNewVehicle({ ...newVehicle, fuel: e.target.value })}
                                className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                            >
                                <option value="">선택</option>
                                <option value="가솔린">가솔린</option>
                                <option value="디젤">디젤</option>
                                <option value="하이브리드">하이브리드</option>
                                <option value="전기">전기</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">소속 회사</label>
                            <select
                                required
                                value={newVehicle.company}
                                onChange={(e) => setNewVehicle({ ...newVehicle, company: e.target.value })}
                                className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                            >
                                <option value="">회사 선택</option>
                                {companies.map(c => (
                                    <option key={c.id} value={c.name}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">부서/용도</label>
                            <input
                                type="text"
                                placeholder="예: 영업팀"
                                value={newVehicle.department}
                                onChange={(e) => setNewVehicle({ ...newVehicle, department: e.target.value })}
                                className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg text-sm font-medium transition-colors border border-border">취소</button>
                        <button type="submit" disabled={isProcessing} className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20 disabled:opacity-50">
                            {isProcessing ? "등록 중..." : "등록하기"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            {selectedVehicle && (
                <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="차량 정보 수정">
                    <form className="space-y-4" onSubmit={handleUpdateVehicle}>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">차종</label>
                                <input
                                    type="text"
                                    required
                                    value={selectedVehicle.model}
                                    onChange={(e) => setSelectedVehicle({ ...selectedVehicle, model: e.target.value })}
                                    className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">번호판</label>
                                <input
                                    type="text"
                                    required
                                    value={selectedVehicle.plate}
                                    onChange={(e) => setSelectedVehicle({ ...selectedVehicle, plate: e.target.value })}
                                    className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">연식</label>
                                <input
                                    type="text"
                                    required
                                    value={selectedVehicle.year}
                                    onChange={(e) => setSelectedVehicle({ ...selectedVehicle, year: e.target.value })}
                                    className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">연료</label>
                                <select
                                    required
                                    value={selectedVehicle.fuel}
                                    onChange={(e) => setSelectedVehicle({ ...selectedVehicle, fuel: e.target.value })}
                                    className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                                >
                                    <option value="가솔린">가솔린</option>
                                    <option value="디젤">디젤</option>
                                    <option value="하이브리드">하이브리드</option>
                                    <option value="전기">전기</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">소속 회사</label>
                                <select
                                    required
                                    value={selectedVehicle.company}
                                    onChange={(e) => setSelectedVehicle({ ...selectedVehicle, company: e.target.value })}
                                    className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                                >
                                    <option value="">회사 선택</option>
                                    {companies.map(c => (
                                        <option key={c.id} value={c.name}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">부서/용도</label>
                                <input
                                    type="text"
                                    value={selectedVehicle.department}
                                    onChange={(e) => setSelectedVehicle({ ...selectedVehicle, department: e.target.value })}
                                    className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-border">
                            <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-6 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg text-sm font-medium transition-colors border border-border">취소</button>
                            <button type="submit" disabled={isProcessing} className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20 disabled:opacity-50">
                                {isProcessing ? "저장 중..." : "저장하기"}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

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
                    {isLoading ? (
                        <div className="p-8 text-center text-muted-foreground">로딩 중...</div>
                    ) : (
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
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground border border-border">
                                                            {v.company || "회사 미지정"}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">{v.plate}</span>
                                                    </div>
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
                                            <button
                                                onClick={() => toggleParkingRecord(v)}
                                                className={`flex items-center gap-2 mx-auto text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${v.parkingRecord ? 'bg-primary/10 text-primary border-primary/20' : 'bg-secondary text-muted-foreground border-border'
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
                                                <button
                                                    onClick={() => { setSelectedVehicle(v); setIsEditModalOpen(true); }}
                                                    className="p-2 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors"
                                                >
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
                    )}
                </div>
            </div>
        </div>
    );
}
