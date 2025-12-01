'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getUserGroups } from '@/services/group';
import { Group } from '@/types';
import BottomNav from '@/components/BottomNav';
import GroupCard from '@/components/GroupCard';
import Link from 'next/link';

export default function GroupsPage() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchGroups = async () => {
            try {
                const userGroups = await getUserGroups(user.uid);
                setGroups(userGroups);
            } catch (error) {
                console.error("Error fetching groups:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchGroups();
    }, [user, authLoading]);

    if (loading) {
        return <div className="flex justify-center p-8">Loading...</div>;
    }

    return (
        <div className="pb-20">
            <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 h-14 flex items-center justify-between">
                <h1 className="text-xl font-bold">Groups</h1>
                <Link href="/groups/create">
                    <Plus className="w-6 h-6 text-gray-900" />
                </Link>
            </header>

            <div className="p-4 space-y-4">
                {groups.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10">
                        <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>You haven't joined any groups yet.</p>
                        <Link href="/groups/create" className="text-blue-500 font-medium mt-2 inline-block">
                            Create a Group
                        </Link>
                    </div>
                ) : (
                    groups.map(group => (
                        <GroupCard key={group.id} group={group} />
                    ))
                )}
            </div>
            <BottomNav />
        </div>
    );
}
