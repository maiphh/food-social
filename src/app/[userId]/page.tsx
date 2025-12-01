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
import { LogOut, MapPin, User as UserIcon, Camera, Edit2, Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { logout } from '@/services/auth';
import { uploadImage } from '@/services/cloudinary';

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

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUser(user as unknown as User); // Cast to our User type or handle mismatch
            } else {
                setCurrentUser(null);
            }
        });
        return () => unsubscribe();
    }, []);

    const [profileUser, setProfileUser] = useState<User | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // If it's own profile, we can use auth.currentUser but it might be better to fetch from DB to be consistent
                // or use a mix. For now, let's fetch from DB to get stored data.
                const fetchedUser = await getUser(userId);
                setProfileUser(fetchedUser);
                if (fetchedUser) {
                    setNewName(fetchedUser.displayName || '');
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
        };

        const fetchPosts = async () => {
            setLoading(true);
            try {
                if (activeTab === 'saved' && isOwnProfile) {
                    const savedPostIds = await getSavedPosts(userId);
                    const postsPromises = savedPostIds.map(id => getPost(id));
                    const posts = await Promise.all(postsPromises);
                    setUserPosts(posts.filter((p): p is Post => p !== null));
                } else {
                    const posts = await getUserPosts(userId);
                    setUserPosts(posts);
                }
            } catch (error) {
                console.error('Error fetching user posts:', error);
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
            alert('Failed to update name');
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
            alert('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (!profileUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="text-center">
                    <p className="text-gray-500 mb-4">User not found.</p>
                    <button
                        onClick={() => router.push('/')}
                        className="text-blue-600 font-medium hover:underline"
                    >
                        Go to Feed
                    </button>
                </div>
                <BottomNav />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="px-4 py-6 flex flex-col items-center">
                    <div className="relative group">
                        <div className="w-24 h-24 bg-gray-100 rounded-full mb-4 flex items-center justify-center overflow-hidden">
                            {profileUser.photoURL ? (
                                <img src={profileUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <UserIcon className="w-12 h-12 text-gray-400" />
                            )}
                        </div>
                        {isOwnProfile && (
                            <>
                                <label className="absolute bottom-4 right-0 bg-blue-600 p-1.5 rounded-full text-white cursor-pointer shadow-md hover:bg-blue-700 transition-colors">
                                    <Camera className="w-4 h-4" />
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                    />
                                </label>
                                {uploading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {isEditingName && isOwnProfile ? (
                        <div className="flex items-center gap-2 mb-1">
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="border border-gray-300 rounded px-2 py-1 text-sm"
                                autoFocus
                            />
                            <button onClick={handleNameUpdate} className="text-green-600 hover:text-green-700">
                                <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => setIsEditingName(false)} className="text-red-600 hover:text-red-700">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-xl font-bold text-gray-900">{profileUser.displayName}</h1>
                            {isOwnProfile && (
                                <button onClick={() => setIsEditingName(true)} className="text-gray-400 hover:text-gray-600">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    )}

                    <p className="text-sm text-gray-500">{profileUser.email}</p>

                    {isOwnProfile && (
                        <button
                            onClick={handleLogout}
                            className="mt-4 flex items-center gap-2 text-red-600 text-sm font-medium hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex border-t border-gray-100">
                    <button
                        onClick={() => setActiveTab('reviews')}
                        className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'reviews'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Reviews
                    </button>
                    {isOwnProfile && (
                        <button
                            onClick={() => setActiveTab('saved')}
                            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'saved'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Saved Posts
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <main className="max-w-md mx-auto p-4">
                {userPosts.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 flex flex-col items-center">
                        {activeTab === 'reviews' ? (
                            <p>{APP_CONFIG.placeholders.emptyReviews}</p>
                        ) : (
                            <>
                                <MapPin className="w-12 h-12 text-gray-300 mb-2" />
                                <p>{APP_CONFIG.placeholders.emptySaved}</p>
                            </>
                        )}
                    </div>
                ) : (
                    userPosts.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            onDelete={isOwnProfile ? () => setUserPosts(prev => prev.filter(p => p.id !== post.id)) : undefined}
                            onClick={() => router.push(`/${post.authorId}/${post.id}`)}
                        />
                    ))
                )}
            </main>

            <BottomNav />
        </div>
    );
}
