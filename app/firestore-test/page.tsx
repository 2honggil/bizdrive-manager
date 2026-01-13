"use client";

import { useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function FirestoreTestPage() {
    const [logs, setLogs] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const addLog = (message: string) => {
        console.log(message);
        setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
    };

    const testFirestoreRead = async () => {
        setIsLoading(true);
        setLogs([]);
        addLog("🔍 Starting Firestore Read Test...");

        try {
            addLog("📡 Attempting to read 'users' collection...");
            const usersRef = collection(db, "users");

            addLog("⏳ Executing getDocs() with 10s timeout...");
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Timeout after 10 seconds")), 10000)
            );

            const result: any = await Promise.race([
                getDocs(usersRef),
                timeoutPromise
            ]);

            addLog(`✅ SUCCESS! Found ${result.docs.length} documents`);
            result.docs.forEach((doc: any, index: number) => {
                addLog(`  Document ${index + 1}: ${JSON.stringify(doc.data())}`);
            });

        } catch (error: any) {
            addLog(`❌ ERROR: ${error.code || 'Unknown'}`);
            addLog(`   Message: ${error.message}`);
            addLog(`   Full error: ${JSON.stringify(error, null, 2)}`);
        } finally {
            setIsLoading(false);
        }
    };

    const testFirestoreWrite = async () => {
        setIsLoading(true);
        addLog("🔍 Starting Firestore Write Test...");

        try {
            addLog("📝 Attempting to write to 'test' collection...");
            const testRef = collection(db, "test");

            const docRef = await addDoc(testRef, {
                message: "Test document",
                timestamp: new Date().toISOString()
            });

            addLog(`✅ SUCCESS! Document created with ID: ${docRef.id}`);

        } catch (error: any) {
            addLog(`❌ ERROR: ${error.code || 'Unknown'}`);
            addLog(`   Message: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const testAuthAndRead = async () => {
        setIsLoading(true);
        setLogs([]);
        addLog("🔍 Starting Auth + Firestore Test...");

        try {
            addLog("🔐 Logging in as hongilee@mangoslab.com...");
            await signInWithEmailAndPassword(auth, "hongilee@mangoslab.com", "8493jis55&");
            addLog("✅ Login successful!");

            addLog("📡 Now attempting to read users collection...");
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("email", "==", "hongilee@mangoslab.com"));

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Timeout after 10 seconds")), 10000)
            );

            const result: any = await Promise.race([getDocs(q), timeoutPromise]);

            addLog(`✅ Query SUCCESS! Found ${result.docs.length} documents`);
            result.docs.forEach((doc: any) => {
                addLog(`  Data: ${JSON.stringify(doc.data())}`);
            });

        } catch (error: any) {
            addLog(`❌ ERROR: ${error.code || 'Unknown'}`);
            addLog(`   Message: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">🔥 Firestore Diagnostic Tool</h1>

                <div className="space-y-4 mb-8">
                    <button
                        onClick={testFirestoreRead}
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Test Firestore Read (No Auth)
                    </button>

                    <button
                        onClick={testFirestoreWrite}
                        disabled={isLoading}
                        className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed ml-4"
                    >
                        Test Firestore Write
                    </button>

                    <button
                        onClick={testAuthAndRead}
                        disabled={isLoading}
                        className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed ml-4"
                    >
                        Test Auth + Read
                    </button>
                </div>

                <div className="bg-black/50 border border-gray-700 rounded-lg p-6">
                    <h2 className="text-xl font-bold mb-4">📋 Test Logs</h2>
                    {isLoading && (
                        <div className="mb-4 text-yellow-400">⏳ Running test...</div>
                    )}
                    <div className="font-mono text-sm space-y-1 max-h-96 overflow-y-auto">
                        {logs.length === 0 ? (
                            <div className="text-gray-500">No logs yet. Click a test button above.</div>
                        ) : (
                            logs.map((log, index) => (
                                <div key={index} className={
                                    log.includes('ERROR') ? 'text-red-400' :
                                        log.includes('SUCCESS') ? 'text-green-400' :
                                            'text-gray-300'
                                }>
                                    {log}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="mt-8 bg-blue-900/30 border border-blue-700 rounded-lg p-6">
                    <h3 className="font-bold mb-2">💡 Instructions:</h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li>Click "Test Firestore Read" to check if you can read data without authentication</li>
                        <li>Click "Test Firestore Write" to check if you can write data</li>
                        <li>Click "Test Auth + Read" to test authenticated read operations</li>
                        <li>Check the logs for detailed error messages</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
