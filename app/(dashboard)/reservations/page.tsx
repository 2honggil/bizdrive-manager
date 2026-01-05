"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">차량예약</h1>
                    <p className="text-muted-foreground text-sm mt-1">차량 사용 일정을 확인하고 예약합니다.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground transition-colors border border-border">
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-lg font-bold text-foreground px-4">2024년 1월</span>
                    <button className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground transition-colors border border-border">
                        <ChevronRight className="h-4 w-4" />
                    </button>
                    <button className="ml-4 flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20">
                        <Plus className="h-4 w-4" />
                        예약하기
                    </button>
                </div>
            </div>

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
        </div>
    );
}
