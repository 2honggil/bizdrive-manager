"use client";


import { Fuel, DollarSign, Download, Plus, Search, Filter, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import Modal from "@/components/Modal";

import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, addDoc, Timestamp, getDocs } from "firebase/firestore";
import { fuelMockData } from "@/lib/mockData";
import { useAuth } from "@/context/AuthContext";

export default function FuelTokensPage() {
    const { user } = useAuth();
    const [fuelData, setFuelData] = useState<any[]>(fuelMockData);
    const [vehicles, setVehicles] = useState<any[]>([]); // Dynamic vehicles
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Sync from Firestore
    useEffect(() => {
        // Fetch Vehicles first
        const fetchVehicles = async () => {
            const q = query(collection(db, "vehicles"));
            const querySnapshot = await getDocs(q);
            const allVehicles = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

            // Filter vehicles based on RBAC
            let accessibleVehicles = [];
            if (user?.role === "superadmin") {
                accessibleVehicles = allVehicles;
            } else {
                accessibleVehicles = allVehicles.filter(v => v.department === user?.department);
            }
            // Fallback for demo if no DB data
            if (accessibleVehicles.length === 0) {
                accessibleVehicles = [{ id: 1, name: "쏘렌토 (195하4504)", department: "망고슬래브" }];
                if (user?.department && user.department !== "망고슬래브") {
                    accessibleVehicles = [];
                }
            }
            setVehicles(accessibleVehicles);
        };

        if (user) {
            fetchVehicles();
        }

        const q = query(collection(db, "fueling"), orderBy("date", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data: any[] = [];
            snapshot.forEach((doc) => {
                data.push({ ...doc.data(), id: doc.id });
            });
            setFuelData(data.length > 0 ? data : fuelMockData);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [user]);

    // Filtering State
    const [selectedYear, setSelectedYear] = useState("전체");
    const [selectedVehicle, setSelectedVehicle] = useState("전체");

    // Derived Data
    const availableVehicleNames = vehicles.map(v => v.name || `${v.model} (${v.plate})`);

    const uniqueYears = Array.from(new Set(fuelData.filter(item => availableVehicleNames.includes(item.car)).map(item => item.date.split('.')[0]))).sort((a, b) => b.localeCompare(a));
    const uniqueVehicles = vehicles.map(v => v.name || `${v.model} (${v.plate})`).sort();

    const filteredFuelData = fuelData.filter(item => {
        // Data Isolation
        if (!availableVehicleNames.includes(item.car)) return false;

        const itemYear = item.date.split('.')[0];
        const matchYear = selectedYear === "전체" || itemYear === selectedYear;
        const matchVehicle = selectedVehicle === "전체" || item.car === selectedVehicle;
        return matchYear && matchVehicle;
    });

    // Calculate Summary Costs
    const totalFuelCost = filteredFuelData
        .filter(item => item.type === "주유")
        .reduce((sum, item) => sum + parseInt(item.amount.replace(/,/g, '')), 0);

    const totalTollCost = filteredFuelData
        .filter(item => item.type === "통행료")
        .reduce((sum, item) => sum + parseInt(item.amount.replace(/,/g, '')), 0);

    const totalMiscCost = filteredFuelData
        .filter(item => item.type !== "주유" && item.type !== "통행료")
        .reduce((sum, item) => sum + parseInt(item.amount.replace(/,/g, '')), 0);

    const formattedFuelCost = totalFuelCost.toLocaleString();
    const formattedTollCost = totalTollCost.toLocaleString();
    const formattedMiscCost = totalMiscCost.toLocaleString();

    // Form state
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        car: "쏘렌토 (195하4504)",
        type: "주유",
        amount: "",
        location: "",
        driver: "홍길동"
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        addDoc(collection(db, "fueling"), {
            date: formData.date.replace(/-/g, '.'),
            car: formData.car,
            type: formData.type,
            amount: Number(formData.amount).toLocaleString(),
            location: formData.location || "기타 장소",
            driver: formData.driver,
            createdAt: Timestamp.now()
        }).then(() => {
            setIsAddModalOpen(false);
        }).catch(err => console.error("Error adding fueling record: ", err));

        // Reset form
        setFormData({
            date: new Date().toISOString().split('T')[0],
            car: "쏘렌토 (195하4504)",
            type: "주유",
            amount: "",
            location: "",
            driver: "홍길동"
        });
    };

    const handleExportCSV = async () => {
        const headers = ["날짜", "차량", "유형", "금액", "장소", "운전자"];

        const rows = filteredFuelData.map(item => [
            item.date,
            item.car,
            item.type,
            item.amount,
            item.location,
            item.driver
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });

        if ('showSaveFilePicker' in window) {
            try {
                const handle = await (window as any).showSaveFilePicker({
                    suggestedName: `주유톨비기록_${new Date().toISOString().split('T')[0]}.csv`,
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
            link.setAttribute('download', `주유톨비기록_${new Date().toISOString().split('T')[0]}.csv`);
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
                    <h1 className="text-2xl font-bold text-foreground">주유 및 톨비기록</h1>
                    <p className="text-muted-foreground text-sm mt-1">차량 유지비용 지출 내역을 기록합니다.</p>
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
                        지출 등록
                    </button>
                </div>
            </div>

            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="지출 등록하기">
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">날짜</label>
                            <input
                                type="date"
                                required
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full px-4 py-2 bg-secondary/80 border border-primary/30 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">차량</label>
                            <select
                                required
                                value={formData.car}
                                onChange={(e) => setFormData({ ...formData, car: e.target.value })}
                                className="w-full px-4 py-2 bg-secondary/80 border border-primary/30 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                            >
                                <option value="">선택</option>
                                {vehicles.map(v => (
                                    <option key={v.id} value={v.name || `${v.model} (${v.plate})`}>
                                        {v.name || `${v.model} (${v.plate})`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">지출 유형</label>
                            <select
                                required
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-4 py-2 bg-secondary/80 border border-primary/30 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                            >
                                <option value="">선택</option>
                                <option>주유</option>
                                <option>통행료</option>
                                <option>수리비</option>
                                <option>기타</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">금액 (원)</label>
                            <input
                                type="number"
                                required
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                placeholder="55000"
                                className="w-full px-4 py-2 bg-secondary/80 border border-primary/30 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">위치/상세</label>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="예: 만남의광장 주유소"
                            className="w-full px-4 py-2 bg-secondary/80 border border-primary/30 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                        />
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
                        <p className="text-muted-foreground text-sm font-medium">총 주유비 (조회)</p>
                        <p className="text-2xl font-bold text-foreground mt-1">₩{formattedFuelCost}</p>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-lg text-primary">
                        <Fuel className="h-6 w-6" />
                    </div>
                </div>
                <div className="glass-card p-6 rounded-xl flex items-center justify-between border-l-4 border-l-orange-500">
                    <div>
                        <p className="text-muted-foreground text-sm font-medium">총 통행료 (조회)</p>
                        <p className="text-2xl font-bold text-foreground mt-1">₩{formattedTollCost}</p>
                    </div>
                    <div className="p-3 bg-orange-500/10 rounded-lg text-orange-400">
                        <DollarSign className="h-6 w-6" />
                    </div>
                </div>
                <div className="glass-card p-6 rounded-xl flex items-center justify-between border-l-4 border-l-muted-foreground">
                    <div>
                        <p className="text-muted-foreground text-sm font-medium">기타 정비/세차 (조회)</p>
                        <p className="text-2xl font-bold text-foreground mt-1">₩{formattedMiscCost}</p>
                    </div>
                    <div className="p-3 bg-secondary rounded-lg text-muted-foreground">
                        <DollarSign className="h-6 w-6" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-card rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
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

                <div className="relative flex-1 w-full md:max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="차량, 운전자, 장소 검색..."
                        className="w-full pl-9 pr-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="glass-card rounded-xl overflow-hidden border border-border">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-secondary/50 text-muted-foreground uppercase text-xs font-medium">
                            <tr>
                                <th className="px-6 py-4 min-w-[120px] whitespace-nowrap">날짜</th>
                                <th className="px-6 py-4 min-w-[80px] whitespace-nowrap">구분</th>
                                <th className="px-6 py-4 min-w-[150px]">차량</th>
                                <th className="px-6 py-4 min-w-[250px]">장소/내역</th>
                                <th className="px-6 py-4 text-right min-w-[100px] whitespace-nowrap">금액</th>
                                <th className="px-6 py-4 min-w-[100px] whitespace-nowrap">기록자</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredFuelData.map((item) => (
                                <tr key={item.id} className="hover:bg-secondary/30 transition-colors">
                                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{item.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded text-xs font-medium border ${item.type === '주유' ? 'bg-primary/10 text-primary border-primary/20' :
                                            item.type === '통행료' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                                'bg-secondary text-muted-foreground border-border'
                                            }`}>
                                            {item.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-foreground">{item.car}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{item.location}</td>
                                    <td className="px-6 py-4 text-right font-medium text-foreground whitespace-nowrap">₩{item.amount}</td>
                                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{item.driver}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
