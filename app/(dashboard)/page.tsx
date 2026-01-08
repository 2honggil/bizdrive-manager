"use client";

import { Car, Fuel, Calendar, ArrowUpRight, ArrowDownRight, MoreHorizontal } from "lucide-react";

export default function Dashboard() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-foreground">대시보드</h1>
                <div className="text-sm text-muted-foreground">
                    최근 업데이트: 오늘 09:41
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="총 운행거리 (1월)"
                    value="1,245km"
                    change="+12.5%"
                    trend="up"
                    icon={Car}
                />
                <StatCard
                    title="월 누적 주유금액"
                    value="₩450,000"
                    change="+4.2%"
                    trend="down"
                    icon={Fuel}
                />
                <StatCard
                    title="예정된 예약"
                    value="5건"
                    change="이번주"
                    trend="neutral"
                    icon={Calendar}
                />
                <StatCard
                    title="가동률"
                    value="82%"
                    change="+2.4%"
                    trend="up"
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

                    {/* Custom CSS Chart - Bar Chart with Mock Data */}
                    <div className="h-64 flex items-end justify-between gap-2 pt-8 px-2 relative">
                        {[
                            { month: "1월", value: 1245 },
                            { month: "2월", value: 1560 },
                            { month: "3월", value: 1320 },
                            { month: "4월", value: 1840 },
                            { month: "5월", value: 1450 },
                            { month: "6월", value: 1920 },
                            { month: "7월", value: 1100 },
                            { month: "8월", value: 1680 },
                            { month: "9월", value: 1420 },
                            { month: "10월", value: 2050 },
                            { month: "11월", value: 1750 },
                            { month: "12월", value: 2200 },
                        ].map((data, i) => {
                            const maxHeight = 2500;
                            const heightPercentage = (data.value / maxHeight) * 100;
                            return (
                                <div key={i} className="flex flex-col items-center gap-2 group w-full h-full justify-end">
                                    <div className="relative w-full bg-secondary/20 rounded-t-md h-full flex items-end overflow-visible">
                                        {/* Value Tooltip */}
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl whitespace-nowrap">
                                            {data.value.toLocaleString()} km
                                        </div>
                                        <div
                                            style={{ height: `${heightPercentage}%` }}
                                            className={`w-full bg-primary/40 group-hover:bg-primary transition-all duration-500 rounded-t-md relative shadow-[0_0_20px_rgba(var(--primary),0.1)] group-hover:shadow-[0_0_25px_rgba(var(--primary),0.4)] ${i === 11 ? 'animate-pulse-slow' : ''}`}
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

                {/* Upcoming Reservations */}
                <div className="glass-card rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-6">다가오는 예약</h3>
                    <div className="space-y-4">
                        {[
                            { car: "쏘렌토 (195하4504)", user: "홍길동", time: "오늘 14:00", status: "승인" },
                            { car: "아반떼 (123가4567)", user: "김철수", time: "내일 09:00", status: "대기" },
                            { car: "그랜저 (999호9999)", user: "이영희", time: "1월 6일", status: "승인" },
                            { car: "카니발 (333루3333)", user: "박민수", time: "1월 7일", status: "승인" },
                            { car: "쏘렌토 (195하4504)", user: "최지우", time: "1월 8일", status: "대기" },
                        ].map((res, i) => (
                            <div key={i} className="flex items-stretch gap-3 p-3 rounded-lg bg-secondary/30 border border-border hover:bg-secondary/50 transition-colors">
                                <div className="flex flex-col flex-1 pl-1">
                                    <span className="text-sm font-medium text-foreground">{res.car}</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-muted-foreground">{res.user}</span>
                                        <span className="text-muted-foreground text-[10px]">•</span>
                                        <span className="text-xs text-muted-foreground">{res.time}</span>
                                    </div>
                                </div>
                                <div className={`px-2 py-1 rounded text-[10px] font-medium h-fit self-center ${res.status === '승인' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                                    }`}>
                                    {res.status}
                                </div>
                            </div>
                        ))}
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
                    {[
                        { name: "쏘렌토", number: "195하4504", totalMileage: "42,500 km", monthlyMileage: "1,245 km", status: "운행중", progress: 65 },
                        { name: "아반떼", number: "123가4567", totalMileage: "15,200 km", monthlyMileage: "850 km", status: "대기중", progress: 30 },
                        { name: "카니발", number: "333루3333", totalMileage: "28,900 km", monthlyMileage: "1,100 km", status: "점검필요", progress: 85 },
                        { name: "그랜저", number: "999호9999", totalMileage: "8,400 km", monthlyMileage: "620 km", status: "대기중", progress: 15 },
                    ].map((vehicle, i) => (
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

function StatCard({ title, value, change, trend, icon: Icon }: any) {
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
                <span className="ml-2 text-muted-foreground">지난달 대비</span>
            </div>
        </div>
    )
}
