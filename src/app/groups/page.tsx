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
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

export default function GroupsPage() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    useEffect(() => {
        if (authLoading) return;
        if (!user) { setLoading(false); return; }

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
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <header className="sticky top-0 z-40 bg-background/70 backdrop-blur-xl border-b border-border/50">
                <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
                    <h1 className="text-lg font-semibold">Groups</h1>
                    <Link href="/groups/create">
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                            <Plus className="w-5 h-5" />
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-4">
                {groups.length === 0 ? (
                    <div className="text-center py-16 space-y-3">
                        <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                            <Users className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground text-sm">You haven&apos;t joined any groups yet</p>
                        <Link href="/groups/create">
                            <Button variant="outline">Create a Group</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {groups.map((group, i) => (
                            <div key={group.id} className="animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${i * 50}ms` }}>
                                <GroupCard group={group} />
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <BottomNav />
        </div>
    );
}
