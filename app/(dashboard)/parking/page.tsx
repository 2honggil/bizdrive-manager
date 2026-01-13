"use client";

import { MapPin, Camera, Car, AlertCircle, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import Modal from "@/components/Modal"; // Keep Modal import if we want to add viewing details later, though manual assignment is being replaced/hidden
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

// Helper to parse "Building (Detail)" format
const parseLocation = (parkingStr: string) => {
    if (!parkingStr) return { building: "미지정", detail: "-" };

    // Known complex building names
    const knownComplexBuildings = ["본사 (파미어스몰)"];

    // Check if it starts with a known building and has a detail
    for (const known of knownComplexBuildings) {
        if (parkingStr.startsWith(known)) {
            // If exactly matches, detail is empty or default
            if (parkingStr === known) return { building: known, detail: "-" };

            // If has extra, assume "Known (Detail)" format where known has parens
            // But simpler: just use the robust lastIndexOf logic below, 
            // BUT we need to be careful if result splits the Known name.

            // Let's rely on the lastIndexOf logic but ensure we don't split INSIDE the known name
            // Actually, the "본사 (파미어스몰)" case usually comes as "본사 (파미어스몰) (B4 J50)"
            // lastIndexOf(' (') would find the last one, which is correct.
            // But if it is JUST "본사 (파미어스몰)", lastIndexOf(' (') is index 3.
            // Then building becomes "본사", detail "파미어스몰". WRONG.
        }
    }

    // Improved logic:
    // 1. Try to split by last " ("
    const lastParenIndex = parkingStr.lastIndexOf(' (');

    if (lastParenIndex > -1 && parkingStr.endsWith(')')) {
        const potentialBuilding = parkingStr.substring(0, lastParenIndex);
        const potentialDetail = parkingStr.substring(lastParenIndex + 2, parkingStr.length - 1);

        // Check if the potential building splits a known complex building name
        // e.g. "본사" is formed because we split "본사 (파미어스몰)"
        if (parkingStr === "본사 (파미어스몰)") {
            return { building: parkingStr, detail: "-" };
        }

        return { building: potentialBuilding, detail: potentialDetail };
    }

    return { building: parkingStr, detail: "-" };
};

export default function ParkingPage() {
    const [zones, setZones] = useState<any[]>([]);
    const [vehicleLocations, setVehicleLocations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

    // Sync from Firestore Logs
    useEffect(() => {
        // Query logs to get latest locations
        const q = query(collection(db, "logs"), orderBy("date", "desc"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const latestLogsByName: Record<string, any> = {};

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                // If we haven't seen this car yet, this is the latest log (due to order by date desc)
                // Note: If multiple logs have same date, order might be arbitrary unless we sort by createdAt too.
                // Assuming date is enough or strictly sequential.
                if (!latestLogsByName[data.car]) {
                    latestLogsByName[data.car] = { ...data, id: doc.id };
                }
            });

            // Construct Zones and List Data
            const newZonesMap: Record<string, any[]> = {};
            const newList: any[] = [];

            Object.values(latestLogsByName).forEach(log => {
                const { building, detail } = parseLocation(log.parking);

                // Add to List View Data
                newList.push({
                    car: log.car,
                    location: `${building} ${detail}`,
                    time: log.date,
                    driver: log.driver,
                    photo: log.hasPhoto,
                    photoUrl: log.photoUrl
                });

                // Add to Zone Data
                if (!newZonesMap[building]) {
                    newZonesMap[building] = [];
                }
                newZonesMap[building].push({
                    id: detail,
                    status: 'occupied',
                    car: log.car,
                    time: log.date,
                    driver: log.driver, // Added driver info to spot
                    photoUrl: log.photoUrl
                });
            });

            // Convert map to array
            const newZones = Object.keys(newZonesMap).map(buildingName => ({
                name: buildingName,
                spots: newZonesMap[buildingName]
            }));

            setZones(newZones);
            setVehicleLocations(newList);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const viewPhoto = (url: string) => {
        if (url) {
            setSelectedPhoto(url);
            setIsPhotoModalOpen(true);
        }
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
                    <span>운행 기록에 따라 자동으로 업데이트됩니다.</span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Dynamic Visual Map */}
                <div className="space-y-6">
                    {zones.length === 0 ? (
                        <div className="glass-card rounded-xl p-10 border border-border text-center">
                            <p className="text-muted-foreground">주차된 차량 정보가 없습니다.</p>
                        </div>
                    ) : (
                        zones.map((zone) => (
                            <div key={zone.name} className="glass-card rounded-xl p-6 border border-border">
                                <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-primary" />
                                    {zone.name}
                                </h3>
                                {/* Use a flexible grid that adapts to content but prefers larger items */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {zone.spots.map((spot: any, index: number) => (
                                        <div
                                            key={`${spot.id}-${index}`}
                                            onClick={() => spot.photoUrl && viewPhoto(spot.photoUrl)}
                                            className={`relative aspect-[4/3] rounded-2xl border flex flex-col items-center justify-center p-4 text-center shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden group ${spot.photoUrl
                                                    ? 'border-primary/50 cursor-pointer hover:shadow-primary/20'
                                                    : 'bg-primary/10 border-primary/30 shadow-primary/5'
                                                }`}
                                        >
                                            {/* Background Image if available */}
                                            {spot.photoUrl && (
                                                <>
                                                    <div
                                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                                        style={{ backgroundImage: `url(${spot.photoUrl})` }}
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
                                                </>
                                            )}

                                            {/* Content Layer */}
                                            <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
                                                <span className={`absolute top-0 left-0 text-xs font-black tracking-tighter ${spot.photoUrl ? 'text-white/80' : 'text-muted-foreground/60'}`}>
                                                    {spot.id === '-' ? '미지정' : spot.id}
                                                </span>

                                                {!spot.photoUrl && <Car className="h-12 w-12 text-primary mb-3 drop-shadow-md" />}

                                                <div className="flex flex-col items-center justify-center flex-1 w-full">
                                                    <p className={`text-2xl font-black truncate w-full mb-1 ${spot.photoUrl ? 'text-white drop-shadow-lg' : 'text-foreground'}`}>
                                                        {spot.car?.split(' ')[0]}
                                                    </p>
                                                    <p className={`text-sm truncate w-full tracking-tighter mb-4 ${spot.photoUrl ? 'text-white/80 drop-shadow-md' : 'text-muted-foreground'}`}>
                                                        {spot.car?.split(' ')[1]}
                                                    </p>
                                                </div>

                                                <div className="mt-auto flex items-center gap-2 w-full justify-center">
                                                    <div className={`px-2 py-1 rounded text-[10px] font-bold ${spot.photoUrl ? 'bg-black/50 text-white border border-white/20 backdrop-blur-sm' : 'bg-primary/20 text-primary'}`}>
                                                        {spot.time}
                                                    </div>
                                                    <div className={`px-2 py-1 rounded text-[10px] font-bold border ${spot.photoUrl ? 'bg-black/50 text-white/90 border-white/20 backdrop-blur-sm' : 'bg-secondary text-muted-foreground border-border'}`}>
                                                        {spot.driver}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* List View */}
                <div className="glass-card rounded-xl p-0 overflow-hidden border border-border h-fit">
                    <div className="p-4 border-b border-border bg-secondary/30">
                        <h3 className="font-semibold text-foreground">차량별 위치 목록</h3>
                    </div>
                    <div className="divide-y divide-border">
                        {vehicleLocations.length === 0 ? (
                            <div className="p-4 text-center text-xs text-muted-foreground">기록 없음</div>
                        ) : (
                            vehicleLocations.map((item, i) => (
                                <div key={i} className="p-4 hover:bg-secondary/30 transition-colors flex items-center gap-4">
                                    {/* Thumbnail */}
                                    {item.photoUrl ? (
                                        <div
                                            className="h-12 w-16 rounded-lg bg-cover bg-center shrink-0 border border-border cursor-pointer hover:opacity-80 transition-opacity"
                                            style={{ backgroundImage: `url(${item.photoUrl})` }}
                                            onClick={() => viewPhoto(item.photoUrl)}
                                        />
                                    ) : (
                                        <div className="h-12 w-16 rounded-lg bg-secondary/50 flex items-center justify-center shrink-0 border border-border">
                                            <Car className="h-6 w-6 text-muted-foreground/30" />
                                        </div>
                                    )}

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-medium text-foreground text-sm">{item.car.split(' ')[0]}</span>
                                            <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                                                {item.location}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-1">{item.car.split(' ')[1]}</p>

                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>{item.time}</span>
                                            <span className="w-0.5 h-2 bg-border"></span>
                                            <span>{item.driver}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
            {/* Photo Viewer Modal */}
            <Modal isOpen={isPhotoModalOpen} onClose={() => setIsPhotoModalOpen(false)} title="주차 위치 사진" size="md">
                <div className="flex items-center justify-center p-2">
                    {selectedPhoto ? (
                        <img src={selectedPhoto} alt="Parking Location" className="max-w-full h-auto rounded-lg shadow-2xl" />
                    ) : (
                        <p className="text-muted-foreground">사진이 없습니다.</p>
                    )}
                </div>
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={() => setIsPhotoModalOpen(false)}
                        className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium"
                    >
                        닫기
                    </button>
                </div>
            </Modal>
        </div>
    );
}
