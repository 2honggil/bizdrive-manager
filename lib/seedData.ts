
import { mockLogs, fuelMockData, maintenanceData } from "./mockData";

export const initialUsers = [
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

export const seedData = {
    users: initialUsers,
    logs: mockLogs,
    fueling: fuelMockData,
    maintenance: maintenanceData
};
