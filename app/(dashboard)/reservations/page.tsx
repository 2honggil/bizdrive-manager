"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, AlertCircle, Loader2 } from "lucide-react";
import Modal from "@/components/Modal";

import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, Timestamp, where } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

// Mock reservation data with full date strings
const initialReservations: any[] = [];

export default function Reservations() {
    const { user } = useAuth();
    const today = new Date(2026, 0, 9);
    const [reservationList, setReservationList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewDate, setViewDate] = useState(new Date(2026, 0, 1)); // Target month start
    const [viewMode, setViewMode] = useState<"month" | "week">("month");
    const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState<any>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [frequentSpots, setFrequentSpots] = useState<any[]>([]);

    // Sync from Firestore
    useEffect(() => {
        const q = query(collection(db, "reservations"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const resData: any[] = [];
            querySnapshot.forEach((doc) => {
                resData.push({ ...doc.data(), id: doc.id });
            });
            setReservationList(resData);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching reservations:", error);
            setError("데이터를 불러오는 중 오류가 발생했습니다. (Console 확인)");
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Sync Frequent Spots from Firestore
    useEffect(() => {
        const q = query(collection(db, "frequent_spots"), where("type", "==", "destination"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const spots: any[] = [];
            querySnapshot.forEach((doc) => {
                spots.push({ ...doc.data(), id: doc.id });
            });
            // Sort: 본사(파미어스몰) first, then alphabetically
            const sortedSpots = spots.sort((a, b) => {
                const isAHeadquarters = a.name?.includes("본사") || a.name?.includes("파미어스몰");
                const isBHeadquarters = b.name?.includes("본사") || b.name?.includes("파미어스몰");

                if (isAHeadquarters && !isBHeadquarters) return -1;
                if (!isAHeadquarters && isBHeadquarters) return 1;
                return (a.name || "").localeCompare(b.name || "");
            });
            setFrequentSpots(sortedSpots);
        }, (error) => {
            console.error("Error fetching frequent spots:", error);
        });
        return () => unsubscribe();
    }, []);

    // Form state
    const [formData, setFormData] = useState({
        car: "기아 쏘렌토 (195하4504)",
        startDate: "2026-01-09",
        startTime: "09:00",
        endDate: "2026-01-09",
        endTime: "10:00",
        startLocation: "",
        endLocation: "",
        purpose: "외근"
    });

    const [error, setError] = useState<string | null>(null);

    // Helper functions
    const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const navigatePrev = () => {
        const newDate = new Date(viewDate);
        if (viewMode === "month") {
            newDate.setMonth(newDate.getMonth() - 1);
        } else {
            newDate.setDate(newDate.getDate() - 7);
        }
        setViewDate(newDate);
    };

    const navigateNext = () => {
        const newDate = new Date(viewDate);
        if (viewMode === "month") {
            newDate.setMonth(newDate.getMonth() + 1);
        } else {
            newDate.setDate(newDate.getDate() + 7);
        }
        setViewDate(newDate);
    };

    const handleDayClick = (date: Date) => {
        // Format date to KST (YYYY-MM-DD)
        const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        setFormData({
            ...formData,
            startDate: dateStr,
            endDate: dateStr,
            car: "기아 쏘렌토 (195하4504)", // Reset to default or current
            purpose: "외근"
        });
        setIsReserveModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Conflict check
        const newStart = new Date(`${formData.startDate}T${formData.startTime}`);
        const newEnd = new Date(`${formData.endDate}T${formData.endTime}`);

        if (newEnd <= newStart) {
            setError("종료 시간이 시작 시간보다 빨라야 합니다.");
            return;
        }

        const conflict = reservationList.find(res => {
            if (res.car !== formData.car) return false;
            if (res.date !== formData.startDate) return false; // Simple date check for now

            const resStart = new Date(`${res.date}T${res.startTime}`);
            const resEnd = new Date(`${res.date}T${res.endTime}`);

            return (newStart < resEnd && newEnd > resStart);
        });

        if (conflict) {
            setError("해당 시간대에 이미 예약이 존재합니다.");
            return;
        }

        const colors = ['bg-indigo-600', 'bg-orange-500', 'bg-green-600', 'bg-blue-600', 'bg-purple-600'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        addDoc(collection(db, "reservations"), {
            car: formData.car,
            user: user?.name || "사용자",
            email: user?.email || "",
            purpose: formData.purpose,
            date: formData.startDate,
            startTime: formData.startTime,
            endTime: formData.endTime,
            startLocation: formData.startLocation,
            endLocation: formData.endLocation,
            status: "confirmed",
            color: randomColor,
            createdAt: Timestamp.now()
        }).then(() => {
            // Dispatch custom event to notify other components
            window.dispatchEvent(new Event('reservations-changed'));
            setIsReserveModalOpen(false);
        }).catch(err => {
            console.error("Error adding reservation: ", err);
            setError("예약 저장 중 오류가 발생했습니다: " + err);
            alert("저장 실패: " + err);
        });

        setIsReserveModalOpen(false);

        // Reset form
        setFormData({
            car: "기아 쏘렌토 (195하4504)",
            startDate: "2026-01-09",
            startTime: "09:00",
            endDate: "2026-01-09",
            endTime: "10:00",
            startLocation: "",
            endLocation: "",
            purpose: "외근"
        });
        setError(null);
    };

    const handleDeleteReservation = async () => {
        if (!selectedReservation) {
            return;
        }

        try {
            await deleteDoc(doc(db, "reservations", selectedReservation.id));

            // Dispatch custom event to notify other components
            window.dispatchEvent(new Event('reservations-changed'));

            setIsDetailsModalOpen(false);
            setSelectedReservation(null);
            setIsDeleting(false);
        } catch (err) {
            console.error("Error deleting reservation: ", err);
            alert("삭제 중 오류가 발생했습니다.");
        }
    };

    const renderCalendarDays = () => {
        const days = [];
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();

        if (viewMode === "month") {
            const daysCount = getDaysInMonth(viewDate);
            const offset = getFirstDayOfMonth(viewDate);

            for (let i = 0; i < offset; i++) {
                days.push(<div key={`empty-${i}`} className="h-32 bg-secondary/5 border-b border-r border-border/50"></div>);
            }

            for (let d = 1; d <= daysCount; d++) {
                const date = new Date(year, month, d);
                const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
                const dayReservations = reservationList.filter(r => r.date === dateStr);
                const isToday = d === 9 && month === 0 && year === 2026;

                days.push(
                    <div
                        key={dateStr}
                        onClick={() => handleDayClick(date)}
                        className={`h-32 border-b border-r border-border/50 p-2 relative group hover:bg-primary/5 transition-all cursor-pointer ${isToday ? 'bg-primary/10' : 'bg-transparent'}`}
                    >
                        <div className={`text-xs font-bold mb-2 ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                            {d}
                        </div>
                        <div className="space-y-1">
                            {dayReservations.map(res => (
                                <div
                                    key={res.id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedReservation(res);
                                        setIsDetailsModalOpen(true);
                                    }}
                                    className={`text-[10px] p-1 rounded-sm ${res.color} text-white truncate shadow-sm flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity`}
                                >
                                    <span className="font-bold shrink-0">{res.startTime}</span>
                                    <span className="opacity-90">
                                        {res.user === "hongilee@mangoslab.com" ? "이홍길" : res.user}
                                    </span>
                                    <span className="opacity-70 truncate">({res.car.includes('(') ? res.car.split('(')[1].split(')')[0] : res.car.split(' ')[0]})</span>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDayClick(date);
                            }}
                            className="absolute bottom-2 right-2 p-1 rounded-full bg-primary text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                            <Plus className="h-3 w-3" />
                        </button>
                    </div>
                );
            }
        } else {
            // Week mode: 7 days from the start of the current week (Sun-Sat)
            const weekStart = new Date(viewDate);
            // If we are in week mode, we might want to center the current week. 
            // For simplicity, let's just use the current viewDate and find its Sunday.
            weekStart.setDate(viewDate.getDate() - viewDate.getDay());

            for (let i = 0; i < 7; i++) {
                const date = new Date(weekStart);
                date.setDate(weekStart.getDate() + i);
                const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
                const dayReservations = reservationList.filter(r => r.date === dateStr);
                const isToday = date.getDate() === 9 && date.getMonth() === 0 && date.getFullYear() === 2026;

                days.push(
                    <div
                        key={dateStr}
                        onClick={() => handleDayClick(date)}
                        className={`h-[450px] border-b border-r border-border/50 p-4 relative group hover:bg-primary/5 transition-all cursor-pointer ${isToday ? 'bg-primary/10' : 'bg-transparent'}`}
                    >
                        <div className="flex flex-col items-center mb-6">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                                {['일', '월', '화', '수', '목', '금', '토'][date.getDay()]}
                            </span>
                            <span className={`text-xl font-black w-10 h-10 flex items-center justify-center rounded-full ${isToday ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' : 'text-foreground hover:bg-secondary transition-colors'}`}>
                                {date.getDate()}
                            </span>
                        </div>
                        <div className="space-y-2 overflow-y-auto max-h-[320px] pr-1 custom-scrollbar">
                            {dayReservations.map(res => (
                                <div
                                    key={res.id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedReservation(res);
                                        setIsDetailsModalOpen(true);
                                    }}
                                    className="p-2.5 rounded-xl bg-secondary/80 border-l-4 border-primary shadow-sm hover:scale-[1.02] transition-transform cursor-pointer"
                                >
                                    <div className="text-[10px] font-bold text-primary mb-1">{res.startTime} - {res.endTime}</div>
                                    <div className="text-xs font-bold text-foreground truncate">{res.car.replace('쓰렌토', '쏘렌토')}</div>
                                    <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                                        <div className="w-1 h-1 rounded-full bg-muted-foreground" />
                                        {res.user === "hongilee@mangoslab.com" ? "이홍길" : res.user} 예약
                                    </div>
                                </div>
                            ))}
                            {dayReservations.length === 0 && (
                                <div className="h-full flex items-center justify-center pt-8 opacity-20 group-hover:opacity-40 transition-opacity">
                                    <Plus className="w-8 h-8 text-muted-foreground" />
                                </div>
                            )}
                        </div>
                    </div>
                );
            }
        }
        return days;
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight">차량예약</h1>
                    <p className="text-muted-foreground text-sm mt-1">팀의 일정을 한눈에 관리하고 예약하세요.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-secondary/50 p-1 rounded-xl border border-border shadow-inner">
                        <button
                            onClick={() => setViewMode("month")}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === "month" ? "bg-background text-foreground shadow-lg" : "text-muted-foreground hover:text-foreground hover:bg-background/20"}`}
                        >
                            월간
                        </button>
                        <button
                            onClick={() => setViewMode("week")}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === "week" ? "bg-background text-foreground shadow-lg" : "text-muted-foreground hover:text-foreground hover:bg-background/20"}`}
                        >
                            주간
                        </button>
                    </div>
                    <button
                        onClick={() => setIsReserveModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-bold transition-all shadow-xl shadow-primary/30 hover:-translate-y-0.5"
                    >
                        <Plus className="h-4 w-4" />
                        새 예약
                    </button>
                </div>
            </div>

            {/* Calendar Controls & Navigation */}
            <div className="flex items-center justify-between bg-zinc-900/80 p-5 rounded-2xl border border-white/10 shadow-3xl backdrop-blur-xl">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-0.5">Reservation Calendar</span>
                        <h2 className="text-2xl font-black text-foreground tracking-tighter">
                            {viewDate.getFullYear()}년 {viewDate.getMonth() + 1}월
                        </h2>
                    </div>
                    <div className="flex bg-secondary/30 p-1.5 rounded-xl border border-border/50 shadow-inner">
                        <button onClick={navigatePrev} className="p-2 hover:bg-secondary hover:text-primary rounded-lg transition-all">
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => {
                                setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
                                setViewMode("month");
                            }}
                            className="px-4 py-1 text-xs font-black text-muted-foreground hover:text-foreground transition-all uppercase tracking-tighter"
                        >
                            Today
                        </button>
                        <button onClick={navigateNext} className="p-2 hover:bg-secondary hover:text-primary rounded-lg transition-all">
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>
                {viewMode === "week" && (
                    <div className="px-4 py-2 bg-primary/5 border border-primary/20 rounded-xl text-xs font-black text-primary uppercase tracking-wider hidden md:block">
                        {(() => {
                            const ws = new Date(viewDate);
                            ws.setDate(ws.getDate() - ws.getDay());
                            const we = new Date(ws);
                            we.setDate(we.getDate() + 6);
                            return `${ws.getMonth() + 1}월 ${ws.getDate()}일 ~ ${we.getMonth() + 1}월 ${we.getDate()}일`;
                        })()}
                    </div>
                )}
            </div>

            {/* Main Calendar Area */}
            <div className="glass-card rounded-3xl border border-white/10 overflow-hidden shadow-4xl backdrop-blur-3xl bg-zinc-950/20">
                {viewMode === "month" && (
                    <div className="grid grid-cols-7 border-b border-white/5 bg-secondary/20">
                        {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
                            <div key={day} className={`p-4 text-center text-[10px] font-black uppercase tracking-[0.3em] ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-muted-foreground/60'}`}>
                                {day}
                            </div>
                        ))}
                    </div>
                )}

                <div className={`grid grid-cols-7 bg-transparent transition-all duration-500 ease-out`}>
                    {renderCalendarDays()}
                </div>
            </div>

            {/* Reservation Modal */}
            <Modal isOpen={isReserveModalOpen} onClose={() => { setIsReserveModalOpen(false); setError(null); }} title="차량 예약하기">
                <form className="space-y-5 p-1" onSubmit={handleSubmit}>
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-bold flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}

                    {/* Hidden Datalist for Locations */}
                    <datalist id="locations-list">
                        {frequentSpots.map((dest) => (
                            <option key={dest.id} value={dest.name} />
                        ))}
                    </datalist>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">차량 선택</label>
                        <select
                            required
                            value={formData.car}
                            onChange={(e) => setFormData({ ...formData, car: e.target.value })}
                            className="w-full px-4 py-3 bg-secondary/50 border border-white/5 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none"
                        >
                            <option value="">선택하세요</option>
                            <option>기아 쏘렌토 (195하4504)</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">운전자 (자동 입력)</label>
                        <div className="w-full px-4 py-3 bg-secondary/20 border border-white/5 rounded-xl text-sm text-muted-foreground flex items-center gap-2 cursor-not-allowed">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            {user?.name || "사용자"}
                            <span className="text-xs opacity-50 ml-auto">로그인 계정</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">시작 날짜</label>
                            <input
                                type="date"
                                required
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="w-full px-4 py-3 bg-secondary/50 border border-white/5 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all [color-scheme:dark]"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">시작 시간</label>
                            <input
                                type="time"
                                required
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                className="w-full px-4 py-3 bg-secondary/50 border border-white/5 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all [color-scheme:dark]"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">종료 날짜</label>
                            <input
                                type="date"
                                required
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                className="w-full px-4 py-3 bg-secondary/50 border border-white/5 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all [color-scheme:dark]"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">종료 시간</label>
                            <input
                                type="time"
                                required
                                value={formData.endTime}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                className="w-full px-4 py-3 bg-secondary/50 border border-white/5 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all [color-scheme:dark]"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">출발지 (선택)</label>
                            <input
                                type="text"
                                list="locations-list"
                                placeholder="직접 입력 또는 선택"
                                value={formData.startLocation}
                                onChange={(e) => setFormData({ ...formData, startLocation: e.target.value })}
                                className="w-full px-4 py-3 bg-secondary/50 border border-white/5 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                            {/* Mobile-friendly Quick Select */}
                            <div className="flex flex-wrap gap-1.5 mt-1">
                                {frequentSpots.map(spot => (
                                    <button
                                        key={spot.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, startLocation: spot.name })}
                                        className="text-[10px] px-2 py-1 bg-secondary hover:bg-primary/20 hover:text-primary rounded-full border border-border transition-colors"
                                    >
                                        {spot.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">목적지 (선택)</label>
                            <input
                                type="text"
                                list="locations-list"
                                placeholder="직접 입력 또는 선택"
                                value={formData.endLocation}
                                onChange={(e) => setFormData({ ...formData, endLocation: e.target.value })}
                                className="w-full px-4 py-3 bg-secondary/50 border border-white/5 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                            {/* Mobile-friendly Quick Select */}
                            <div className="flex flex-wrap gap-1.5 mt-1">
                                {frequentSpots.map(spot => (
                                    <button
                                        key={spot.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, endLocation: spot.name })}
                                        className="text-[10px] px-2 py-1 bg-secondary hover:bg-primary/20 hover:text-primary rounded-full border border-border transition-colors"
                                    >
                                        {spot.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">목적</label>
                        <select
                            required
                            value={formData.purpose}
                            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                            className="w-full px-4 py-3 bg-secondary/50 border border-white/5 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none"
                        >
                            <option value="외근">외근</option>
                            <option value="출장">출장</option>
                            <option value="기타">기타</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-6">
                        <button type="button" onClick={() => setIsReserveModalOpen(false)} className="px-6 py-3 bg-secondary/50 hover:bg-secondary text-foreground rounded-xl text-sm font-bold transition-all border border-white/5">취소</button>
                        <button type="submit" className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-bold transition-all shadow-xl shadow-primary/30">예약 완료</button>
                    </div>
                </form>
            </Modal>

            {/* Reservation Details Modal */}
            <Modal isOpen={isDetailsModalOpen} onClose={() => { setIsDetailsModalOpen(false); setSelectedReservation(null); setIsDeleting(false); }} title="예약 정보">
                {selectedReservation && (
                    <div className="space-y-4 p-1">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">차량</label>
                            <div className="w-full px-4 py-3 bg-secondary/50 border border-white/5 rounded-xl text-sm text-foreground">
                                {selectedReservation.car}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">예약자</label>
                            <div className="w-full px-4 py-3 bg-secondary/50 border border-white/5 rounded-xl text-sm text-foreground">
                                {selectedReservation.user === "hongilee@mangoslab.com" ? "이홍길" : selectedReservation.user}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">시작 시간</label>
                                <div className="w-full px-4 py-3 bg-secondary/50 border border-white/5 rounded-xl text-sm text-foreground">
                                    {selectedReservation.date} {selectedReservation.startTime}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">종료 시간</label>
                                <div className="w-full px-4 py-3 bg-secondary/50 border border-white/5 rounded-xl text-sm text-foreground">
                                    {selectedReservation.date} {selectedReservation.endTime}
                                </div>
                            </div>
                        </div>

                        {(selectedReservation.startLocation || selectedReservation.endLocation) && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">출발지</label>
                                    <div className="w-full px-4 py-3 bg-secondary/50 border border-white/5 rounded-xl text-sm text-foreground min-h-[46px]">
                                        {selectedReservation.startLocation || "-"}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">목적지</label>
                                    <div className="w-full px-4 py-3 bg-secondary/50 border border-white/5 rounded-xl text-sm text-foreground min-h-[46px]">
                                        {selectedReservation.endLocation || "-"}
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedReservation.purpose && (
                            <div className="space-y-2">
                                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">목적</label>
                                <div className="w-full px-4 py-3 bg-secondary/50 border border-white/5 rounded-xl text-sm text-foreground">
                                    {selectedReservation.purpose}
                                </div>
                            </div>
                        )}
                        <div className="flex justify-end gap-3 pt-6 border-t border-white/5 mt-6">
                            {isDeleting ? (
                                <div className="flex items-center justify-between w-full">
                                    <span className="text-sm font-bold text-red-400">정말 삭제하시겠습니까?</span>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsDeleting(false)}
                                            className="px-4 py-2 bg-secondary/50 hover:bg-secondary text-foreground rounded-xl text-xs font-bold transition-all border border-white/5"
                                        >
                                            아니오
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleDeleteReservation}
                                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-red-500/20"
                                        >
                                            예, 삭제합니다
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => setIsDeleting(true)}
                                        className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-sm font-bold transition-all"
                                    >
                                        삭제
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setIsDetailsModalOpen(false); setSelectedReservation(null); setIsDeleting(false); }}
                                        className="px-6 py-3 bg-secondary/50 hover:bg-secondary text-foreground rounded-xl text-sm font-bold transition-all border border-white/5"
                                    >
                                        닫기
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
