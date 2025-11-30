"use client";

import { useState } from "react";
import { signInWithGoogle, logout } from "@/services/auth";
import { createUserProfile, getUser } from "@/services/user";
import { createPost, getPublicFeed, getUserPosts } from "@/services/post";
import { createGroup, joinGroup } from "@/services/group";
import { savePost, unsavePost, isPostSaved } from "@/services/savedPost";
import { User } from "@/types";

export default function BackendTest() {
    const [logs, setLogs] = useState<string[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [lastPostId, setLastPostId] = useState<string>("");

    const addLog = (msg: string) => setLogs((prev) => [...prev, msg]);

    const handleLogin = async () => {
        try {
            addLog("Starting login...");
            const user = await signInWithGoogle();
            setCurrentUser(user);
            addLog(`Logged in as: ${user.email}`);

            // Create profile
            const userProfile: User = {
                uid: user.uid,
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                following: [],
            };
            await createUserProfile(userProfile);
            addLog("User profile created/verified.");
        } catch (e: any) {
            addLog(`Error login: ${e.message}`);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            setCurrentUser(null);
            addLog("Logged out.");
        } catch (e: any) {
            addLog(`Error logout: ${e.message}`);
        }
    };

    const handleCreatePost = async () => {
        if (!currentUser) return addLog("Must be logged in to post.");
        try {
            const postId = await createPost({
                authorId: currentUser.uid,
                content: "Test post content " + Date.now(),
                ratings: { food: 5, ambiance: 4, overall: 5 },
                images: [],
                visibility: "public",
                createdAt: Date.now(),
            });
            addLog(`Post created with ID: ${postId}`);
            setLastPostId(postId);
        } catch (e: any) {
            addLog(`Error creating post: ${e.message}`);
        }
    };

    const handleGetFeed = async () => {
        try {
            const posts = await getPublicFeed();
            addLog(`Fetched ${posts.length} public posts.`);
            console.log(posts);
        } catch (e: any) {
            addLog(`Error fetching feed: ${e.message}`);
        }
    };

    const handleCreateGroup = async () => {
        if (!currentUser) return addLog("Must be logged in to create group.");
        try {
            const groupId = await createGroup({
                name: "Test Group " + Date.now(),
                ownerId: currentUser.uid,
                members: [currentUser.uid],
                isPrivate: false,
            });
            addLog(`Group created with ID: ${groupId}`);
        } catch (e: any) {
            addLog(`Error creating group: ${e.message}`);
        }
    };

    const handleSavePost = async () => {
        if (!currentUser || !lastPostId) return addLog("Need login and created post.");
        try {
            await savePost(currentUser.uid, lastPostId);
            addLog(`Saved post ${lastPostId}`);
            const isSaved = await isPostSaved(currentUser.uid, lastPostId);
            addLog(`Is saved? ${isSaved}`);
        } catch (e: any) {
            addLog(`Error saving: ${e.message}`);
        }
    };

    const handleUnsavePost = async () => {
        if (!currentUser || !lastPostId) return addLog("Need login and created post.");
        try {
            await unsavePost(currentUser.uid, lastPostId);
            addLog(`Unsaved post ${lastPostId}`);
            const isSaved = await isPostSaved(currentUser.uid, lastPostId);
            addLog(`Is saved? ${isSaved}`);
        } catch (e: any) {
            addLog(`Error unsaving: ${e.message}`);
        }
    };

    return (
        <div className="p-4 space-y-4">
            <h1 className="text-2xl font-bold">Backend Service Test</h1>
            <div className="space-x-2">
                <button onClick={handleLogin} className="px-4 py-2 bg-blue-500 text-white rounded">Login</button>
                <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded">Logout</button>
                <button onClick={handleCreatePost} className="px-4 py-2 bg-green-500 text-white rounded">Create Post</button>
                <button onClick={handleGetFeed} className="px-4 py-2 bg-purple-500 text-white rounded">Get Feed</button>
                <button onClick={handleCreateGroup} className="px-4 py-2 bg-yellow-500 text-white rounded">Create Group</button>
                <button onClick={handleSavePost} className="px-4 py-2 bg-indigo-500 text-white rounded">Save Post</button>
                <button onClick={handleUnsavePost} className="px-4 py-2 bg-pink-500 text-white rounded">Unsave Post</button>
            </div>
            <div className="border p-4 h-64 overflow-y-auto bg-gray-100 rounded">
                {logs.map((log, i) => (
                    <div key={i} className="font-mono text-sm">{log}</div>
                ))}
            </div>
        </div>
    );
}
