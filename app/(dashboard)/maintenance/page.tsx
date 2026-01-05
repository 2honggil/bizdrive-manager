"use client";

import { Wrench, Calendar, AlertTriangle, Plus, Filter } from "lucide-react";

const maintenanceData = [
    { id: 1, car: "쏘렌토 (195하4504)", type: "정기점검", date: "2024.01.02", km: "45,000 km", cost: "₩120,000", note: "엔진오일 교환, 타이어 위치 교환" },
    { id: 2, car: "아반떼 (123가4567)", type: "수리", date: "2023.12.15", km: "8,900 km", cost: "₩350,000", note: "범퍼 긁힘 도색 (운전자 과실)" },
    { id: 3, car: "카니발 (333루3333)", type: "소모품", date: "2023.11.20", km: "11,500 km", cost: "₩45,000", note: "와이퍼 교체, 워셔액 보충" },
];

export default function MaintenancePage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">정비기록</h1>
                    <p className="text-muted-foreground text-sm mt-1">차량 수리 및 점검 내역을 관리합니다.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20">
                    <Plus className="h-4 w-4" />
                    정비 등록
                </button>
            </div>

            {/* Alert Banner for Upcoming */}
            <div className="glass-card rounded-xl p-4 border border-orange-500/20 bg-orange-500/5 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                    <h3 className="text-sm font-bold text-orange-200">정비 필요 알림</h3>
                    <p className="text-xs text-orange-200/70 mt-1">
                        <span className="font-medium text-orange-100">그랜저 (999호9999)</span> 차량의 엔진오일 교환 주기가 도래했습니다. (마지막 교환 후 10,200km 주행)
                    </p>
                </div>
            </div>

            <div className="glass-card rounded-xl overflow-hidden border border-border">
                <div className="p-4 border-b border-border flex items-center justify-between">
                    <div className="text-sm font-medium text-foreground">전체 내역</div>
                    <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                        <Filter className="h-3 w-3" />
                        필터
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-secondary/50 text-muted-foreground uppercase text-xs font-medium">
                            <tr>
                                <th className="px-6 py-4">날짜</th>
                                <th className="px-6 py-4">차량</th>
                                <th className="px-6 py-4">구분</th>
                                <th className="px-6 py-4">주행거리</th>
                                <th className="px-6 py-4">내역</th>
                                <th className="px-6 py-4 text-right">비용</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {maintenanceData.map((item) => (
                                <tr key={item.id} className="hover:bg-secondary/30 transition-colors">
                                    <td className="px-6 py-4 text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-3 w-3 text-muted-foreground" />
                                            {item.date}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-foreground">{item.car}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium border ${item.type === '정기점검' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                            item.type === '수리' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                'bg-secondary text-muted-foreground border-border'
                                            }`}>
                                            {item.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">{item.km}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{item.note}</td>
                                    <td className="px-6 py-4 text-right font-medium text-foreground">{item.cost}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
