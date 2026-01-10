"use client";

import { Wrench, Calendar, AlertTriangle, Plus, Filter, ChevronDown, Search, Download } from "lucide-react";
import { useState } from "react";
import Modal from "@/components/Modal";

import { maintenanceData } from "@/lib/mockData";

export default function MaintenancePage() {
    const [maintenanceList, setMaintenanceList] = useState(maintenanceData);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        car: "쏘렌토 (195하4504)",
        type: "정기점검",
        km: "",
        cost: "",
        note: ""
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newRecord = {
            id: maintenanceList.length + 1,
            date: formData.date.replace(/-/g, '.'),
            car: formData.car,
            type: formData.type,
            km: `${Number(formData.km).toLocaleString()} km`,
            cost: `₩${Number(formData.cost).toLocaleString()}`,
            note: formData.note
        };

        setMaintenanceList([newRecord, ...maintenanceList]);
        setIsAddModalOpen(false);

        // Reset form
        setFormData({
            date: new Date().toISOString().split('T')[0],
            car: "쏘렌토 (195하4504)",
            type: "정기점검",
            km: "",
            cost: "",
            note: ""
        });
    };
    const [selectedYear, setSelectedYear] = useState("전체");
    const [selectedVehicle, setSelectedVehicle] = useState("전체");

    // Derived Data
    const uniqueYears = Array.from(new Set(maintenanceData.map(item => item.date.split('.')[0]))).sort((a, b) => b.localeCompare(a));
    const uniqueVehicles = Array.from(new Set(maintenanceData.map(item => item.car))).sort();

    const filteredMaintenanceData = maintenanceList.filter(item => {
        const itemYear = item.date.split('.')[0];
        const matchYear = selectedYear === "전체" || itemYear === selectedYear;
        const matchVehicle = selectedVehicle === "전체" || item.car === selectedVehicle;
        return matchYear && matchVehicle;
    });

    const handleExportCSV = async () => {
        const headers = ["날짜", "차량", "유형", "주행거리(km)", "비용(원)", "정비소", "비고"];

        const rows = filteredMaintenanceData.map(item => [
            item.date,
            item.car,
            item.type,
            item.km || "",
            item.cost || "",
            "",
            item.note || ""
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });

        if ('showSaveFilePicker' in window) {
            try {
                const handle = await (window as any).showSaveFilePicker({
                    suggestedName: `정비기록_${new Date().toISOString().split('T')[0]}.csv`,
                    types: [{
                        description: 'CSV Files',
                        accept: { 'text/csv': ['.csv'] }
                    }]
                });
                const writable = await handle.createWritable();
                await writable.write(blob);
                await writable.close();
            } catch (err) {
                console.log('다운로드 취소됨');
            }
        } else {
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `정비기록_${new Date().toISOString().split('T')[0]}.csv`);
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
                    <h1 className="text-2xl font-bold text-foreground">정비기록</h1>
                    <p className="text-muted-foreground text-sm mt-1">차량 수리 및 점검 내역을 관리합니다.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg text-sm font-medium transition-colors border border-border"
                    >
                        <Download className="h-4 w-4" />
                        내보내기
                    </button>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20"
                    >
                        <Plus className="h-4 w-4" />
                        정비 등록
                    </button>
                </div>
            </div>

            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="정비기록 등록">
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">날짜</label>
                            <input
                                type="date"
                                required
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">차량</label>
                            <select
                                required
                                value={formData.car}
                                onChange={(e) => setFormData({ ...formData, car: e.target.value })}
                                className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                            >
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
                            <label className="text-sm font-medium text-foreground">정비 유형</label>
                            <select
                                required
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                            >
                                <option value="">선택</option>
                                <option>정기점검</option>
                                <option>수리</option>
                                <option>소모품</option>
                                <option>기타</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">주행거리 (km)</label>
                            <input
                                type="number"
                                required
                                value={formData.km}
                                onChange={(e) => setFormData({ ...formData, km: e.target.value })}
                                placeholder="45000"
                                className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">비용 (원)</label>
                        <input
                            type="number"
                            required
                            value={formData.cost}
                            onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                            placeholder="120000"
                            className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">정비 내역</label>
                        <textarea
                            rows={3}
                            value={formData.note}
                            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                            placeholder="예: 엔진오일 교환, 타이어 위치 교환"
                            className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                        ></textarea>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg text-sm font-medium transition-colors border border-border">취소</button>
                        <button type="submit" className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20">등록하기</button>
                    </div>
                </form>
            </Modal>



            <div className="glass-card rounded-xl overflow-hidden border border-border">
                <div className="p-4 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {/* Year Dropdown */}
                        <div className="relative">
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="appearance-none pl-3 pr-8 py-1.5 bg-secondary/50 border border-input rounded-lg text-xs font-medium text-foreground focus:outline-none focus:border-primary transition-colors min-w-[100px]"
                            >
                                <option value="전체">전체 연도</option>
                                {uniqueYears.map(year => (
                                    <option key={year} value={year}>{year}년</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
                        </div>

                        {/* Vehicle Dropdown */}
                        <div className="relative">
                            <select
                                value={selectedVehicle}
                                onChange={(e) => setSelectedVehicle(e.target.value)}
                                className="appearance-none pl-3 pr-8 py-1.5 bg-secondary/50 border border-input rounded-lg text-xs font-medium text-foreground focus:outline-none focus:border-primary transition-colors min-w-[150px]"
                            >
                                <option value="전체">전체 차량</option>
                                {uniqueVehicles.map(car => (
                                    <option key={car} value={car}>{car}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-secondary/50 text-muted-foreground uppercase text-xs font-medium">
                            <tr>
                                <th className="px-6 py-4 min-w-[120px] whitespace-nowrap">날짜</th>
                                <th className="px-6 py-4 min-w-[150px]">차량</th>
                                <th className="px-6 py-4 min-w-[80px] whitespace-nowrap">구분</th>
                                <th className="px-6 py-4 min-w-[100px] whitespace-nowrap">주행거리</th>
                                <th className="px-6 py-4 min-w-[250px]">내역</th>
                                <th className="px-6 py-4 text-right min-w-[100px] whitespace-nowrap">비용</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredMaintenanceData.map((item) => (
                                <tr key={item.id} className="hover:bg-secondary/30 transition-colors">
                                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
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
                                    <td className="px-6 py-4 whitespace-nowrap">{item.km}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{item.note}</td>
                                    <td className="px-6 py-4 text-right font-medium text-foreground whitespace-nowrap">{item.cost}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
