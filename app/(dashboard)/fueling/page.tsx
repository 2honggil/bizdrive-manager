"use client";

import { Fuel, DollarSign, Download, Plus, Search, Filter } from "lucide-react";
import { useState } from "react";
import Modal from "@/components/Modal";

const fuelMockData = [
    { id: 1, date: "2024.01.03", car: "쏘렌토 (195하4504)", type: "주유", amount: "55,000", location: "만남의광장 주유소", driver: "홍길동" },
    { id: 2, date: "2024.01.02", car: "카니발 (333루3333)", type: "통행료", amount: "4,500", location: "하이패스 (서서울TG)", driver: "김철수" },
    { id: 3, date: "2024.01.01", car: "쏘렌토 (195하4504)", type: "주유", amount: "72,000", location: "강남 주유소", driver: "박민수" },
    { id: 4, date: "2023.12.30", car: "아반떼 (123가4567)", type: "수리비", amount: "120,000", location: "블루핸즈 역삼점", driver: "이영희" },
];

export default function FuelTokensPage() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">주유 및 톨비기록</h1>
                    <p className="text-muted-foreground text-sm mt-1">차량 유지비용 지출 내역을 기록합니다.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg text-sm font-medium transition-colors border border-border">
                        <Download className="h-4 w-4" />
                        내보내기
                    </button>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20"
                    >
                        <Plus className="h-4 w-4" />
                        지출 등록
                    </button>
                </div>
            </div>

            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="지출 등록하기">
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsAddModalOpen(false); }}>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">날짜</label>
                            <input type="date" required className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">차량</label>
                            <select required className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors">
                                <option value="">선택</option>
                                <option>쏘렌토 (195하4504)</option>
                                <option>아반떼 (123가4567)</option>
                                <option>카니발 (333루3333)</option>
                                <option>그랜저 (999호9999)</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">지출 유형</label>
                            <select required className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors">
                                <option value="">선택</option>
                                <option>주유</option>
                                <option>통행료</option>
                                <option>수리비</option>
                                <option>기타</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">금액 (원)</label>
                            <input type="number" required placeholder="55000" className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">위치/상세</label>
                        <input type="text" placeholder="예: 만남의광장 주유소" className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors" />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg text-sm font-medium transition-colors border border-border">취소</button>
                        <button type="submit" className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20">등록하기</button>
                    </div>
                </form>
            </Modal>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card p-6 rounded-xl flex items-center justify-between border-l-4 border-l-primary">
                    <div>
                        <p className="text-muted-foreground text-sm font-medium">이번달 주유비</p>
                        <p className="text-2xl font-bold text-foreground mt-1">₩540,000</p>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-lg text-primary">
                        <Fuel className="h-6 w-6" />
                    </div>
                </div>
                <div className="glass-card p-6 rounded-xl flex items-center justify-between border-l-4 border-l-orange-500">
                    <div>
                        <p className="text-muted-foreground text-sm font-medium">이번달 통행료</p>
                        <p className="text-2xl font-bold text-foreground mt-1">₩84,500</p>
                    </div>
                    <div className="p-3 bg-orange-500/10 rounded-lg text-orange-400">
                        <DollarSign className="h-6 w-6" />
                    </div>
                </div>
                <div className="glass-card p-6 rounded-xl flex items-center justify-between border-l-4 border-l-muted-foreground">
                    <div>
                        <p className="text-muted-foreground text-sm font-medium">기타 정비/세차</p>
                        <p className="text-2xl font-bold text-foreground mt-1">₩150,000</p>
                    </div>
                    <div className="p-3 bg-secondary rounded-lg text-muted-foreground">
                        <DollarSign className="h-6 w-6" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-card rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 w-full md:max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="차량, 운전자, 장소 검색..."
                        className="w-full pl-9 pr-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button className="flex items-center gap-2 px-3 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                        <Filter className="h-4 w-4" />
                        필터
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
                                <th className="px-6 py-4">구분</th>
                                <th className="px-6 py-4">차량</th>
                                <th className="px-6 py-4">장소/내역</th>
                                <th className="px-6 py-4 text-right">금액</th>
                                <th className="px-6 py-4">기록자</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {fuelMockData.map((item) => (
                                <tr key={item.id} className="hover:bg-secondary/30 transition-colors">
                                    <td className="px-6 py-4 text-muted-foreground">{item.date}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium border ${item.type === '주유' ? 'bg-primary/10 text-primary border-primary/20' :
                                            item.type === '통행료' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                                'bg-secondary text-muted-foreground border-border'
                                            }`}>
                                            {item.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-foreground">{item.car}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{item.location}</td>
                                    <td className="px-6 py-4 text-right font-medium text-foreground">₩{item.amount}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{item.driver}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
