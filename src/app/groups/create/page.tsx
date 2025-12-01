'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { createGroup } from '@/services/group';
import { uploadImage } from '@/services/cloudinary';
import Image from 'next/image';

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

            // Upload image if selected
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
        <div className="pb-20">
            <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 h-14 flex items-center gap-4">
                <button onClick={() => router.back()}>
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold">Create Group</h1>
            </header>

            <form onSubmit={handleSubmit} className="p-4 space-y-6">
                {/* Group Image Upload */}
                <div className="flex flex-col items-center">
                    <label htmlFor="image-upload" className="cursor-pointer">
                        <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-300 hover:border-blue-500 transition-colors">
                            {imagePreview ? (
                                <Image
                                    src={imagePreview}
                                    alt="Group preview"
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Camera className="w-10 h-10 text-gray-400" />
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
                    <p className="text-sm text-gray-500 mt-2">Click to upload group image</p>
                </div>

                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Group Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="e.g. Foodies of NY"
                        required
                    />
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="isPrivate"
                        checked={isPrivate}
                        onChange={(e) => setIsPrivate(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isPrivate" className="text-sm text-gray-700">
                        Private Group
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={loading || !name.trim()}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Creating...' : 'Create Group'}
                </button>
            </form>
        </div>
    );
}
