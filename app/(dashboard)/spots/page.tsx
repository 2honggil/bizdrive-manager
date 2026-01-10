"use client";

import { useState } from "react";
import { MapPin, ParkingCircle, Plus, MoreVertical, Edit, Trash } from "lucide-react";
import Modal from "@/components/Modal";

import { frequentDestinations, frequentParking } from "@/lib/mockData";

export default function FrequentSpotsPage() {
    const [activeTab, setActiveTab] = useState<'destinations' | 'parking'>('destinations');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">자주가는곳 관리</h1>
                    <p className="text-muted-foreground text-sm mt-1">자주 방문하는 목적지와 주차장을 등록하여 입력을 간소화합니다.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20"
                >
                    <Plus className="h-4 w-4" />
                    {activeTab === 'destinations' ? '목적지 추가' : '주차장 추가'}
                </button>
            </div>

            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title={activeTab === 'destinations' ? '목적지 추가' : '주차장 추가'}>
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsAddModalOpen(false); }}>
                    {activeTab === 'destinations' ? (
                        <>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">장소명</label>
                                <input type="text" required placeholder="예: 본사" className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">주소</label>
                                <input type="text" required placeholder="서울시 강남구 테헤란로 123" className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors" />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">주차장명</label>
                                <input type="text" required placeholder="예: 본사 지하주차장" className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">유형</label>
                                <select required className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors">
                                    <option value="">선택</option>
                                    <option>실내</option>
                                    <option>기계식</option>
                                    <option>노상</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">메모</label>
                                <input type="text" placeholder="예: B3층 임원 전용 구역" className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors" />
                            </div>
                        </>
                    )}
                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg text-sm font-medium transition-colors border border-border">취소</button>
                        <button type="submit" className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20">추가하기</button>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeTab === 'destinations' ? (
                    frequentDestinations.map(item => (
                        <div key={item.id} className="glass-card p-5 rounded-xl border border-border group hover:border-primary/50 transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <button className="p-1 text-muted-foreground hover:text-foreground rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreVertical className="h-4 w-4" />
                                </button>
                            </div>
                            <h3 className="text-foreground font-medium">{item.name}</h3>
                            <p className="text-muted-foreground text-sm mt-1">{item.address}</p>
                            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">누적 방문 {item.usage}회</span>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="text-muted-foreground hover:text-primary"><Edit className="h-3 w-3" /></button>
                                    <button className="text-muted-foreground hover:text-destructive"><Trash className="h-3 w-3" /></button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    frequentParking.map(item => (
                        <div key={item.id} className="glass-card p-5 rounded-xl border border-border group hover:border-primary/50 transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <div className="p-2 rounded-lg bg-secondary text-muted-foreground">
                                    <ParkingCircle className="h-5 w-5" />
                                </div>
                                <button className="p-1 text-muted-foreground hover:text-foreground rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreVertical className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-foreground font-medium">{item.name}</h3>
                                <span className="text-[10px] px-1.5 py-0.5 rounded border border-border text-muted-foreground bg-secondary">{item.type}</span>
                            </div>
                            <p className="text-muted-foreground text-sm">{item.note}</p>
                            <div className="mt-4 pt-4 border-t border-border flex items-center justify-end text-xs">
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="text-muted-foreground hover:text-primary"><Edit className="h-3 w-3" /></button>
                                    <button className="text-muted-foreground hover:text-destructive"><Trash className="h-3 w-3" /></button>
                                </div>
                            </div>
                        </div>
                    ))
                )}

                {/* Add Button Mockup */}
                <button className="border border-dashed border-border rounded-xl p-5 flex flex-col items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-secondary/30 transition-all min-h-[160px]">
                    <Plus className="h-6 w-6 mb-2" />
                    <span className="text-sm font-medium">새로운 항목 추가</span>
                </button>
            </div>
        </div>
    );
}
