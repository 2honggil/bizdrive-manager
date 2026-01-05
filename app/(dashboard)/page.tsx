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

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Main Chart Section */}
                <div className="lg:col-span-2 glass-card rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-foreground">월별 차량 운행 현황</h3>
                        <button className="text-muted-foreground hover:text-foreground">
                            <MoreHorizontal className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Custom CSS Chart Placeholder - Bar Chart */}
                    <div className="h-64 flex items-end justify-between gap-2 pt-4 px-2">
                        {[40, 65, 45, 80, 55, 70, 48, 85, 60, 75, 50, 90].map((h, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 group w-full">
                                <div className="relative w-full bg-secondary/30 rounded-t-sm h-full flex items-end overflow-hidden">
                                    <div
                                        style={{ height: `${h}%` }}
                                        className="w-full bg-primary/80 hover:bg-primary transition-all duration-300 rounded-t-sm relative group-hover:shadow-[0_0_15px_rgba(var(--primary),0.5)]"
                                    ></div>
                                </div>
                                <span className="text-xs text-muted-foreground">{i + 1}월</span>
                            </div>
                        ))}
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
                            <div key={i} className="flex items-center items-stretch gap-3 p-3 rounded-lg bg-secondary/30 border border-border hover:bg-secondary/50 transition-colors">
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
