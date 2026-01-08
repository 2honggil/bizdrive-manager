"use client";

import { useState } from "react";
import { Search, Filter, Download, Plus, MapPin, Camera, ChevronUp, ChevronDown, ChevronsUp, ChevronsDown } from "lucide-react";
import Modal from "@/components/Modal";

const mockLogs = [
    { id: 1, date: "2024.01.04", car: "쏘렌토 (195하4504)", driver: "홍길동", purpose: "외근 (고객 미팅)", route: "본사 -> 강남 파이낸스센터", startKm: 45200, endKm: 45235, parking: "본사 (파미어스몰)", hasPhoto: true },
    { id: 2, date: "2024.01.04", car: "카니발 (333루3333)", driver: "김철수", purpose: "물품 구매", route: "본사 -> 코스트코 양재", startKm: 12050, endKm: 12072, parking: "외부 주차장", hasPhoto: false },
    { id: 3, date: "2024.01.03", car: "아반떼 (123가4567)", driver: "이영희", purpose: "출장 (대전 지사)", route: "본사 -> 대전역", startKm: 8900, endKm: 9050, parking: "대전지사 주차장", hasPhoto: true },
    { id: 4, date: "2024.01.03", car: "쏘렌토 (195하4504)", driver: "박민수", purpose: "직원 픽업", route: "본사 -> 수서역", startKm: 45180, endKm: 45200, parking: "본사 (파미어스몰)", hasPhoto: false },
    { id: 5, date: "2024.01.02", car: "그랜저 (999호9999)", driver: "최지우", purpose: "임원 수행", route: "자택 -> 본사", startKm: 5500, endKm: 5520, parking: "본사 전용", hasPhoto: true },
];

export default function VehicleLogs() {
    const [logs, setLogs] = useState(mockLogs);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        car: "",
        driver: "홍길동",
        purpose: "",
        route: "",
        startKm: "",
        endKm: "",
        parking: "",
    });
    const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

    const adjustKm = (field: 'startKm' | 'endKm', amount: number) => {
        setFormData(prev => {
            // Use 45200 as a default base for startKm if empty, 45235 for endKm
            const baseValue = field === 'startKm' ? 45200 : 45235;
            const currentVal = prev[field] === "" ? baseValue : parseInt(prev[field] as string);
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
            reader.onloadend = () => {
                setCapturedPhoto(reader.result as string);
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

        const newLog = {
            id: logs.length + 1,
            date: formData.date.replace(/-/g, '.'),
            car: formData.car || "쏘렌토 (195하4504)", // Default if not selected
            driver: formData.driver,
            purpose: formData.purpose,
            route: formData.route || "본사 -> 목적지",
            startKm: startKm,
            endKm: endKm,
            parking: formData.parking,
            hasPhoto: !!capturedPhoto,
            photoUrl: capturedPhoto
        };

        setLogs([newLog, ...logs]);
        setIsAddModalOpen(false);

        // Reset form
        setFormData({
            date: new Date().toISOString().split('T')[0],
            car: "",
            driver: "홍길동",
            purpose: "",
            route: "",
            startKm: "",
            endKm: "",
            parking: "",
        });
        setCapturedPhoto(null);
    };

    const viewPhoto = (url: string | undefined) => {
        if (url) {
            setSelectedPhoto(url);
            setIsPhotoModalOpen(true);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">차량운행기록</h1>
                    <p className="text-muted-foreground text-sm mt-1">모든 차량의 운행 상세 내역을 관리합니다.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg text-sm font-medium transition-colors border border-border">
                        <Download className="h-4 w-4" />
                        엑셀 다운로드
                    </button>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20"
                    >
                        <Plus className="h-4 w-4" />
                        기록 추가
                    </button>
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
                                <option>쏘렌토 (195하4504)</option>
                                <option>아반떼 (123가4567)</option>
                                <option>카니발 (333루3333)</option>
                                <option>그랜저 (999호9999)</option>
                            </select>
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
                            <input
                                type="text"
                                required
                                value={formData.purpose}
                                onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                                placeholder="예: 외근, 출장"
                                className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">출발지</label>
                            <input
                                type="text"
                                required
                                placeholder="예: 본사"
                                className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">목적지</label>
                            <input
                                type="text"
                                required
                                value={formData.route}
                                onChange={e => setFormData({ ...formData, route: e.target.value })}
                                placeholder="예: 강남역"
                                className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
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

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">주차 위치</label>
                        <input
                            type="text"
                            list="parking-locations"
                            value={formData.parking}
                            onChange={e => setFormData({ ...formData, parking: e.target.value })}
                            placeholder="본사 (파미어스몰) 또는 외부 장소 입력"
                            className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                        />
                        <datalist id="parking-locations">
                            <option value="본사 (파미어스몰)" />
                            <option value="외부 주차장" />
                        </datalist>
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

            {/* Filters */}
            <div className="glass-card rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 w-full md:max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="운전자, 차량번호, 목적 검색..."
                        className="w-full pl-9 pr-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-muted-foreground">
                        <Filter className="h-4 w-4" />
                        <span>2024.01</span>
                    </div>
                    <button className="p-2 bg-secondary/50 border border-input rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                        <Filter className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="glass-card rounded-xl overflow-hidden border border-border">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-secondary/50 text-muted-foreground uppercase text-xs font-medium">
                            <tr>
                                <th className="px-6 py-4">날짜</th>
                                <th className="px-6 py-4">차량</th>
                                <th className="px-6 py-4">운전자</th>
                                <th className="px-6 py-4">목적 및 경로</th>
                                <th className="px-6 py-4 text-right">주행거리</th>
                                <th className="px-6 py-4">주차위치</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-secondary/30 transition-colors">
                                    <td className="px-6 py-4 text-muted-foreground">{log.date}</td>
                                    <td className="px-6 py-4 font-medium text-foreground">{log.car}</td>
                                    <td className="px-6 py-4">
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
                                    <td className="px-6 py-4 text-right">
                                        <div className="text-foreground">{log.endKm - log.startKm} km</div>
                                        <div className="text-xs text-muted-foreground">누적 {log.endKm.toLocaleString()}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-secondary border border-border text-xs text-muted-foreground">
                                                <MapPin className="h-3 w-3" />
                                                {log.parking}
                                            </div>
                                            {log.hasPhoto && (
                                                <Camera
                                                    className="h-4 w-4 text-primary hover:text-primary/80 cursor-pointer transition-colors"
                                                    //@ts-ignore
                                                    onClick={() => viewPhoto(log.photoUrl || "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=800")}
                                                />
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="bg-secondary/30 px-6 py-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                    <span>총 {logs.length}건의 기록이 있습니다.</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 bg-secondary rounded hover:bg-secondary/80 text-muted-foreground transition-colors">이전</button>
                        <button className="px-3 py-1 bg-secondary rounded hover:bg-secondary/80 text-muted-foreground transition-colors">다음</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
