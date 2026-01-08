"use client";

import { MapPin, Camera, Navigation, Car, AlertCircle } from "lucide-react";

const parkingZones = [
    {
        name: "본사 (파미어스몰)", spots: [
            { id: "A1", status: "occupied", car: "쏘렌토 (195하4504)", time: "10:30" },
            { id: "A2", status: "empty" },
            { id: "A3", status: "empty" },
            { id: "A4", status: "occupied", car: "아반떼 (123가4567)", time: "09:00" },
        ]
    },
    {
        name: "외부 주차장", spots: [
            { id: "B1", status: "empty" },
            { id: "B2", status: "occupied", car: "카니발 (333루3333)", time: "Yesterday" },
            { id: "B3", status: "empty" },
        ]
    }
];

const lastParked = [
    { car: "쏘렌토 (195하4504)", location: "본사 - A1", photo: true, time: "오늘 10:30", driver: "홍길동" },
    { car: "아반떼 (123가4567)", location: "본사 - A4", photo: true, time: "오늘 09:00", driver: "이영희" },
    { car: "카니발 (333루3333)", location: "외부 - B2", photo: false, time: "어제 18:00", driver: "김철수" },
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
                {/* Dynamic Visual Map */}
                <div className="lg:col-span-2 space-y-6">
                    {parkingZones.map((zone) => (
                        <div key={zone.name} className="glass-card rounded-xl p-5 border border-border">
                            <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-primary" />
                                {zone.name}
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {zone.spots.map((spot) => {
                                    // Find if any vehicle is parked specifically at this zone and spot ID
                                    // Format in lastParked: "ZoneName - SpotID"
                                    const zonePrefix = zone.name.split(" ")[0]; // "본사" or "외부"
                                    const targetLoc = `${zonePrefix} - ${spot.id}`;
                                    const occupant = lastParked.find(p => p.location === targetLoc);

                                    if (!occupant) return null;

                                    return (
                                        <div
                                            key={spot.id}
                                            className={`relative aspect-square rounded-xl border flex flex-col items-center justify-center p-2 text-center transition-all ${occupant
                                                ? 'bg-primary/10 border-primary/30 shadow-lg shadow-primary/5'
                                                : 'bg-secondary/30 border-border border-dashed'
                                                }`}
                                        >
                                            <span className="absolute top-2 left-3 text-[10px] font-black tracking-tighter text-muted-foreground/60">
                                                {occupant ? occupant.location : spot.id}
                                            </span>
                                            {occupant ? (
                                                <>
                                                    <Car className="h-8 w-8 text-primary mb-2 drop-shadow-sm" />
                                                    <p className="text-[10px] font-black text-foreground truncate w-full">{occupant.car.split(' ')[0]}</p>
                                                    <p className="text-[8px] text-muted-foreground truncate w-full tracking-tighter">{occupant.car.split(' ')[1]}</p>
                                                    <div className="mt-1 px-1.5 py-0.5 bg-primary/20 rounded text-[8px] font-bold text-primary">
                                                        {occupant.time}
                                                    </div>
                                                </>
                                            ) : (
                                                <span className="text-[10px] font-medium text-muted-foreground/40">EMPTY</span>
                                            )}
                                        </div>
                                    );
                                })}
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
