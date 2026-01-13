"use client";

import Link from "next/link";

import { useState, useEffect } from "react";
import { Search, Filter, Download, Plus, MapPin, Camera, ChevronUp, ChevronDown, ChevronsUp, ChevronsDown, MoreHorizontal, Edit, Trash } from "lucide-react";
import Modal from "@/components/Modal";

import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp } from "firebase/firestore";
import { mockLogs, frequentDestinations } from "@/lib/mockData";

// Define accessible vehicles centrally for this view
const vehicles = [
    { id: 1, name: "쏘렌토 (195하4504)" }
];

export default function VehicleLogs() {
    const [logs, setLogs] = useState<any[]>(mockLogs);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | number | null>(null);
    const [activeMenuId, setActiveMenuId] = useState<string | number | null>(null);

    // Sync from Firestore
    useEffect(() => {
        const q = query(collection(db, "logs"), orderBy("date", "desc"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const logsData: any[] = [];
            querySnapshot.forEach((doc) => {
                logsData.push({ ...doc.data(), id: doc.id });
            });

            // Robust fallback: Always use mockLogs if Firestore is empty
            setLogs(logsData.length > 0 ? logsData : mockLogs);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Filtering State
    const [selectedYear, setSelectedYear] = useState("2026");
    const [selectedVehicle, setSelectedVehicle] = useState("전체");

    // Derived Data
    const uniqueYears = Array.from(new Set(logs.map(log => log.date.split('.')[0]))).sort((a, b) => b.localeCompare(a));
    const uniqueVehicles = Array.from(new Set(logs.map(log => log.car))).sort();

    const filteredLogs = logs.filter(log => {
        const logYear = log.date.split('.')[0];
        const matchYear = selectedYear === "전체" || logYear === selectedYear;
        const matchVehicle = selectedVehicle === "전체" || log.car === selectedVehicle;
        return matchYear && matchVehicle;
    });

    // Initial mileage for the default vehicle
    const initialCar = vehicles.length === 1 ? vehicles[0].name : "";
    const lastLogForInitialCar = initialCar ? logs.find(l => l.car === initialCar) : null;
    const initialKm = lastLogForInitialCar ? lastLogForInitialCar.endKm : 45200;

    // Form state
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        car: initialCar,
        driver: "홍길동",
        purpose: "",
        origin: "본사",
        destination: "",
        startKm: initialCar ? initialKm.toString() : "",
        endKm: initialCar ? initialKm.toString() : "",
        parkingBuilding: "본사 (파미어스몰)",
        parkingDetail: "",
    });
    const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

    const adjustKm = (field: 'startKm' | 'endKm', amount: number) => {
        setFormData(prev => {
            // Use 45200 as a default base for startKm if empty, 45235 for endKm
            const baseValue = field === 'startKm' ? 45200 : 45235;
            const currentVal = prev[field as keyof typeof prev] === "" ? baseValue : parseInt(prev[field as keyof typeof prev] as string);
            let newVal = currentVal + amount;

            // Enforce endKm >= startKm if startKm is set
            if (field === 'endKm' && prev.startKm !== "") {
                const startVal = parseInt(prev.startKm as string);
                if (newVal < startVal) newVal = startVal;
            }

            return {
                ...prev,
                [field]: newVal.toString()
            };
        });
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Resize to max 800px width
                    const MAX_WIDTH = 800;
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    // Compress to JPEG with 0.7 quality
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    setCapturedPhoto(dataUrl);
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const startKm = Number(formData.startKm);
        const endKm = Number(formData.endKm);

        if (endKm <= startKm) {
            alert("도착 주행거리는 출발 주행거리보다 커야 합니다.");
            return;
        }

        if (editingId !== null && typeof editingId === 'string') {
            // Update in Firestore
            const logRef = doc(db, "logs", editingId);
            updateDoc(logRef, {
                date: formData.date.replace(/-/g, '.'),
                car: formData.car || vehicles[0].name,
                driver: formData.driver,
                purpose: formData.purpose,
                route: `${formData.origin} -> ${formData.destination}`,
                startKm: startKm,
                endKm: endKm,
                parking: formData.parkingDetail ? `${formData.parkingBuilding} (${formData.parkingDetail})` : formData.parkingBuilding,
                hasPhoto: !!capturedPhoto,
                photoUrl: capturedPhoto
            }).catch(err => console.error("Error updating document: ", err));
        } else {
            // Add to Firestore
            addDoc(collection(db, "logs"), {
                date: formData.date.replace(/-/g, '.'),
                car: formData.car || vehicles[0].name,
                driver: formData.driver,
                purpose: formData.purpose,
                route: `${formData.origin} -> ${formData.destination}`,
                startKm: startKm,
                endKm: endKm,
                parking: formData.parkingDetail ? `${formData.parkingBuilding} (${formData.parkingDetail})` : formData.parkingBuilding,
                hasPhoto: !!capturedPhoto,
                photoUrl: capturedPhoto,
                createdAt: Timestamp.now()
            }).catch(err => console.error("Error adding document: ", err));
        }

        setIsAddModalOpen(false);

        // Reset form to latest state
        const lastKm = endKm;
        setFormData({
            date: new Date().toISOString().split('T')[0],
            car: vehicles.length === 1 ? vehicles[0].name : "",
            driver: "홍길동",
            purpose: "",
            origin: "본사",
            destination: "",
            startKm: lastKm.toString(),
            endKm: lastKm.toString(),
            parkingBuilding: "본사 (파미어스몰)",
            parkingDetail: "",
        });
        setCapturedPhoto(null);
        setEditingId(null);
    };

    const viewPhoto = (url: string | undefined) => {
        if (url) {
            setSelectedPhoto(url);
            setIsPhotoModalOpen(true);
        }
    };

    const [deletingId, setDeletingId] = useState<string | number | null>(null);

    const handleDelete = async (id: string | number) => {
        if (typeof id === 'string') {
            await deleteDoc(doc(db, "logs", id));
        } else {
            setLogs(logs.filter(log => log.id !== id));
        }
        setDeletingId(null);
        setActiveMenuId(null);
    };

    const handleEdit = (log: any) => {
        setEditingId(log.id);

        // Parse parking string safely
        let parkingBuilding = log.parking;
        let parkingDetail = "";

        // Known complex building names that should be treated as a whole if they match exactly
        const knownComplexBuildings = ["본사 (파미어스몰)"];

        if (knownComplexBuildings.includes(log.parking)) {
            parkingBuilding = log.parking;
            parkingDetail = "";
        } else {
            // Try to split by the *last* occurrence of " (" to handle "Building (Name) (Detail)"
            const lastParenIndex = log.parking.lastIndexOf(' (');
            if (lastParenIndex > -1 && log.parking.endsWith(')')) {
                parkingBuilding = log.parking.substring(0, lastParenIndex);
                parkingDetail = log.parking.substring(lastParenIndex + 2, log.parking.length - 1);
            }
        }

        setFormData({
            date: log.date.replace(/\./g, '-'),
            car: log.car,
            driver: log.driver,
            purpose: log.purpose,
            origin: log.route.split(' -> ')[0] || "본사",
            destination: log.route.split(' -> ')[1] || "",
            startKm: log.startKm.toString(),
            endKm: log.endKm.toString(),
            parkingBuilding,
            parkingDetail,
        });
        setCapturedPhoto(log.photoUrl || null);
        setIsAddModalOpen(true);
        setActiveMenuId(null);
    };

    const handleAddClick = () => {
        setEditingId(null);
        const initialCar = vehicles.length === 1 ? vehicles[0].name : "";
        const lastLogForInitialCar = initialCar ? logs.find(l => l.car === initialCar) : null;
        const initialKm = lastLogForInitialCar ? lastLogForInitialCar.endKm : 45200;

        setFormData({
            date: new Date().toISOString().split('T')[0],
            car: initialCar,
            driver: "홍길동",
            purpose: "",
            origin: "본사",
            destination: "",
            startKm: initialKm.toString(),
            endKm: initialKm.toString(),
            parkingBuilding: "본사 (파미어스몰)",
            parkingDetail: "",
        });
        setCapturedPhoto(null);
        setIsAddModalOpen(true);
    };

    const handleExportCSV = async () => {
        const headers = ["날짜", "차량", "운전자", "목적", "경로", "출발거리(km)", "도착거리(km)", "주행거리(km)", "주차위치"];

        const rows = filteredLogs.map(log => [
            log.date,
            log.car,
            log.driver,
            log.purpose,
            log.route,
            log.startKm.toString(),
            log.endKm.toString(),
            (log.endKm - log.startKm).toString(),
            log.parking
        ]);

        // Create CSV content
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });

        // Use File System Access API for location selection (modern browsers)
        if ('showSaveFilePicker' in window) {
            try {
                const handle = await (window as any).showSaveFilePicker({
                    suggestedName: `차량운행기록_${new Date().toISOString().split('T')[0]}.csv`,
                    types: [{
                        description: 'CSV Files',
                        accept: { 'text/csv': ['.csv'] }
                    }]
                });
                const writable = await handle.createWritable();
                await writable.write(blob);
                await writable.close();
            } catch (err) {
                // User cancelled or error occurred
                console.log('다운로드 취소됨');
            }
        } else {
            // Fallback for older browsers
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `차량운행기록_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">차량운행기록</h1>
                    <p className="text-muted-foreground text-sm mt-1">모든 차량의 운행 상세 내역을 관리합니다.</p>
                </div>
            </div>

            {/* Photo Viewer Modal */}
            <Modal isOpen={isPhotoModalOpen} onClose={() => setIsPhotoModalOpen(false)} title="주차 위치 확인" size="md">
                <div className="flex items-center justify-center p-2">
                    {selectedPhoto && (
                        <img src={selectedPhoto} alt="Parking Location" className="max-w-full h-auto rounded-lg shadow-2xl" />
                    )}
                </div>
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={() => setIsPhotoModalOpen(false)}
                        className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium"
                    >
                        닫기
                    </button>
                </div>
            </Modal>

            {/* Add Record Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="차량 운행기록 추가" size="lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">날짜</label>
                            <input
                                type="date"
                                required
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">차량</label>
                            {vehicles.length === 1 ? (
                                <div className="relative">
                                    <input
                                        type="text"
                                        readOnly
                                        value={vehicles[0].name}
                                        className="w-full px-4 py-2 bg-secondary/30 border border-input rounded-lg text-sm text-foreground focus:outline-none cursor-default"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <span className="text-[10px] px-1.5 py-0.5 bg-secondary text-muted-foreground rounded tracking-tighter">단일 차량</span>
                                    </div>
                                </div>
                            ) : (
                                <select
                                    required
                                    value={formData.car}
                                    onChange={e => {
                                        const selectedCar = e.target.value;
                                        // Find last mileage for this car
                                        const lastLog = logs.find(l => l.car === selectedCar);
                                        const lastKm = lastLog ? lastLog.endKm : 45200; // Default if no record
                                        setFormData({
                                            ...formData,
                                            car: selectedCar,
                                            startKm: lastKm.toString(),
                                            endKm: lastKm.toString() // Initialize end with start
                                        });
                                    }}
                                    className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                                >
                                    <option value="">선택하세요</option>
                                    {vehicles.map(v => (
                                        <option key={v.id} value={v.name}>{v.name}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">운전자</label>
                            <input
                                type="text"
                                required
                                value={formData.driver}
                                onChange={e => setFormData({ ...formData, driver: e.target.value })}
                                placeholder="이름 입력"
                                className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">목적</label>
                            <select
                                required
                                value={formData.purpose}
                                onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                                className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors appearance-none"
                            >
                                <option value="">선택하세요</option>
                                <option value="외근">외근</option>
                                <option value="출장">출장</option>
                                <option value="기타">기타</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 text-left">
                            <label className="text-sm font-medium text-foreground">출발지</label>
                            <input
                                type="text"
                                list="spots-list"
                                required
                                value={formData.origin}
                                onChange={e => setFormData({ ...formData, origin: e.target.value })}
                                placeholder="예: 본사"
                                className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <div className="space-y-2 text-left">
                            <label className="text-sm font-medium text-foreground">목적지</label>
                            <input
                                type="text"
                                list="spots-list"
                                required
                                value={formData.destination}
                                onChange={e => setFormData({ ...formData, destination: e.target.value })}
                                placeholder="예: 강남역"
                                className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <datalist id="spots-list">
                            <option value="본사" />
                            {frequentDestinations.map(spot => (
                                <option key={spot.id} value={spot.name} />
                            ))}
                        </datalist>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground flex items-center justify-between">
                                출발 주행거리 (km)
                                <span className="text-[10px] px-1.5 py-0.5 bg-secondary text-muted-foreground rounded tracking-tighter">자동 입력</span>
                            </label>
                            <div className="relative group">
                                <input
                                    type="number"
                                    readOnly
                                    required
                                    value={formData.startKm}
                                    placeholder="차량을 선택하세요"
                                    className="w-full px-4 py-2 bg-secondary/30 border border-input rounded-lg text-sm text-muted-foreground cursor-not-allowed focus:outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground flex items-center justify-between">
                                도착 주행거리 (km)
                                {formData.startKm !== "" && formData.endKm !== "" && Number(formData.endKm) >= Number(formData.startKm) && (
                                    <span className="text-[10px] px-1.5 py-0.5 bg-primary/20 text-primary rounded font-bold animate-pulse">
                                        +{Number(formData.endKm) - Number(formData.startKm)}km 주행
                                    </span>
                                )}
                            </label>
                            <div className="relative group">
                                <input
                                    type="number"
                                    required
                                    value={formData.endKm}
                                    onChange={e => setFormData({ ...formData, endKm: e.target.value })}
                                    placeholder="45235"
                                    className={`w-full pl-4 pr-32 py-2 bg-secondary/50 border rounded-lg text-sm text-foreground focus:outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${formData.endKm !== "" && formData.startKm !== "" && Number(formData.endKm) <= Number(formData.startKm)
                                        ? "border-red-500/50 focus:border-red-500"
                                        : "border-input focus:border-primary"
                                        }`}
                                />
                                <div className="absolute right-1 top-1 bottom-1 flex gap-0.5">
                                    <div className="flex flex-col gap-0.5">
                                        <button type="button" onClick={() => adjustKm('endKm', 10)} className="flex-1 px-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded flex items-center justify-center transition-colors" title="+10">
                                            <ChevronsUp className="h-3 w-3" />
                                        </button>
                                        <button type="button" onClick={() => adjustKm('endKm', -10)} className="flex-1 px-1.5 bg-secondary hover:bg-secondary/80 text-muted-foreground rounded flex items-center justify-center transition-colors" title="-10">
                                            <ChevronsDown className="h-3 w-3" />
                                        </button>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <button type="button" onClick={() => adjustKm('endKm', 1)} className="flex-1 px-2 bg-primary/20 hover:bg-primary/30 text-primary rounded flex items-center justify-center transition-colors" title="+1">
                                            <ChevronUp className="h-3 w-3" />
                                        </button>
                                        <button type="button" onClick={() => adjustKm('endKm', -1)} className="flex-1 px-2 bg-secondary hover:bg-secondary/80 text-muted-foreground rounded flex items-center justify-center transition-colors" title="-1">
                                            <ChevronDown className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground text-left block">주차 건물</label>
                            <input
                                type="text"
                                list="parking-buildings"
                                value={formData.parkingBuilding}
                                onChange={e => setFormData({ ...formData, parkingBuilding: e.target.value })}
                                placeholder="예: 본사 (파미어스몰)"
                                className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                            />
                            <datalist id="parking-buildings">
                                <option value="본사 (파미어스몰)" />
                                <option value="외부 주차장" />
                            </datalist>
                        </div>
                        <div className="space-y-2 text-left">
                            <label className="text-sm font-medium text-foreground block">상세 위치</label>
                            <input
                                type="text"
                                value={formData.parkingDetail}
                                onChange={e => setFormData({ ...formData, parkingDetail: e.target.value })}
                                placeholder="예: B2 45"
                                className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                    </div>

                    <div className="space-y-3 p-4 bg-secondary/30 rounded-xl border border-dashed border-border">
                        <label className="text-sm font-medium text-foreground flex items-center gap-2">
                            <Camera className="h-4 w-4 text-primary" />
                            주차 위치 사진 (선택)
                        </label>

                        {capturedPhoto ? (
                            <div className="relative group overflow-hidden rounded-lg aspect-video bg-black/20 flex items-center justify-center">
                                <img src={capturedPhoto} alt="Captured" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => document.getElementById('parking-photo')?.click()}
                                        className="p-2 bg-white/20 backdrop-blur rounded-full hover:bg-white/30 transition-colors"
                                    >
                                        <Camera className="h-5 w-5 text-white" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCapturedPhoto(null)}
                                        className="p-2 bg-red-500/80 rounded-full hover:bg-red-500 transition-colors"
                                    >
                                        <Plus className="h-5 w-5 text-white rotate-45" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => document.getElementById('parking-photo')?.click()}
                                className="w-full flex flex-col items-center justify-center gap-2 py-8 bg-primary/10 hover:bg-primary/20 text-primary border border-dashed border-primary/50 rounded-lg transition-all"
                            >
                                <Camera className="h-8 w-8" />
                                <span className="text-sm font-semibold">사진 찍기 / 선택하기</span>
                                <span className="text-[10px] text-primary/60">모바일: 카메라 촬영 | 데스크톱: 파일 선택</span>
                            </button>
                        )}

                        <input
                            id="parking-photo"
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handlePhotoChange}
                            className="hidden"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <button
                            type="button"
                            onClick={() => setIsAddModalOpen(false)}
                            className="px-6 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg text-sm font-medium transition-colors border border-border"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20"
                        >
                            저장하기
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Filters & Actions */}
            <div className="glass-card rounded-xl p-6 mb-6">
                <div className="mb-4">
                    <h3 className="text-lg font-bold text-foreground">차량운행기록</h3>
                    <p className="text-sm text-muted-foreground">선택한 연도의 운행 기록입니다.</p>
                </div>
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                        {/* Year Dropdown */}
                        <div className="relative">
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="appearance-none pl-4 pr-10 py-2.5 bg-secondary/50 border border-input rounded-lg text-sm font-medium text-foreground focus:outline-none focus:border-primary transition-colors min-w-[120px]"
                            >
                                <option value="전체">전체 연도</option>
                                {uniqueYears.map(year => (
                                    <option key={year} value={year}>{year}년</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        </div>

                        {/* Vehicle Dropdown */}
                        <div className="relative">
                            <select
                                value={selectedVehicle}
                                onChange={(e) => setSelectedVehicle(e.target.value)}
                                className="appearance-none pl-4 pr-10 py-2.5 bg-secondary/50 border border-input rounded-lg text-sm font-medium text-foreground focus:outline-none focus:border-primary transition-colors min-w-[200px]"
                            >
                                <option value="전체">전체 차량</option>
                                {uniqueVehicles.map(car => (
                                    <option key={car} value={car}>{car}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 px-4 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg text-sm font-medium transition-colors border border-border whitespace-nowrap"
                        >
                            <Download className="h-4 w-4" />
                            내보내기
                        </button>
                        <button
                            onClick={handleAddClick}
                            className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20 whitespace-nowrap"
                        >
                            <Plus className="h-4 w-4" />
                            운행기록추가
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="glass-card rounded-xl overflow-hidden border border-border">
                <div className="overflow-x-auto pb-32">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-secondary/50 text-muted-foreground uppercase text-xs font-medium">
                            <tr>
                                <th className="px-6 py-4 min-w-[120px] whitespace-nowrap">날짜</th>
                                <th className="px-6 py-4 min-w-[150px]">차량</th>
                                <th className="px-6 py-4 min-w-[100px] whitespace-nowrap">운전자</th>
                                <th className="px-6 py-4 min-w-[250px]">목적 및 경로</th>
                                <th className="px-6 py-4 text-right min-w-[120px] whitespace-nowrap">주행거리</th>
                                <th className="px-6 py-4 min-w-[150px] whitespace-nowrap">주차위치</th>
                                <th className="px-6 py-4 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-secondary/30 transition-colors">
                                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{log.date}</td>
                                    <td className="px-6 py-4 font-medium text-foreground">{log.car}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                                                {log.driver[0]}
                                            </div>
                                            <span className="text-muted-foreground">{log.driver}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="text-foreground">{log.purpose}</div>
                                            <div className="text-xs text-muted-foreground mt-0.5">{log.route}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                        <div className="text-foreground">{log.endKm - log.startKm} km</div>
                                        <div className="text-xs text-muted-foreground">누적 {log.endKm.toLocaleString()}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <Link href="/parking">
                                                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-secondary border border-border text-xs text-muted-foreground hover:bg-secondary/80 hover:text-foreground cursor-pointer transition-colors">
                                                    <MapPin className="h-3 w-3" />
                                                    {log.parking}
                                                </div>
                                            </Link>
                                            {log.hasPhoto && (
                                                <Camera
                                                    className="h-4 w-4 text-primary hover:text-primary/80 cursor-pointer transition-colors"
                                                    //@ts-ignore
                                                    onClick={() => viewPhoto(log.photoUrl || "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=800")}
                                                />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveMenuId(activeMenuId === log.id ? null : log.id);
                                            }}
                                            className="p-1.5 hover:bg-secondary rounded-lg text-muted-foreground transition-colors"
                                        >
                                            <MoreHorizontal className="h-4 w-4" />
                                        </button>

                                        {activeMenuId === log.id && (
                                            <div className="absolute right-4 top-10 w-32 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden flex flex-col">
                                                {deletingId === log.id ? (
                                                    <div className="p-2 flex flex-col gap-2">
                                                        <span className="text-[10px] text-red-500 font-bold px-1">정말 삭제할까요?</span>
                                                        <div className="flex gap-1">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDelete(log.id);
                                                                }}
                                                                className="flex-1 py-1 bg-red-500 text-white text-[10px] rounded hover:bg-red-600 transition-colors"
                                                            >
                                                                삭제
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setDeletingId(null);
                                                                }}
                                                                className="flex-1 py-1 bg-secondary text-foreground text-[10px] rounded hover:bg-secondary/80 transition-colors"
                                                            >
                                                                취소
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEdit(log);
                                                            }}
                                                            className="px-3 py-2.5 text-xs text-left hover:bg-secondary transition-colors text-foreground flex items-center gap-2 border-b border-border/50"
                                                        >
                                                            <Edit className="h-3 w-3 text-primary" />
                                                            수정
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setDeletingId(log.id);
                                                            }}
                                                            className="px-3 py-2.5 text-xs text-left hover:bg-secondary transition-colors text-red-500 flex items-center gap-2"
                                                        >
                                                            <Trash className="h-3 w-3" />
                                                            삭제
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                        {/* Click outside listener could be added, but simple toggle sufficient for now */}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="bg-secondary/30 px-6 py-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                    <span>총 {filteredLogs.length}건의 기록이 있습니다. (전체 {logs.length}건)</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 bg-secondary rounded hover:bg-secondary/80 text-muted-foreground transition-colors">이전</button>
                        <button className="px-3 py-1 bg-secondary rounded hover:bg-secondary/80 text-muted-foreground transition-colors">다음</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
