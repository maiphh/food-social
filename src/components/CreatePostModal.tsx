'use client';

import { useState } from 'react';
import { createPost } from '@/services/post';
import { uploadImage } from '@/services/cloudinary';
import { APP_CONFIG } from '@/config/settings';
import { X, Star, Image as ImageIcon } from 'lucide-react';
import { auth } from '@/lib/firebase';

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void; // Changed from onPostCreated to match usage in GroupDetailPage, but wait, GroupDetailPage uses onPostCreated. Let's check the prop name in GroupDetailPage.
    // In GroupDetailPage: onPostCreated={handlePostCreated}
    // In CreatePostModal definition: onSuccess: () => void;
    // I should probably align them. The existing code uses onSuccess. I will keep onSuccess in the interface but alias it or change the usage in GroupDetailPage?
    // Actually, looking at the file content I just read, the interface has `onSuccess`.
    // But in GroupDetailPage I wrote `onPostCreated={handlePostCreated}`.
    // I should update GroupDetailPage to use `onSuccess` OR update CreatePostModal to use `onPostCreated`.
    // Let's update CreatePostModal to use `onPostCreated` to be more descriptive, or just stick to `onSuccess`.
    // The previous file content shows `onSuccess`.
    // I will add `defaultGroupId` to props.
    defaultGroupId?: string;
}

export default function CreatePostModal({ isOpen, onClose, onSuccess, defaultGroupId }: CreatePostModalProps) {
    const [content, setContent] = useState('');
    const [ratings, setRatings] = useState<Record<string, number>>({
        food: 0,
        ambiance: 0
    });
    const [visibility, setVisibility] = useState<'public' | 'private' | 'group'>(defaultGroupId ? 'group' : 'public');
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth.currentUser) {
            alert('You must be logged in to post.');
            return;
        }

        setLoading(true);
        try {
            const uploadPromises = selectedImages.map(image => uploadImage(image));
            const imageUrls = await Promise.all(uploadPromises);

            await createPost({
                authorId: auth.currentUser.uid,
                content,
                ratings: ratings as { food: number; ambiance: number },
                images: imageUrls,
                visibility,
                groupId: defaultGroupId, // Add groupId if present
                createdAt: Date.now()
            });
            setContent('');
            setRatings({ food: 0, ambiance: 0 });
            setSelectedImages([]);
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Failed to create post');
        } finally {
            setLoading(false);
        }
    };

    const handleRatingChange = (category: string, value: number) => {
        setRatings(prev => ({ ...prev, [category]: value }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">Create Review</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={APP_CONFIG.placeholders.createPost}
                        maxLength={APP_CONFIG.maxPostLength}
                        className="w-full h-32 p-3 bg-gray-50 rounded-lg border-none resize-none focus:ring-2 focus:ring-blue-500 mb-4"
                        required
                    />

                    <div className="space-y-4 mb-6">
                        {APP_CONFIG.ratingCategories.map((category) => (
                            <div key={category.id} className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">{category.label}</span>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => handleRatingChange(category.id, star)}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <Star
                                                className={`w-6 h-6 ${star <= (ratings[category.id] || 0)
                                                    ? 'text-yellow-400 fill-yellow-400'
                                                    : 'text-gray-300'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex gap-2">
                            <select
                                value={visibility}
                                onChange={(e) => setVisibility(e.target.value as any)}
                                disabled={!!defaultGroupId} // Disable if defaultGroupId is set
                                className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                            >
                                <option value="public">Public</option>
                                <option value="private">Private</option>
                                <option value="group">Group</option>
                            </select>
                            <button
                                type="button"
                                onClick={() => document.getElementById('image-upload')?.click()}
                                className={`p-2 rounded-full ${selectedImages.length > 0 ? 'text-blue-500 bg-blue-50' : 'text-gray-500 hover:bg-gray-100'}`}
                            >
                                <ImageIcon className="w-5 h-5" />
                            </button>
                            <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => {
                                    if (e.target.files) {
                                        setSelectedImages(Array.from(e.target.files));
                                    }
                                }}
                            />
                            {selectedImages.length > 0 && (
                                <span className="text-xs text-gray-500 self-center">
                                    {selectedImages.length} image{selectedImages.length > 1 ? 's' : ''} selected
                                </span>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !content.trim()}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Posting...' : 'Post Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
