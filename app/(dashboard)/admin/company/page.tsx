"use client";

import { Building, Save } from "lucide-react";

export default function CompanyManagement() {
    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="text-2xl font-bold text-foreground">회사관리</h1>
                <p className="text-muted-foreground text-sm mt-1">회사 기본 정보 및 정책을 설정합니다.</p>
            </div>

            <div className="glass-card rounded-xl p-6 border border-border">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                    <div className="h-16 w-16 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground border border-border">
                        <Building className="h-8 w-8" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-foreground">망고슬래브</h2>
                        <p className="text-sm text-muted-foreground">엔터프라이즈 플랜 이용 중</p>
                    </div>
                </div>

                <form className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">회사명</label>
                        <input
                            type="text"
                            defaultValue="망고슬래브"
                            className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">사업자 등록번호</label>
                            <input
                                type="text"
                                defaultValue="123-45-67890"
                                className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">대표 전화</label>
                            <input
                                type="text"
                                defaultValue="02-1234-5678"
                                className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">주소</label>
                        <input
                            type="text"
                            defaultValue="서울시 강남구 테헤란로..."
                            className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>

                    <div className="pt-4 mt-6 border-t border-border flex justify-end">
                        <button type="button" className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20">
                            <Save className="h-4 w-4" />
                            변경사항 저장
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
