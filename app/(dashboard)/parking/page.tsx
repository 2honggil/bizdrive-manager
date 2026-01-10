"use client";

import { MapPin, Camera, Navigation, Car, AlertCircle, Plus, ChevronDown } from "lucide-react";
import { useState } from "react";
import Modal from "@/components/Modal";

import { parkingZones, lastParked } from "@/lib/mockData";

export default function ParkingPage() {
    const [zones, setZones] = useState(parkingZones);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedSpot, setSelectedSpot] = useState<any>(null);
    const [formData, setFormData] = useState({ car: "", time: "09:00" });

    const handleSpotClick = (zoneName: string, spot: any) => {
        setSelectedSpot({ zoneName, ...spot });
        setFormData({ car: spot.car || "", time: spot.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) });
        setIsAssignModalOpen(true);
    };

    const handleAssign = (e: React.FormEvent) => {
        e.preventDefault();
        setZones(zones.map(zone => {
            if (zone.name === selectedSpot.zoneName) {
                return {
                    ...zone,
                    spots: zone.spots.map(s => {
                        if (s.id === selectedSpot.id) {
                            return { ...s, car: formData.car, status: formData.car ? 'occupied' : 'empty', time: formData.time };
                        }
                        return s;
                    })
                };
            }
            return zone;
        }));
        setIsAssignModalOpen(false);
    };

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
                                    return (
                                        <button
                                            key={spot.id}
                                            onClick={() => handleSpotClick(zone.name, spot)}
                                            className={`relative aspect-square rounded-xl border flex flex-col items-center justify-center p-2 text-center transition-all hover:scale-[1.02] ${spot.status === 'empty'
                                                ? 'bg-secondary/30 border-dashed border-border text-muted-foreground hover:bg-secondary/50'
                                                : 'bg-primary/10 border-primary/30 shadow-lg shadow-primary/5'
                                                }`}
                                        >
                                            <span className="absolute top-2 left-3 text-[10px] font-black tracking-tighter text-muted-foreground/60">
                                                {spot.id}
                                            </span>
                                            {spot.status === 'empty' ? (
                                                <Plus className="h-6 w-6 text-muted-foreground/30" />
                                            ) : (
                                                <>
                                                    <Car className="h-8 w-8 text-primary mb-2 drop-shadow-sm" />
                                                    <p className="text-[10px] font-black text-foreground truncate w-full">{spot.car?.split(' ')[0]}</p>
                                                    <p className="text-[8px] text-muted-foreground truncate w-full tracking-tighter">{spot.car?.split(' ')[1]}</p>
                                                    <div className="mt-1 px-1.5 py-0.5 bg-primary/20 rounded text-[8px] font-bold text-primary">
                                                        {spot.time}
                                                    </div>
                                                </>
                                            )}
                                        </button>
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

            <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title="주차 위치 배정">
                <form className="space-y-4" onSubmit={handleAssign}>
                    <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl mb-4">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">배정 위치</p>
                        <p className="text-sm font-black text-foreground">{selectedSpot?.zoneName} - {selectedSpot?.id}번 구역</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">배정 차량</label>
                        <select
                            value={formData.car}
                            onChange={(e) => setFormData({ ...formData, car: e.target.value })}
                            className="w-full px-4 py-2 bg-secondary/80 border border-primary/30 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                        >
                            <option value="">비어 있음 (출차)</option>
                            <option>쏘렌토 (195하4504)</option>
                            <option>아반떼 (123가4567)</option>
                            <option>카니발 (333루3333)</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">주차 시간</label>
                        <input
                            type="time"
                            value={formData.time}
                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                            className="w-full px-4 py-2 bg-secondary/80 border border-primary/30 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <button type="button" onClick={() => setIsAssignModalOpen(false)} className="px-6 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg text-sm font-medium transition-colors border border-border">취소</button>
                        <button type="submit" className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors">배정 완료</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
