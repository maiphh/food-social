"use client";

import { useState } from "react";
import { addUser, getUser, updateUser, deleteUser, getAllUsers } from "@/services/user";

export default function FirebaseTest() {
    const [lastId, setLastId] = useState<string>("");
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => setLogs((prev) => [...prev, msg]);

    const handleAdd = async () => {
        try {
            const id = await addUser({
                name: "Test User",
                email: "test@example.com",
                createdAt: new Date(),
            });
            setLastId(id);
            addLog(`Added user with ID: ${id}`);
        } catch (error) {
            addLog(`Error adding user: ${error}`);
        }
    };

    const handleGet = async () => {
        if (!lastId) return addLog("No ID to get");
        try {
            const user = await getUser(lastId);
            addLog(`Got user: ${JSON.stringify(user)}`);
        } catch (error) {
            addLog(`Error getting user: ${error}`);
        }
    };

    const handleUpdate = async () => {
        if (!lastId) return addLog("No ID to update");
        try {
            await updateUser(lastId, {
                name: "Updated User",
                updatedAt: new Date(),
            });
            addLog(`Updated user ${lastId}`);
        } catch (error) {
            addLog(`Error updating user: ${error}`);
        }
    };

    const handleDelete = async () => {
        if (!lastId) return addLog("No ID to delete");
        try {
            await deleteUser(lastId);
            addLog(`Deleted user ${lastId}`);
            setLastId("");
        } catch (error) {
            addLog(`Error deleting user: ${error}`);
        }
    };

    const handleGetAll = async () => {
        try {
            const users = await getAllUsers();
            addLog(`Got ${users.length} users`);
            console.log(users);
        } catch (error) {
            addLog(`Error getting all users: ${error}`);
        }
    };

    return (
        <div className="p-4 border rounded-lg space-y-4">
            <h2 className="text-xl font-bold">Firebase CRUD Test</h2>
            <div className="flex gap-2 flex-wrap">
                <button
                    onClick={handleAdd}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Add User
                </button>
                <button
                    onClick={handleGet}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    disabled={!lastId}
                >
                    Get User
                </button>
                <button
                    onClick={handleUpdate}
                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    disabled={!lastId}
                >
                    Update User
                </button>
                <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    disabled={!lastId}
                >
                    Delete User
                </button>
                <button
                    onClick={handleGetAll}
                    className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                >
                    Get All Users
                </button>
            </div>
            <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-800 rounded h-40 overflow-y-auto font-mono text-sm">
                {logs.map((log, i) => (
                    <div key={i}>{log}</div>
                ))}
            </div>
        </div>
    );
}
