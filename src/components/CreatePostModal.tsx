'use client';

import { useState, useEffect } from 'react';
import { createPost, updatePost } from '@/services/post';
import { uploadImage } from '@/services/cloudinary';
import { APP_CONFIG } from '@/config/settings';
import { X, Star, Image as ImageIcon } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { Post } from '@/types';

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    defaultGroupId?: string;
    post?: Post; // Optional post for editing
}


export default function CreatePostModal({ isOpen, onClose, onSuccess, defaultGroupId, post }: CreatePostModalProps) {
    const [content, setContent] = useState('');
    const [ratings, setRatings] = useState<Record<string, number>>({
        food: 0,
        ambiance: 0,
        overall: 0
    });
    const [address, setAddress] = useState('');
    const [priceMin, setPriceMin] = useState('');
    const [priceMax, setPriceMax] = useState('');
    const [recommendation, setRecommendation] = useState<'not-recommend' | 'recommend' | 'highly-recommend' | ''>('');
    const [visibility, setVisibility] = useState<'public' | 'private' | 'group'>(defaultGroupId ? 'group' : 'public');
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    // Populate form when editing
    useEffect(() => {
        if (post) {
            setContent(post.content || '');
            setRatings(post.ratings || { food: 0, ambiance: 0, overall: 0 });
            setAddress(post.address || '');
            setPriceMin(post.priceMin?.toString() || '');
            setPriceMax(post.priceMax?.toString() || '');
            setRecommendation(post.recommendation || '');
            setVisibility(post.visibility || 'public');
            setExistingImageUrls(post.images || []);
        } else {
            // Reset form for create mode
            setContent('');
            setRatings({ food: 0, ambiance: 0, overall: 0 });
            setAddress('');
            setPriceMin('');
            setPriceMax('');
            setRecommendation('');
            setVisibility(defaultGroupId ? 'group' : 'public');
            setExistingImageUrls([]);
            setSelectedImages([]);
        }
    }, [post, defaultGroupId]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth.currentUser) {
            alert('You must be logged in to post.');
            return;
        }

        setLoading(true);
        try {
            // Upload new images if any
            const uploadPromises = selectedImages.map(image => uploadImage(image));
            const newImageUrls = await Promise.all(uploadPromises);

            // Combine existing images with new images
            const allImageUrls = [...existingImageUrls, ...newImageUrls];

            const postData = {
                authorId: auth.currentUser.uid,
                content,
                ratings: ratings as { food: number; ambiance: number; overall: number },
                images: allImageUrls,
                visibility,
                ...(defaultGroupId ? { groupId: defaultGroupId } : {}),
                address,
                priceMin: priceMin ? Number(priceMin) : 0,
                priceMax: priceMax ? Number(priceMax) : 0,
                recommendation: recommendation as 'not-recommend' | 'recommend' | 'highly-recommend'
            };

            // Check if we're editing or creating
            if (post?.id) {
                // EDIT MODE: Update existing post
                await updatePost(post.id, postData);
                // Show success message (you can add a toast notification here)
                alert('Post updated successfully!');
                onSuccess();
                // Don't close modal or clear form in edit mode
            } else {
                // CREATE MODE: Create new post
                await createPost({
                    ...postData,
                    createdAt: Date.now()
                });
                // Clear form
                setContent('');
                setAddress('');
                setPriceMin('');
                setPriceMax('');
                setRecommendation('');
                setRatings({ food: 0, ambiance: 0, overall: 0 });
                setSelectedImages([]);
                setExistingImageUrls([]);
                onSuccess();
                onClose();
            }
        } catch (error) {
            console.error('Error saving post:', error);
            alert(post?.id ? 'Failed to update post' : 'Failed to create post');
        } finally {
            setLoading(false);
        }
    };

    const handleRatingChange = (category: string, value: number) => {
        setRatings(prev => ({ ...prev, [category]: value }));
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={(e) => {
                e.stopPropagation();
                onClose();
            }}
        >
            <div
                className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">{post ? 'Edit Review' : 'Create Review'}</h2>
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

                    <div className="space-y-4 mb-4">
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Address"
                            className="w-full p-3 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex gap-4">
                            <div className="flex-1 flex gap-2">
                                <input
                                    type="number"
                                    value={priceMin}
                                    onChange={(e) => setPriceMin(e.target.value)}
                                    placeholder="Min Price"
                                    className="w-full p-3 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-blue-500"
                                />
                                <input
                                    type="number"
                                    value={priceMax}
                                    onChange={(e) => setPriceMax(e.target.value)}
                                    placeholder="Max Price"
                                    className="w-full p-3 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <select
                                value={recommendation}
                                onChange={(e) => setRecommendation(e.target.value as any)}
                                className="flex-1 p-3 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Recommendation</option>
                                <option value="not-recommend">Not Recommend</option>
                                <option value="recommend">Recommend</option>
                                <option value="highly-recommend">Highly Recommend</option>
                            </select>
                        </div>
                    </div>

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

                    {/* Image Previews */}
                    {(existingImageUrls.length > 0 || selectedImages.length > 0) && (
                        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                            {/* Existing images */}
                            {existingImageUrls.map((url, index) => (
                                <div key={`existing-${index}`} className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden group">
                                    <img
                                        src={url}
                                        alt={`Existing ${index}`}
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setExistingImageUrls(prev => prev.filter((_, i) => i !== index))}
                                        className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            {/* New images */}
                            {selectedImages.map((image, index) => (
                                <div key={`new-${index}`} className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden group">
                                    <img
                                        src={URL.createObjectURL(image)}
                                        alt={`Preview ${index}`}
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setSelectedImages(prev => prev.filter((_, i) => i !== index))}
                                        className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

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
                            {loading ? (post ? 'Updating...' : 'Posting...') : (post ? 'Update Review' : 'Post Review')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
