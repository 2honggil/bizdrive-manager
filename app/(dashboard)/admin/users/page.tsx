"use client";

import { Search, Plus, User, MoreVertical, Shield, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import Modal from "@/components/Modal";

// Mock Data
const initialUsers = [
    { id: 1, name: "홍길동", email: "hongilee@mangoslab.com", role: "admin", department: "경영지원", status: "active" },
    { id: 2, name: "김철수", email: "user@example.com", role: "user", department: "영업팀", status: "active" },
    { id: 3, name: "이영희", email: "yhlee@example.com", role: "user", department: "개발팀", status: "active" },
    { id: 4, name: "박민수", email: "mspark@example.com", role: "user", department: "마케팅", status: "suspended" },
];

export default function UserManagement() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [users, setUsers] = useState(initialUsers);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);

    const handleEdit = (user: any) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
        setOpenMenuId(null);
    };

    const handleDelete = (userId: number) => {
        if (confirm("정말로 이 사용자를 삭제하시겠습니까?")) {
            setUsers(users.filter(u => u.id !== userId));
        }
        setOpenMenuId(null);
    };

    const handleSaveUser = (e: React.FormEvent) => {
        e.preventDefault();
        setUsers(users.map(u => u.id === selectedUser.id ? selectedUser : u));
        setIsEditModalOpen(false);
    };

    return (
        <div className="space-y-6" onClick={() => setOpenMenuId(null)}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">사용자관리</h1>
                    <p className="text-muted-foreground text-sm mt-1">사용자 계정 및 권한을 관리합니다.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20"
                >
                    <Plus className="h-4 w-4" />
                    사용자 초대
                </button>
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
                            <label className="text-sm font-medium text-foreground">부서</label>
                            <input type="text" placeholder="영업팀" className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">권한</label>
                            <select required className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors">
                                <option value="">선택</option>
                                <option value="user">일반 사용자</option>
                                <option value="admin">관리자</option>
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
                                <label className="text-sm font-medium text-foreground">부서</label>
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
                                <th className="px-6 py-4">사용자</th>
                                <th className="px-6 py-4">부서</th>
                                <th className="px-6 py-4">권한</th>
                                <th className="px-6 py-4">상태</th>
                                <th className="px-6 py-4 text-right">관리</th>
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
                                    <td className="px-6 py-4 text-muted-foreground">{u.department}</td>
                                    <td className="px-6 py-4">
                                        {u.role === 'admin' ? (
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
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleEdit(u); }}
                                                    className="w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors flex items-center gap-2"
                                                >
                                                    <Edit className="h-3.5 w-3.5" />
                                                    수정
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(u.id); }}
                                                    className="w-full text-left px-4 py-2 text-sm hover:bg-red-500/10 text-red-500 transition-colors flex items-center gap-2"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                    삭제
                                                </button>
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
