'use client';

import { useState, Suspense } from 'react';
import { signInWithGoogle, signInWithFacebook, signInAsGuest } from '@/services/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { APP_CONFIG } from '@/config/settings';
import { LogIn } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

function LoginContent() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleLogin = async (loginMethod: () => Promise<any>) => {
        setLoading(true);
        setError(null);
        try {
            await loginMethod();
            const redirectUrl = searchParams.get('redirect');
            router.push(redirectUrl || '/');
        } catch (err) {
            setError('Failed to sign in. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 bg-primary/10 p-3 rounded-full w-fit">
                        <LogIn className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Welcome to {APP_CONFIG.name}</CardTitle>
                    <CardDescription>
                        Sign in to share your dining experiences
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {error && (
                        <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm animate-in fade-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    <Button
                        onClick={() => handleLogin(signInWithGoogle)}
                        disabled={loading}
                        variant="outline"
                        className="w-full gap-3 h-12 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {loading ? (
                            <Spinner size="sm" />
                        ) : (
                            <>
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Sign in with Google
                            </>
                        )}
                    </Button>

                    <Button
                        onClick={() => handleLogin(signInWithFacebook)}
                        disabled={loading}
                        className="w-full gap-3 h-12 bg-[#1877F2] hover:bg-[#1864D9] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.148 0-2.971.747-2.971 2.28v1.69h4.757l-.871 3.667h-3.886v7.98h-4.844Z" />
                        </svg>
                        Sign in with Facebook
                    </Button>

                    <Button
                        onClick={() => handleLogin(signInAsGuest)}
                        disabled={loading}
                        variant="secondary"
                        className="w-full gap-3 h-12 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                        </svg>
                        Continue as Guest
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Spinner size="md" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
