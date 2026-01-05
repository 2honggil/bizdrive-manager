"use client";

import { Send, MessageSquare } from "lucide-react";
import { useState } from "react";

export default function FeedbackPage() {
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="text-2xl font-bold text-foreground">피드백 및 요청</h1>
                <p className="text-muted-foreground text-sm mt-1">앱 사용 중 발생한 문제나 개선 제안을 보내주세요.</p>
            </div>

            <div className="glass-card rounded-xl p-6 border border-border">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <MessageSquare className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-foreground">의견 보내기</h2>
                        <p className="text-sm text-muted-foreground">여러분의 소중한 의견이 더 나은 서비스를 만듭니다.</p>
                    </div>
                </div>

                {submitted ? (
                    <div className="p-8 text-center bg-green-500/10 rounded-xl border border-green-500/20">
                        <h3 className="text-lg font-bold text-green-400 mb-2">소중한 의견 감사합니다!</h3>
                        <p className="text-sm text-green-200/70">보내주신 내용은 꼼꼼히 검토하여 반영하겠습니다.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">제목</label>
                            <input
                                type="text"
                                placeholder="어떤 내용인가요?"
                                className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">내용</label>
                            <textarea
                                rows={6}
                                placeholder="상세한 내용을 적어주세요..."
                                className="w-full px-4 py-3 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                            />
                        </div>

                        <div className="pt-4 mt-6 border-t border-border flex justify-end">
                            <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20">
                                <Send className="h-4 w-4" />
                                의견 보내기
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
