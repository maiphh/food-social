'use client';

import { useEffect, useState } from 'react';
import { Post } from '@/types';
import { getPublicFeed } from '@/services/post';
import PostCard from '@/components/PostCard';
import CreatePostModal from '@/components/CreatePostModal';
import BottomNav from '@/components/BottomNav';
import { Plus, Sparkles } from 'lucide-react';
import { APP_CONFIG } from '@/config/settings';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

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
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/70 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-lg font-semibold">{APP_CONFIG.name}</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCreateModalOpen(true)}
            className="hover:bg-muted"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">{APP_CONFIG.placeholders.emptyFeed}</p>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(true)}>
              Share Your First Review
            </Button>
          </div>
        ) : (
          <div className="space-y-0">
            {posts.map((post, index) => (
              <div
                key={post.id}
                className="animate-in fade-in slide-in-from-bottom-2"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <PostCard post={post} onDelete={fetchPosts} />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <Button
        onClick={() => setIsCreateModalOpen(true)}
        size="icon"
        className="fixed right-4 bottom-20 h-14 w-14 rounded-full shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 z-30"
      >
        <Plus className="w-6 h-6" />
      </Button>

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchPosts}
      />

      <BottomNav />
    </div>
  );
}
