'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { joinGroup } from '@/services/group';
import { Loader2 } from 'lucide-react';

export default function JoinGroupPage() {
    const params = useParams();
    const groupId = params.groupId as string;
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'joining' | 'error'>('loading');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setStatus('joining');
                try {
                    await joinGroup(groupId, user.uid);
                    router.push(`/groups/${groupId}`);
                } catch (err) {
                    console.error("Error joining group:", err);
                    setStatus('error');
                    setError("Failed to join group. Please try again.");
                }
            } else {
                // Not logged in, redirect to login with return url
                const returnUrl = `/join/${groupId}`;
                router.push(`/login?redirect=${encodeURIComponent(returnUrl)}`);
            }
        });

        return () => unsubscribe();
    }, [groupId, router]);

    if (status === 'error') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
                    <div className="text-red-500 mb-4">
                        <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Error Joining Group</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Go to Feed
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Joining group...</p>
            </div>
        </div>
    );
}
