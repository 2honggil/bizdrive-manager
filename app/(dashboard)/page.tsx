"use client";

import { Car, Fuel, Calendar, ArrowUpRight, ArrowDownRight, MoreHorizontal } from "lucide-react";

import { mockLogs, fuelMockData } from "@/lib/mockData";
import { useMemo, useState, useEffect } from "react";

export default function Dashboard() {
    const [reservationCount, setReservationCount] = useState(0);
    const [upcomingReservations, setUpcomingReservations] = useState<any[]>([]);

    // Load reservations from localStorage
    useEffect(() => {
        const loadReservations = () => {
            const saved = localStorage.getItem('bizdrive-reservations');
            if (saved) {
                try {
                    const reservations = JSON.parse(saved);
                    // Count upcoming reservations (today or later)
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const upcoming = reservations.filter((res: any) => {
                        const resDate = new Date(res.date);
                        return resDate >= today;
                    }).sort((a: any, b: any) => {
                        const dateCompare = a.date.localeCompare(b.date);
                        if (dateCompare !== 0) return dateCompare;
                        return a.startTime.localeCompare(b.startTime);
                    });

                    setReservationCount(upcoming.length);
                    setUpcomingReservations(upcoming.slice(0, 3)); // Show top 3
                } catch (e) {
                    console.error('Failed to load reservations', e);
                }
            } else {
                setReservationCount(0);
                setUpcomingReservations([]);
            }
        };

        // Initial load
        loadReservations();

        // Listen for storage changes (works across tabs)
        window.addEventListener('storage', loadReservations);

        // Listen for custom reservation changes (same tab)
        window.addEventListener('reservations-changed', loadReservations);

        // Listen for focus events (when user returns to tab)
        window.addEventListener('focus', loadReservations);

        return () => {
            window.removeEventListener('storage', loadReservations);
            window.removeEventListener('reservations-changed', loadReservations);
            window.removeEventListener('focus', loadReservations);
        };
    }, []);

    // Calculate dashboard statistics
    const stats = useMemo(() => {
        // 1. Determine "Current Month" based on the latest log (Jan 2026)
        const sortedLogs = [...mockLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const latestLogDate = sortedLogs[0]?.date ? new Date(sortedLogs[0].date) : new Date();
        const currentYear = latestLogDate.getFullYear();
        const currentMonth = latestLogDate.getMonth() + 1; // 1-based

        // Filter logs for the "Current Month"
        const currentMonthLogs = mockLogs.filter(log => {
            const d = new Date(log.date);
            return d.getFullYear() === currentYear && (d.getMonth() + 1) === currentMonth;
        });

        // Total Distance (Current Month)
        const totalDistance = currentMonthLogs.reduce((sum, log) => sum + (log.endKm - log.startKm), 0);

        // Fuel Cost (Current Month) - Note: mockFuelData might be older, so this might be 0 if no match
        // Let's assume we show the latest available month with data for Fuel if current is empty? 
        // Or just show strict current month. Sticking to strict current month for accuracy.
        const currentMonthFuel = fuelMockData.filter(item => {
            const d = new Date(item.date);
            return d.getFullYear() === currentYear && (d.getMonth() + 1) === currentMonth;
        });
        const totalFuelCost = currentMonthFuel.reduce((sum, item) => sum + parseInt(item.amount.replace(/,/g, ''), 10), 0);

        // Monthly Chart Data (Last 12 months)
        const chartData = Array.from({ length: 12 }, (_, i) => {
            const d = new Date(currentYear, currentMonth - 1 - i, 1);
            const y = d.getFullYear();
            const m = d.getMonth() + 1;

            const monthLogs = mockLogs.filter(log => {
                const ld = new Date(log.date);
                return ld.getFullYear() === y && (ld.getMonth() + 1) === m;
            });

            const value = monthLogs.reduce((sum, log) => sum + (log.endKm - log.startKm), 0);

            return {
                month: `${m}월`,
                value,
                year: y
            };
        }).reverse();

        // Utilization Rate Calculation
        // (Number of unique days with operations / Total days in current month) x 100
        const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
        const uniqueOperatingDays = new Set(
            currentMonthLogs.map(log => {
                const d = new Date(log.date);
                return d.getDate(); // Day of month (1-31)
            })
        ).size;
        const utilizationRate = daysInMonth > 0 ? Math.round((uniqueOperatingDays / daysInMonth) * 100) : 0;

        // Last Month Utilization Rate
        const lastMonthDate = new Date(currentYear, currentMonth - 2, 1); // Previous month
        const lastMonthYear = lastMonthDate.getFullYear();
        const lastMonth = lastMonthDate.getMonth() + 1;
        const lastMonthLogs = mockLogs.filter(log => {
            const d = new Date(log.date);
            return d.getFullYear() === lastMonthYear && (d.getMonth() + 1) === lastMonth;
        });
        const lastMonthDaysInMonth = new Date(lastMonthYear, lastMonth, 0).getDate();
        const lastMonthUniqueDays = new Set(
            lastMonthLogs.map(log => new Date(log.date).getDate())
        ).size;
        const lastMonthUtilization = lastMonthDaysInMonth > 0 ? Math.round((lastMonthUniqueDays / lastMonthDaysInMonth) * 100) : 0;

        // Overall Average Utilization Rate (all months with data)
        const monthsWithData = new Set(mockLogs.map(log => {
            const d = new Date(log.date);
            return `${d.getFullYear()}-${d.getMonth() + 1}`;
        }));

        let totalUtilization = 0;
        monthsWithData.forEach(monthKey => {
            const [year, month] = monthKey.split('-').map(Number);
            const monthLogs = mockLogs.filter(log => {
                const d = new Date(log.date);
                return d.getFullYear() === year && (d.getMonth() + 1) === month;
            });
            const daysInThisMonth = new Date(year, month, 0).getDate();
            const uniqueDays = new Set(monthLogs.map(log => new Date(log.date).getDate())).size;
            totalUtilization += (uniqueDays / daysInThisMonth) * 100;
        });
        const overallAverageUtilization = monthsWithData.size > 0 ? Math.round(totalUtilization / monthsWithData.size) : 0;

        // Vehicle Status Data
        // Group by car
        const cars = Array.from(new Set(mockLogs.map(l => l.car)));
        const vehicleStatus = cars.map(carName => {
            const carLogs = mockLogs.filter(l => l.car === carName);
            // Sort desc
            carLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            const totalMileage = carLogs[0]?.endKm || 0;

            const thisMonthLogs = carLogs.filter(log => {
                const d = new Date(log.date);
                return d.getFullYear() === currentYear && (d.getMonth() + 1) === currentMonth;
            });
            const monthlyMileage = thisMonthLogs.reduce((sum, log) => sum + (log.endKm - log.startKm), 0);

            // Determine status based on recent activity (e.g., if used in last 3 days = In Use, else Standby)
            // This is a simple heuristic.
            const lastUsed = new Date(carLogs[0]?.date);
            const daysSinceLastUse = (new Date().getTime() - lastUsed.getTime()) / (1000 * 3600 * 24);

            // Extract simplified name and number
            // Format: "기아 쏘렌토 (195하4504)" -> Name: "쏘렌토", Number: "195하4504"
            const match = carName.match(/(.*)\s\((.*)\)/);
            const cleanName = match ? match[1].replace('기아 ', '').replace('현대 ', '') : carName;
            const number = match ? match[2] : '';

            return {
                originalName: carName,
                name: cleanName,
                number: number,
                totalMileage: `${totalMileage.toLocaleString()} km`,
                monthlyMileage: `${monthlyMileage.toLocaleString()} km`,
                status: daysSinceLastUse < 7 ? "운행중" : "대기중", // Simple logic
                progress: Math.min((monthlyMileage / 2000) * 100, 100) // Dummy target of 2000km
            };
        });

        return {
            currentMonth: `${currentMonth}월`,
            totalDistance,
            totalFuelCost,
            utilizationRate,
            lastMonthUtilization,
            overallAverageUtilization,
            chartData,
            vehicleStatus
        };
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-foreground">대시보드</h1>
                <div className="text-sm text-muted-foreground">
                    최근 업데이트: 오늘 {new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title={`총 운행거리 (${stats.currentMonth})`}
                    value={`${stats.totalDistance.toLocaleString()}km`}
                    change="12.5%" // Stable mock value to fix hydration mismatch
                    trend="up"
                    icon={Car}
                />
                <StatCard
                    title="월 누적 주유금액"
                    value={`₩${stats.totalFuelCost.toLocaleString()}`}
                    change="변동없음" // Fuel data is sparse in current mock
                    trend="neutral"
                    icon={Fuel}
                />
                <StatCard
                    title="예정된 예약"
                    value={`${reservationCount}건`}
                    change={reservationCount > 0 ? "예약 있음" : "예약 없음"}
                    trend={reservationCount > 0 ? "up" : "neutral"}
                    icon={Calendar}
                    showTrendLabel={false}
                />
                <StatCard
                    title="가동률"
                    value={`${stats.utilizationRate}%`}
                    subtitle1={`지난달: ${stats.lastMonthUtilization}%`}
                    subtitle2={`전체 평균: ${stats.overallAverageUtilization}%`}
                    trend={stats.utilizationRate >= 50 ? "up" : stats.utilizationRate > 0 ? "neutral" : "down"}
                    icon={ArrowUpRight}
                />
            </div>

            {/* Upcoming Reservations & Vehicle Stats Section */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Main Chart Section */}
                <div className="lg:col-span-2 glass-card rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-foreground">월별 차량 운행 현황</h3>
                        <button className="text-muted-foreground hover:text-foreground">
                            <MoreHorizontal className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Custom CSS Chart - Bar Chart with Real Data */}
                    <div className="h-64 flex items-end justify-between gap-2 pt-8 px-2 relative">
                        {stats.chartData.map((data, i) => {
                            const maxHeight = 3000; // Adjusted max height
                            const heightPercentage = Math.min((data.value / maxHeight) * 100, 100);
                            return (
                                <div key={i} className="flex flex-col items-center gap-2 group w-full h-full justify-end">
                                    <div className="relative w-full bg-secondary/20 rounded-t-md h-full flex items-end overflow-visible">
                                        {/* Value Tooltip */}
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl whitespace-nowrap">
                                            {data.value.toLocaleString()} km
                                        </div>
                                        <div
                                            style={{ height: `${heightPercentage}%` }}
                                            className={`w-full bg-primary/40 group-hover:bg-primary transition-all duration-500 rounded-t-md relative shadow-[0_0_20px_rgba(var(--primary),0.1)] group-hover:shadow-[0_0_25px_rgba(var(--primary),0.4)]`}
                                        >
                                            {/* Glow effect */}
                                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-md"></div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">{data.month}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="glass-card rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-6">다가오는 예약</h3>
                    <div className="space-y-4">
                        {upcomingReservations.length > 0 ? (
                            upcomingReservations.map((res: any, i: number) => (
                                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-secondary/20 border border-white/5">
                                    <div className={`w-2 h-10 rounded-full ${res.color || 'bg-primary'}`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-black text-primary uppercase tracking-tighter">
                                            {res.date.split('-')[1]}월 {res.date.split('-')[2]}일 · {res.startTime}
                                        </div>
                                        <div className="text-sm font-bold text-foreground truncate">{res.car.replace('쓰렌토', '쏘렌토')}</div>
                                        <div className="text-[10px] text-muted-foreground truncate">{res.user === 'hongilee@mangoslab.com' ? '이홍길' : res.user} · {res.purpose || '목적 없음'}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                                예정된 예약이 없습니다.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Vehicle Detailed Status Section */}
            <div className="glass-card rounded-xl p-6 mt-6">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-foreground">차량별 상세 현황</h3>
                    <span className="text-xs text-primary font-bold px-3 py-1 bg-primary/10 rounded-full border border-primary/20 tracking-tighter uppercase">Real-time Status</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.vehicleStatus.map((vehicle, i) => (
                        <div key={i} className="p-5 rounded-2xl bg-secondary/20 border border-white/5 hover:bg-secondary/40 hover:border-primary/30 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-lg shadow-primary/10">
                                        <Car className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-foreground text-base tracking-tighter">{vehicle.name}</h4>
                                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{vehicle.number}</p>
                                    </div>
                                </div>
                                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tighter border ${vehicle.status === '운행중' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                    vehicle.status === '대기중' ? 'bg-blue-500/10 text-blue-400 border-blue-200/20' :
                                        'bg-red-500/10 text-red-400 border-red-500/20'
                                    }`}>
                                    {vehicle.status}
                                </span>
                            </div>
                            <div className="space-y-4 relative z-10">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">누적 주행거리</span>
                                    <span className="text-sm font-black text-foreground font-mono">{vehicle.totalMileage}</span>
                                </div>
                                <div className="w-full bg-secondary/50 h-2 rounded-full overflow-hidden border border-white/5">
                                    <div
                                        className={`h-full transition-all duration-1000 ease-out ${vehicle.status === '점검필요' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]'}`}
                                        style={{ width: `${vehicle.progress}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">이번 달 주행</span>
                                    <span className="text-xs font-black text-primary tracking-tighter">{vehicle.monthlyMileage}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, change, subtitle1, subtitle2, trend, icon: Icon, showTrendLabel = true }: any) {
    return (
        <div className="glass-card rounded-xl p-6 hover:bg-accent/40 transition-colors group">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <p className="text-2xl font-bold text-foreground mt-2 font-mono">{value}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-secondary border border-border flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="h-5 w-5 text-primary" />
                </div>
            </div>
            <div className="mt-4 flex items-center text-xs">
                {subtitle1 && subtitle2 ? (
                    <div className="flex flex-col gap-1 w-full">
                        <span className="text-muted-foreground">{subtitle1}</span>
                        <span className="text-muted-foreground">{subtitle2}</span>
                    </div>
                ) : change ? (
                    <>
                        {trend === 'up' ? (
                            <span className="text-green-400 flex items-center font-medium bg-green-400/10 px-1.5 py-0.5 rounded">
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                                {change}
                            </span>
                        ) : trend === 'down' ? (
                            <span className="text-red-400 flex items-center font-medium bg-red-400/10 px-1.5 py-0.5 rounded">
                                <ArrowDownRight className="h-3 w-3 mr-1" />
                                {change}
                            </span>
                        ) : (
                            <span className="text-muted-foreground flex items-center font-medium bg-secondary px-1.5 py-0.5 rounded">
                                {change}
                            </span>
                        )}
                        {showTrendLabel && <span className="ml-2 text-muted-foreground">지난달 대비</span>}
                    </>
                ) : null}
            </div>
        </div>
    )
}
