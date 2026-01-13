"use client";

import { Search, Plus, User, MoreVertical, Shield, Edit, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import { seedDatabase } from "@/lib/seeder"; // Added import

import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp } from "firebase/firestore";

// Mock Data
const initialUsers = [
    { id: 1, name: "이홍길", email: "hongilee@mangoslab.com", role: "superadmin", department: "망고슬래브", status: "active" },
    { id: 2, name: "김태연", email: "kim19707@mangoslab.com", role: "user", department: "망고슬래브", status: "active" },
    { id: 3, name: "김제봉", email: "chenwoo@chenwoo.co.kr", role: "admin", department: "천우주식회사", status: "active" },
    { id: 4, name: "김진아", email: "sweet@mangoslab.com", role: "user", department: "망고슬래브", status: "active" },
    { id: 5, name: "이상봉", email: "lsb0078@mangoslab.com", role: "user", department: "망고슬래브", status: "active" },
    { id: 6, name: "김예건", email: "wlfka102@mangoslab.com", role: "user", department: "망고슬래브", status: "active" },
    { id: 7, name: "박진호", email: "zlzmei123@mangoslab.com", role: "user", department: "망고슬래브", status: "active" },
    { id: 8, name: "김영재", email: "yeongjae.kim@mangoslab.com", role: "user", department: "망고슬래브", status: "active" },
    { id: 9, name: "박종훈", email: "hoon023@mangoslab.com", role: "user", department: "망고슬래브", status: "active" },
    { id: 10, name: "김승현", email: "seunghyun@mangoslab.com", role: "user", department: "망고슬래브", status: "active" },
    { id: 11, name: "신동호", email: "taylor.shin@mangoslab.com", role: "user", department: "망고슬래브", status: "active" },
    { id: 12, name: "이수민", email: "soom@mangoslab.com", role: "user", department: "망고슬래브", status: "active" },
    { id: 13, name: "김희정", email: "hjkim@mangoslab.com", role: "user", department: "망고슬래브", status: "active" },
    { id: 14, name: "한지훈", email: "ricky@mangoslab.com", role: "user", department: "망고슬래브", status: "active" },
    { id: 15, name: "박용식", email: "petepark@mangoslab.com", role: "user", department: "망고슬래브", status: "active" },
    { id: 16, name: "정용수", email: "index50@mangoslab.com", role: "user", department: "망고슬래브", status: "active" },
    { id: 17, name: "윤하늘", email: "luckysky2030@mangoslab.com", role: "user", department: "망고슬래브", status: "active" },
];

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// ...

