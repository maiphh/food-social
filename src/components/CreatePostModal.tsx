'use client';

import { useState, useEffect, useRef } from 'react';
import { createPost, updatePost } from '@/services/post';
import { uploadImage } from '@/services/cloudinary';
import { APP_CONFIG } from '@/config/settings';
import { X, Star, Camera, Plus, MapPin, DollarSign, Globe, Lock, Users, ChevronDown } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { Post } from '@/types';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    defaultGroupId?: string;
    post?: Post;
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
    const [dragActive, setDragActive] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
            setShowDetails(true);
        } else {
            setContent('');
            setRatings({ food: 0, ambiance: 0, overall: 0 });
            setAddress('');
            setPriceMin('');
            setPriceMax('');
            setRecommendation('');
            setVisibility(defaultGroupId ? 'group' : 'public');
            setExistingImageUrls([]);
            setSelectedImages([]);
            setShowDetails(false);
        }
    }, [post, defaultGroupId, isOpen]);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
            setSelectedImages(prev => [...prev, ...files]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedImages(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeImage = (index: number, isExisting: boolean) => {
        if (isExisting) {
            setExistingImageUrls(prev => prev.filter((_, i) => i !== index));
        } else {
            setSelectedImages(prev => prev.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth.currentUser) {
            alert('You must be logged in to post.');
            return;
        }

        setLoading(true);
        try {
            const uploadPromises = selectedImages.map(image => uploadImage(image));
            const newImageUrls = await Promise.all(uploadPromises);
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

            if (post?.id) {
                await updatePost(post.id, postData);
                onSuccess();
            } else {
                await createPost({ ...postData, createdAt: Date.now() });
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

    const allImages = [
        ...existingImageUrls.map((url, i) => ({ url, isExisting: true, index: i })),
        ...selectedImages.map((file, i) => ({ url: URL.createObjectURL(file), isExisting: false, index: i }))
    ];

    const visibilityLabel = visibility === 'public' ? 'Public' : visibility === 'private' ? 'Private' : 'Group';
    const VisibilityIcon = visibility === 'public' ? Globe : visibility === 'private' ? Lock : Users;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md p-0 gap-0 overflow-hidden max-h-[85vh]">
                <DialogHeader className="px-4 py-3 border-b border-border">
                    <DialogTitle className="text-base font-semibold">
                        {post ? 'Edit Review' : 'New Review'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[60vh]">
                        {/* Content */}
                        <Textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="What did you think of this place?"
                            maxLength={APP_CONFIG.maxPostLength}
                            className="min-h-[80px] resize-none text-sm"
                            autoFocus
                        />

                        {/* Image Upload Area */}
                        <div
                            className={cn(
                                "relative rounded-lg border-2 border-dashed transition-all duration-200",
                                dragActive ? "border-primary bg-primary/5" : "border-border",
                                allImages.length === 0 ? "p-6" : "p-2"
                            )}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            {allImages.length === 0 ? (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full flex flex-col items-center justify-center gap-2"
                                >
                                    <Camera className="w-8 h-8 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">
                                        Add photos
                                    </p>
                                </button>
                            ) : (
                                <div className="grid grid-cols-4 gap-2">
                                    {allImages.map((img, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-md overflow-hidden group">
                                            <img src={img.url} alt="" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(img.index, img.isExisting)}
                                                className="absolute top-1 right-1 w-5 h-5 bg-background/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="aspect-square rounded-md border border-dashed border-border flex items-center justify-center hover:border-primary hover:bg-primary/5 transition-colors"
                                    >
                                        <Plus className="w-5 h-5 text-muted-foreground" />
                                    </button>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>

                        {/* Ratings - Always visible */}
                        <div className="space-y-2">
                            {APP_CONFIG.ratingCategories.map((category) => (
                                <div key={category.id} className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">{category.label}</span>
                                    <div className="flex gap-0.5">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => handleRatingChange(category.id, star)}
                                                className="p-0.5 focus:outline-none transition-transform hover:scale-110 active:scale-95"
                                            >
                                                <Star
                                                    className={cn(
                                                        "w-6 h-6 transition-colors",
                                                        star <= (ratings[category.id] || 0)
                                                            ? 'text-amber-400 fill-amber-400'
                                                            : 'text-muted-foreground/40 stroke-[1.5]'
                                                    )}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Expandable details */}
                        <button
                            type="button"
                            onClick={() => setShowDetails(!showDetails)}
                            className="w-full flex items-center justify-between py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <span>More details</span>
                            <ChevronDown className={cn("w-4 h-4 transition-transform", showDetails && "rotate-180")} />
                        </button>

                        {showDetails && (
                            <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
                                {/* Location */}
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
                                    <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                    <Input
                                        type="text"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="Location"
                                        className="border-0 bg-transparent p-0 h-auto text-sm focus-visible:ring-0"
                                    />
                                </div>

                                {/* Price */}
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
                                    <DollarSign className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                    <div className="flex items-center gap-2 flex-1">
                                        <Input
                                            type="number"
                                            value={priceMin}
                                            onChange={(e) => setPriceMin(e.target.value)}
                                            placeholder="Min"
                                            className="border-0 bg-transparent p-0 h-auto text-sm w-20 focus-visible:ring-0"
                                        />
                                        <span className="text-muted-foreground text-sm">-</span>
                                        <Input
                                            type="number"
                                            value={priceMax}
                                            onChange={(e) => setPriceMax(e.target.value)}
                                            placeholder="Max"
                                            className="border-0 bg-transparent p-0 h-auto text-sm w-20 focus-visible:ring-0"
                                        />
                                    </div>
                                </div>

                                {/* Recommendation */}
                                <div className="flex gap-2">
                                    {[
                                        { value: 'not-recommend', label: '👎 No', color: 'hover:bg-red-500/10 hover:text-red-600' },
                                        { value: 'recommend', label: '👍 Yes', color: 'hover:bg-blue-500/10 hover:text-blue-600' },
                                        { value: 'highly-recommend', label: '🔥 Must Try', color: 'hover:bg-green-500/10 hover:text-green-600' },
                                    ].map((rec) => (
                                        <button
                                            key={rec.value}
                                            type="button"
                                            onClick={() => setRecommendation(rec.value as any)}
                                            className={cn(
                                                "flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all",
                                                recommendation === rec.value
                                                    ? "bg-foreground text-background"
                                                    : `bg-muted text-muted-foreground ${rec.color}`
                                            )}
                                        >
                                            {rec.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t border-border bg-muted/20">
                        <div className="flex items-center justify-between">
                            {/* Visibility */}
                            <button
                                type="button"
                                disabled={!!defaultGroupId}
                                onClick={() => {
                                    if (!defaultGroupId) {
                                        const options: ('public' | 'private' | 'group')[] = ['public', 'private', 'group'];
                                        const currentIndex = options.indexOf(visibility);
                                        setVisibility(options[(currentIndex + 1) % options.length]);
                                    }
                                }}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                                    defaultGroupId ? "opacity-50 cursor-not-allowed" : "hover:bg-muted",
                                    "bg-muted/50"
                                )}
                            >
                                <VisibilityIcon className="w-3.5 h-3.5" />
                                {visibilityLabel}
                            </button>

                            <Button
                                type="submit"
                                disabled={loading || !content.trim()}
                                size="sm"
                                className="px-6"
                            >
                                {loading ? 'Posting...' : (post ? 'Save' : 'Post')}
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
