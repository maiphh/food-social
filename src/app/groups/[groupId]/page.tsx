'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Plus, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getGroup } from '@/services/group';
import { getGroupPosts } from '@/services/post';
import { Group, Post, GroupRole } from '@/types';
import PostCard from '@/components/PostCard';
import CreatePostModal from '@/components/CreatePostModal';
import BottomNav from '@/components/BottomNav';
import GroupManagementModal from '@/components/GroupManagementModal';

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
        if (!user || !groupId) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                const [groupData, groupPosts] = await Promise.all([
                    getGroup(groupId),
                    getGroupPosts(groupId)
                ]);
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
        // Refresh posts
        getGroupPosts(groupId).then(setPosts);
        setIsCreateModalOpen(false);
    };

    if (loading) {
        return <div className="flex justify-center p-8">Loading...</div>;
    }

    if (!group) {
        return <div className="p-8 text-center">Group not found</div>;
    }

    const currentUserRole = user ? (group.roles[user.uid] as GroupRole) : null;
    const canManage = currentUserRole === GroupRole.OWNER || currentUserRole === GroupRole.ADMIN;

    return (
        <div className="pb-20">
            <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 h-14 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()}>
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold">{group.name}</h1>
                        <p className="text-xs text-gray-500">{group.members.length} members</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {currentUserRole && (
                        <button
                            onClick={() => setIsManagementModalOpen(true)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                            title="Group Members"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                    )}
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="text-blue-600 font-medium text-sm"
                    >
                        Create Post
                    </button>
                </div>
            </header>

            <div className="max-w-md mx-auto">
                {posts.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10 p-4">
                        <p>No posts yet.</p>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="text-blue-500 font-medium mt-2"
                        >
                            Be the first to post!
                        </button>
                    </div>
                ) : (
                    posts.map(post => (
                        <PostCard key={post.id} post={post} />
                    ))
                )}
            </div>

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
