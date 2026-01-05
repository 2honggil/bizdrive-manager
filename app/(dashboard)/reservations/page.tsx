"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import Modal from "@/components/Modal";

// Mock reservation data
const reservations = [
    { id: 1, car: "쏘렌토 (195하4504)", user: "홍길동", date: 4, startTime: "09:00", endTime: "12:00", status: "confirmed", color: "bg-indigo-600" },
    { id: 2, car: "카니발 (333루3333)", user: "김철수", date: 4, startTime: "13:00", endTime: "18:00", status: "pending", color: "bg-orange-500" },
    { id: 3, car: "아반떼 (123가4567)", user: "이영희", date: 5, startTime: "10:00", endTime: "15:00", status: "confirmed", color: "bg-green-600" },
    { id: 4, car: "그랜저 (999호9999)", user: "최지우", date: 6, startTime: "09:00", endTime: "18:00", status: "confirmed", color: "bg-blue-600" },
    { id: 5, car: "쏘렌토 (195하4504)", user: "박민수", date: 8, startTime: "14:00", endTime: "16:00", status: "pending", color: "bg-orange-500" },
];

export default function Reservations() {
    const [currentDate, setCurrentDate] = useState(new Date(2024, 0, 4));
    const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);

    const daysInMonth = 31;
    const startDayOffset = 1;

    const renderCalendarDays = () => {
        const days = [];

        // Empty cells for previous month
        for (let i = 0; i < startDayOffset; i++) {
            days.push(<div key={`empty-${i}`} className="h-32 bg-secondary/10 border-b border-r border-border"></div>);
        }

        // Days
        for (let day = 1; day <= daysInMonth; day++) {
            const dayReservations = reservations.filter(r => r.date === day);
            const isToday = day === 4;

            days.push(
                <div key={day} className={`h-32 border-b border-r border-border p-2 relative group hover:bg-secondary/30 transition-colors ${isToday ? 'bg-secondary/20' : 'bg-transparent'}`}>
                    <div className={`text-sm font-medium mb-2 ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                        {day}
                    </div>
                    <div className="space-y-1">
                        {dayReservations.map(res => (
                            <div key={res.id} className="text-xs p-1.5 rounded bg-secondary border-l-2 border-primary truncate cursor-pointer hover:bg-secondary/80 transition-colors">
                                <div className="font-medium text-foreground truncate">{res.car}</div>
                                <div className="text-muted-foreground text-[10px]">{res.startTime} - {res.user}</div>
                            </div>
                        ))}
                    </div>
                    <button className="absolute bottom-2 right-2 p-1 rounded-full bg-primary text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                        <Plus className="h-3 w-3" />
                    </button>
                </div>
            );
        }
        return days;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">차량예약</h1>
                    <p className="text-muted-foreground text-sm mt-1">캘린더에서 차량을 예약하고 현황을 확인합니다.</p>
                </div>
                <button
                    onClick={() => setIsReserveModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20"
                >
                    <Plus className="h-4 w-4" />
                    예약하기
                </button>
            </div>

            <Modal isOpen={isReserveModalOpen} onClose={() => setIsReserveModalOpen(false)} title="차량 예약하기">
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsReserveModalOpen(false); }}>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">차량 선택</label>
                        <select required className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors">
                            <option value="">선택하세요</option>
                            <option>쏘렌토 (195하4504)</option>
                            <option>아반떼 (123가4567)</option>
                            <option>카니발 (333루3333)</option>
                            <option>그랜저 (999호9999)</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">시작 날짜</label>
                            <input type="date" required className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">시작 시간</label>
                            <input type="time" required className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">종료 날짜</label>
                            <input type="date" required className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">종료 시간</label>
                            <input type="time" required className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">목적</label>
                        <input type="text" required placeholder="예: 외근, 출장" className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors" />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <button type="button" onClick={() => setIsReserveModalOpen(false)} className="px-6 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg text-sm font-medium transition-colors border border-border">취소</button>
                        <button type="submit" className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20">예약하기</button>
                    </div>
                </form>
            </Modal>

            <div className="glass-card rounded-xl border border-border overflow-hidden">
                <div className="grid grid-cols-7 border-b border-border bg-secondary/50">
                    {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
                        <div key={day} className={`p-3 text-center text-sm font-medium ${i === 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 bg-background">
                    {renderCalendarDays()}
                </div>
            </div>
        </div >
    );
}
