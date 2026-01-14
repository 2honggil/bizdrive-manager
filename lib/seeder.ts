import { db } from "./firebase";
import { collection, doc, writeBatch, Timestamp, serverTimestamp, getDocs, deleteDoc, query } from "firebase/firestore";
import { seedData } from "./seedData";

const clearCollection = async (collectionName: string) => {
    console.log(`[Seeder] Clearing collection: ${collectionName}`);
    const q = query(collection(db, collectionName));
    const snapshot = await getDocs(q);
    console.log(`[Seeder] Found ${snapshot.size} documents in ${collectionName}`);
    if (snapshot.size === 0) return;

    const batch = writeBatch(db);
    snapshot.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();
    console.log(`[Seeder] Successfully cleared ${collectionName}`);
};

export const seedDatabase = async () => {
    console.log("[Seeder] Starting database restoration...");
    try {
        // Clear existing test data
        await clearCollection("users");
        await clearCollection("vehicles");
        await clearCollection("companies");
        await clearCollection("logs");
        await clearCollection("fueling");
        await clearCollection("maintenance");

        const batch = writeBatch(db);

        // 1. Users
        console.log("[Seeder] Seeding users...");
        seedData.users.forEach((user) => {
            const userRef = doc(collection(db, "users"));
            batch.set(userRef, {
                ...user,
                createdAt: serverTimestamp()
            });
        });

        // 2. Logs
        console.log("[Seeder] Seeding logs...");
        seedData.logs.forEach((log) => {
            const logRef = doc(collection(db, "logs"));
            batch.set(logRef, {
                ...log,
                hasPhoto: log.hasPhoto || false,
                createdAt: serverTimestamp()
            });
        });

        // 3. Vehicles
        console.log("[Seeder] Seeding vehicles...");
        const vehicles = [
            {
                id: "vehicle_sorento",
                model: "쏘렌토",
                plate: "195하4504",
                year: "2023",
                fuel: "디젤",
                department: "영업팀",
                company: "망고슬래브",
                parkingRecord: true
            },
            {
                id: "vehicle_morning",
                model: "모닝",
                plate: "12가3456",
                year: "2022",
                fuel: "가솔린",
                department: "품질부",
                company: "천우주식회사",
                parkingRecord: false
            }
        ];
        vehicles.forEach((v) => {
            const { id, ...data } = v;
            const vRef = doc(db, "vehicles", id);
            batch.set(vRef, { ...data, createdAt: serverTimestamp() });
        });

        // 4. Companies
        console.log("[Seeder] Seeding companies...");
        const companies = [
            {
                id: "main",
                name: "망고슬래브",
                businessId: "123-45-67890",
                phone: "02-1234-5678",
                address: "경기 성남시 수정구 금토로 803 218호",
                manager: "이홍길",
                email: "hongilee@mangoslab.com",
                plan: "엔터프라이즈 플랜 이용 중"
            },
            {
                id: "chunwoo",
                name: "천우주식회사",
                businessId: "987-65-43210",
                phone: "031-700-1234",
                address: "경기 성남시 판교로...",
                manager: "홍길동",
                email: "hong@chunwoo.com",
                plan: "베이직 플랜 이용 중"
            }
        ];
        companies.forEach((c) => {
            const { id, ...data } = c;
            const cRef = doc(db, "companies", id);
            batch.set(cRef, { ...data, updatedAt: serverTimestamp() });
        });

        await batch.commit();
        console.log("[Seeder] Batch commit successful. Database restored.");
        return true;
    } catch (error) {
        console.error("[Seeder] FATAL ERROR during seeding:", error);
        throw error;
    }
};
