'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Settings, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getGroup } from '@/services/group';
import { getGroupPosts } from '@/services/post';
import { Group, Post, GroupRole } from '@/types';
import PostCard from '@/components/PostCard';
import CreatePostModal from '@/components/CreatePostModal';
import BottomNav from '@/components/BottomNav';
import GroupManagementModal from '@/components/GroupManagementModal';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users } from 'lucide-react';

export default function GroupDetailPage() {
    const [group, setGroup] = useState<Group | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isManagementModalOpen, setIsManagementModalOpen] = useState(false);
    const router = useRouter();
    const params = useParams();
    const groupId = params.groupId as string;
    const { user, loading: authLoading } = useAuth();

    useEffect(() => {
        if (authLoading) return;
        if (!user || !groupId) { setLoading(false); return; }

        const fetchData = async () => {
            try {
                const [groupData, groupPosts] = await Promise.all([getGroup(groupId), getGroupPosts(groupId)]);
                setGroup(groupData);
                setPosts(groupPosts);
            } catch (error) {
                console.error("Error fetching group data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, groupId, authLoading]);

    const handlePostCreated = () => {
        getGroupPosts(groupId).then(setPosts);
        setIsCreateModalOpen(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!group) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="text-center">
                    <p className="text-muted-foreground mb-4">Group not found</p>
                    <Button variant="link" onClick={() => router.push('/groups')}>Back to Groups</Button>
                </div>
            </div>
        );
    }

    const currentUserRole = user ? (group.roles[user.uid] as GroupRole) : null;

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-background/70 backdrop-blur-xl border-b border-border/50">
                <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-9 w-9">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={group.imageUrl || undefined} />
                                <AvatarFallback><Users className="w-4 h-4" /></AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                                <h1 className="text-sm font-semibold truncate">{group.name}</h1>
                                <p className="text-[10px] text-muted-foreground">{group.members.length} members</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        {currentUserRole && (
                            <Button variant="ghost" size="icon" onClick={() => setIsManagementModalOpen(true)} className="h-9 w-9">
                                <Settings className="w-4 h-4" />
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => setIsCreateModalOpen(true)} className="h-9 w-9">
                            <Plus className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-4">
                {posts.length === 0 ? (
                    <div className="text-center py-16 space-y-3">
                        <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                            <Users className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground text-sm">No posts yet in this group</p>
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(true)}>
                            Be the first to post
                        </Button>
                    </div>
                ) : (
                    posts.map((post, i) => (
                        <div key={post.id} className="animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${i * 50}ms` }}>
                            <PostCard post={post} />
                        </div>
                    ))
                )}
            </main>

            {isCreateModalOpen && (
                <CreatePostModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={handlePostCreated}
                    defaultGroupId={groupId}
                />
            )}

            {isManagementModalOpen && currentUserRole && (
                <GroupManagementModal
                    isOpen={isManagementModalOpen}
                    onClose={() => setIsManagementModalOpen(false)}
                    groupId={groupId}
                    currentUserRole={currentUserRole}
                />
            )}
            <BottomNav />
        </div>
    );
}
