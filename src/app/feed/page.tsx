'use client';

import { useEffect, useState } from 'react';
import { Post } from '@/types';
import { getPublicFeed } from '@/services/post';
import PostCard from '@/components/PostCard';
import CreatePostModal from '@/components/CreatePostModal';
import BottomNav from '@/components/BottomNav';
import { Plus } from 'lucide-react';
import { APP_CONFIG } from '@/config/settings';

export default function FeedPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchPosts = async () => {
        try {
            const data = await getPublicFeed();
            setPosts(data);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10 px-4 py-3 flex justify-between items-center">
                <h1 className="text-xl font-bold text-blue-600">{APP_CONFIG.name}</h1>
            </header>

            {/* Main Content */}
            <main className="max-w-md mx-auto p-4">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        {APP_CONFIG.placeholders.emptyFeed}
                    </div>
                ) : (
                    posts.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            onDelete={fetchPosts}
                        />
                    ))
                )}
            </main>

            {/* Floating Action Button */}
            <button
                onClick={() => setIsCreateModalOpen(true)}
                className="fixed right-4 bottom-20 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-transform hover:scale-105 active:scale-95 z-20"
            >
                <Plus className="w-6 h-6" />
            </button>

            <CreatePostModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchPosts}
            />

            <BottomNav />
        </div>
    );
}
