'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, Lock, Globe, Users } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { createGroup } from '@/services/group';
import { uploadImage } from '@/services/cloudinary';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function CreateGroupPage() {
    const [name, setName] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const router = useRouter();
    const user = auth.currentUser;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !name.trim()) return;

        setLoading(true);
        try {
            let imageUrl: string = "";

            if (imageFile) {
                imageUrl = await uploadImage(imageFile);
            }

            const groupId = await createGroup({
                name: name.trim(),
                ownerId: user.uid,
                members: [user.uid],
                isPrivate,
                imageUrl,
            });
            router.push(`/groups/${groupId}`);
        } catch (error) {
            console.error("Error creating group:", error);
            alert("Failed to create group. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-background/70 backdrop-blur-xl border-b border-border/50">
                <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-lg font-semibold">Create Group</h1>
                </div>
            </header>

            <main className="max-w-md mx-auto px-4 py-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Group Image Upload */}
                    <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-2">
                        <label htmlFor="image-upload" className="cursor-pointer group">
                            <div className={cn(
                                "relative w-28 h-28 rounded-2xl overflow-hidden bg-muted border-2 border-dashed border-border",
                                "transition-all duration-300 hover:border-foreground hover:scale-105",
                                imagePreview && "border-solid"
                            )}>
                                {imagePreview ? (
                                    <Image
                                        src={imagePreview}
                                        alt="Group preview"
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                                        <Camera className="w-8 h-8 text-muted-foreground transition-colors group-hover:text-foreground" />
                                        <span className="text-[10px] text-muted-foreground">Add Photo</span>
                                    </div>
                                )}
                            </div>
                        </label>
                        <input
                            type="file"
                            id="image-upload"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                        />
                    </div>

                    {/* Group Name */}
                    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: '50ms' }}>
                        <label htmlFor="name" className="block text-sm font-medium">
                            Group Name
                        </label>
                        <Input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Foodies of NY"
                            className="h-12 text-base"
                            required
                        />
                    </div>

                    {/* Privacy Toggle */}
                    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: '100ms' }}>
                        <label className="block text-sm font-medium">Privacy</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setIsPrivate(false)}
                                className={cn(
                                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                                    !isPrivate
                                        ? "border-foreground bg-foreground/5"
                                        : "border-border hover:border-muted-foreground"
                                )}
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center",
                                    !isPrivate ? "bg-foreground text-background" : "bg-muted"
                                )}>
                                    <Globe className="w-5 h-5" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-medium">Public</p>
                                    <p className="text-[10px] text-muted-foreground">Anyone can join</p>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsPrivate(true)}
                                className={cn(
                                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                                    isPrivate
                                        ? "border-foreground bg-foreground/5"
                                        : "border-border hover:border-muted-foreground"
                                )}
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center",
                                    isPrivate ? "bg-foreground text-background" : "bg-muted"
                                )}>
                                    <Lock className="w-5 h-5" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-medium">Private</p>
                                    <p className="text-[10px] text-muted-foreground">Invite only</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <Button
                        type="submit"
                        disabled={loading || !name.trim()}
                        className="w-full h-12 text-base animate-in fade-in slide-in-from-bottom-2"
                        style={{ animationDelay: '150ms' }}
                    >
                        {loading ? 'Creating...' : 'Create Group'}
                    </Button>
                </form>
            </main>
        </div>
    );
}
