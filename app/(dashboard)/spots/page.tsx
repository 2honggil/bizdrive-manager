"use client";

import { useState, useEffect } from "react";
import { MapPin, ParkingCircle, Plus, MoreVertical, Edit, Trash, AlertCircle, Loader2 } from "lucide-react";
import Modal from "@/components/Modal";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp, orderBy } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

interface Spot {
    id: string;
    type: 'destination' | 'parking';
    name: string;
    address?: string;
    parkingType?: string;
    note?: string;
    usage?: number;
    createdAt: any;
}

export default function FrequentSpotsPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'destinations' | 'parking'>('destinations');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [spots, setSpots] = useState<Spot[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // For editing
    const [editingSpot, setEditingSpot] = useState<Spot | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        address: "",
        parkingType: "",
        note: ""
    });

    // Sync from Firestore
    useEffect(() => {
        const q = query(collection(db, "frequent_spots"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const spotsData: Spot[] = [];
            querySnapshot.forEach((doc) => {
                spotsData.push({ ...doc.data(), id: doc.id } as Spot);
            });
            setSpots(spotsData);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching spots:", error);
            setError("데이터를 불러오는 중 오류가 발생했습니다.");
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleOpenAddModal = () => {
        setEditingSpot(null);
        setFormData({ name: "", address: "", parkingType: "", note: "" });
        setIsAddModalOpen(true);
    };

    const handleOpenEditModal = (spot: Spot) => {
        setEditingSpot(spot);
        setFormData({
            name: spot.name,
            address: spot.address || "",
            parkingType: spot.parkingType || "",
            note: spot.note || ""
        });
        setIsAddModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            if (editingSpot) {
                // Update
                const spotRef = doc(db, "frequent_spots", editingSpot.id);
                await updateDoc(spotRef, {
                    name: formData.name,
                    address: activeTab === 'destinations' ? formData.address : "",
                    parkingType: activeTab === 'parking' ? formData.parkingType : "",
                    note: activeTab === 'parking' ? formData.note : "",
                });
            } else {
                // Create
                await addDoc(collection(db, "frequent_spots"), {
                    type: activeTab === 'destinations' ? 'destination' : 'parking',
                    name: formData.name,
                    address: activeTab === 'destinations' ? formData.address : "",
                    parkingType: activeTab === 'parking' ? formData.parkingType : "",
                    note: activeTab === 'parking' ? formData.note : "",
                    usage: 0,
                    createdAt: Timestamp.now(),
                    userId: user?.uid || "anonymous"
                });
            }
            setIsAddModalOpen(false);
            setFormData({ name: "", address: "", parkingType: "", note: "" });
        } catch (err) {
            console.error("Error saving spot:", err);
            setError("저장 중 오류가 발생했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("정말 삭제하시겠습니까?")) return;
        try {
            await deleteDoc(doc(db, "frequent_spots", id));
        } catch (err) {
            console.error("Error deleting spot:", err);
            alert("삭제 중 오류가 발생했습니다.");
        }
    };

    const filteredSpots = spots.filter(spot =>
        activeTab === 'destinations' ? spot.type === 'destination' : spot.type === 'parking'
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">자주가는곳 관리</h1>
                    <p className="text-muted-foreground text-sm mt-1">자주 방문하는 목적지와 주차장을 등록하여 입력을 간소화합니다.</p>
                </div>
                <button
                    onClick={handleOpenAddModal}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20"
                >
                    <Plus className="h-4 w-4" />
                    {activeTab === 'destinations' ? '목적지 추가' : '주차장 추가'}
                </button>
            </div>

            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title={editingSpot ? (activeTab === 'destinations' ? '목적지 수정' : '주차장 수정') : (activeTab === 'destinations' ? '목적지 추가' : '주차장 추가')}
            >
                <form className="space-y-4" onSubmit={handleSubmit}>
                    {error && (
                        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-xs text-destructive flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}
                    {activeTab === 'destinations' ? (
                        <>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">장소명</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="예: 본사"
                                    className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">주소</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="서울시 강남구 테헤란로 123"
                                    className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">주차장명</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="예: 본사 지하주차장"
                                    className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">유형</label>
                                <select
                                    required
                                    className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                                    value={formData.parkingType}
                                    onChange={(e) => setFormData({ ...formData, parkingType: e.target.value })}
                                >
                                    <option value="">선택</option>
                                    <option value="실내">실내</option>
                                    <option value="기계식">기계식</option>
                                    <option value="노상">노상</option>
                                    <option value="외부">외부</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">메모</label>
                                <input
                                    type="text"
                                    placeholder="예: B3층 임원 전용 구역"
                                    className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                                    value={formData.note}
                                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                />
                            </div>
                        </>
                    )}
                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg text-sm font-medium transition-colors border border-border">취소</button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
                        >
                            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                            {editingSpot ? '수정하기' : '추가하기'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Tabs */}
            <div className="border-b border-border">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('destinations')}
                        className={`pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === 'destinations'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                            }`}
                    >
                        <MapPin className="h-4 w-4" />
                        자주 가는 목적지
                    </button>
                    <button
                        onClick={() => setActiveTab('parking')}
                        className={`pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === 'parking'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                            }`}
                    >
                        <ParkingCircle className="h-4 w-4" />
                        자주 이용하는 주차장
                    </button>
                </nav>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mb-4" />
                    <p>데이터를 불러오는 중...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredSpots.map(item => (
                        <div key={item.id} className="glass-card p-5 rounded-xl border border-border group hover:border-primary/50 transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <div className={`p-2 rounded-lg ${activeTab === 'destinations' ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                                    {activeTab === 'destinations' ? <MapPin className="h-5 w-5" /> : <ParkingCircle className="h-5 w-5" />}
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleOpenEditModal(item)} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => handleDelete(item.id)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                                        <Trash className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-foreground font-medium">{item.name}</h3>
                                {item.parkingType && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded border border-border text-muted-foreground bg-secondary">{item.parkingType}</span>
                                )}
                            </div>
                            <p className="text-muted-foreground text-sm mt-1">{activeTab === 'destinations' ? item.address : item.note}</p>
                            {activeTab === 'destinations' && (
                                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">누적 방문 {item.usage || 0}회</span>
                                </div>
                            )}
                        </div>
                    ))}

                    <button
                        onClick={handleOpenAddModal}
                        className="border border-dashed border-border rounded-xl p-5 flex flex-col items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-secondary/30 transition-all min-h-[160px]"
                    >
                        <Plus className="h-6 w-6 mb-2" />
                        <span className="text-sm font-medium">새로운 항목 추가</span>
                    </button>
                </div>
            )}
        </div>
    );
}