export default function UserManagement() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    // Route Protection
    useEffect(() => {
        if (!authLoading && user?.role === "user") {
            router.push("/");
        }
    }, [user, authLoading, router]);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [users, setUsers] = useState<any[]>(initialUsers);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [openMenuId, setOpenMenuId] = useState<string | number | null>(null);
    const [deletingUserId, setDeletingUserId] = useState<string | number | null>(null);

    // Restore State
    const [isRestoring, setIsRestoring] = useState(false);

    // Sync from Firestore
    useEffect(() => {
        const q = query(collection(db, "users"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data: any[] = [];
            snapshot.forEach((doc) => {
                data.push({ ...doc.data(), id: doc.id });
            });
            // Update logic: If Firestore has data, use it. Otherwise, keep initialUsers logic (though setUsers default covers it)
            // Actually, if data is empty, we might show empty. But user wants to recover.
            if (data.length > 0) {
                setUsers(data);
            } else {
                // If totally empty, maybe show empty? Or mock?
                // Current requirement is to restore data to DB, so we rely on DB being populated.
                setUsers([]); // Show empty if DB is empty, so user knows to click Restore
            }
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleEdit = (user: any) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
        setOpenMenuId(null);
    };

    const handleDelete = async (userId: string | number) => {
        if (typeof userId === 'string') {
            await deleteDoc(doc(db, "users", userId));
        } else {
            setUsers(users.filter(u => u.id !== userId));
        }
        setDeletingUserId(null);
        setOpenMenuId(null);
    };

    const handleSaveUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (typeof selectedUser.id === 'string') {
            const userRef = doc(db, "users", selectedUser.id);
            await updateDoc(userRef, {
                name: selectedUser.name,
                email: selectedUser.email,
                role: selectedUser.role,
                department: selectedUser.department,
                status: selectedUser.status
            });
        }
        setIsEditModalOpen(false);
    };

    const handleRestore = async () => {
        if (!confirm("테스트 데이터를 복구하시겠습니까? 데이터베이스에 기존 테스트 데이터가 추가됩니다.")) return;
        setIsRestoring(true);
        try {
            await seedDatabase();
            alert("테스트 데이터가 복구되었습니다. 잠시 후 목록이 갱신됩니다.");
        } catch (error) {
            console.error(error);
            alert("데이터 복구 실패");
        } finally {
            setIsRestoring(false);
        }
    };

    return (
        <div className="space-y-6" onClick={() => setOpenMenuId(null)}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">사용자관리</h1>
                    <p className="text-muted-foreground text-sm mt-1">사용자 계정 및 권한을 관리합니다.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleRestore}
                        disabled={isRestoring}
                        className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg text-sm font-medium transition-colors border border-border"
                    >
                        {isRestoring ? "복구 중..." : "테스트 데이터 복구"}
                    </button>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20"
                    >
                        <Plus className="h-4 w-4" />
                        사용자 초대
                    </button>
                </div>
            </div>

            {/* Invite Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="사용자 초대">
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsAddModalOpen(false); }}>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">이름</label>
                        <input type="text" required placeholder="홍길동" className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">이메일</label>
                        <input type="email" required placeholder="user@example.com" className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">비밀번호</label>
                        <input type="password" required placeholder="********" className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">소속 (회사/부서)</label>
                            <input type="text" placeholder="예: 망고슬래브 / 영업팀" className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">권한</label>
                            <select required className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors">
                                <option value="">선택</option>
                                <option value="user">일반 사용자</option>
                                <option value="admin">관리자</option>
                                <option value="superadmin">수퍼관리자</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg text-sm font-medium transition-colors border border-border">취소</button>
                        <button type="submit" className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20">초대하기</button>
                    </div>
                </form>
            </Modal>

            {/* Edit User Modal */}
            {selectedUser && (
                <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="사용자 정보 수정">
                    <form className="space-y-4" onSubmit={handleSaveUser}>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">이름</label>
                            <input
                                type="text"
                                required
                                value={selectedUser.name}
                                onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                                className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">이메일</label>
                            <input
                                type="email"
                                required
                                value={selectedUser.email}
                                onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                                className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">소속 (회사/부서)</label>
                                <input
                                    type="text"
                                    value={selectedUser.department}
                                    onChange={(e) => setSelectedUser({ ...selectedUser, department: e.target.value })}
                                    className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">권한</label>
                                <select
                                    required
                                    value={selectedUser.role}
                                    onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                                    className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                                >
                                    <option value="user">일반 사용자</option>
                                    <option value="admin">관리자</option>
                                    <option value="superadmin">수퍼관리자</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">상태</label>
                            <select
                                required
                                value={selectedUser.status}
                                onChange={(e) => setSelectedUser({ ...selectedUser, status: e.target.value })}
                                className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                            >
                                <option value="active">활성</option>
                                <option value="suspended">정지</option>
                            </select>
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-border">
                            <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-6 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg text-sm font-medium transition-colors border border-border">취소</button>
                            <button type="submit" className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20">저장하기</button>
                        </div>
                    </form>
                </Modal>
            )}

            <div className="glass-card rounded-xl overflow-hidden border border-border">
                <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/30">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="이름, 이메일 검색..."
                            className="w-full pl-9 pr-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-secondary/50 text-muted-foreground uppercase text-xs font-medium">
                            <tr>
                                <th className="px-6 py-4 min-w-[200px]">사용자</th>
                                <th className="px-6 py-4 min-w-[120px] whitespace-nowrap">소속</th>
                                <th className="px-6 py-4 min-w-[100px] whitespace-nowrap">권한</th>
                                <th className="px-6 py-4 min-w-[80px] whitespace-nowrap">상태</th>
                                <th className="px-6 py-4 text-right min-w-[80px]">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {users.map((u) => (
                                <tr key={u.id} className="hover:bg-secondary/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-secondary border border-border flex items-center justify-center text-xs font-bold text-muted-foreground">
                                                {u.name[0]}
                                            </div>
                                            <div>
                                                <div className="font-medium text-foreground">{u.name}</div>
                                                <div className="text-xs text-muted-foreground">{u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{u.department}</td>
                                    <td className="px-6 py-4">
                                        {u.role === 'superadmin' ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/20 text-primary border border-primary/30">
                                                <Shield className="h-3 w-3" /> 수퍼관리자
                                            </span>
                                        ) : u.role === 'admin' ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                                <Shield className="h-3 w-3" /> 관리자
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-muted-foreground border border-border">
                                                <User className="h-3 w-3" /> 일반 사용자
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${u.status === 'active' ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'
                                            }`}>
                                            {u.status === 'active' ? '활성' : '정지'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenMenuId(openMenuId === u.id ? null : u.id);
                                            }}
                                            className="p-2 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <MoreVertical className="h-4 w-4" />
                                        </button>

                                        {/* Dropdown Menu */}
                                        {openMenuId === u.id && (
                                            <div className="absolute right-8 top-8 w-32 bg-card border border-border rounded-lg shadow-lg z-10 overflow-hidden">
                                                {deletingUserId === u.id ? (
                                                    <div className="p-2 flex flex-col gap-2 bg-secondary/50">
                                                        <span className="text-[10px] text-red-500 font-bold px-1 text-center">삭제하시겠습니까?</span>
                                                        <div className="flex gap-1">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleDelete(u.id); }}
                                                                className="flex-1 py-1 bg-red-500 text-white text-[10px] rounded hover:bg-red-600 transition-colors"
                                                            >
                                                                확인
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setDeletingUserId(null); }}
                                                                className="flex-1 py-1 bg-background text-foreground text-[10px] rounded hover:bg-secondary transition-colors"
                                                            >
                                                                취소
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleEdit(u); }}
                                                            className="w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors flex items-center gap-2"
                                                        >
                                                            <Edit className="h-3.5 w-3.5" />
                                                            수정
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setDeletingUserId(u.id); }}
                                                            className="w-full text-left px-4 py-2 text-sm hover:bg-red-500/10 text-red-500 transition-colors flex items-center gap-2"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                            삭제
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
