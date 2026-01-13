
import { db } from "./firebase";
import { collection, doc, writeBatch, Timestamp } from "firebase/firestore";
import { seedData } from "./seedData";

export const seedDatabase = async () => {
    try {
        const batch = writeBatch(db);

        // 1. Users
        seedData.users.forEach((user) => {
            // Use user.id (which is a number in mock) as doc ID if possible, or auto-id?
            // Since we might want to preserve IDs or email as ID is better.
            // Let's us auto-generated IDs for simplicity or user email as ID if unique?
            // Actually, we can just use setDoc with a new ID or update existing logic.
            // But writeBatch needs a reference.
            // Let's use auto-generated reference.
            const userRef = doc(collection(db, "users"));
            // Better: Check if we want to overwrite? No, just add.
            // But wait, if we run this twice, we get duplicates.
            // Ideally should use a unique key. Email is good for users.

            // However, Firestore rules might require auth. We assume we are logged in.

            // Let's use email as ID for users to prevent duplicates
            // const userRef = doc(db, "users", user.email); // This is safer
            // But wait, existing code might expect random IDs.
            // Let's stick to adding new docs, but maybe we should clear first? 
            // Clearing is dangerous.
            // Let's just add them.
            batch.set(userRef, {
                ...user,
                createdAt: Timestamp.now()
            });
        });

        // 2. Logs
        seedData.logs.forEach((log) => {
            const logRef = doc(collection(db, "logs"));
            batch.set(logRef, {
                ...log,
                // Ensure correct types
                hasPhoto: log.hasPhoto || false,
                createdAt: Timestamp.now()
            });
        });

        // 3. Fueling
        seedData.fueling.forEach((item) => {
            const fuelRef = doc(collection(db, "fueling"));
            batch.set(fuelRef, {
                ...item,
                createdAt: Timestamp.now()
            });
        });

        // 4. Maintenance
        seedData.maintenance.forEach((item) => {
            const maintRef = doc(collection(db, "maintenance"));
            batch.set(maintRef, {
                ...item,
                createdAt: Timestamp.now()
            });
        });

        await batch.commit();
        console.log("Database seeded successfully");
        return true;
    } catch (error) {
        console.error("Error seeding database:", error);
        throw error;
    }
};
