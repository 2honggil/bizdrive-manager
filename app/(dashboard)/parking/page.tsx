"use client";

import { MapPin, Camera, Navigation, Car, AlertCircle } from "lucide-react";

const parkingZones = [
    {
        name: "지하 1층 (B1)", spots: [
            { id: "A1", status: "occupied", car: "쏘렌토 (195하4504)", time: "10:30" },
            { id: "A2", status: "empty" },
            { id: "A3", status: "empty" },
            { id: "A4", status: "occupied", car: "아반떼 (123가4567)", time: "09:00" },
        ]
    },
    {
        name: "지하 2층 (B2)", spots: [
            { id: "B1", status: "empty" },
            { id: "B2", status: "occupied", car: "카니발 (333루3333)", time: "Yesterday" },
            { id: "B3", status: "empty" },
        ]
    }
];

const lastParked = [
    { car: "쏘렌토 (195하4504)", location: "B1 - A1", photo: true, time: "오늘 10:30", driver: "홍길동" },
    { car: "아반떼 (123가4567)", location: "B1 - A4", photo: true, time: "오늘 09:00", driver: "이영희" },
    { car: "카니발 (333루3333)", location: "B2 - B2", photo: false, time: "어제 18:00", driver: "김철수" },
    { car: "그랜저 (999호9999)", location: "출차 중", photo: false, time: "-", driver: "최지우" },
];

export default function ParkingPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">차량주차위치</h1>
                    <p className="text-muted-foreground text-sm mt-1">각 차량의 현재 주차 위치를 확인합니다.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary border border-border rounded-full text-xs text-muted-foreground">
                    <AlertCircle className="h-3 w-3" />
                    <span>마지막 운행 종료 시 입력된 정보입니다.</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Visual Map Placeholder */}
                <div className="lg:col-span-2 space-y-6">
                    {parkingZones.map((zone) => (
                        <div key={zone.name} className="glass-card rounded-xl p-5 border border-border">
                            <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-primary" />
                                {zone.name}
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {zone.spots.map((spot) => (
                                    <div
                                        key={spot.id}
                                        className={`relative aspect-square rounded-xl border flex flex-col items-center justify-center p-2 text-center transition-all ${spot.status === 'occupied'
                                            ? 'bg-primary/10 border-primary/30'
                                            : 'bg-secondary/30 border-border border-dashed'
                                            }`}
                                    >
                                        <span className="absolute top-2 left-3 text-xs font-bold text-muted-foreground">{spot.id}</span>
                                        {spot.status === 'occupied' ? (
                                            <>
                                                <Car className="h-8 w-8 text-primary/80 mb-2" />
                                                <p className="text-xs font-bold text-primary-foreground/90 truncate w-full">{spot.car?.split(' ')[0]}</p>
                                                <p className="text-[10px] text-muted-foreground truncate w-full">{spot.car?.split(' ')[1]}</p>
                                            </>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">빈 자리</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* List View */}
                <div className="glass-card rounded-xl p-0 overflow-hidden border border-border h-fit">
                    <div className="p-4 border-b border-border bg-secondary/30">
                        <h3 className="font-semibold text-foreground">차량별 위치 목록</h3>
                    </div>
                    <div className="divide-y divide-border">
                        {lastParked.map((item, i) => (
                            <div key={i} className="p-4 hover:bg-secondary/30 transition-colors">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-foreground text-sm">{item.car.split(' ')[0]}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded ${item.location === '출차 중' ? 'bg-secondary text-muted-foreground' : 'bg-primary/10 text-primary border border-primary/20'
                                        }`}>
                                        {item.location}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground mb-2">{item.car.split(' ')[1]}</p>

                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <span>{item.time}</span>
                                        <span className="w-0.5 h-2 bg-border"></span>
                                        <span>{item.driver}</span>
                                    </div>
                                    {item.photo && (
                                        <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                                            <Camera className="h-3 w-3" />
                                            <span>사진 보기</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
