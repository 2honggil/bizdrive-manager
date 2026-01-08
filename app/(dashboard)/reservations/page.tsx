"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import Modal from "@/components/Modal";

// Mock reservation data with full date strings
const initialReservations = [
    { id: 1, car: "쏘렌토 (195하4504)", user: "홍길동", date: "2026-01-04", startTime: "09:00", endTime: "12:00", status: "confirmed", color: "bg-indigo-600" },
    { id: 2, car: "카니발 (333루3333)", user: "김철수", date: "2026-01-04", startTime: "13:00", endTime: "18:00", status: "pending", color: "bg-orange-500" },
    { id: 3, car: "아반떼 (123가4567)", user: "이영희", date: "2026-01-05", startTime: "10:00", endTime: "15:00", status: "confirmed", color: "bg-green-600" },
    { id: 4, car: "그랜저 (999호9999)", user: "최지우", date: "2026-01-06", startTime: "09:00", endTime: "18:00", status: "confirmed", color: "bg-blue-600" },
    { id: 5, car: "쏘렌토 (195하4504)", user: "박민수", date: "2026-01-08", startTime: "14:00", endTime: "16:00", status: "pending", color: "bg-orange-500" },
];

export default function Reservations() {
    const today = new Date(2026, 0, 9);
    const [reservationList, setReservationList] = useState(initialReservations);
    const [viewDate, setViewDate] = useState(new Date(2026, 0, 1)); // Target month start
    const [viewMode, setViewMode] = useState<"month" | "week">("month");
    const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        car: "",
        startDate: "2026-01-09",
        startTime: "09:00",
        endDate: "2026-01-09",
        endTime: "10:00",
        purpose: ""
    });

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
            endDate: dateStr
        });
        setIsReserveModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const colors = ['bg-indigo-600', 'bg-orange-500', 'bg-green-600', 'bg-blue-600', 'bg-purple-600'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        const newReservation = {
            id: reservationList.length + 1,
            car: formData.car || "쏘렌토 (195하4504)",
            user: "홍길동",
            date: formData.startDate,
            startTime: formData.startTime,
            endTime: formData.endTime,
            status: "confirmed",
            color: randomColor
        };

        setReservationList([...reservationList, newReservation]);
        setIsReserveModalOpen(false);

        // Reset form
        setFormData({
            car: "",
            startDate: "2026-01-09",
            startTime: "09:00",
            endDate: "2026-01-09",
            endTime: "10:00",
            purpose: ""
        });
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
                                <div key={res.id} className={`text-[10px] p-1 rounded-sm ${res.color} text-white truncate shadow-sm flex items-center gap-1`}>
                                    <span className="font-bold shrink-0">{res.startTime}</span>
                                    <span className="opacity-90">{res.user}</span>
                                    <span className="opacity-70 truncate">({res.car.split(' ')[0]})</span>
                                </div>
                            ))}
                        </div>
                        <button className="absolute bottom-2 right-2 p-1 rounded-full bg-primary text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
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
                                <div key={res.id} className="p-2.5 rounded-xl bg-secondary/80 border-l-4 border-primary shadow-sm hover:scale-[1.02] transition-transform">
                                    <div className="text-[10px] font-bold text-primary mb-1">{res.startTime} - {res.endTime}</div>
                                    <div className="text-xs font-bold text-foreground truncate">{res.car}</div>
                                    <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                                        <div className="w-1 h-1 rounded-full bg-muted-foreground" />
                                        {res.user} 예약
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
            <Modal isOpen={isReserveModalOpen} onClose={() => setIsReserveModalOpen(false)} title="차량 예약하기">
                <form className="space-y-5 p-1" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">차량 선택</label>
                        <select
                            required
                            value={formData.car}
                            onChange={(e) => setFormData({ ...formData, car: e.target.value })}
                            className="w-full px-4 py-3 bg-secondary/50 border border-white/5 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none"
                        >
                            <option value="">선택하세요</option>
                            <option>쏘렌토 (195하4504)</option>
                            <option>아반떼 (123가4567)</option>
                            <option>카니발 (333루3333)</option>
                            <option>그랜저 (999호9999)</option>
                        </select>
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
                    <div className="space-y-2">
                        <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">목적</label>
                        <input
                            type="text"
                            required
                            value={formData.purpose}
                            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                            placeholder="예: 외근, 출장"
                            className="w-full px-4 py-3 bg-secondary/50 border border-white/5 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-6">
                        <button type="button" onClick={() => setIsReserveModalOpen(false)} className="px-6 py-3 bg-secondary/50 hover:bg-secondary text-foreground rounded-xl text-sm font-bold transition-all border border-white/5">취소</button>
                        <button type="submit" className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-bold transition-all shadow-xl shadow-primary/30">예약 완료</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
