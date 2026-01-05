"use client";

import { useState } from "react";
import { Search, Filter, Download, Plus, MapPin, Camera } from "lucide-react";
import Modal from "@/components/Modal";

const mockLogs = [
    { id: 1, date: "2024.01.04", car: "쏘렌토 (195하4504)", driver: "홍길동", purpose: "외근 (고객 미팅)", route: "본사 -> 강남 파이낸스센터", startKm: 45200, endKm: 45235, parking: "B3 - A12", hasPhoto: true },
    { id: 2, date: "2024.01.04", car: "카니발 (333루3333)", driver: "김철수", purpose: "물품 구매", route: "본사 -> 코스트코 양재", startKm: 12050, endKm: 12072, parking: "지상 1층", hasPhoto: false },
    { id: 3, date: "2024.01.03", car: "아반떼 (123가4567)", driver: "이영희", purpose: "출장 (대전 지사)", route: "본사 -> 대전역", startKm: 8900, endKm: 9050, parking: "대전지사 주차장", hasPhoto: true },
    { id: 4, date: "2024.01.03", car: "쏘렌토 (195하4504)", driver: "박민수", purpose: "직원 픽업", route: "본사 -> 수서역", startKm: 45180, endKm: 45200, parking: "B3 - C04", hasPhoto: false },
    { id: 5, date: "2024.01.02", car: "그랜저 (999호9999)", driver: "최지우", purpose: "임원 수행", route: "자택 -> 본사", startKm: 5500, endKm: 5520, parking: "임원 전용", hasPhoto: true },
];

export default function VehicleLogs() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Add logic to save the record
        setIsAddModalOpen(false);
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

            {/* Add Record Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="차량 운행기록 추가" size="lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">날짜</label>
                            <input type="date" required className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">차량</label>
                            <select required className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors">
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
                            <input type="text" required placeholder="이름 입력" className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">목적</label>
                            <input type="text" required placeholder="예: 외근, 출장" className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">출발지</label>
                            <input type="text" required placeholder="예: 본사" className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">목적지</label>
                            <input type="text" required placeholder="예: 강남역" className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">출발 주행거리 (km)</label>
                            <input type="number" required placeholder="45200" className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">도착 주행거리 (km)</label>
                            <input type="number" required placeholder="45235" className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">주차 위치</label>
                        <input type="text" placeholder="예: B3 - A12" className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">주차 위치 사진 (선택)</label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => document.getElementById('parking-photo')?.click()}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20"
                            >
                                <Camera className="h-5 w-5" />
                                📸 사진 찍기 / 선택하기
                            </button>
                        </div>
                        <input
                            id="parking-photo"
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                        />
                        <p className="text-xs text-muted-foreground mt-1">모바일: 카메라로 직접 촬영 | 데스크톱: 파일 선택</p>
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
                            {mockLogs.map((log) => (
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
                                                <Camera className="h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="bg-secondary/30 px-6 py-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                    <span>총 5건의 기록이 있습니다.</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 bg-secondary rounded hover:bg-secondary/80 text-muted-foreground transition-colors">이전</button>
                        <button className="px-3 py-1 bg-secondary rounded hover:bg-secondary/80 text-muted-foreground transition-colors">다음</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
