'use client';

import { Post } from '@/types';
import { Star, User as UserIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { APP_CONFIG } from '@/config/settings';
import { getUser } from '@/services/user';
import { useState, useEffect } from 'react';

interface PostDetailModalProps {
    post: Post | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function PostDetailModal({ post, isOpen, onClose }: PostDetailModalProps) {
    const [authorName, setAuthorName] = useState<string>('Loading...');
    const [authorPhoto, setAuthorPhoto] = useState<string | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        if (post) {
            const fetchAuthor = async () => {
                try {
                    const user = await getUser(post.authorId);
                    setAuthorName(user?.displayName || 'Unknown User');
                    setAuthorPhoto(user?.photoURL || null);
                } catch (error) {
                    console.error('Error fetching user:', error);
                    setAuthorName('Unknown User');
                    setAuthorPhoto(null);
                }
            };
            fetchAuthor();
            setCurrentImageIndex(0);
        }
    }, [post]);

    if (!isOpen || !post) return null;

    const renderStars = (rating: number) => (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                />
            ))}
        </div>
    );

    const nextImage = () => {
        if (post.images && currentImageIndex < post.images.length - 1) {
            setCurrentImageIndex(prev => prev + 1);
        }
    };

    const prevImage = () => {
        if (currentImageIndex > 0) {
            setCurrentImageIndex(prev => prev - 1);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Image Section */}
                <div className="md:w-2/3 bg-black relative flex items-center justify-center min-h-[300px] md:min-h-full">
                    {post.images && post.images.length > 0 ? (
                        <>
                            <img
                                src={post.images[currentImageIndex]}
                                alt={`Post image ${currentImageIndex + 1}`}
                                className="max-w-full max-h-[60vh] md:max-h-full object-contain"
                            />

                            {post.images.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        disabled={currentImageIndex === 0}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        disabled={currentImageIndex === post.images.length - 1}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight className="w-6 h-6" />
                                    </button>
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
                                        {post.images.map((_, idx) => (
                                            <div
                                                key={idx}
                                                className={`w-2 h-2 rounded-full ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="text-gray-500">No images</div>
                    )}
                </div>

                {/* Details Section */}
                <div className="md:w-1/3 flex flex-col h-full bg-white">
                    <div className="p-4 border-b flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                                {authorPhoto ? (
                                    <img src={authorPhoto} alt={authorName} className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon className="w-6 h-6 text-gray-400" />
                                )}
                            </div>
                            <div>
                                <div className="font-medium text-gray-900">{authorName}</div>
                                <div className="text-xs text-gray-500">
                                    {new Date(post.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    <div className="p-4 flex-1 overflow-y-auto">
                        <p className="text-gray-800 mb-6 whitespace-pre-wrap">{post.content}</p>

                        <div className="space-y-3">
                            {APP_CONFIG.ratingCategories.map((category) => (
                                <div key={category.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                    <span className="text-sm font-medium text-gray-600">{category.label}</span>
                                    {renderStars(post.ratings[category.id as keyof typeof post.ratings] || 0)}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
