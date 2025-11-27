'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { createGroup } from '@/services/group';

export default function CreateGroupPage() {
    const [name, setName] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const user = auth.currentUser;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !name.trim()) return;

        setLoading(true);
        try {
            const groupId = await createGroup({
                name: name.trim(),
                ownerId: user.uid,
                members: [user.uid],
                isPrivate
            });
            router.push(`/groups/${groupId}`);
        } catch (error) {
            console.error("Error creating group:", error);
            alert("Failed to create group. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pb-20">
            <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 h-14 flex items-center gap-4">
                <button onClick={() => router.back()}>
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold">Create Group</h1>
            </header>

            <form onSubmit={handleSubmit} className="p-4 space-y-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Group Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="e.g. Foodies of NY"
                        required
                    />
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="isPrivate"
                        checked={isPrivate}
                        onChange={(e) => setIsPrivate(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isPrivate" className="text-sm text-gray-700">
                        Private Group
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={loading || !name.trim()}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Creating...' : 'Create Group'}
                </button>
            </form>
        </div>
    );
}
