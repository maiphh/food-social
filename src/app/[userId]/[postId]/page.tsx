'use client';

import { useEffect, useState, use } from 'react';
import { getPost } from '@/services/post';
import { getUser } from '@/services/user';
import { Post, User } from '@/types';
import BottomNav from '@/components/BottomNav';
import PostDetail from '@/components/PostDetail';
import CommentsSection from '@/components/CommentsSection';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getComments } from '@/services/comments';
import { Comment } from '@/types';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

export default function PostPage({ params }: { params: Promise<{ userId: string; postId: string }> }) {
    const { userId, postId } = use(params);
    const [post, setPost] = useState<Post | null>(null);
    const [author, setAuthor] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [initialComments, setInitialComments] = useState<Comment[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchedPost = await getPost(postId);
                setPost(fetchedPost);

                if (fetchedPost) {
                    const fetchedAuthor = await getUser(fetchedPost.authorId);
                    setAuthor(fetchedAuthor);
                    const fetchedComments = await getComments(postId);
                    setInitialComments(fetchedComments);
                }
            } catch (error) {
                console.error('Error fetching post data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [postId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="text-center animate-in fade-in slide-in-from-bottom-4">
                    <p className="text-muted-foreground mb-4">Post not found.</p>
                    <Button
                        variant="link"
                        onClick={() => router.push('/')}
                        className="text-primary"
                    >
                        Go to Feed
                    </Button>
                </div>
                <BottomNav />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <header className="bg-background/80 backdrop-blur-lg border-b border-border sticky top-0 z-10 px-4 h-14 flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    className="hover:scale-105 transition-transform"
                >
                    <ChevronLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-lg font-semibold text-foreground">Post</h1>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                <div className="animate-in fade-in slide-in-from-bottom-4">
                    <PostDetail
                        post={post}
                        author={author}
                        onAuthorClick={() => router.push(`/${post.authorId}`)}
                        onCommentClick={() => {
                            const commentsSection = document.getElementById('comments-section');
                            if (commentsSection) {
                                commentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                        }}
                    />
                </div>

                <div id="comments-section" className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '100ms' }}>
                    <CommentsSection
                        postId={postId}
                        initialComments={initialComments}
                    />
                </div>
            </main>

            <BottomNav />
        </div>
    );
}
