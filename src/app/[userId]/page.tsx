'use client';

import { useEffect, useState, use } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserPosts, getPost } from '@/services/post';
import { getSavedPosts } from '@/services/savedPost';
import { getUser, changeUserName, changePfp } from '@/services/user';
import { Post, User } from '@/types';
import PostCard from '@/components/PostCard';
import BottomNav from '@/components/BottomNav';
import { APP_CONFIG } from '@/config/settings';
import { LogOut, Bookmark, Grid3X3, User as UserIcon, Camera, Edit2, Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { logout } from '@/services/auth';
import { uploadImage } from '@/services/cloudinary';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

export default function ProfilePage({ params }: { params: Promise<{ userId: string }> }) {
    const { userId } = use(params);
    const [activeTab, setActiveTab] = useState<'reviews' | 'saved'>('reviews');
    const [userPosts, setUserPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState('');
    const [uploading, setUploading] = useState(false);
    const router = useRouter();

    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const isOwnProfile = currentUser?.uid === userId;
    const [profileUser, setProfileUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user ? (user as unknown as User) : null);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const fetchedUser = await getUser(userId);
                setProfileUser(fetchedUser);
                if (fetchedUser) setNewName(fetchedUser.displayName || '');
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
        };

        const fetchPosts = async () => {
            setLoading(true);
            try {
                if (activeTab === 'saved' && isOwnProfile) {
                    const savedPostIds = await getSavedPosts(userId);
                    const posts = await Promise.all(savedPostIds.map(id => getPost(id)));
                    setUserPosts(posts.filter((p): p is Post => p !== null));
                } else {
                    setUserPosts(await getUserPosts(userId));
                }
            } catch (error) {
                console.error('Error fetching posts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
        fetchPosts();
    }, [userId, activeTab, isOwnProfile]);

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/login');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const handleNameUpdate = async () => {
        if (!isOwnProfile || !currentUser || !newName.trim()) return;
        try {
            await changeUserName(currentUser.uid, newName);
            setProfileUser(prev => prev ? ({ ...prev, displayName: newName }) : null);
            setIsEditingName(false);
        } catch (error) {
            console.error('Error updating name:', error);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !isOwnProfile || !currentUser) return;

        setUploading(true);
        try {
            const imageUrl = await uploadImage(file);
            await changePfp(currentUser.uid, imageUrl);
            setProfileUser(prev => prev ? ({ ...prev, photoURL: imageUrl }) : null);
        } catch (error) {
            console.error('Error uploading image:', error);
        } finally {
            setUploading(false);
        }
    };

    if (loading && !profileUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!profileUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="text-center">
                    <p className="text-muted-foreground mb-4">User not found</p>
                    <Button variant="link" onClick={() => router.push('/')}>Go to Feed</Button>
                </div>
                <BottomNav />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Profile Header */}
            <div className="relative">
                {/* Background gradient */}
                <div className="h-24 bg-gradient-to-b from-muted to-background" />

                {/* Profile info */}
                <div className="px-4 -mt-12">
                    <div className="flex flex-col items-center">
                        {/* Avatar */}
                        <div className="relative">
                            <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                                <AvatarImage src={profileUser.photoURL || undefined} />
                                <AvatarFallback className="text-2xl"><UserIcon className="w-10 h-10" /></AvatarFallback>
                            </Avatar>
                            {isOwnProfile && (
                                <label className="absolute bottom-0 right-0 h-8 w-8 bg-foreground text-background rounded-full flex items-center justify-center cursor-pointer shadow-md hover:scale-105 transition-transform">
                                    <Camera className="w-4 h-4" />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                                </label>
                            )}
                            {uploading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-full">
                                    <Spinner size="sm" />
                                </div>
                            )}
                        </div>

                        {/* Name */}
                        <div className="mt-3 flex items-center gap-2">
                            {isEditingName && isOwnProfile ? (
                                <div className="flex items-center gap-1">
                                    <Input
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="h-8 w-36 text-center"
                                        autoFocus
                                    />
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNameUpdate}>
                                        <Check className="w-4 h-4 text-green-500" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsEditingName(false)}>
                                        <X className="w-4 h-4 text-destructive" />
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <h1 className="text-xl font-semibold">{profileUser.displayName}</h1>
                                    {isOwnProfile && (
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsEditingName(true)}>
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground">{profileUser.email}</p>

                        {/* Stats */}
                        <div className="flex gap-8 mt-4">
                            <div className="text-center">
                                <p className="text-lg font-semibold">{userPosts.length}</p>
                                <p className="text-xs text-muted-foreground">Reviews</p>
                            </div>
                        </div>

                        {/* Logout button */}
                        {isOwnProfile && (
                            <Button
                                variant="ghost"
                                onClick={handleLogout}
                                className="mt-4 gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </Button>
                        )}
                    </div>
                </div>

                {/* Tabs - Compact centered design */}
                <div className="flex justify-center mt-6 px-4">
                    <div className="inline-flex bg-muted rounded-lg p-1">
                        <button
                            onClick={() => setActiveTab('reviews')}
                            className={cn(
                                "flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all",
                                activeTab === 'reviews'
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Grid3X3 className="w-4 h-4" />
                            Reviews
                        </button>
                        {isOwnProfile && (
                            <button
                                onClick={() => setActiveTab('saved')}
                                className={cn(
                                    "flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all",
                                    activeTab === 'saved'
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Bookmark className="w-4 h-4" />
                                Saved
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <main className="max-w-2xl mx-auto px-4 py-6">
                {loading ? (
                    <div className="flex justify-center py-8"><Spinner size="md" /></div>
                ) : userPosts.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <p className="text-sm">
                            {activeTab === 'reviews' ? 'No reviews yet' : 'No saved posts'}
                        </p>
                    </div>
                ) : (
                    userPosts.map((post, i) => (
                        <div key={post.id} className="animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${i * 50}ms` }}>
                            <PostCard
                                post={post}
                                onDelete={isOwnProfile ? () => setUserPosts(prev => prev.filter(p => p.id !== post.id)) : undefined}
                                onClick={() => router.push(`/${post.authorId}/${post.id}`)}
                            />
                        </div>
                    ))
                )}
            </main>

            <BottomNav />
        </div>
    );
}
